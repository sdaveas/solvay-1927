// Einstein: stimulated emission (1917). A passing photon makes an excited atom emit an identical photon (same direction, same phase).
// With more atoms excited than not (population inversion) and mirrors to send the light back through, the copies avalanche into a beam.
import { C, canvas, controls, slider, toggle, loop, readout, text } from "./kit.js";

export const title = "Stimulated emission";
export const caption = "An excited atom normally emits a photon in a random direction. But a passing photon can trigger it to emit a copy, same direction and phase, as Einstein described in 1917. With most atoms pumped up (inversion) and mirrors bouncing light back and forth, copies pile up along the axis and leak out as a beam. Qualitative: atom count and rates are simplified.";

// All sim geometry is in units of the canvas width, so the simulation does not depend on the canvas size.
const COLS = 9, ROWS = 4, NA = COLS * ROWS;
const MIRL = 0.1, MIRR = 0.78, ROD0 = 0.14, ROD1 = 0.42; // mirror positions and the rod's top and bottom
const V = 1.2;      // photon speed (canvas widths per second). ponytail: slowed so you can follow single photons
const GAMMA = 1.2;  // spontaneous decay rate per excited atom, 1/s
const LAM = 10;     // hazard (1/s) while a photon is within RI of an atom; stimulated emission and absorption share it (equal Einstein B coefficients)
const ACC = 0.35;   // only photons within ~19° of the axis take part. ponytail: stands in for the cavity's mode selection; with ~10^19 real atoms off-axis light just leaves before it can build up, but 36 atoms are too few and noisy for that
const RI = 0.042, T_OUT = 0.25, CAP = 200, PUMP_MAX = 6, PUMP_FLIGHT = 0.25, CAPD = 90, LAMP = 0.5; // pump rate per atom at 100% (1/s), pump-photon flight time, most pump photons drawn, lamp height
const TAU = 2 * Math.PI;

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "Atoms in a cavity between two mirrors. A pump excites atoms; they emit photons in random directions, but passing photons also trigger identical copies. When most atoms are excited and the mirrors are on, an avalanche of in-step photons builds along the axis and a beam leaves through the partly reflecting mirror on the right." });
  const row = controls(root), info = readout(root);
  let pump = 60, mirrors = true, beam = 0, escaped = 0, esc = 0, n = 0;
  const ax = new Float32Array(NA), ay = new Float32Array(NA), exc = new Uint8Array(NA), fl = new Float32Array(NA), flk = new Uint8Array(NA);
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    const a = i * ROWS + j;
    ax[a] = MIRL + 0.05 + ((i + 0.5) / COLS) * (MIRR - MIRL - 0.1);
    ay[a] = ROD0 + ((j + 0.5) / ROWS) * (ROD1 - ROD0);
  }
  const dTgt = new Uint8Array(CAPD), dT = new Float32Array(CAPD), dX = new Float32Array(CAPD); // pump photons in flight: target atom, time left, start x
  let nd = 0, dAcc = 0;
  const px = new Float32Array(CAP), py = new Float32Array(CAP), vx = new Float32Array(CAP), vy = new Float32Array(CAP), ph = new Float32Array(CAP);
  const kind = new Uint8Array(CAP), out = new Uint8Array(CAP); // kind 1 = stimulated copy; out 1 = already through the output mirror
  const put = (i, j) => { px[i] = px[j]; py[i] = py[j]; vx[i] = vx[j]; vy[i] = vy[j]; ph[i] = ph[j]; kind[i] = kind[j]; out[i] = out[j]; };
  function emit(x, y, dx, dy, p, k) {
    if (n >= CAP) return; // ponytail: caps the photons drawn, which also caps how hard the avalanche can run
    px[n] = x; py[n] = y; vx[n] = dx; vy[n] = dy; ph[n] = p; kind[n] = k; out[n] = 0; n++;
  }
  const FLC = [C.blue, C.gold, C.violet]; // ring colours: pumped, stimulated, spontaneous

  slider(row, { label: "Pump", min: 0, max: 100, step: 1, value: pump, fmt: v => `${v}%` }, v => { pump = v; lp.redraw(); });
  toggle(row, "Mirrors", true, on => { mirrors = on; lp.redraw(); });

  function step(dt) {
    const pSp = 1 - Math.exp(-GAMMA * dt), pHaz = 1 - Math.exp(-LAM * dt);
    // Pump photons head for random atoms and excite the target if it is still in the ground state (a pump photon aimed at an excited atom is wasted).
    dAcc += (pump / 100) * PUMP_MAX * NA * dt;
    while (dAcc >= 1) { dAcc--; if (nd < CAPD) { dTgt[nd] = (Math.random() * NA) | 0; dT[nd] = PUMP_FLIGHT; dX[nd] = Math.random() - 0.5; nd++; } }
    for (let d = 0; d < nd;) {
      dT[d] -= dt;
      if (dT[d] > 0) { d++; continue; }
      const a = dTgt[d];
      if (!exc[a]) { exc[a] = 1; fl[a] = 1; flk[a] = 0; }
      nd--; dTgt[d] = dTgt[nd]; dT[d] = dT[nd]; dX[d] = dX[nd];
    }
    for (let a = 0; a < NA; a++) {
      fl[a] = Math.max(0, fl[a] - dt * 3);
      if (exc[a] && Math.random() < pSp) { // spontaneous emission: random direction, random phase
        exc[a] = 0; fl[a] = 1; flk[a] = 2;
        const t = Math.random() * TAU, axial = Math.abs(Math.sin(t)) < ACC * Math.abs(Math.cos(t));
        emit(ax[a], ay[a], V * Math.cos(t), V * Math.sin(t), axial ? 0 : Math.random() * TAU, 0); // ponytail: near-axial seeds start in phase with the cavity mode, so the beam draws as one clean wave
      }
    }
    for (let i = 0; i < n;) {
      px[i] += vx[i] * dt; py[i] += vy[i] * dt;
      let dead = py[i] < ROD0 - 0.05 || py[i] > ROD1 + 0.05; // left through the side of the rod
      if (!dead && !out[i]) {
        if (px[i] < MIRL) { if (mirrors) { px[i] = 2 * MIRL - px[i]; vx[i] = -vx[i]; } else dead = px[i] < 0.02; }
        else if (px[i] > MIRR) {
          if (!mirrors || Math.random() < T_OUT) { out[i] = 1; escaped++; esc++; } else { px[i] = 2 * MIRR - px[i]; vx[i] = -vx[i]; }
        }
      }
      if (out[i] && px[i] > 1.03) dead = true;
      if (!dead && !out[i] && Math.abs(vy[i]) < ACC * Math.abs(vx[i])) {
        for (let a = 0; a < NA; a++) {
          const dx = px[i] - ax[a], dy = py[i] - ay[a];
          if (dx * dx + dy * dy > RI * RI || Math.random() > pHaz) continue;
          if (exc[a]) { exc[a] = 0; fl[a] = 1; flk[a] = 1; emit(ax[a], ay[a], vx[i], vy[i], ph[i], 1); } // stimulated emission: a clone
          else { exc[a] = 1; fl[a] = 1; flk[a] = 0; dead = true; break; } // absorption
        }
      }
      if (dead) { n--; put(i, n); } else i++;
    }
  }

  // A short wave packet, drawn into the current path. All packets with the same phase and direction line up into one continuous wave.
  function packet(ctx, x, y, ux, uy, p, w) {
    const lam = Math.max(10, w * 0.03), amp = Math.max(2, w * 0.006), len = lam * 2, q0 = x * ux + y * uy;
    for (let s = 0; s <= 14; s++) {
      const d = (s / 14) * len, o = amp * Math.sin(((q0 - d) * TAU) / lam + p) * Math.sin((s / 14) * Math.PI);
      const X = x - ux * d - uy * o, Y = y - uy * d + ux * o;
      s ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    }
  }

  function draw(dt) {
    if (dt) { step(dt); beam = Math.min(1, beam * Math.exp(-dt * 2.5) + esc * 0.12); esc = 0; }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);
    const X = u => u * w, mL = X(MIRL), mR = X(MIRR), r0 = X(ROD0), r1 = X(ROD1), ar = Math.max(4, w * 0.012);
    let exN = 0;
    for (let a = 0; a < NA; a++) exN += exc[a];
    const frac = exN / NA, inv = frac > 0.5;

    // Population bar at the top: how many atoms are excited, with the 50% line that marks inversion.
    const bx = w * 0.3, bw = w * 0.4, by = h * 0.03, bh = Math.max(9, h * 0.045);
    ctx.fillStyle = "#2a2420"; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = inv ? C.red : "#8a4a44"; ctx.fillRect(bx, by, bw * frac, bh);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx + bw / 2, by - 3); ctx.lineTo(bx + bw / 2, by + bh + 3); ctx.stroke();
    text(ctx, "excited atoms", bx - 8, by + bh / 2, { color: C.muted, size: 11, align: "right", base: "middle" });
    text(ctx, inv ? "inversion" : "50%", bx + bw + 8, by + bh / 2, { color: inv ? C.green : C.muted, size: 11, base: "middle", weight: inv ? 600 : 400 });

    // The rod (open at the sides, so off-axis light escapes), the output beam and the mirrors.
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(mL, r0, mR - mL, r1 - r0);
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mL, r0); ctx.lineTo(mR, r0); ctx.moveTo(mL, r1); ctx.lineTo(mR, r1); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    if (beam > 0.02) {
      const g = ctx.createLinearGradient(mR, 0, w, 0);
      g.addColorStop(0, `rgba(255,220,140,${0.5 * beam})`); g.addColorStop(1, "rgba(255,220,140,0)");
      ctx.fillStyle = g; ctx.fillRect(mR, r0, w - mR, r1 - r0);
    }
    ctx.globalAlpha = mirrors ? 1 : 0.18;
    ctx.fillStyle = "#d8d2c6"; ctx.fillRect(mL - 4, r0 - 6, 5, r1 - r0 + 12);
    ctx.fillStyle = "#9a948a"; ctx.fillRect(mR - 1, r0 - 6, 3, r1 - r0 + 12);
    ctx.globalAlpha = 1;
    if (mirrors) text(ctx, "mirror", mL, r0 - 12, { color: C.muted, size: 10, align: "center" });
    text(ctx, mirrors ? "partial mirror" : "no mirrors", mR, r0 - 12, { color: C.muted, size: 10, align: "center" });

    // Pump light from below.
    const yl = X(LAMP);
    ctx.fillStyle = C.blue; ctx.globalAlpha = 0.08 + 0.4 * (pump / 100);
    ctx.fillRect(mL, yl, mR - mL, 4); ctx.globalAlpha = 1;
    text(ctx, "pump light", (mL + mR) / 2, yl + 20, { color: C.blue, size: 11, align: "center" });

    // Pump photons rising toward their target atoms.
    ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let d = 0; d < nd; d++) {
      const f = 1 - dT[d] / PUMP_FLIGHT, x1 = X(ax[dTgt[d]] + dX[d] * 0.06 * (1 - f)), y1 = yl + (X(ay[dTgt[d]]) - yl) * f;
      ctx.moveTo(x1 - dX[d] * 3, y1 + 9); ctx.lineTo(x1, y1);
    }
    ctx.stroke(); ctx.globalAlpha = 1;

    // Atoms: dark when in the ground state, glowing when excited; rings mark each event.
    for (let a = 0; a < NA; a++) {
      const x = X(ax[a]), y = X(ay[a]);
      if (exc[a]) { ctx.fillStyle = C.red; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(x, y, ar * 1.9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.fillStyle = exc[a] ? C.red : "#241f1b"; ctx.strokeStyle = exc[a] ? "#ffb0a8" : C.muted; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x, y, ar, 0, TAU); ctx.fill(); ctx.stroke();
      if (fl[a] > 0.02) {
        ctx.strokeStyle = FLC[flk[a]]; ctx.globalAlpha = fl[a]; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(x, y, ar + (1 - fl[a]) * ar * 3, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }

    // Photons: in-step stimulated copies in gold, spontaneous ones in dim violet. Count the near-axial ones as "the beam".
    let bn = 0;
    ctx.lineCap = "round";
    for (let k = 0; k < 2; k++) {
      ctx.strokeStyle = k ? C.gold : C.violet; ctx.lineWidth = k ? 1.8 : 1.5; ctx.globalAlpha = k ? 0.9 : 0.7;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        if (kind[i] !== k) continue;
        if (Math.abs(vy[i]) < 0.2 * Math.abs(vx[i])) bn++;
        packet(ctx, X(px[i]), X(py[i]), vx[i] / V, vy[i] / V, ph[i], w);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = "butt";
    if (mirrors && beam > 0.15) text(ctx, "laser beam", (mR + w) / 2, r1 + 16, { color: C.gold, size: 11, align: "center", weight: 600 });

    info.textContent = `Excited: ${Math.round(frac * 100)}% · inversion: ${inv ? "yes" : "no"} · beam photons: ${bn} · escaped: ${escaped}`;
  }

  for (let i = 0; i < 240; i++) step(1 / 60); // warm up so the first (or reduced-motion) frame is not empty
  const lp = loop(row, (t, dt) => draw(dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
