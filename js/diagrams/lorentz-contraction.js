// Lorentz: length contraction. A rod moving at speed βc past a lab is measured shorter along its motion: L = L₀/γ, γ = 1/√(1−β²).
import { C, canvas, controls, slider, loop, readout, text, axes, curve, map } from "./kit.js";

export const title = "Length contraction";
export const caption = "A rod that is exactly one unit long at rest is measured shorter when it flies past: L = L₀/γ, with γ = 1/√(1−β²). Only the length along the motion shrinks, and it is barely noticeable below a tenth of light speed. Lorentz's transformations of space and time contain this shrinking. The speed on screen is slowed down for viewing.";

const L0 = 0.5, V0 = 0.55; // rest length (canvas widths) and on-screen speed at β = 1 (canvas widths per second). ponytail: the on-screen speed is just for viewing; the length contraction itself is exact

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "A ruled rod flying to the right over a stationary ruler. A dashed ghost shows its length at rest; the solid rod is shorter, by a factor one over gamma. A small graph of gamma against speed has a marker at the current speed." });
  const row = controls(root), info = readout(root);
  let beta = 0.8, s = 0.3; // speed as a fraction of c; rod position along its looping track
  const gamma = () => 1 / Math.sqrt(1 - beta * beta);
  slider(row, { label: "Speed β", min: 0, max: 0.99, step: 0.01, value: beta, fmt: v => `${v.toFixed(2)} c` }, v => { beta = v; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));

  function draw(dt) {
    const { ctx, w, h } = cv, g = gamma(), L = L0 / g;
    if (dt) s = (s + beta * V0 * dt) % (1 + L0);
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);
    const cx = (s - L0 / 2) * w, x1 = cx - (L * w) / 2, x2 = cx + (L * w) / 2, gx1 = cx - (L0 * w) / 2, gx2 = cx + (L0 * w) / 2;
    const yc = h * 0.2, rh = Math.max(14, h * 0.1), yR = h * 0.41;

    text(ctx, "Lab frame", w * 0.03, h * 0.07, { color: C.muted, size: 10 });
    text(ctx, `v = ${beta.toFixed(2)} c  →`, w * 0.97, h * 0.07, { color: C.gold, size: 12, align: "right", weight: 600 });

    // Speed streaks behind the rod.
    if (beta > 0.02) {
      const len = beta * w * 0.2, sg = ctx.createLinearGradient(x1, 0, x1 - len, 0);
      sg.addColorStop(0, "rgba(227,194,127,0.5)"); sg.addColorStop(1, "rgba(227,194,127,0)");
      ctx.strokeStyle = sg; ctx.lineWidth = 2;
      ctx.beginPath();
      for (const o of [-0.3, 0, 0.3]) { ctx.moveTo(x1 - 4, yc + o * rh); ctx.lineTo(x1 - len, yc + o * rh); }
      ctx.stroke();
    }

    // The ghost: the rod as it would be at rest, with its ruler ticks.
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.strokeRect(gx1, yc - rh / 2 - 5, gx2 - gx1, rh + 10);
    ctx.setLineDash([]); ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) { const x = gx1 + ((gx2 - gx1) * i) / 10; ctx.moveTo(x, yc + rh / 2 + 5); ctx.lineTo(x, yc + rh / 2 + (i % 5 ? 9 : 12)); }
    ctx.stroke(); ctx.globalAlpha = 1;

    // The moving rod, contracted, with its own ruler ticks squeezed by the same factor.
    ctx.fillStyle = C.gold; ctx.fillRect(x1, yc - rh / 2, x2 - x1, rh);
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(x1, yc - rh / 2, x2 - x1, rh * 0.28);
    ctx.strokeStyle = "#2a2218"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) { const x = x1 + ((x2 - x1) * i) / 10; ctx.moveTo(x, yc + rh / 2); ctx.lineTo(x, yc + rh / 2 - (i % 5 ? rh * 0.3 : rh * 0.55)); }
    ctx.stroke();

    // The lab ruler (ticks every L₀/10) and the stretch of it the rod covers.
    const rx0 = w * 0.03, rx1 = w * 0.97, tk = (L0 * w) / 10;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx0, yR); ctx.lineTo(rx1, yR);
    for (let i = 0; rx0 + i * tk <= rx1 + 0.5; i++) { ctx.moveTo(rx0 + i * tk, yR); ctx.lineTo(rx0 + i * tk, yR + (i % 5 ? 4 : 7)); }
    ctx.stroke();
    text(ctx, "lab ruler", rx0, yR - 7, { color: C.muted, size: 10 });
    const a = Math.max(rx0, x1), b = Math.min(rx1, x2);
    ctx.strokeStyle = "rgba(227,194,127,0.5)"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(x1, yc + rh / 2); ctx.lineTo(x1, yR); ctx.moveTo(x2, yc + rh / 2); ctx.lineTo(x2, yR); ctx.stroke();
    ctx.setLineDash([]);
    if (b > a) { ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a, yR); ctx.lineTo(b, yR); ctx.stroke(); }
    const lx = Math.min(w * 0.82, Math.max(w * 0.18, cx));
    text(ctx, `L = ${(L / L0).toFixed(2)} L₀`, lx, yR + 24, { color: C.gold, size: 12, align: "center", weight: 600 });

    // Legend.
    const lgx = w * 0.04;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.strokeRect(lgx, h * 0.64, 14, 8); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.fillRect(lgx, h * 0.74, 14, 8);
    text(ctx, "rest length L₀", lgx + 22, h * 0.64 + 8, { color: C.muted, size: 10 });
    text(ctx, "length in the lab", lgx + 22, h * 0.74 + 8, { color: C.muted, size: 10 });
    text(ctx, "L = L₀ / γ", lgx, h * 0.9, { color: C.gold, size: 13, weight: 700 });

    // Inset: γ against speed.
    const r = { x: w * 0.62, y: h * 0.6, w: w * 0.3, h: h * 0.28 }, GM = 7.4;
    axes(ctx, r, {});
    curve(ctx, r, [0, 1], [1, GM], x => (x < 0.995 ? 1 / Math.sqrt(1 - x * x) : GM * 2), { color: C.gold, width: 2 });
    const mx = map(beta, 0, 1, r.x, r.x + r.w), my = map(g, 1, GM, r.y + r.h, r.y);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(mx, r.y + r.h); ctx.lineTo(mx, my); ctx.lineTo(r.x, my); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(mx, my, 4.5, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = C.bg; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(mx, my, 4.5, 0, 2 * Math.PI); ctx.stroke();
    for (const [v, lab] of [[0, "0"], [0.5, "0.5"], [1, "1"]]) text(ctx, lab, map(v, 0, 1, r.x, r.x + r.w), r.y + r.h + 13, { color: C.muted, size: 10, align: "center" });
    for (const v of [1, 4, 7]) text(ctx, v, r.x - 5, map(v, 1, GM, r.y + r.h, r.y) + 3.5, { color: C.muted, size: 10, align: "right" });
    text(ctx, "γ", r.x + 6, r.y + 8, { color: C.gold, size: 12, weight: 600 });
    text(ctx, "β", r.x + r.w + 6, r.y + r.h + 4, { color: C.muted, size: 11 });

    info.textContent = `β = ${beta.toFixed(2)} · γ = ${g.toFixed(3)} · lab length L = ${(L / L0).toFixed(3)} L₀ (rest length L₀ = 1)`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
