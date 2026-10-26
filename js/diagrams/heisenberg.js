// Heisenberg: uncertainty principle. A Gaussian packet has the minimum Δx·Δp = ħ/2, with σp = ħ/(2σx). Units: ħ = 1.
import { C, canvas, controls, slider, loop, readout, text } from "./kit.js";

export const title = "Uncertainty principle";
export const caption = "Squeeze a wave packet into a small region (small Δx) and you must mix in many wavelengths, so its momentum spread Δp widens. Δx·Δp can never fall below ħ/2, and this Gaussian packet sits exactly on that limit. The packet's shape is held fixed as it moves (real packets spread), and heights are scaled to fit.";

const K0 = 5, XR = 8, VG = 2.4, VP = 1.2, PMAX = 10, NP = 240; // carrier wavenumber, half-width of the window, group and phase speeds, momentum axis, samples

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "Top: a wave packet in position space that drifts across the window and wraps around, with a bracket marking its width Δx. Bottom: its momentum distribution, with a bracket marking Δp. A narrower packet has a wider momentum distribution." });
  const row = controls(root), info = readout(root);
  const ENV = new Float64Array(NP + 1), RE = new Float64Array(NP + 1);
  let sx = 1.2;
  slider(row, { label: "Position spread Δx", min: 0.4, max: 2.5, step: 0.05, value: sx, fmt: v => v.toFixed(2) }, v => { sx = v; lp.redraw(); });

  // Square-ish bracket from xl to xr at height y, ticks pointing down.
  const bracket = (ctx, xl, xr, y) => { ctx.beginPath(); ctx.moveTo(xl, y + 5); ctx.lineTo(xl, y); ctx.lineTo(xr, y); ctx.lineTo(xr, y + 5); ctx.stroke(); };

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]);
    const px = w * 0.07, pw = w * 0.86, X = x => px + ((x + XR) / (2 * XR)) * pw, P = p => px + (p / PMAX) * pw;
    const yc = h * 0.29, amp = h * 0.125, yb = h * 0.88, ph = h * 0.18;
    const sp = 1 / (2 * sx), x0 = ((VG * t + XR - 3) % (2 * XR)) - XR, phase = K0 * (VG - VP) * t;

    // Position space: the packet and its periodic images (so it wraps smoothly), ψ = Σ e^(−d²/4σ²) cos(k₀d + φ).
    for (let i = 0; i <= NP; i++) {
      const x = -XR + (2 * XR * i) / NP;
      let env = 0, re = 0;
      for (let m = -1; m <= 1; m++) {
        const d = x - x0 + 2 * XR * m, g = Math.exp(-(d * d) / (4 * sx * sx));
        env += g; re += g * Math.cos(K0 * d + phase);
      }
      ENV[i] = env; RE[i] = re;
    }
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(px, yc); ctx.lineTo(px + pw, yc); ctx.stroke();
    ctx.globalAlpha = 0.9; ctx.setLineDash([5, 4]);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= NP; i++) { const x = px + (pw * i) / NP, y = yc - s * amp * ENV[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= NP; i++) { const x = px + (pw * i) / NP, y = yc - amp * RE[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();

    // Δx bracket, ±σx about the packet centre (drawn on the wrapped images too, clipped to the window).
    ctx.save(); ctx.beginPath(); ctx.rect(px - 1, 0, pw + 2, h * 0.2); ctx.clip();
    ctx.strokeStyle = C.green; ctx.lineWidth = 1.5;
    for (let m = -1; m <= 1; m++) bracket(ctx, X(x0 - sx + 2 * XR * m), X(x0 + sx + 2 * XR * m), h * 0.115);
    ctx.restore();
    text(ctx, "±Δx", X(x0), h * 0.115 - 5, { align: "center", color: C.green, size: 11, weight: 600 });
    text(ctx, "position x", px + pw, h * 0.51, { align: "right", color: C.muted, size: 10 });

    // Momentum space: |φ(p)|² is a Gaussian centred on p₀ = ħk₀ with σp = ħ/(2σx).
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, yb); ctx.lineTo(px + pw, yb); ctx.moveTo(P(K0), yb); ctx.lineTo(P(K0), yb + 4); ctx.stroke();
    const gy = p => yb - ph * Math.exp(-((p - K0) ** 2) / (2 * sp * sp));
    ctx.beginPath(); ctx.moveTo(px, yb);
    for (let i = 0; i <= NP; i++) ctx.lineTo(px + (pw * i) / NP, gy((PMAX * i) / NP));
    ctx.lineTo(px + pw, yb); ctx.closePath();
    ctx.globalAlpha = 0.28; ctx.fillStyle = C.gold; ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= NP; i++) { const x = px + (pw * i) / NP, y = gy((PMAX * i) / NP); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.strokeStyle = C.green; ctx.lineWidth = 1.5;
    bracket(ctx, P(K0 - sp), P(K0 + sp), yb - ph - 10);
    text(ctx, "±Δp", P(K0), yb - ph - 15, { align: "center", color: C.green, size: 11, weight: 600 });
    text(ctx, "p₀", P(K0), yb + 15, { align: "center", color: C.muted, size: 10 });
    text(ctx, "momentum p", px + pw, yb + 15, { align: "right", color: C.muted, size: 10 });

    info.textContent = `Δx = ${sx.toFixed(2)} · Δp = ħ/(2Δx) = ${sp.toFixed(2)} · Δx·Δp = ${(sx * sp).toFixed(2)} = ħ/2 (units: ħ = 1)`;
  }

  const lp = loop(row, t => draw(t));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
