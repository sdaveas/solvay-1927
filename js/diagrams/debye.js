// Debye: heat capacity of a solid. Gold = Debye model, dashed blue = Einstein (θE = 0.8 θD, approximate), dashed grey = Dulong–Petit.
import { C, canvas, controls, slider, loop, readout, axes, curve, text, map } from "./kit.js";

export const title = "Heat capacity of solids";
export const caption = "A solid soaks up heat by vibrating, but only as many vibrations as the temperature can excite. Debye (1912) let the lattice ring with waves of all lengths, so heat capacity rises as T³ near absolute zero and levels off at the classical Dulong–Petit value. Einstein's single-frequency curve (dashed, with an approximate θE) falls too steeply. The jiggling atoms are schematic.";

const THETA_CU = 343, TMAX = 1.5, NT = 150, COLS = 12, ROWS = 3;
const f = x => (x < 1e-9 ? 0 : x ** 4 / (4 * Math.sinh(x / 2) ** 2)); // x⁴eˣ/(eˣ−1)²
const debye = tau => { // C/3Nk = 3τ³ ∫₀^(1/τ) f(x) dx by Simpson's rule (τ = T/θD); the integrand is ~0 beyond x = 60
  const xm = Math.min(1 / tau, 60), n = 200, hs = xm / n;
  let s = f(0) + f(xm);
  for (let i = 1; i < n; i++) s += f(i * hs) * (i % 2 ? 4 : 2);
  return 3 * tau ** 3 * ((s * hs) / 3);
};
const einstein = tau => { if (tau < 1e-3) return 0; const u = 0.8 / tau; return (u * u) / (4 * Math.sinh(u / 2) ** 2); }; // (θE/T)² eᵘ/(eᵘ−1)², θE = 0.8 θD
const TD = Array.from({ length: NT + 1 }, (_, i) => debye((TMAX * i) / NT)); // curves are drawn from tables, the marker is computed live
const TE = Array.from({ length: NT + 1 }, (_, i) => einstein((TMAX * i) / NT));
const occ = x => x / Math.expm1(x); // energy in a mode relative to kT: 1 when kT ≫ ħω, frozen out when kT ≪ ħω

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "A small lattice of vibrating atoms above a graph of heat capacity against temperature, showing the Debye curve, the Einstein curve and the Dulong–Petit limit." });
  const row = controls(root), info = readout(root);
  let tau = 0.5;
  slider(row, { label: "T / θ_D", min: 0.02, max: TMAX, step: 0.01, value: tau, fmt: v => v.toFixed(2) }, v => { tau = v; lp.redraw(); });

  // ponytail: schematic lattice dynamics. Six travelling waves per axis; wave m has amplitude ∝ √(kT·occ)/ω, so short waves freeze out at low T. Visual only.
  const modes = Array.from({ length: 6 }, (_, m) => {
    const q = (m + 1) / 6.5, ang = Math.random() * 2 * Math.PI;
    return { q, kx: Math.PI * q * Math.cos(ang), ky: Math.PI * q * Math.sin(ang), w: 1.5 + 5 * q, px: Math.random() * 6.3, py: Math.random() * 6.3 };
  });
  const amp = (m, T) => Math.sqrt(T * occ(m.q / T)) / m.q;
  const norm = 0.21 / Math.sqrt(modes.reduce((s, m) => s + amp(m, TMAX) ** 2 / 2, 0)); // rms jiggle = 0.21 spacings at T/θD = 1.5

  const lp = loop(row, t => draw(t));

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const L0 = h * 0.3, cu = Math.round(tau * THETA_CU);

    // ── Lattice ─────────────────────────────────────────────
    const s = Math.min((w * 0.56) / (COLS - 1), (L0 - 24) / ROWS), lx = 16 + 0.35 * s, ly = 14 + 0.5 * s;
    const hue = Math.round(48 - 28 * (tau / TMAX));
    ctx.fillStyle = `hsl(${hue}, 95%, 62%)`;
    ctx.beginPath();
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      let dx = 0, dy = 0;
      for (const m of modes) {
        const ph = m.kx * i + m.ky * j - m.w * t, a = norm * s * amp(m, tau);
        dx += a * Math.cos(ph + m.px); dy += a * Math.cos(ph + m.py);
      }
      const x = lx + i * s + dx, y = ly + j * s + dy;
      ctx.moveTo(x + s * 0.2, y); ctx.arc(x, y, s * 0.2, 0, 2 * Math.PI);
    }
    ctx.fill();
    const tx = lx + (COLS - 1) * s + 1.6 * s, ty = ly + s;
    text(ctx, "copper lattice", tx, ty - 8, { color: C.gold, size: 11, weight: 600 });
    text(ctx, `T = ${cu} K`, tx, ty + 7, { size: 11 });
    text(ctx, `θ_D ≈ ${THETA_CU} K`, tx, ty + 21, { color: C.muted, size: 10 });

    // ── Heat capacity curves ────────────────────────────────
    const pr = { x: 42, y: L0 + 24, w: w - 58, h: h - L0 - 58 }, Y = 1.15;
    const X = v => map(v, 0, TMAX, pr.x, pr.x + pr.w), Yp = v => map(v, 0, Y, pr.y + pr.h, pr.y);
    ctx.fillStyle = "rgba(255,214,102,0.07)"; ctx.fillRect(pr.x, pr.y, X(0.1) - pr.x, pr.h); // the T³ regime, T/θD < 0.1
    text(ctx, "T³", pr.x + 3, pr.y + pr.h * 0.45, { color: C.gold, size: 10 });
    axes(ctx, pr);
    text(ctx, "C / 3Nk", pr.x, pr.y - 7, { color: C.muted, size: 10 });
    for (const v of [0, 0.5, 1]) text(ctx, v, pr.x - 5, Yp(v) + 3, { color: C.muted, size: 10, align: "right" });
    for (const v of [0, 0.5, 1, 1.5]) text(ctx, v, X(v), pr.y + pr.h + 13, { color: C.muted, size: 10, align: "center" });
    text(ctx, "T / θ_D", pr.x + pr.w, pr.y + pr.h + 26, { color: C.muted, size: 10, align: "right" });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pr.x, Yp(1)); ctx.lineTo(pr.x + pr.w, Yp(1)); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "Dulong–Petit: 3Nk", pr.x + pr.w - 4, Yp(1) - 4, { color: C.muted, size: 10, align: "right" });
    curve(ctx, pr, [0, TMAX], [0, Y], x => TE[Math.round((x / TMAX) * NT)], { color: C.blue, dash: [5, 4], width: 1.8, n: NT });
    curve(ctx, pr, [0, TMAX], [0, Y], x => TD[Math.round((x / TMAX) * NT)], { color: C.gold, width: 2.5, n: NT });
    const cd = debye(tau), ce = einstein(tau);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(X(tau), pr.y + pr.h); ctx.lineTo(X(tau), Yp(Math.max(cd, ce))); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(X(tau), Yp(ce), 3, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X(tau), Yp(cd), 4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    const lgx = pr.x + pr.w - 6;
    for (const [i, col, dash, label] of [[0, C.gold, [], "Debye model"], [1, C.blue, [5, 4], "Einstein, approx. θ_E = 0.8 θ_D"]]) {
      const y = pr.y + pr.h - 24 + i * 15;
      text(ctx, label, lgx - 24, y + 3, { color: col, size: 10, align: "right" });
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(lgx - 20, y); ctx.lineTo(lgx, y); ctx.stroke(); ctx.setLineDash([]);
    }

    info.textContent = tau < 0.1
      ? `T/θ_D = ${tau.toFixed(2)} (copper at ${cu} K): C ∝ T³ (Debye's law), C = ${cd.toFixed(3)} × 3Nk`
      : `T/θ_D = ${tau.toFixed(2)} (copper at ${cu} K): Debye C = ${cd.toFixed(2)} × 3Nk · Einstein ${ce.toFixed(2)} · classical limit 1`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
