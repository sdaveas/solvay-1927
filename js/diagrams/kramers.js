// Kramers: a Lorentz oscillator gives ε(ω) = 1 + ωp²/(ω₀² − ω² − iγω). n and κ come from √ε, so absorption and refraction rise and fall together.
import { C, canvas, controls, slider, loop, readout, axes, curve, text, map, clamp } from "./kit.js";

export const title = "Absorption and refraction";
export const caption = "A material's electrons behave like springs with a resonant frequency. Near it the material absorbs strongly (red κ), and the refractive index (gold n) swings up and then down. The two curves are linked: this is the Kramers–Kronig relation. Inside the slab the wavelength shrinks to λ/n and the wave fades. Surface reflection is ignored.";

const WP2 = 0.25;                       // ωp² with ωp = 0.5 ω₀, and ω₀ = 1
const TAU = 2 * Math.PI, OUT = { n: 1, k: 0 };
// n + iκ = √ε, principal root (κ ≥ 0 because Im ε ≥ 0)
function nk(om, g) {
  const d = 1 - om * om, den = d * d + g * g * om * om;
  const e1 = 1 + (WP2 * d) / den, e2 = (WP2 * g * om) / den, m = Math.hypot(e1, e2);
  OUT.n = Math.sqrt((m + e1) / 2); OUT.k = Math.sqrt(Math.max(0, (m - e1) / 2));
}

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "Top: a light wave enters a slab of material; inside, its wavelength shortens and its amplitude decays. Bottom: graph of refractive index n in gold and absorption κ in red against light frequency, with a marker at the chosen frequency." });
  const row = controls(root), info = readout(root);
  let om = 0.93, g = 0.12;
  slider(row, { label: "Light frequency", min: 0.5, max: 1.5, step: 0.01, value: om, fmt: v => `${v.toFixed(2)} ω₀` }, v => { om = v; lp.redraw(); });
  slider(row, { label: "Damping γ", min: 0.04, max: 0.4, step: 0.01, value: g, fmt: v => `${v.toFixed(2)} ω₀` }, v => { g = v; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t));

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13);
    nk(om, g);
    const n = OUT.n, kap = OUT.k;

    // ── The wave and the slab ──
    const xs = w * 0.4, xe = w * 0.94, top = h * 0.045, bot = h * 0.375, yc = (top + bot) / 2, A = h * 0.09;
    ctx.fillStyle = "rgba(79,168,255,0.08)"; ctx.fillRect(xs, top, xe - xs, bot - top);
    ctx.fillStyle = `rgba(255,90,78,${(0.32 * clamp(kap / 1.2, 0, 1)).toFixed(3)})`; ctx.fillRect(xs, top, xe - xs, bot - top); // the slab reddens as it absorbs
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(xs, top, xe - xs, bot - top);
    text(ctx, "vacuum", w * 0.04, top + fs + 2, { color: C.muted, size: fs });
    text(ctx, "material: λ = λ₀/n", xs + 6, top + fs + 2, { color: C.muted, size: fs });

    // ponytail: the visual wavelength is scaled to the canvas (λ₀ = 0.14w/ω); reflection at the surface is left out
    const lam0 = (0.14 * w) / om, k0 = TAU / lam0, v = 0.25 * w;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = w * 0.02; x <= w * 0.98; x += 2) {
      const inside = x >= xs, ph = inside ? k0 * (xs - v * t) + n * k0 * (x - xs) : k0 * (x - v * t), amp = inside ? A * Math.exp(-kap * k0 * (x - xs)) : A;
      const y = yc - amp * Math.sin(ph);
      x === w * 0.02 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); // decay envelope exp(−2πκx/λ₀)
    for (const sgn of [-1, 1]) for (let x = xs; x <= xe; x += 3) { const y = yc + sgn * A * Math.exp(-kap * k0 * (x - xs)); x === xs ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);

    // ── Plot of n and κ ──
    const r = { x: w * 0.12, y: h * 0.47, w: w * 0.84, h: h * 0.355 }, X = f => map(f, 0.5, 1.5, r.x, r.x + r.w), Y = val => r.y + r.h - (val / 2.4) * r.h;
    axes(ctx, r, { xLabel: "light frequency ω/ω₀" });
    for (const f of [0.6, 0.8, 1, 1.2, 1.4]) text(ctx, f.toFixed(1), X(f), r.y + r.h + 14, { align: "center", color: C.muted, size: 10 });
    for (const val of [0, 1, 2]) text(ctx, String(val), r.x - 4, Y(val) + 3.5, { align: "right", color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(r.x, Y(1)); ctx.lineTo(r.x + r.w, Y(1)); ctx.moveTo(X(1), r.y); ctx.lineTo(X(1), r.y + r.h); ctx.stroke(); // n = 1 and resonance ω₀
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    curve(ctx, r, [0.5, 1.5], [0, 2.4], f => (nk(f, g), OUT.n), { color: C.gold, width: 2.5 });
    curve(ctx, r, [0.5, 1.5], [0, 2.4], f => (nk(f, g), OUT.k), { color: C.red, width: 2.5 });
    text(ctx, "n  refractive index", r.x + r.w - 4, r.y + 12, { color: C.gold, size: fs, align: "right" });
    text(ctx, "κ  absorption", r.x + r.w - 4, r.y + 12 + fs + 3, { color: C.red, size: fs, align: "right" });
    nk(om, g);
    const mx = X(om);
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(mx, r.y); ctx.lineTo(mx, r.y + r.h); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    for (const [val, col] of [[n, C.gold], [kap, C.red]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(mx, clamp(Y(val), r.y, r.y + r.h), 4.5, 0, TAU); ctx.fill(); }

    info.textContent = `At ${om.toFixed(2)} ω₀: n = ${n.toFixed(2)}, κ = ${kap.toFixed(2)}` + (kap > 0.3 ? ", strong absorption." : kap < 0.05 ? ", nearly transparent." : ".");
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
