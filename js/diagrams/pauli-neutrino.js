// Pauli: the missing energy in beta decay (tritium, Q = 18.6 keV). Electron energies are sampled from N(T) ∝ √(T² + 2Tmc²)·(T + mc²)·(Q − T)².
import { C, reduced, canvas, controls, slider, button, toggle, loop, readout, text, axes, map, clamp } from "./kit.js";

export const title = "The missing energy";
export const caption = "In beta decay a nucleus fires out an electron, yet the electrons carry a whole spread of energies, never the fixed amount Q that energy conservation seems to demand. Energy looked lost. Pauli's remedy was a nearly undetectable particle sharing out the rest: Q − T. The spectrum shape is approximate (Fermi function ignored).";

const Q = 18.6, MC2 = 511;             // keV: tritium decay energy, electron rest energy
const XMAX = 20, BIN = 0.5, NB = XMAX / BIN, G = 1860, MAXN = 2e5;
const TAU = 2 * Math.PI;
const shape = T => Math.sqrt(T * T + 2 * T * MC2) * (T + MC2) * (Q - T) ** 2; // ponytail: phase space only (massless neutrino, no Fermi function), so the shape is approximate
const cdf = new Float64Array(G + 1);
let norm = 0;
for (let i = 0; i < G; i++) cdf[i + 1] = norm += shape(((i + 0.5) * Q) / G);
for (let i = 0; i <= G; i++) cdf[i] /= norm;
const dens = T => shape(T) / ((norm * Q) / G);   // probability per keV
const sample = () => {
  const r = Math.random();
  let lo = 1, hi = G;
  while (lo < hi) { const m = (lo + hi) >> 1; cdf[m] >= r ? (hi = m) : (lo = m + 1); }
  return ((lo - 1 + (r - cdf[lo - 1]) / (cdf[lo] - cdf[lo - 1] || 1)) * Q) / G;
};
const LIFE = 1;                          // seconds a decay stays on screen

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Top: a nucleus emits an electron, and optionally a ghostly neutrino, and a bar shows how the decay energy Q is split. Bottom: a histogram of electron energies building up as a broad hump, with a dashed line at Q where every electron would land if nothing else were emitted, and the much lower average marked." });
  const row = controls(root), info = readout(root);
  const counts = new Int32Array(NB);
  let n = 0, sum = 0, maxC = 0, rate = 20, showNu = false, acc = 0, ev = [];

  slider(row, { label: "Decay rate", min: 1, max: 200, step: 1, value: rate, fmt: v => `${v}/s` }, v => { rate = v; lp.redraw(); });
  toggle(row, "Show the neutrino", false, on => { showNu = on; lp.redraw(); });
  button(row, "Clear", () => { clear(); lp.redraw(); });
  function clear() { counts.fill(0); n = sum = maxC = 0; ev = []; }

  function decay(age) {
    const T = sample(), b = Math.min(NB - 1, Math.floor(T / BIN));
    maxC = Math.max(maxC, ++counts[b]); n++; sum += T;
    if (n >= MAXN) { clear(); return; }
    ev.push({ T, a: (Math.random() - 0.5) * 2.0, an: Math.PI + (Math.random() - 0.5) * 2.0, age });
    if (ev.length > 8) ev.shift();
  }
  if (reduced) for (let i = 0; i < 400; i++) decay(0.4); // reduced motion starts paused, so give the first frame something to show

  function draw(dt) {
    if (dt) {
      acc += dt * rate;
      while (acc >= 1) { acc--; decay(0); }
      for (const e of ev) e.age += dt;
      ev = ev.filter(e => e.age < LIFE);
    }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    const fs = clamp(w / 52, 10, 13);

    // ── Decay scene ──
    const S = { x: w * 0.03, y: h * 0.03, w: w * 0.43, h: h * 0.33 }, nx = S.x + S.w * 0.5, ny = S.y + S.h * 0.5, nr = Math.max(7, w * 0.022);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(S.x, S.y, S.w, S.h);
    ctx.save(); ctx.beginPath(); ctx.rect(S.x, S.y, S.w, S.h); ctx.clip();
    const latest = ev.length ? ev[ev.length - 1] : null;
    for (const e of ev) {
      const al = clamp(1 - e.age / LIFE, 0, 1), spd = w * (0.1 + 0.2 * Math.sqrt(e.T / Q)), d = nr + e.age * spd; // ponytail: electron speed drawn ∝ √T, schematic
      const ex = nx + Math.cos(e.a) * d, ey = ny + Math.sin(e.a) * d;
      ctx.strokeStyle = C.blue; ctx.globalAlpha = al * 0.35; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(nx + Math.cos(e.a) * nr, ny + Math.sin(e.a) * nr); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.globalAlpha = al; ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, TAU); ctx.fill();
      if (showNu) { // the ghost: dashed, faint, carrying Q − T
        const dn = nr + e.age * w * 0.22, gx = nx + Math.cos(e.an) * dn, gy = ny + Math.sin(e.an) * dn;
        ctx.strokeStyle = C.violet; ctx.globalAlpha = al * 0.35; ctx.beginPath(); ctx.moveTo(nx + Math.cos(e.an) * nr, ny + Math.sin(e.an) * nr); ctx.lineTo(gx, gy); ctx.stroke();
        ctx.globalAlpha = al * 0.8; ctx.fillStyle = "rgba(177,140,255,0.25)"; ctx.setLineDash([2.5, 2.5]); ctx.beginPath(); ctx.arc(gx, gy, 4.4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        if (e === latest) text(ctx, "ν", gx + 7, gy + 4, { color: C.violet, size: fs + 1, weight: 700 });
      }
      if (e === latest) text(ctx, "e⁻", ex + 7, ey + 4, { color: C.blue, size: fs, weight: 700 });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(nx, ny, nr, 0, TAU); ctx.fill();
    text(ctx, "nucleus", nx, S.y + S.h - 5, { align: "center", color: C.muted, size: fs });

    // ── Energy bar for the latest decay: how Q is shared ──
    const bx = w * 0.52, bw = w * 0.44, by = h * 0.15, bh = Math.max(12, h * 0.075);
    text(ctx, `Q = ${Q} keV to share`, bx, by - 8, { color: C.muted, size: fs });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    if (latest) {
      const tw = (latest.T / Q) * bw, rest = Q - latest.T;
      ctx.fillStyle = C.blue; ctx.globalAlpha = 0.85; ctx.fillRect(bx, by, tw, bh); ctx.globalAlpha = 1;
      if (showNu) { ctx.fillStyle = "rgba(177,140,255,0.45)"; ctx.fillRect(bx + tw, by, bw - tw, bh); }
      else {
        ctx.strokeStyle = C.red; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.strokeRect(bx + tw + 0.5, by + 0.5, bw - tw - 1, bh - 1); ctx.setLineDash([]);
        if (bw - tw > 14) text(ctx, "?", bx + tw + (bw - tw) / 2, by + bh / 2 + 5, { align: "center", color: C.red, size: fs + 3, weight: 700 });
      }
      text(ctx, `e⁻ ${latest.T.toFixed(1)} keV`, bx, by + bh + fs + 4, { color: C.blue, size: fs });
      text(ctx, showNu ? `ν ${rest.toFixed(1)} keV` : `missing ${rest.toFixed(1)} keV`, bx + bw, by + bh + fs + 4, { color: showNu ? C.violet : C.red, size: fs, align: "right" });
    } else text(ctx, "waiting for a decay…", bx + 6, by + bh / 2 + 4, { color: C.muted, size: fs });

    // ── Histogram of electron energies ──
    const r = { x: w * 0.1, y: h * 0.48, w: w * 0.86, h: h * 0.35 };
    const X = T => map(T, 0, XMAX, r.x, r.x + r.w), Neff = Math.max(n, 40);
    const top = Math.max(maxC, Neff * dens(3.8) * BIN, 4) * 1.3, Y = c => r.y + r.h - (c / top) * r.h;
    ctx.fillStyle = C.gold; ctx.globalAlpha = 0.7;
    for (let b = 0; b < NB; b++) if (counts[b]) ctx.fillRect(X(b * BIN) + 0.5, Y(counts[b]), Math.max(1, X(BIN) - X(0) - 1), (counts[b] / top) * r.h);
    ctx.globalAlpha = 1;
    axes(ctx, r, { yLabel: "electrons" });
    for (const T of [0, 5, 10, 15]) text(ctx, T, X(T), r.y + r.h + 13, { align: "center", color: C.muted, size: 10 });
    text(ctx, "Q", X(Q), r.y + r.h + 13, { align: "center", color: C.red, size: 10, weight: 700 });
    text(ctx, "electron kinetic energy T (keV)", r.x + r.w / 2, r.y + r.h + 27, { align: "center", color: C.muted, size: 10 });
    ctx.strokeStyle = C.blue; ctx.lineWidth = 1.3; ctx.globalAlpha = 0.8; ctx.beginPath(); // the calculated shape, scaled to the electrons counted so far
    for (let i = 0; i <= 120; i++) { const T = (Q * i) / 120, y = Y(Neff * dens(T) * BIN); i ? ctx.lineTo(X(T), y) : ctx.moveTo(X(T), y); }
    ctx.stroke(); ctx.globalAlpha = 1;

    // Q (the single energy every electron would have if nothing else were emitted) and the mean.
    const gy = r.y - 9;
    ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(X(Q), gy - 4); ctx.lineTo(X(Q), r.y + r.h); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "expected: all at Q", X(Q) - 5, r.y + 11, { align: "right", color: C.red, size: fs });
    if (n) {
      const mean = sum / n, xm = X(mean), col = showNu ? C.violet : C.red;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xm, gy - 4); ctx.lineTo(xm, r.y + r.h); ctx.stroke();
      text(ctx, `mean ${mean.toFixed(1)}`, xm + 4, r.y + 11, { color: C.gold, size: fs, weight: 700 });
      ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xm + 2, gy); ctx.lineTo(X(Q) - 2, gy); ctx.stroke();
      for (const [x0, s] of [[xm + 2, 1], [X(Q) - 2, -1]]) { ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + 5 * s, gy - 3); ctx.lineTo(x0 + 5 * s, gy + 3); ctx.closePath(); ctx.fill(); }
      text(ctx, showNu ? `neutrino share ${(Q - mean).toFixed(1)} keV` : `missing ${(Q - mean).toFixed(1)} keV on average`, (xm + X(Q)) / 2, gy - 6, { align: "center", color: col, size: fs });
    }

    info.textContent = n
      ? `${n} electrons · mean energy ${(sum / n).toFixed(1)} keV against Q = ${Q} keV${showNu ? ` · the ghost neutrino carries the other ${(Q - sum / n).toFixed(1)} keV` : ""}`
      : `No decays yet. If an electron were the only thing emitted, each would carry Q = ${Q} keV.`;
  }

  const lp = loop(row, (t, dt) => draw(dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
