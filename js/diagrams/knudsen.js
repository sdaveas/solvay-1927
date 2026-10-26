// Knudsen: gas molecules in a narrow channel. Kn = λ/d picks the regime; pressure sets the mean free path, λ ∝ 1/P.
import { C, canvas, controls, slider, loop, readout, text, clamp } from "./kit.js";

export const title = "When gases get thin";
export const caption = "The Knudsen number, Kn = λ/d, compares a molecule's mean free path with the width of its channel. At low Kn molecules jostle each other and flow like a fluid. At high Kn they cross the channel and strike the walls far more often than each other. Pressure sets λ; the molecule count stays fixed. A gentle push drives the flow, and the pink trail follows one molecule.";

// ponytail: toy kinetics. The molecule count is fixed at 150 and pressure acts only through the collision probability |v|Δt/λ; the partner is the
// nearest neighbour and velocities are re-randomised (with a forward bias standing in for the push), so momentum is not conserved. Wall bounces are diffuse (cosine law).
const NM = 150, V0 = 2.4, PUSH = 0.3, TR = 90, LIFE = 0.25, LO = -2.5, HI = 2; // speeds in channel widths per second; LO..HI = log10 Kn range of the regime bar
const REGIMES = [
  { max: 0.01, name: "continuum flow", short: "continuum", col: C.blue, alts: ["continuum", "cont."] },
  { max: 0.1, name: "slip flow", short: "slip flow", col: C.green, alts: ["slip"] },
  { max: 10, name: "transition flow", short: "transition", col: C.gold, alts: ["transition"] },
  { max: Infinity, name: "free molecular (Knudsen) flow", short: "free molecular", col: C.violet, alts: ["free molecular", "free mol.", "free"] },
];
const fmtKn = k => (k < 1 ? k.toPrecision(2) : k < 10 ? k.toFixed(1) : k.toFixed(0));

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "Gas molecules moving along a narrow channel, colliding with each other in gold flashes and with the walls in blue flashes, above a bar showing the flow regime for the current Knudsen number." });
  const row = controls(root), info = readout(root);
  let Kn = 0.5, L = 3.2, cW = 0, cM = 0, wN = 0, mN = 0, fbM = 0, fbW = 0, tn = 0;
  const x = new Float32Array(NM), y = new Float32Array(NM), vx = new Float32Array(NM), vy = new Float32Array(NM), trail = new Float32Array(2 * TR);
  const F = Array.from({ length: 48 }, () => ({ age: -1, wall: false, x1: 0, y1: 0, x2: 0, y2: 0 }));
  const pressure = s => 10 ** (0.04 * s - 1.7); // relative pressure; Kn = 1 / pressure
  slider(row, { label: "Pressure", min: 0, max: 100, step: 1, value: 50, fmt: s => { const P = pressure(s); return P < 1 ? P.toFixed(2) : P < 10 ? P.toFixed(1) : String(Math.round(P)); } }, s => { Kn = 1 / pressure(s); lp.redraw(); });
  const lp = loop(row, (_, dt) => { step(dt); draw(); });

  const flash = (wall, x1, y1, x2, y2) => { const f = F.find(p => p.age < 0); if (f) Object.assign(f, { age: 0, wall, x1, y1, x2, y2 }); };
  const speed = () => V0 * (0.6 + 0.8 * Math.random());
  function scatter(i) { // a new random direction, with a forward bias
    let a = Math.random() * 2 * Math.PI;
    if (Math.cos(a) < 0 && Math.random() < PUSH) a = Math.PI - a;
    const s = speed(); vx[i] = s * Math.cos(a); vy[i] = s * Math.sin(a);
  }
  function wall(i, side) { // diffuse reflection: the outgoing angle follows the cosine law, whatever the incoming one
    y[i] = side;
    let t = 2 * Math.random() - 1; // sin of the angle from the wall normal
    if (t < 0 && Math.random() < PUSH) t = -t;
    const s = speed(), nrm = Math.sqrt(1 - t * t);
    vx[i] = s * t; vy[i] = side ? -s * nrm : s * nrm;
    wN++;
    if (fbW < 3) { fbW++; flash(true, x[i], side, x[i], side); }
  }
  function collide(i) { // with the nearest other molecule
    let j = 0, best = 1e9, bx = 0, by = 0;
    for (let k = 0; k < NM; k++) {
      if (k === i) continue;
      let dx = x[k] - x[i]; if (dx > L / 2) dx -= L; else if (dx < -L / 2) dx += L;
      const dy = y[k] - y[i], d2 = dx * dx + dy * dy;
      if (d2 < best) { best = d2; j = k; bx = dx; by = dy; }
    }
    scatter(i); scatter(j); mN++;
    if (fbM < 3) { fbM++; flash(false, x[i], y[i], x[i] + bx, y[i] + by); }
  }
  for (let i = 0; i < NM; i++) { x[i] = Math.random() * L; y[i] = Math.random(); scatter(i); }

  function step(dt) {
    if (!dt) return;
    const nsub = clamp(Math.ceil((1.4 * V0 * dt) / Kn / 0.4), 1, 24), hh = dt / nsub; // keep the per-step collision probability small
    fbM = fbW = 0;
    for (let k = 0; k < nsub; k++) for (let i = 0; i < NM; i++) {
      x[i] += vx[i] * hh; y[i] += vy[i] * hh;
      if (x[i] >= L || x[i] < 0) x[i] -= L * Math.floor(x[i] / L); // the channel wraps round: what leaves on the right re-enters on the left
      if (y[i] < 0) wall(i, 0); else if (y[i] > 1) wall(i, 1);
      if (Math.random() < (Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]) * hh) / Kn) collide(i);
    }
    const dec = Math.exp(-dt / 2); // collision counts over roughly the last two seconds
    cW = cW * dec + wN; cM = cM * dec + mN; wN = mN = 0;
    for (const f of F) if (f.age >= 0 && (f.age += dt) > LIFE) f.age = -1;
    trail[2 * (tn % TR)] = x[0]; trail[2 * (tn % TR) + 1] = y[0]; tn++;
  }

  function draw() {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const x0 = 26, Lpx = w - x0 - 10, dpx = Math.min(Lpx / 2.7, h - 105), y0 = 34 + Math.max(0, h - dpx - 105) / 4;
    L = Lpx / dpx;
    const X = u => x0 + (u / L) * Lpx, Y = v => y0 + v * dpx, r = clamp(dpx / 40, 2.2, 5);
    const reg = REGIMES.find(g => Kn < g.max);

    // ── Channel ─────────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.025)"; ctx.fillRect(x0, y0, Lpx, dpx);
    ctx.fillStyle = C.muted; ctx.fillRect(x0, y0 - 4, Lpx, 4); ctx.fillRect(x0, y0 + dpx, Lpx, 4);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); // the channel width d
    ctx.moveTo(12, y0); ctx.lineTo(12, y0 + dpx / 2 - 9); ctx.moveTo(12, y0 + dpx / 2 + 9); ctx.lineTo(12, y0 + dpx);
    ctx.moveTo(9, y0 + 5); ctx.lineTo(12, y0); ctx.lineTo(15, y0 + 5); ctx.moveTo(9, y0 + dpx - 5); ctx.lineTo(12, y0 + dpx); ctx.lineTo(15, y0 + dpx - 5);
    ctx.stroke();
    text(ctx, "d", 12, y0 + dpx / 2 + 4, { color: C.muted, size: 11, align: "center" });
    // the tagged molecule's trail
    const cnt = Math.min(tn, TR);
    ctx.strokeStyle = "rgba(255,143,207,0.55)"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let k = 0, px = 0; k < cnt; k++) {
      const idx = (tn - cnt + k) % TR, tx = trail[2 * idx], ty = trail[2 * idx + 1];
      if (k === 0 || Math.abs(tx - px) > L / 2) ctx.moveTo(X(tx), Y(ty)); else ctx.lineTo(X(tx), Y(ty));
      px = tx;
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(236,228,214,0.9)";
    ctx.beginPath();
    for (let i = 1; i < NM; i++) { ctx.moveTo(X(x[i]) + r, Y(y[i])); ctx.arc(X(x[i]), Y(y[i]), r, 0, 2 * Math.PI); }
    ctx.fill();
    ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(X(x[0]), Y(y[0]), r + 1.5, 0, 2 * Math.PI); ctx.fill();
    for (const f of F) {
      if (f.age < 0) continue;
      const k = f.age / LIFE, a = 1 - k;
      if (f.wall) {
        ctx.fillStyle = `rgba(79,168,255,${0.85 * a})`;
        ctx.beginPath(); ctx.arc(X(f.x1), Y(f.y1), r * (1 + 1.8 * k), 0, 2 * Math.PI); ctx.fill();
      } else {
        const mx = (X(f.x1) + X(f.x2)) / 2, my = (Y(f.y1) + Y(f.y2)) / 2;
        ctx.strokeStyle = `rgba(255,214,102,${a})`; ctx.lineWidth = 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(X(f.x1), Y(f.y1)); ctx.lineTo(X(f.x2), Y(f.y2)); ctx.stroke(); ctx.lineCap = "butt";
        ctx.fillStyle = `rgba(255,214,102,${0.7 * a})`;
        ctx.beginPath(); ctx.arc(mx, my, r * (1 + 1.8 * k), 0, 2 * Math.PI); ctx.fill();
      }
    }

    // ── Labels, mean free path, regime bar ──────────────────
    text(ctx, `Kn = ${fmtKn(Kn)}`, 10, 18, { color: C.gold, size: 14, weight: 600 });
    text(ctx, w < 340 ? reg.short : reg.name, w - 10, 18, { color: reg.col, size: 12, align: "right" });
    const yr = y0 + dpx + 18, lamPx = Kn * dpx;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, yr); ctx.lineTo(x0 + clamp(lamPx, 2, Lpx), yr); ctx.moveTo(x0, yr - 4); ctx.lineTo(x0, yr + 4); ctx.moveTo(x0 + clamp(lamPx, 2, Lpx), yr - 4); ctx.lineTo(x0 + clamp(lamPx, 2, Lpx), yr + 4); ctx.stroke();
    text(ctx, `mean free path λ = ${fmtKn(Kn)} d${lamPx > Lpx ? " (off the end)" : ""}`, x0, yr + 15, { color: C.muted, size: 10 });
    const yb = yr + 24, P = l => x0 + ((l - LO) / (HI - LO)) * Lpx, bounds = [LO, -2, -1, 1, HI];
    REGIMES.forEach((g, i) => {
      ctx.globalAlpha = 0.4; ctx.fillStyle = g.col; ctx.fillRect(P(bounds[i]), yb, P(bounds[i + 1]) - P(bounds[i]), 12); ctx.globalAlpha = 1;
      const room = P(bounds[i + 1]) - P(bounds[i]) - 6, name = g.alts.find(s => s.length * 5.4 <= room);
      if (name) text(ctx, name, (P(bounds[i]) + P(bounds[i + 1])) / 2, yb + 9, { size: 10, align: "center" });
    });
    text(ctx, "Kn", x0 - 4, yb + 9, { color: C.muted, size: 10, align: "right" });
    for (const [l, s] of [[-2, "0.01"], [-1, "0.1"], [1, "10"]]) text(ctx, s, P(l), yb + 24, { color: C.muted, size: 10, align: "center" });
    const mk = P(clamp(Math.log10(Kn), LO, HI)), gi = REGIMES.indexOf(reg);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(P(bounds[gi]) + 0.5, yb + 0.5, P(bounds[gi + 1]) - P(bounds[gi]) - 1, 11); // the current regime
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(mk - 4, yb - 7); ctx.lineTo(mk + 4, yb - 7); ctx.lineTo(mk, yb - 1); ctx.fill(); // marker, clear of the labels

    const ratio = cM < 0.3 ? "walls only" : cW / cM >= 100 ? `${Math.round(cW / cM)} : 1` : `${(cW / cM).toFixed(cW / cM < 10 ? 2 : 0)} : 1`;
    info.textContent = cW + cM < 5 ? `Kn = ${fmtKn(Kn)} · ${reg.name} · measuring collisions…`
      : `Kn = ${fmtKn(Kn)} · ${reg.name} · wall : molecule collisions ≈ ${ratio}`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
