// Debye–Hückel: one central ion and its ionic atmosphere. Ions diffuse in the screened potential of the (fixed) central ion, so the cloud forms by itself; its thickness is λ_D = 0.304/√I nm.
import { C, canvas, controls, slider, loop, readout, axes, curve, text, clamp } from "./kit.js";

export const title = "Ionic atmospheres";
export const caption = "Every ion in salt water gathers a cloud of opposite charge that screens its field beyond the Debye length. Debye and Hückel (1923) used this to explain how dissolved salts behave. More salt means a tighter cloud and a shorter reach. The ring's thickness is to scale with the nanometre bar; ion numbers are compressed and the cloud's pull is exaggerated.";

const TAU = 2 * Math.PI, LB = 0.714, LBOX = 22, RC = 0.5, RI = 0.27, RX = RC + RI, NMAX = 300, D = 3; // Bjerrum length of water at 25 °C, box side, central and ion radii, contact distance (all nm), ions, diffusion (nm²/s)
// ponytail: the coupling is 6× the real Bjerrum length so a few hundred ions show a visible cloud; λ_D itself is exact.
const BOOST = 6;
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(TAU * Math.random());
const lamOf = I => 0.304 / Math.sqrt(I);                       // Debye length (nm), 1:1 salt in water at 25 °C, I in mol/L
// ponytail: ion count is compressed to 30–300 across the three decades of concentration (the real density rises 1000-fold); ions ignore each other (mean field).
const countOf = lg => 2 * Math.round(15 * 10 ** ((lg + 3) / 3));

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Left: salt ions jiggling in water around one highlighted central ion, with a ring marking the thickness of its ionic atmosphere. Right: a graph of the screened potential against the bare 1/r potential; the screened one dies away faster the saltier the water." });
  const row = controls(root), info = readout(root);
  let lg = -2, lam = lamOf(10 ** lg), n = countOf(lg);
  const X = new Float32Array(NMAX), Y = new Float32Array(NMAX);
  for (let i = 0; i < NMAX; i++) { X[i] = (Math.random() - 0.5) * LBOX; Y[i] = (Math.random() - 0.5) * LBOX; }

  // Overdamped diffusion of each ion in U/kT = q·B·l_B·e^(−r/λ)/r (the central ion is +1). The stationary state is the Debye–Hückel Boltzmann cloud.
  function step(dt) {
    const m = Math.ceil(dt * 60), h = dt / m, s = Math.sqrt(2 * D * h), half = LBOX / 2;
    for (let k = 0; k < m; k++) for (let i = 0; i < n; i++) {
      const q = i & 1 ? -1 : 1, x = X[i], y = Y[i], r = Math.max(Math.hypot(x, y), RX);
      const f = (D * h * q * BOOST * LB * Math.exp(-r / lam) * (1 / r + 1 / lam)) / (r * r);   // outward drift per unit of x, y
      let nx = x + f * x + s * gauss(), ny = y + f * y + s * gauss();
      const nr = Math.hypot(nx, ny) || 1e-9;
      if (nr < RX) { nx *= RX / nr; ny *= RX / nr; }                                          // hard core
      X[i] = clamp(nx > half ? LBOX - nx : nx < -half ? -LBOX - nx : nx, -half, half);       // reflecting walls
      Y[i] = clamp(ny > half ? LBOX - ny : ny < -half ? -LBOX - ny : ny, -half, half);
    }
  }
  const settle = () => { for (let k = 0; k < 300; k++) step(1 / 30); };
  settle();

  slider(row, { label: "Salt concentration", min: -3, max: 0, step: 0.05, value: lg, fmt: v => `${(10 ** v).toPrecision(2)} M` }, v => {
    lg = v; lam = lamOf(10 ** v); n = countOf(v);
    if (!lp.playing) settle();
    lp.redraw();
  });
  const lp = loop(row, (_, dt) => draw(dt));

  function draw(dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    if (dt) step(dt);
    const fs = clamp(w / 52, 10, 13), S = Math.round(Math.min(w * 0.58, h - 38)), bx = 8, by = 24, sc = S / LBOX, cx = bx + S / 2, cy = by + S / 2;

    // ── the water box ──
    text(ctx, "salt water, 25 °C", bx, 15, { color: C.muted, size: fs });
    ctx.fillStyle = "rgba(79,168,255,0.04)"; ctx.fillRect(bx, by, S, S);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, S - 1, S - 1);
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, S, S); ctx.clip();
    // ponytail: the ring is measured from the central ion's surface (contact distance + λ_D) so it stays visible at high salt, where λ_D is smaller than the drawn ion.
    const R = (RX + lam) * sc;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, "rgba(227,194,127,0.30)"); g.addColorStop(1, "rgba(227,194,127,0.05)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);

    const ri = Math.max(2, RI * sc);
    ctx.globalAlpha = 0.9;
    for (const [first, col] of [[0, C.red], [1, C.blue]]) {
      ctx.fillStyle = col; ctx.beginPath();
      for (let i = first; i < n; i += 2) { const x = cx + X[i] * sc, y = cy + Y[i] * sc; ctx.moveTo(x + ri, y); ctx.arc(x, y, ri, 0, TAU); }
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const rc = Math.max(4.5, RC * sc);                                  // the central ion
    const cg = ctx.createRadialGradient(cx - rc * 0.3, cy - rc * 0.3, rc * 0.1, cx, cy, rc);
    cg.addColorStop(0, "#fff1c9"); cg.addColorStop(1, C.gold);
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, rc, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    if (rc >= 7) text(ctx, "+", cx, cy + 0.5, { color: "#1a1408", size: rc * 1.5, align: "center", base: "middle", weight: 700 });

    const ca = Math.cos(-0.7), sa = Math.sin(-0.7);                     // the λ_D marker: from the ion's surface to the ring
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx + ca * RX * sc, cy + sa * RX * sc); ctx.lineTo(cx + ca * R, cy + sa * R); ctx.stroke();
    ctx.fillStyle = "rgba(15,13,11,0.7)"; ctx.fillRect(cx + ca * R + 2, cy + sa * R - fs - 3, fs * 2 + 4, fs + 3);
    text(ctx, "λ_D", cx + ca * R + 4, cy + sa * R - 4, { color: C.gold, size: fs, weight: 600 });

    const bar = 5 * sc, sy = by + S - 9;                               // scale bar, 5 nm
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(bx + 8, sy - 3); ctx.lineTo(bx + 8, sy + 3); ctx.moveTo(bx + 8, sy); ctx.lineTo(bx + 8 + bar, sy); ctx.moveTo(bx + 8 + bar, sy - 3); ctx.lineTo(bx + 8 + bar, sy + 3); ctx.stroke();
    text(ctx, "5 nm", bx + 8 + bar / 2, sy - 6, { align: "center", size: fs });
    ctx.restore();

    // ── potential of the central ion ──
    const x0 = bx + S + 12, r = { x: x0 + 26, y: by + 14, w: w - 8 - (x0 + 26), h: Math.round(S * 0.5) };
    const PX = v => r.x + ((v - 0.5) / 7.5) * r.w;
    axes(ctx, r, { xLabel: "distance (nm)", yLabel: "potential" });
    for (const v of [2, 4, 6, 8]) text(ctx, v, PX(v), r.y + r.h + 13, { align: "center", color: C.muted, size: 10 });
    curve(ctx, r, [0.5, 8], [0, 1.05], x => 0.5 / x, { color: C.muted, dash: [5, 4], width: 1.5, n: 90 });
    curve(ctx, r, [0.5, 8], [0, 1.05], x => (0.5 / x) * Math.exp(-x / lam), { color: C.gold, width: 2.5, n: 90 });
    if (lam >= 0.5 && lam <= 8) {
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(PX(lam), r.y + r.h); ctx.lineTo(PX(lam), r.y + 12); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "λ_D", PX(lam) + (lam > 5.5 ? -3 : 3), r.y + 9, { align: lam > 5.5 ? "right" : "left", color: C.gold, size: 10 });
    }
    text(ctx, "bare 1/r", r.x + r.w - 2, r.y + r.h * 0.4, { align: "right", color: C.muted, size: 10 });
    text(ctx, "screened", r.x + r.w - 2, r.y + r.h * 0.4 + 13, { align: "right", color: C.gold, size: 10 });

    // ── key ──
    const ky = r.y + r.h + 52;
    for (const [i, col, label] of [[0, C.gold, "central ion (+)"], [1, C.red, "+ ions"], [2, C.blue, "− ions"]]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0 + 5, ky - 3 + i * 14, 4, 0, TAU); ctx.fill();
      text(ctx, label, x0 + 14, ky + i * 14, { size: 10, color: C.muted });
    }

    info.textContent = `Debye length λ_D = ${lam.toPrecision(2)} nm at ${(10 ** lg).toPrecision(2)} M (1:1 salt, water, 25 °C)`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
