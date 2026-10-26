// Born: double slit, one electron at a time. Landing positions are sampled from I(y) ∝ cos²(πdy/λL)·sinc²(πay/λL), a ≈ d/4.
import { C, canvas, controls, slider, button, toggle, loop, readout, text, clamp } from "./kit.js";

export const title = "One electron at a time";
export const caption = "Each electron lands as a single dot, and where it lands cannot be predicted. Yet thousands of dots build interference fringes, a pattern set by |ψ|²: the Born rule. Close one slit and the fringes vanish, though electrons still arrive one by one. Positions are sampled from the calculated probability, and the slit geometry is schematic.";

// y is measured in fringe spacings u = y·d/(λL), so cos²(πu) has period 1 and, with a = d/4, sinc²(πu/4) has its first zero at u = ±4.
const U = 5, BINS = 80, G = 2000, MAXDOTS = 1500; // half-range of the screen, histogram bins, CDF samples, dots kept on screen
const sinc2 = x => (x ? (Math.sin(x) / x) ** 2 : 1);
const BOTH = u => Math.cos(Math.PI * u) ** 2 * sinc2((Math.PI * u) / 4);
const ONE = u => sinc2((Math.PI * u) / 4);
const model = f => {
  const cdf = new Float64Array(G + 1);
  let s = 0;
  for (let i = 0; i < G; i++) cdf[i + 1] = s += f(-U + ((i + 0.5) * 2 * U) / G);
  for (let i = 0; i <= G; i++) cdf[i] /= s;
  return { f, cdf, bin: (2 * U) / BINS / ((s * 2 * U) / G) }; // bin = bin width / ∫I, so N·I(u)·bin is the expected count per bin
};
const sample = ({ cdf }) => {
  const r = Math.random();
  let lo = 1, hi = G;
  while (lo < hi) { const mid = (lo + hi) >> 1; cdf[mid] >= r ? (hi = mid) : (lo = mid + 1); }
  return -U + (lo - 1 + (r - cdf[lo - 1]) / (cdf[lo] - cdf[lo - 1] || 1)) * ((2 * U) / G);
};
const M2 = model(BOTH), M1 = model(ONE);

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "An electron gun fires at a barrier with two slits. Dots land one at a time on a screen and slowly build up into interference fringes, which a histogram beside the screen also shows." });
  const row = controls(root), info = readout(root);
  const counts = new Int32Array(BINS), dotU = new Float32Array(MAXDOTS), dotX = new Float32Array(MAXDOTS);
  let N = 0, maxC = 0, size = 0, head = 0, rate = 30, closed = false, curve = false, acc = 0, gun = 0, lastU = null, flashes = [];

  slider(row, { label: "Rate", min: 1, max: 200, step: 1, value: rate, fmt: v => `${v}/s` }, v => { rate = v; lp.redraw(); });
  toggle(row, "Close one slit", false, on => { closed = on; clear(); });
  toggle(row, "Show probability curve", false, on => { curve = on; lp.redraw(); });
  button(row, "Clear", () => clear());
  function clear() { counts.fill(0); N = maxC = size = head = 0; lastU = null; flashes = []; lp.redraw(); }

  function land() {
    const u = sample(closed ? M1 : M2), b = clamp(Math.floor(((u + U) / (2 * U)) * BINS), 0, BINS - 1);
    maxC = Math.max(maxC, ++counts[b]); N++;
    dotU[head] = u; dotX[head] = Math.random(); head = (head + 1) % MAXDOTS; size = Math.min(size + 1, MAXDOTS); // ponytail: only the latest 1,500 dots are drawn; the histogram keeps every count
    flashes.push({ u, x: dotX[(head + MAXDOTS - 1) % MAXDOTS], age: 0 });
    if (flashes.length > 12) flashes.shift();
    lastU = u; gun = 1;
  }

  function draw(t, dt) {
    if (dt && cv.w) {
      acc += dt * rate;
      while (acc >= 1) { acc--; land(); }
      for (const f of flashes) f.age += dt;
      flashes = flashes.filter(f => f.age < 0.35);
      gun = Math.max(0, gun - dt * 6);
    }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]);
    const yc = h * 0.5, yU = u => yc - (u / U) * h * 0.38, yTop = yU(U), yBot = yU(-U);
    const gx = w * 0.07, bx = w * 0.31, sx0 = w * 0.56, sw = w * 0.08, hx = sx0 + sw + 6, hL = w * 0.97 - hx;
    const ds = h * 0.17, sa = ds / 4; // schematic slit spacing and width, a = d/4

    // Source and its flash.
    ctx.fillStyle = C.muted; ctx.fillRect(gx - w * 0.03, yc - 6, w * 0.04, 12);
    if (gun > 0) { ctx.globalAlpha = gun; ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(gx + w * 0.01, yc, 3 + 8 * gun, 0, 2 * Math.PI); ctx.fill(); ctx.globalAlpha = 1; }
    text(ctx, "source", gx - w * 0.01, yc + 24, { align: "center", color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.4; ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx + w * 0.01, yc); ctx.lineTo(bx, yc); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // The wave spreading from each open slit: schematic ripples drifting towards the screen.
    const lw = w * 0.04, slits = closed ? [yc - ds / 2] : [yc - ds / 2, yc + ds / 2];
    ctx.save(); ctx.beginPath(); ctx.rect(bx + 3, yTop, sx0 - bx - 3, yBot - yTop); ctx.clip();
    ctx.strokeStyle = C.blue; ctx.lineWidth = 1;
    for (const sy of slits) for (let k = 0; k < 9; k++) {
      const rad = (k + ((t * 0.35) % 1)) * lw;
      ctx.globalAlpha = 0.22 * Math.max(0, 1 - rad / (sx0 - bx));
      ctx.beginPath(); ctx.arc(bx, sy, rad, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;

    // Barrier with two slits (the lower one is shuttered when closed).
    ctx.fillStyle = C.muted;
    const gaps = [yc - ds / 2, yc + ds / 2];
    ctx.fillRect(bx - 2.5, yTop, 5, gaps[0] - sa / 2 - yTop);
    ctx.fillRect(bx - 2.5, gaps[0] + sa / 2, 5, gaps[1] - gaps[0] - sa);
    ctx.fillRect(bx - 2.5, gaps[1] + sa / 2, 5, yBot - gaps[1] - sa / 2);
    if (closed) { ctx.fillStyle = C.red; ctx.fillRect(bx - 2.5, gaps[1] - sa / 2, 5, sa); }
    text(ctx, "slits", bx, yTop - 6, { align: "center", color: C.muted, size: 10 });

    // Screen: dots as they landed, plus a bright ring on each new arrival.
    ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(sx0, yTop, sw, yBot - yTop);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(sx0, yTop, sw, yBot - yTop);
    const d = Math.max(2, w / 260);
    ctx.fillStyle = C.gold; ctx.globalAlpha = 0.85;
    for (let k = 0; k < size; k++) ctx.fillRect(sx0 + 2 + dotX[k] * (sw - 4 - d), yU(dotU[k]) - d / 2, d, d);
    ctx.globalAlpha = 1; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    for (const f of flashes) {
      ctx.globalAlpha = 1 - f.age / 0.35;
      ctx.beginPath(); ctx.arc(sx0 + 2 + f.x * (sw - 4 - d) + d / 2, yU(f.u), 2.5 + f.age * 18, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    text(ctx, "screen", sx0 + sw / 2, yTop - 6, { align: "center", color: C.muted, size: 10 });

    // Histogram beside the screen. Bars are counts; the curve is the expected counts (shown for at least 40 electrons so it is never empty).
    const mdl = closed ? M1 : M2, Neff = Math.max(N, 40), S = Math.max(maxC, Neff * mdl.bin, 4), px = L => (L / S) * hL * 0.92, bh = (yBot - yTop) / BINS;
    ctx.fillStyle = C.gold; ctx.globalAlpha = 0.55;
    for (let b = 0; b < BINS; b++) if (counts[b]) ctx.fillRect(hx, yTop + (BINS - 1 - b) * bh, px(counts[b]), Math.max(1, bh - 0.6));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(hx, yTop); ctx.lineTo(hx, yBot); ctx.stroke();
    text(ctx, "counts", hx + hL, yTop - 6, { align: "right", color: C.muted, size: 10 });
    if (curve) {
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const u = -U + (2 * U * i) / 200, x = hx + px(Neff * mdl.f(u) * mdl.bin), y = yU(u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      text(ctx, "probability |ψ|²", hx + hL, yBot + 14, { align: "right", color: C.blue, size: 10 });
    }

    info.textContent = N
      ? `${N} electron${N === 1 ? "" : "s"} · latest landed ${lastU < 0 ? "−" : "+"}${Math.abs(lastU).toFixed(2)} fringe spacings from the centre`
      : "No electrons yet. Each one will land somewhere unpredictable.";
  }

  const lp = loop(row, draw);
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
