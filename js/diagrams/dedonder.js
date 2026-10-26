// De Donder: A <-> B with 200 molecules. Affinity A = RT ln(K[A]/[B]) measures distance from equilibrium; entropy production A·(dξ/dt)/T is never negative.
import { C, canvas, controls, slider, button, loop, readout, axes, text, map, clamp } from "./kit.js";

export const title = "Affinity drives a reaction";
export const caption = "In 1923 De Donder defined chemical affinity precisely: the drive of a reaction. Here molecules flip between A and B at random. Affinity, RT ln(K[A]/[B]), measures the distance from equilibrium. It shrinks to zero as the mixture settles, and the entropy produced on the way, affinity times reaction rate, is never negative. Change K mid-run and watch the drive return.";

const N = 200, K0 = 0.2, RT = 2.479, TWIN = 15, NORM = 1800; // molecules; rate scale (1/s); RT at 298 K in kJ/mol; plot window (s); entropy-production full scale

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "Left: 200 molecules of two kinds, blue A and gold B, bouncing in a box and flashing when they convert. Right: graph of the fraction converted to B rising to its equilibrium line. Below: two bars, the affinity and the entropy production, both shrinking as equilibrium is reached." });
  const row = controls(root), info = readout(root);
  let K = 2, t = 0, nextS = 0, nB = 0;
  const isB = new Uint8Array(N), px = new Float32Array(N), py = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N), fl = new Float32Array(N);
  let hT = [], hF = [];
  const heading = i => { const a = Math.random() * 2 * Math.PI, s = 0.12 + 0.14 * Math.random(); vx[i] = Math.cos(a) * s; vy[i] = Math.sin(a) * s; };
  for (let i = 0; i < N; i++) { px[i] = Math.random(); py[i] = Math.random(); heading(i); }
  function reset() { isB.fill(0); fl.fill(0); t = 0; nextS = 0; nB = 0; hT = []; hF = []; }
  reset();
  slider(row, { label: "Constant K", min: -2, max: 2, step: 0.05, value: Math.log2(K), fmt: v => (2 ** v).toFixed(2) }, v => { K = 2 ** v; lp.redraw(); });
  button(row, "Reset to all A", () => { reset(); lp.redraw(); });
  const lp = loop(row, (_, dt) => draw(dt));

  function draw(dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const kf = K0 * Math.sqrt(K), kb = K0 / Math.sqrt(K);
    if (dt) {
      const pf = 1 - Math.exp(-kf * dt), pb = 1 - Math.exp(-kb * dt);
      t += dt;
      for (let i = 0; i < N; i++) {
        if (isB[i] ? Math.random() < pb : Math.random() < pf) { isB[i] ^= 1; fl[i] = 1; }
        fl[i] = Math.max(0, fl[i] - dt * 2.5);
        if (Math.random() < dt * 0.8) heading(i);
        px[i] += vx[i] * dt; py[i] += vy[i] * dt;
        if (px[i] < 0 || px[i] > 1) { px[i] = clamp(px[i], 0, 1); vx[i] = -vx[i]; }
        if (py[i] < 0 || py[i] > 1) { py[i] = clamp(py[i], 0, 1); vy[i] = -vy[i]; }
      }
    }
    nB = 0; for (let i = 0; i < N; i++) nB += isB[i];
    if (dt && t >= nextS) { hT.push(t); hF.push(nB / N); nextS = t + 0.1; while (hT[0] < t - TWIN - 1) { hT.shift(); hF.shift(); } }
    if (!hT.length) { hT.push(0); hF.push(0); }
    const nA = N - nB;
    // Affinity and entropy production from the current composition. The +1/2 keeps ln finite when a species is momentarily absent.
    // dξ/dt is the expected net rate, forward minus backward, so (a - b)·ln(a/b) >= 0 always.
    const a = kf * (nA + 0.5), b = kb * (nB + 0.5), lr = Math.log(a / b), aff = RT * lr, sigma = (a - b) * lr;

    // ── Box of molecules ──
    const topH = h - 22 - 58 - 4;
    const AR = { x: 8, y: 22, w: Math.round(w * 0.42), h: topH };
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(AR.x + 4, 11, 3.5, 0, 2 * Math.PI); ctx.fill();
    text(ctx, `A  ${nA}`, AR.x + 12, 15, { color: C.ink, size: 11 });
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(AR.x + 64, 11, 3.5, 0, 2 * Math.PI); ctx.fill();
    text(ctx, `B  ${nB}`, AR.x + 72, 15, { color: C.ink, size: 11 });
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(AR.x, AR.y, AR.w, AR.h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(AR.x + 0.5, AR.y + 0.5, AR.w - 1, AR.h - 1);
    const mr = clamp(w / 150, 2, 3.6);
    for (const [kind, col] of [[0, C.blue], [1, C.gold]]) {
      ctx.fillStyle = col; ctx.beginPath();
      for (let i = 0; i < N; i++) if (isB[i] === kind) { const x = AR.x + 3 + px[i] * (AR.w - 6), y = AR.y + 3 + py[i] * (AR.h - 6); ctx.moveTo(x + mr, y); ctx.arc(x, y, mr, 0, 2 * Math.PI); }
      ctx.fill();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    for (let i = 0; i < N; i++) if (fl[i] > 0.02) { // a ring flashes where a molecule has just converted
      ctx.globalAlpha = fl[i] * 0.7; ctx.beginPath();
      ctx.arc(AR.x + 3 + px[i] * (AR.w - 6), AR.y + 3 + py[i] * (AR.h - 6), mr + (1 - fl[i]) * 5, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── Fraction converted over time ──
    const r = { x: AR.x + AR.w + 34, y: 22, w: w - (AR.x + AR.w + 34) - 12, h: topH - 18 };
    const x0 = Math.max(0, t - TWIN), X = v => map(v, x0, x0 + TWIN, r.x, r.x + r.w), Y = v => map(v, 0, 1, r.y + r.h, r.y);
    text(ctx, "fraction converted to B", r.x - 28, 15, { color: C.muted, size: 11 });
    axes(ctx, r, {});
    for (const v of [0, 0.5, 1]) text(ctx, v, r.x - 5, Y(v), { color: C.muted, size: 10, align: "right", base: "middle" });
    text(ctx, `${Math.round(x0)} s`, r.x, r.y + r.h + 13, { color: C.muted, size: 10 });
    text(ctx, `${Math.round(x0 + TWIN)} s`, r.x + r.w, r.y + r.h + 13, { color: C.muted, size: 10, align: "right" });
    const eq = K / (1 + K);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(r.x, Y(eq)); ctx.lineTo(r.x + r.w, Y(eq)); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "equilibrium", r.x + r.w - 4, Y(eq) - 5, { color: C.muted, size: 10, align: "right" });
    ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y - 2, r.w, r.h + 4); ctx.clip();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
    for (let i = 0; i < hT.length; i++) i ? ctx.lineTo(X(hT[i]), Y(hF[i])) : ctx.moveTo(X(hT[i]), Y(hF[i]));
    ctx.lineTo(X(t), Y(nB / N)); ctx.stroke(); ctx.restore();

    // ── Bars ──
    const bx = 8, bw = w - 16;
    const bar = (y, label, frac, val, col) => {
      text(ctx, label, bx, y - 4, { color: C.muted, size: 10 });
      text(ctx, val, bx + bw, y - 4, { color: col, size: 11, align: "right", weight: 600 });
      ctx.fillStyle = C.line; ctx.fillRect(bx, y, bw, 9);
      ctx.fillStyle = col; ctx.fillRect(bx, y, bw * clamp(frac, 0, 1), 9);
    };
    bar(h - 42, "affinity = RT ln(K[A]/[B])", aff / (8 * RT), `${Math.max(0, aff).toFixed(1)} kJ/mol`, C.green);
    bar(h - 16, "entropy production = affinity × rate / T", sigma / NORM, (sigma / NORM).toFixed(2), C.red);

    info.textContent = `K = ${K.toFixed(2)}: equilibrium is ${(100 * eq).toFixed(0)}% B. Now ${nB} of ${N} are B, affinity ${aff.toFixed(1)} kJ/mol (RT = 2.48 kJ/mol at 298 K), entropy production ${(sigma / NORM).toFixed(2)} (relative).`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
