// Fowler: electron degeneracy pressure holds up a white dwarf. More mass means a smaller star, down to zero radius at the Chandrasekhar limit.
import { C, canvas, controls, slider, loop, readout, axes, text, map, clamp } from "./kit.js";

export const title = "White dwarf support";
export const caption = "A white dwarf packs a star's mass into roughly an Earth-sized ball, yet it does not collapse. Fowler (1926) showed why: electrons obey the exclusion principle, so squeezing them forces them to move faster, and that pressure holds the star up. Adding mass makes the dwarf smaller. Chandrasekhar later extended this and found the mass limit, about 1.4 solar masses. Zoomed speeds are not to scale.";

const MCH = 1.44, E_IN_SUN = 0.00917;                                    // Chandrasekhar mass (M☉); R⊕ in R☉
const RSUN_KM = 695700, RSUN_CM = 6.957e10, MSUN_G = 1.989e33;
const TAU = 2 * Math.PI, N = 40;
const radius = M => 0.0112 * Math.sqrt((M / MCH) ** (-2 / 3) - (M / MCH) ** (2 / 3));   // Nauenberg's fit, R/R☉
const rEarths = M => radius(M) / E_IN_SUN;
const density = M => (M * MSUN_G) / ((4 / 3) * Math.PI * (radius(M) * RSUN_CM) ** 3);     // g/cm³
const RHO_MIN = density(0.2);
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sci = x => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(1)}×10${[...String(e)].map(c => (c === "-" ? "⁻" : SUP[+c])).join("")}`; };

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "Left: a white dwarf drawn to scale next to an Earth disc; it shrinks as its mass grows. Upper right: electrons jiggling faster inside as density rises. Lower right: a graph of radius against mass with the current mass, Sirius B and the Chandrasekhar limit." });
  const row = controls(root), info = readout(root);
  let M = 1;
  // electrons in the zoomed box: position in box fractions and a heading
  const ex = Float32Array.from({ length: N }, () => Math.random()), ey = Float32Array.from({ length: N }, () => Math.random()), eh = Float32Array.from({ length: N }, () => Math.random() * TAU);
  slider(row, { label: "Mass", min: 0.2, max: 1.43, step: 0.01, value: M, fmt: v => `${v.toFixed(2)} M☉` }, v => { M = v; lp.redraw(); });
  const lp = loop(row, (_, dt) => draw(dt));

  function draw(dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13);
    const Re = rEarths(M), rho = density(M), f = (rho / RHO_MIN) ** (1 / 3);   // speed factor, Fermi momentum ∝ ρ^(1/3)

    text(ctx, "Size next to Earth", w * 0.03, h * 0.065, { color: C.muted, size: fs });
    text(ctx, "Inside (zoomed)", w * 0.56, h * 0.065, { color: C.muted, size: fs });
    text(ctx, "Radius in Earth radii, by mass", w * 0.56, h * 0.54, { color: C.muted, size: fs });

    // ── star and Earth, to the same scale ──
    const cx = w * 0.26, rE = w * 0.064, rS = Math.max(2.2, rE * Re), sy = h * 0.37, ey0 = h * 0.76;
    // the star and Earth discs are to scale; the soft glow around the star is decoration
    const glow = ctx.createRadialGradient(cx, sy, 0, cx, sy, rS * 1.3 + 4);
    glow.addColorStop(0, "rgba(255,236,190,0.45)"); glow.addColorStop(1, "rgba(255,236,190,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, sy, rS * 1.3 + 4, 0, TAU); ctx.fill();
    const sg = ctx.createRadialGradient(cx, sy, 0, cx, sy, rS);
    sg.addColorStop(0, "#fffdf5"); sg.addColorStop(0.7, "#ffe9b8"); sg.addColorStop(1, C.gold);
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, sy, rS, 0, TAU); ctx.fill();
    text(ctx, "white dwarf", cx, h * 0.615, { align: "center", color: C.gold, size: fs });
    const eg = ctx.createRadialGradient(cx - rE * 0.3, ey0 - rE * 0.3, 0, cx, ey0, rE);
    eg.addColorStop(0, "#7db6ff"); eg.addColorStop(1, "#2a5aa6");
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, ey0, rE, 0, TAU); ctx.fill();
    text(ctx, "Earth", cx, ey0 + rE + fs + 3, { align: "center", color: C.blue, size: fs });

    // ── electrons, zoomed ──
    // ponytail: the box shows the same 40 electrons whatever the density; only their speed changes, on a log scale (real v ∝ ρ^(1/3), much steeper near the limit)
    const B = { x: w * 0.56, y: h * 0.1, w: w * 0.41, h: h * 0.34 }, sp = 0.12 + 0.28 * Math.log(f);   // box widths per second
    ctx.fillStyle = "rgba(79,168,255,0.05)"; ctx.fillRect(B.x, B.y, B.w, B.h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(B.x, B.y, B.w, B.h);
    ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = 1.5;
    const tail = Math.min(12, sp * B.w * 0.06);
    for (let i = 0; i < N; i++) {
      if (dt > 0) {
        eh[i] += (Math.random() - 0.5) * 8 * dt;
        ex[i] += Math.cos(eh[i]) * sp * dt; ey[i] += Math.sin(eh[i]) * sp * dt * (B.w / B.h);
        if (ex[i] < 0 || ex[i] > 1) { ex[i] = clamp(ex[i], 0, 1); eh[i] = Math.PI - eh[i]; }
        if (ey[i] < 0 || ey[i] > 1) { ey[i] = clamp(ey[i], 0, 1); eh[i] = -eh[i]; }
      }
      const px = B.x + 4 + ex[i] * (B.w - 8), py = B.y + 4 + ey[i] * (B.h - 8);
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(eh[i]) * tail, py - Math.sin(eh[i]) * tail); ctx.stroke();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const sl = `speed ×${f.toFixed(f < 10 ? 1 : 0)}`;
    ctx.fillStyle = "rgba(15,13,11,0.75)"; ctx.fillRect(B.x + 2, B.y + B.h - fs - 7, sl.length * fs * 0.56 + 8, fs + 5);
    text(ctx, sl, B.x + 5, B.y + B.h - 5, { color: C.ink, size: fs });

    // ── radius against mass ──
    const r = { x: w * 0.64, y: h * 0.58, w: w * 0.32, h: h * 0.22 }, X = m => map(m, 0.2, 1.6, r.x, r.x + r.w), Y = v => r.y + r.h - (v / 2.6) * r.h;
    axes(ctx, r, { xLabel: "mass (M☉)" });
    for (const m of [0.5, 1, 1.5]) text(ctx, String(m), X(m), r.y + r.h + 13, { align: "center", color: C.muted, size: 10 });
    for (const v of [1, 2]) text(ctx, String(v), r.x - 4, Y(v) + 3.5, { align: "right", color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(MCH), r.y); ctx.lineTo(X(MCH), r.y + r.h); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "limit ≈ 1.4", X(MCH) - 4, r.y + 10, { align: "right", color: C.muted, size: 10 });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 100; i++) { const m = 0.2 + ((MCH - 0.0001 - 0.2) * i) / 100, x = X(m), y = Y(rEarths(m)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(1), Y(rEarths(1)), 4, 0, TAU); ctx.stroke();
    text(ctx, "Sirius B", X(1) - 6, Y(rEarths(1)) + 14, { align: "right", color: C.ink, size: 10 });
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(M), Y(Re), 4.5, 0, TAU); ctx.fill();

    info.textContent = `${M.toFixed(2)} M☉: radius ${Math.round(radius(M) * RSUN_KM).toLocaleString("en-US")} km (${Re.toFixed(2)} Earth), density ${sci(rho)} g/cm³`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
