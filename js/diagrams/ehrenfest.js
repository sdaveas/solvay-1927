// Ehrenfest: in a harmonic well a coherent-state packet keeps its shape and its average position follows the classical orbit exactly.
import { C, canvas, controls, slider, loop, readout, text, map, clamp } from "./kit.js";

export const title = "Quantum averages follow Newton";
export const caption = "Quantum particles are spread out, yet their average position obeys Newton. In a parabolic well the gold wave packet keeps its shape and its centre ⟨x⟩ swings exactly like the blue classical ball. Ehrenfest's theorem (1927): exact for a spring-like force like this one, only approximate in general.";

// ponytail: lengths are in units of the packet width σ, and ω = 2 rad/s is just a pleasant speed; the physics only needs a parabola and a coherent state
const TAU = 2 * Math.PI, OMEGA = 2, SIGMA = 1, XMAX = 6;
const PEAK = 1 / (SIGMA * Math.sqrt(TAU));
const dens = (x, c) => PEAK * Math.exp(-((x - c) ** 2) / (2 * SIGMA * SIGMA));   // |ψ|² of a coherent state centred at c
const f2 = v => (Math.round(v * 100) / 100 + 0).toFixed(2);                      // avoids "-0.00"

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A parabola for a harmonic potential with a gold quantum wave packet sliding back and forth in it. Below, a blue classical ball slides along a track in exact step with the packet's average position." });
  const row = controls(root), info = readout(root);
  let x0 = 3;
  slider(row, { label: "Amplitude x₀", min: 0, max: 4.5, step: 0.1, value: x0, fmt: v => `${v.toFixed(1)} widths` }, v => { x0 = v; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t));

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13);
    const X = x => map(x, -XMAX, XMAX, w * 0.06, w * 0.94), y0 = h * 0.66, hV = h * 0.42, hG = h * 0.15;
    const xc = x0 * Math.cos(OMEGA * t + 1);                // classical position, and the packet's centre
    const yE = y0 - ((x0 * x0) / (XMAX * XMAX)) * hV;        // the packet's energy level

    text(ctx, "|ψ|² quantum packet", w * 0.06, h * 0.085, { color: C.gold, size: fs });
    text(ctx, "potential V(x)", w * 0.94, h * 0.085, { color: C.muted, size: fs, align: "right" });

    // the well, and the energy line between the turning points ±x₀
    ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 80; i++) { const x = -XMAX + (2 * XMAX * i) / 80, px = X(x), py = y0 - ((x * x) / (XMAX * XMAX)) * hV; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    if (x0 > 0.2) {
      ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(-x0), yE); ctx.lineTo(X(x0), yE); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.muted; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(X(s * x0), yE, 3, 0, TAU); ctx.fill(); }
    }

    // |ψ|², filled; ⟨x⟩ computed by summing x|ψ|² over the packet
    ctx.beginPath(); ctx.moveTo(X(-XMAX), yE);
    for (let i = 0; i <= 120; i++) { const x = -XMAX + (2 * XMAX * i) / 120; ctx.lineTo(X(x), yE - (dens(x, xc) / PEAK) * hG); }
    ctx.lineTo(X(XMAX), yE); ctx.closePath();
    ctx.fillStyle = "rgba(227,194,127,0.28)"; ctx.fill();
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const x = -XMAX + (2 * XMAX * i) / 120; i ? ctx.lineTo(X(x), yE - (dens(x, xc) / PEAK) * hG) : ctx.moveTo(X(x), yE - (dens(x, xc) / PEAK) * hG); }
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    let ex = 0;
    for (let i = 0; i <= 240; i++) { const x = xc - 6 + i * 0.05; ex += x * dens(x, xc) * 0.05; }

    // ⟨x⟩ marker, with a guide down to the classical ball
    const mx = X(ex), my = yE - hG - 6, yr = h * 0.82, rb = Math.max(6, h * 0.035);
    ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx, yr); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx - 5, my - 8); ctx.lineTo(mx + 5, my - 8); ctx.closePath(); ctx.fill();
    text(ctx, "⟨x⟩", mx, my - 11, { color: C.gold, size: fs, align: "center", weight: 600 });

    // the classical ball on its own track, with a short trail
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(-XMAX), yr); ctx.lineTo(X(XMAX), yr); ctx.stroke();
    if (x0 > 0.2) {
      ctx.lineWidth = 1; ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(X(s * x0), yr - 5); ctx.lineTo(X(s * x0), yr + 5); } ctx.stroke();
      text(ctx, "−x₀", X(-x0), yr + 18, { color: C.muted, size: 10, align: "center" });
      text(ctx, "+x₀", X(x0), yr + 18, { color: C.muted, size: 10, align: "center" });
    }
    text(ctx, "classical ball", w * 0.94, yr - rb - 5, { color: C.blue, size: fs, align: "right" });
    ctx.fillStyle = C.blue;
    for (let j = 14; j >= 1; j--) {
      ctx.globalAlpha = 0.5 * (1 - j / 15); ctx.beginPath(); ctx.arc(X(x0 * Math.cos(OMEGA * (t - j * 0.03) + 1)), yr, rb * (1 - j / 18), 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(X(xc), yr, rb, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();

    info.textContent = `⟨x⟩ = ${f2(ex)} (quantum average) · x = ${f2(xc)} (classical ball), in packet widths.`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
