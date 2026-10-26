// Planck: blackbody spectrum. Solid = Planck's law; dashed = the classical Rayleigh–Jeans prediction.
import { C, canvas, controls, slider, loop, readout, axes, curve, text, map, wavelengthColor, kelvinColor } from "./kit.js";

export const title = "Blackbody radiation";
export const caption = "A hot object glows at many wavelengths at once. Planck's formula (solid) matches what experiments measured. The classical prediction (dashed) climbs without limit at short wavelengths: the ‘ultraviolet catastrophe’ that the quantum resolved. Drag the temperature: hotter objects glow far brighter and peak at shorter wavelengths.";

const h = 6.62607015e-34, c = 2.99792458e8, k = 1.380649e-23, WIEN = 2.897771955e-3;
const planck = (nm, T) => { const l = nm * 1e-9; return (2 * h * c * c) / l ** 5 / Math.expm1((h * c) / (l * k * T)); };
const rayleighJeans = (nm, T) => { const l = nm * 1e-9; return (2 * c * k * T) / l ** 4; };
const L0 = 100, L1 = 3000; // wavelength range shown, nm

export function mount(root) {
  const cv = canvas(root, { label: "Graph of light intensity against wavelength for a glowing object, next to the glowing object itself." });
  const row = controls(root), info = readout(root);
  let T = 5000, cdf = [], photons = [], spawn = 0;
  const grid = Array.from({ length: 291 }, (_, i) => L0 + i * 10);
  const resample = () => { let s = 0; cdf = grid.map(nm => (s += planck(nm, T))).map(v => v / s); };
  const pick = () => { const u = Math.random(); return grid[cdf.findIndex(v => v >= u)] ?? L1; };
  resample();
  slider(row, { label: "Temperature", min: 2000, max: 8000, step: 100, value: T, fmt: v => `${v} K` }, v => { T = v; resample(); lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));

  function draw(dt) {
    const { ctx, w, h: H } = cv;
    ctx.clearRect(0, 0, w, H);

    // The glowing object, shedding photons coloured by wavelengths drawn from Planck's distribution.
    const ox = w * 0.14, oy = H * 0.45, orad = Math.min(w * 0.07, H * 0.13), reach = w * 0.13;
    spawn += dt * (8 + 90 * (T / 8000) ** 4); // ponytail: visual rate only; real total power grows as T^4
    while (spawn >= 1) { spawn--; photons.push({ a: Math.random() * 2 * Math.PI, d: orad, nm: pick() }); }
    photons = photons.filter(p => (p.d += dt * 90) < orad + reach);
    for (const p of photons) {
      ctx.fillStyle = wavelengthColor(p.nm, 1 - (p.d - orad) / reach);
      ctx.beginPath(); ctx.arc(ox + Math.cos(p.a) * p.d, oy + Math.sin(p.a) * p.d, 2.8, 0, 2 * Math.PI); ctx.fill();
    }
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, orad * 1.8);
    g.addColorStop(0, kelvinColor(T)); g.addColorStop(0.55, kelvinColor(T, 0.9)); g.addColorStop(1, kelvinColor(T, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, orad * 1.8, 0, 2 * Math.PI); ctx.fill();
    text(ctx, `${T} K`, ox, oy + orad * 1.8 + 16, { align: "center", color: C.muted });

    // The spectrum.
    const r = { x: w * 0.34, y: H * 0.08, w: w * 0.62, h: H * 0.68 };
    const peak = (WIEN / T) * 1e9, top = planck(peak, T) * 1.25;
    for (let nm = 380; nm < 750; nm += 2) {
      ctx.fillStyle = wavelengthColor(nm);
      ctx.fillRect(map(nm, L0, L1, r.x, r.x + r.w), r.y + r.h + 3, (r.w * 2) / (L1 - L0) + 0.5, 6);
    }
    axes(ctx, r, { xLabel: "wavelength (nm)", yLabel: "intensity" });
    for (const nm of [500, 1000, 1500, 2000, 2500]) text(ctx, nm, map(nm, L0, L1, r.x, r.x + r.w), r.y + r.h + 21, { align: "center", color: C.muted, size: 10 });
    curve(ctx, r, [L0, L1], [0, top], nm => rayleighJeans(nm, T), { color: C.red, dash: [6, 5], width: 1.5 });
    curve(ctx, r, [L0, L1], [0, top], nm => planck(nm, T), { color: C.gold, width: 2.5 });
    const px = map(peak, L0, L1, r.x, r.x + r.w);
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, r.y + r.h); ctx.lineTo(px, r.y + r.h * 0.18); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `peak ${Math.round(peak)} nm`, px + 4, r.y + r.h * 0.18, { size: 11 });
    text(ctx, "classical prediction", r.x + 6, r.y + 10, { color: C.red, size: 11 });
    text(ctx, "Planck's law", r.x + r.w - 4, r.y + 10, { color: C.gold, size: 11, align: "right" });

    const band = peak < 380 ? "ultraviolet" : peak <= 750 ? "visible" : "infrared";
    info.textContent = `Peak wavelength ${Math.round(peak)} nm, in the ${band} range. For scale: the Sun's surface is about 5,800 K, a candle flame about 1,900 K.`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
