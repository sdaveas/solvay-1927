// Bragg: X-ray diffraction from stacked atomic planes (rock salt, d = 0.282 nm; copper Kα, λ = 0.154 nm).
import { C, canvas, controls, slider, toggle, loop, readout, axes, curve, text, map } from "./kit.js";

export const title = "X-ray diffraction";
export const caption = "Lawrence Bragg saw in 1912 that a crystal's atomic layers act like stacked mirrors. Rays reflected from neighbouring planes travel different distances. When the extra path 2d sin θ is a whole number of wavelengths, the reflections add up and the detector lights. Drag θ, or let it sweep. Four planes are drawn, but the signal sums six.";

const D_NM = 0.282, LAM = 0.154, NPL = 6, RAD = Math.PI / 180, T0 = 4, T1 = 60;
const pathDiff = th => (2 * D_NM * Math.sin(th * RAD)) / LAM; // 2d·sinθ in wavelengths
// |Σⱼ e^(i·2π·j·δ/λ)|² over NPL planes, normalised to 1: sin²(Nπr) / (N² sin²(πr)).
const signal = th => { const s = Math.sin(Math.PI * pathDiff(th)); return Math.abs(s) < 1e-6 ? 1 : (Math.sin(NPL * Math.PI * pathDiff(th)) / (NPL * s)) ** 2; };
const TAB = Array.from({ length: (T1 - T0) * 4 + 1 }, (_, i) => signal(T0 + i / 4)); // sampled every 0.25°

