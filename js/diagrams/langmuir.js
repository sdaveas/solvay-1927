// Langmuir: adsorption on a surface. Gas molecules stick to free sites and leave again at a constant rate; at equilibrium θ = KP/(1+KP).
import { C, canvas, controls, slider, button, loop, readout, axes, curve, text, map, clamp } from "./kit.js";

export const title = "Adsorption on a surface";
export const caption = "Gas molecules stick to free sites on a surface, one molecule per site, and leave again at a steady rate. More pressure means more sticking, but fewer free sites remain, so coverage follows Langmuir's isotherm, θ = KP/(1 + KP): steep at first, then flattening towards a single full layer. The green dot is this simulation's time average.";

// ponytail: a toy kinetic model with the isotherm built in. G molecules per unit KP bounce at mean vertical speed VB (box heights per second),
// so a free site is hit about KP·KD times per second (checked: simulated θ lands within a few percent of theory), and a bound molecule leaves at rate KD.
// Hence K·P = KP. The gas is a reservoir at fixed pressure.
const NS = 40, G = 8, VB = 3.2, KD = (G * VB) / (2 * NS), MAXG = 100;

export function mount(root) {
  const cv = canvas(root, { aspect: 1.3, label: "Gas molecules bouncing above a surface of 40 sites, some of which hold a stuck molecule, above a graph of the covered fraction against pressure with Langmuir's curve and the simulated value." });
  const row = controls(root), info = readout(root);
  let KP = 1.5, n = 0, avg = 0, gap = 0.1;
  const gx = new Float32Array(MAXG), gy = new Float32Array(MAXG), vx = new Float32Array(MAXG), vy = new Float32Array(MAXG);
  const occ = new Uint8Array(NS), fl = new Float32Array(NS), dive = new Uint8Array(MAXG);
  slider(row, { label: "Pressure K·P", min: 0, max: 10, step: 0.1, value: KP, fmt: v => v.toFixed(1) }, v => { KP = v; lp.redraw(); });
  button(row, "Clear surface", () => { occ.fill(0); avg = 0; lp.redraw(); });
  const lp = loop(row, (_, dt) => { step(dt); draw(); });

  const add = (u, v, up) => { if (n >= MAXG) return; gx[n] = u; gy[n] = v; vy[n] = (up ? -1 : 1) * VB * (0.5 + Math.random()); vx[n] = (Math.random() - 0.5) * 0.6 * VB; dive[n] = 0; n++; };
  const drop = i => { n--; dive[i] = dive[n]; gx[i] = gx[n]; gy[i] = gy[n]; vx[i] = vx[n]; vy[i] = vy[n]; };
  const covered = () => occ.reduce((s, v) => s + v, 0);

  function step(dt) {
    if (!dt) return;
    for (let i = 0; i < n; i++) {
      gx[i] += vx[i] * dt; gy[i] += vy[i] * dt;
      if (gx[i] < 0 || gx[i] > 1) { gx[i] = gx[i] < 0 ? -gx[i] : 2 - gx[i]; vx[i] = -vx[i]; }
      if (gy[i] < 0) { gy[i] = -gy[i]; vy[i] = Math.abs(vy[i]); }
      const s = Math.min(NS - 1, (gx[i] * NS) | 0), top = 1 - gap; // top = the upper surface of the layer of bound molecules
      if (gy[i] >= top && vy[i] > 0 && !dive[i]) {
        if (occ[s]) { gy[i] = 2 * top - gy[i]; vy[i] = -Math.abs(vy[i]); } // site taken: bounce off
        else { dive[i] = 1; vx[i] = 0; } // free site: drop straight in, so a neighbour's bump can't deflect it
      }
      if (dive[i] && gy[i] >= 1) {
        if (occ[s]) { dive[i] = 0; gy[i] = 2 - gy[i]; vy[i] = -Math.abs(vy[i]); } // another molecule got there first
        else { occ[s] = 1; fl[s] = 1; drop(i--); } // stick
      }
    }
    for (let s = 0; s < NS; s++) {
      if (fl[s] > 0) fl[s] = Math.max(0, fl[s] - 3 * dt);
      if (occ[s] && Math.random() < KD * dt) { occ[s] = 0; add((s + 0.5) / NS, 1 - gap / 2, true); } // desorption
    }
    const target = Math.round(KP * G); // keep the gas pressure constant: top up from the reservoir, or remove from the top
    for (let k = 0; k < 3 && n < target; k++) add(Math.random(), 0.02, false);
    for (let k = 0; k < 6 && n > target; k++) { let m = 0; for (let i = 1; i < n; i++) if (gy[i] < gy[m]) m = i; drop(m); }
    avg += (covered() / NS - avg) * (1 - Math.exp(-dt / 3));
  }

  function draw() {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);

    // ── Gas above a surface of 40 sites ─────────────────────
    const m = 10, W = w - 2 * m, B0 = Math.round(h * 0.5), yT = 8, ys = B0 - 22, sw = W / NS;
    const rg = clamp(sw * 0.32, 2, 5.5), rad = sw * 0.42, Hpx = ys - yT - 2 * rg;
    gap = (2 * rad) / Hpx;
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.strokeRect(m, yT, W, ys - yT);
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(m, ys, W, 6);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    for (let s = 0; s < NS; s++) ctx.strokeRect(m + s * sw + 0.5, ys + 0.5, sw - 1, 5);
    ctx.fillStyle = C.blue; ctx.globalAlpha = 0.9;
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const x = m + gx[i] * W, y = yT + rg + gy[i] * Hpx; ctx.moveTo(x + rg, y); ctx.arc(x, y, rg, 0, 2 * Math.PI); }
    ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    for (let s = 0; s < NS; s++) if (occ[s]) { const x = m + (s + 0.5) * sw; ctx.moveTo(x + rad, ys - rad); ctx.arc(x, ys - rad, rad, 0, 2 * Math.PI); }
    ctx.fill();
    for (let s = 0; s < NS; s++) if (fl[s] > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${fl[s]})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(m + (s + 0.5) * sw, ys - rad, rad * (1 + 1.6 * (1 - fl[s])), 0, 2 * Math.PI); ctx.stroke();
    }
    text(ctx, "gas at constant pressure", m + 5, yT + 13, { color: C.muted, size: 10 });
    text(ctx, "surface: 40 sites, one molecule each", m, B0 - 4, { color: C.muted, size: 10 });

    // ── Coverage against pressure ───────────────────────────
    const pr = { x: 38, y: B0 + 24, w: w - 54, h: h - B0 - 60 }, Y = 1.25, pred = KP / (1 + KP);
    const X = v => map(v, 0, 10, pr.x, pr.x + pr.w), Yp = v => map(v, 0, Y, pr.y + pr.h, pr.y);
    axes(ctx, pr);
    text(ctx, "coverage θ", 10, pr.y - 10, { color: C.muted, size: 10 });
    for (const v of [0, 0.5, 1]) text(ctx, v, pr.x - 5, Yp(v) + 3, { color: C.muted, size: 10, align: "right" });
    for (const v of [0, 2, 4, 6, 8, 10]) text(ctx, v, X(v), pr.y + pr.h + 13, { color: C.muted, size: 10, align: "center" });
    text(ctx, "pressure K·P", pr.x + pr.w, pr.y + pr.h + 26, { color: C.muted, size: 10, align: "right" });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pr.x, Yp(1)); ctx.lineTo(pr.x + pr.w, Yp(1)); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "full layer", pr.x + pr.w - 4, Yp(1) - 4, { color: C.muted, size: 10, align: "right" });
    curve(ctx, pr, [0, 10], [0, Y], x => x / (1 + x), { color: C.gold, width: 2.5 });
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(KP), Yp(pred), 3, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C.green; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X(KP), Yp(avg), 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    const lgx = pr.x + pr.w - 6;
    for (const [i, col, label] of [[0, C.gold, "theory: θ = KP/(1+KP)"], [1, C.green, "simulation, time average"]]) {
      const y = pr.y + pr.h - 24 + i * 15;
      text(ctx, label, lgx - 24, y + 3, { color: col, size: 10, align: "right" });
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lgx - 20, y); ctx.lineTo(lgx, y); ctx.stroke();
    }

    info.textContent = `K·P = ${KP.toFixed(1)} · simulated θ = ${avg.toFixed(2)} (${covered()} of ${NS} sites full right now) · predicted KP/(1+KP) = ${pred.toFixed(2)}`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
