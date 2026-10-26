// Schrödinger: particle in a box. ψₙ = √(2/L) sin(nπx/L) e^(−iEₙt/ħ), Eₙ ∝ n². Units: L = 1.
import { C, canvas, controls, slider, toggle, loop, readout, text } from "./kit.js";

export const title = "Particle in a box";
export const caption = "A particle confined between two walls can only hold wave patterns that fit: ψₙ = √(2/L) sin(nπx/L), with energy growing as n². In a stationary state the phase spins but the probability |ψ|² never moves. Mix n = 1 and 2 and the density sloshes back and forth at the beat frequency (E₂ − E₁)/ħ. Time is slowed so the phase can be seen.";

const W1 = 1.2, NP = 160; // ω₁ in rad/s (ponytail: slowed enormously; a real electron in a nanometre box turns ~10¹⁵ times faster); samples across the box
const SQ2 = Math.SQRT2;

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "Top: the real (blue) and imaginary (violet) parts of a particle-in-a-box wave function. Bottom: the probability density |ψ|² in gold. An energy ladder and a rotating phase arrow sit on the right." });
  const row = controls(root), info = readout(root);
  const RE = new Float64Array(NP + 1), IM = new Float64Array(NP + 1);
  let n = 1, sup = false;
  const nInp = slider(row, { label: "State n", min: 1, max: 4, step: 1, value: n, fmt: v => `n = ${v}` }, v => { n = v; lp.redraw(); });
  toggle(row, "Superposition of n = 1 and 2", false, on => { sup = on; nInp.disabled = on; lp.redraw(); });

  // Fill RE/IM with ψ(x, t). Superposition is (ψ₁ + ψ₂)/√2 with equal weights, ω₂ = 4ω₁.
  function evaluate(t) {
    for (let i = 0; i <= NP; i++) {
      const x = i / NP;
      if (sup) {
        const a = Math.sin(Math.PI * x), b = Math.sin(2 * Math.PI * x);
        RE[i] = a * Math.cos(W1 * t) + b * Math.cos(4 * W1 * t);
        IM[i] = -(a * Math.sin(W1 * t) + b * Math.sin(4 * W1 * t));
      } else {
        const a = SQ2 * Math.sin(n * Math.PI * x), ph = n * n * W1 * t;
        RE[i] = a * Math.cos(ph); IM[i] = -a * Math.sin(ph);
      }
    }
  }

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]);
    evaluate(t);
    const px = w * 0.07, pw = w * 0.64, y1 = h * 0.11, h1 = h * 0.36, y2 = h * 0.58, h2 = h * 0.27;
    const yc = y1 + h1 / 2, yb = y2 + h2, sY = h1 / 2 / 1.85, sD = h2 / 3.3, X = i => px + (pw * i) / NP;

    // Panel labels.
    text(ctx, "Re ψ", px + 6, y1 - 5, { color: C.blue, size: 11 });
    text(ctx, "Im ψ", px + 48, y1 - 5, { color: C.violet, size: 11 });
    text(ctx, "|ψ|²", px + 6, y2 - 5, { color: C.gold, size: 11 });

    // Zero lines and the two walls.
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(px, yc); ctx.lineTo(px + pw, yc); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(px, yb); ctx.lineTo(px + pw, yb); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, y1); ctx.lineTo(px, yb); ctx.moveTo(px + pw, y1); ctx.lineTo(px + pw, yb); ctx.stroke();
    text(ctx, "0", px, yb + 13, { align: "center", color: C.muted, size: 10 });
    text(ctx, "L", px + pw, yb + 13, { align: "center", color: C.muted, size: 10 });

    // Re ψ and Im ψ.
    for (const [A, color, lw] of [[RE, C.blue, 2], [IM, C.violet, 1.2]]) {
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
      for (let i = 0; i <= NP; i++) { const y = yc - sY * A[i]; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); }
      ctx.stroke();
    }

    // |ψ|², filled.
    ctx.beginPath(); ctx.moveTo(px, yb);
    for (let i = 0; i <= NP; i++) ctx.lineTo(X(i), yb - sD * (RE[i] * RE[i] + IM[i] * IM[i]));
    ctx.lineTo(px + pw, yb); ctx.closePath();
    ctx.globalAlpha = 0.3; ctx.fillStyle = C.gold; ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= NP; i++) { const y = yb - sD * (RE[i] * RE[i] + IM[i] * IM[i]); i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); }
    ctx.stroke();

    // Energy ladder, Eₙ = n² E₁ (to scale).
    const lx = w * 0.76, lw = w * 0.11, ytop = h * 0.14, ybot = h * 0.56, yE = k => ybot - ((k * k) / 17) * (ybot - ytop);
    text(ctx, "energy", lx, y1 - 5, { color: C.muted, size: 10 });
    const occ = sup ? [1, 2] : [n], col = sup ? [C.blue, C.green] : [C.blue];
    for (let k = 1; k <= 4; k++) {
      const i = occ.indexOf(k), on = i >= 0;
      ctx.strokeStyle = on ? C.gold : C.muted; ctx.lineWidth = on ? 2.5 : 1.5; ctx.globalAlpha = on ? 1 : 0.6;
      ctx.beginPath(); ctx.moveTo(lx, yE(k)); ctx.lineTo(lx + lw, yE(k)); ctx.stroke();
      ctx.globalAlpha = 1;
      text(ctx, `n=${k}`, lx + lw + 4, yE(k) + 3.5, { color: on ? C.gold : C.muted, size: 10 });
      if (on) { ctx.fillStyle = col[i]; ctx.beginPath(); ctx.arc(lx + lw / 2, yE(k), 3.5, 0, 2 * Math.PI); ctx.fill(); }
    }

    // Phase arrows: e^(−iEt/ħ) turns clockwise at ωₙ = n² ω₁.
    const pcx = w * 0.86, pcy = h * 0.78, pr = Math.min(w * 0.07, h * 0.105);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, 2 * Math.PI); ctx.stroke();
    occ.forEach((k, i) => {
      const ph = k * k * W1 * t, x = pcx + pr * Math.cos(ph), y = pcy + pr * Math.sin(ph);
      ctx.strokeStyle = ctx.fillStyle = col[i]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pcx, pcy); ctx.lineTo(x, y); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * Math.PI); ctx.fill();
    });
    text(ctx, sup ? "phases" : "phase", pcx, pcy + pr + 12, { align: "center", color: C.muted, size: 10 });

    info.textContent = sup
      ? `n = 1 + 2: density sloshes at (E₂ − E₁)/ħ = ${(3 * W1).toFixed(1)} rad/s, once every ${((2 * Math.PI) / (3 * W1)).toFixed(1)} s`
      : `n = ${n}: E = ${n * n} E₁ · phase turns at ${(n * n * W1).toFixed(1)} rad/s · |ψ|² stays put`;
  }

  const lp = loop(row, t => draw(t));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