export function mount(root) {
  const cv = canvas(root, { aspect: 1.1, label: "Diagram of X-rays reflecting from layers of atoms in a crystal, with a detector that glows when reflections from different layers are in step, above a graph of detector signal against angle." });
  const row = controls(root), info = readout(root);
  let th = 8, sweeping = true, auto = false, phase = -1.2;
  const sl = slider(row, { label: "Angle θ", min: 5, max: 60, step: 0.1, value: th, fmt: v => `${v.toFixed(1)}°` }, v => {
    th = v;
    if (!auto) { sweeping = false; sw.checked = false; } // dragging takes over from the sweep
    lp.redraw();
  });
  const sw = toggle(row, "Sweep θ", true, on => { sweeping = on; });
  const lp = loop(row, (t, dt) => {
    if (sweeping && dt) {
      phase += dt * 0.4;
      th = 32.5 + 27.5 * Math.sin(phase);
      sl.value = th; auto = true; sl.dispatchEvent?.(new Event("input")); auto = false; // keeps the slider and its label in step
    }
    draw(t);
  });

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const r = pathDiff(th), I = signal(th), a = th * RAD, ca = Math.cos(a), sa = Math.sin(a);

    // ── Crystal and rays ────────────────────────────────────
    // ponytail: the drawing is to scale in d : λ (so wave crests are λ/d apart), but only 4 planes are drawn and the signal sums 6.
    const schH = Math.round(h * 0.64);
    const D = Math.min((w - 20) / 8.2, (schH - 46) / 5.3), lam = D * (LAM / D_NM), Ls = 2 * D;
    const xa = w / 2, y0 = schH - 3 * D - 24;
    ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1; ctx.setLineDash([]);
    for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.moveTo(xa - 3.5 * D, y0 + j * D); ctx.lineTo(xa + 3.5 * D, y0 + j * D); ctx.stroke(); }
    for (let j = 0; j < 4; j++) for (let i = -3; i <= 3; i++) { // rock salt: atoms alternate in a checkerboard
      const na = ((i + j) & 1) === 0;
      ctx.fillStyle = na ? C.gold : C.muted;
      ctx.beginPath(); ctx.arc(xa + i * D, y0 + j * D, D * (na ? 0.16 : 0.23), 0, 2 * Math.PI); ctx.fill();
    }
    // Each ray j starts on a common wavefront and ends on a common one, so ray j travels 2·j·D·sinθ further than ray 0.
    const march = ((t * 0.8) % 1) * lam;
    for (let j = 0; j < 4; j++) {
      const qy = y0 + j * D, L = Ls + j * D * sa;
      ctx.beginPath(); ctx.moveTo(xa - L * ca, qy - L * sa); ctx.lineTo(xa, qy); ctx.lineTo(xa + L * ca, qy - L * sa);
      ctx.setLineDash([]); ctx.strokeStyle = `rgba(110,185,255,${j < 2 ? 0.2 : 0.1})`; ctx.lineWidth = 1; ctx.stroke();
      ctx.setLineDash([lam * 0.4, lam * 0.6]); ctx.lineDashOffset = -march;
      ctx.strokeStyle = `rgba(130,200,255,${j < 2 ? 1 : 0.55})`; ctx.lineWidth = 2.2; ctx.stroke();
    }
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
    // The path difference between rays 0 and 1: two legs of length D·sinθ (gold), measured from perpendiculars dropped from P.
    const fy = y0 + D * ca * ca, f1 = xa - D * ca * sa, f2 = xa + D * ca * sa;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(f1, fy); ctx.lineTo(xa, y0); ctx.lineTo(f2, fy); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(f1, fy); ctx.lineTo(xa, y0 + D); ctx.lineTo(f2, fy); ctx.stroke(); ctx.lineCap = "butt";
    // The glancing angle θ at P.
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(xa, y0, D * 0.9, Math.PI, Math.PI + a); ctx.stroke();
    text(ctx, "θ", xa + 1.35 * D * Math.cos(Math.PI + a + 0.3) - 3, y0 + 1.35 * D * Math.sin(Math.PI + a + 0.3) + 4, { size: 11 });

    // Detector at 2θ from the incoming beam, glowing with the signal.
    const dd = Ls + 0.5 * D, off = 1.5 * D * ca, dx = xa + dd * ca + off * sa, dy = y0 - dd * sa + off * ca, half = off + 0.4 * D;
    const rg = D * (0.2 + 0.55 * I), g = ctx.createRadialGradient(dx, dy, 0, dx, dy, rg);
    g.addColorStop(0, `rgba(255,214,102,${0.1 + 0.85 * I})`); g.addColorStop(1, "rgba(255,214,102,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, rg, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(dx - half * sa, dy - half * ca); ctx.lineTo(dx + half * sa, dy + half * ca); ctx.stroke(); ctx.lineCap = "butt";

    text(ctx, `gold: extra path 2d sin θ = ${r.toFixed(2)} λ`, 8, 16, { color: C.gold, size: 11 });
    text(ctx, "plane spacing d = 0.282 nm", 8, schH - 3, { color: C.muted, size: 10 });
    text(ctx, "X-ray λ = 0.154 nm", w - 8, schH - 3, { color: C.muted, size: 10, align: "right" });

    // ── Signal against angle ────────────────────────────────
    const pr = { x: 36, y: schH + 22, w: w - 50, h: h - schH - 54 }, Y = 1.12;
    const X = v => map(v, T0, T1, pr.x, pr.x + pr.w), Yp = v => map(v, 0, Y, pr.y + pr.h, pr.y);
    axes(ctx, pr, { yLabel: "signal" });
    for (const v of [10, 20, 30, 40, 50, 60]) text(ctx, v, X(v), pr.y + pr.h + 13, { color: C.muted, size: 10, align: "center" });
    text(ctx, "glancing angle θ (degrees)", pr.x + pr.w, pr.y + pr.h + 26, { color: C.muted, size: 10, align: "right" });
    for (let n = 1; n <= 3; n++) {
      const tn = Math.asin((n * LAM) / (2 * D_NM)) / RAD;
      if (tn <= T1) text(ctx, `n=${n}`, X(tn), pr.y - 5, { color: C.muted, size: 10, align: "center" });
    }
    curve(ctx, pr, [T0, T1], [0, Y], x => TAB[Math.round((x - T0) * 4)], { color: C.gold, width: 2, n: (T1 - T0) * 4 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(X(th), pr.y + pr.h); ctx.lineTo(X(th), Yp(I)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X(th), Yp(I), 4, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();

    const verdict = I >= 0.5 ? `in step: bright, order ${Math.round(r)}` : I < 0.05 ? "out of step: reflections cancel" : "partly in step";
    info.textContent = `θ = ${th.toFixed(1)}° · path difference 2d sin θ = ${r.toFixed(2)} λ · detector ${Math.round(I * 100)}% (${verdict})`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
