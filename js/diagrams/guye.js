// Guye: m/m0 against v/c for three theories, plus an electron beam bending in a magnetic field (radius = p/eB = m v/eB).
import { C, canvas, controls, slider, loop, readout, axes, curve, text, map, clamp } from "./kit.js";

export const title = "Mass grows with speed";
export const caption = "How sharply does a magnetic field bend a fast electron? If mass never changed (Newton), the bend would depend on speed alone. Lorentz and Einstein say mass grows as γ, so fast electrons bend less; Abraham's rival model grows more slowly. Guye's measurements on cathode-ray electrons from 1907 favoured the relativistic curve. Beam arcs are schematic, not to scale.";

const YMAX = 7.5, BMAX = 0.99;
const gamma = b => 1 / Math.sqrt(1 - b * b);
// Abraham's transverse mass; the closed form cancels badly near 0, so use its series there.
const abraham = b => b < 0.02 ? 1 + 0.4 * b * b + (9 / 35) * b ** 4
  : (3 / (4 * b * b)) * (((1 + b * b) / (2 * b)) * Math.log((1 + b) / (1 - b)) - 1);

const NPT = 480;
const mkBuf = () => ({ x: new Float32Array(NPT), y: new Float32Array(NPT), n: 0, ds: 1 });
// Fill buf with a circular path of radius R that enters the panel at (x0, y0) heading right and bends down (an electron in B into the screen).
// It stops where it leaves the panel, or after one full circle.
function trace(buf, R, x0, y0, p) {
  const dth = clamp(2.5 / R, 0.02, 0.15);
  let n = 0;
  for (let th = 0; th <= 2 * Math.PI + 1e-6 && n < NPT; th += dth) {
    const x = x0 + R * Math.sin(th), y = y0 + R * (1 - Math.cos(th));
    if (x > p.x + p.w || y > p.y + p.h || x < p.x - 0.01) break;
    buf.x[n] = x; buf.y[n] = y; n++;
  }
  buf.n = n; buf.ds = R * dth;
}
function beam(ctx, buf, t, speed, gap, { line, dots, dash, lw, dotR }) {
  if (buf.n < 2) return;
  ctx.setLineDash(dash); ctx.strokeStyle = line; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(buf.x[0], buf.y[0]);
  for (let i = 1; i < buf.n; i++) ctx.lineTo(buf.x[i], buf.y[i]);
  ctx.stroke(); ctx.setLineDash([]);
  const L = (buf.n - 1) * buf.ds, nd = Math.max(1, Math.round(L / gap));
  ctx.fillStyle = dots;
  for (let k = 0; k < nd; k++) {
    const s = (((k * L) / nd + t * speed) % L + L) % L, idx = s / buf.ds, i = Math.min(buf.n - 2, Math.floor(idx)), f = idx - i;
    ctx.beginPath(); ctx.arc(buf.x[i] + (buf.x[i + 1] - buf.x[i]) * f, buf.y[i] + (buf.y[i + 1] - buf.y[i]) * f, dotR, 0, 2 * Math.PI); ctx.fill();
  }
}

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "Left: graph of apparent mass against speed for the relativistic, Abraham and Newtonian theories, with a marker at the chosen speed. Right: an electron beam bending in a magnetic field, curving less than the Newtonian path would." });
  const row = controls(root), info = readout(root);
  let beta = 0.8;
  const bufR = mkBuf(), bufN = mkBuf();
  slider(row, { label: "Speed v/c", min: 0.05, max: BMAX, step: 0.01, value: beta, fmt: v => v.toFixed(2) }, v => { beta = v; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t));

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const padT = 26, padB = 56;
    const r = { x: 38, y: padT, w: Math.round(w * 0.5) - 44, h: h - padT - padB };
    const bx = Math.round(w * 0.58), p = { x: bx, y: padT, w: w - bx - 10, h: r.h };
    const g = gamma(beta), a = abraham(beta);

    // ── Mass plot ──
    text(ctx, "mass ÷ rest mass", r.x - 24, padT - 9, { color: C.muted, size: 11 });
    axes(ctx, r, { xLabel: "v / c" });
    const X = b => map(b, 0, BMAX, r.x, r.x + r.w), Y = m => map(m, 0, YMAX, r.y + r.h, r.y);
    for (const m of [1, 3, 5, 7]) {
      ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x, Y(m)); ctx.lineTo(r.x + r.w, Y(m)); ctx.stroke();
      text(ctx, m, r.x - 5, Y(m), { color: C.muted, size: 10, align: "right", base: "middle" });
    }
    for (const b of [0, 0.5, 0.9]) text(ctx, b === 0 ? "0" : b, X(b), r.y + r.h + 14, { color: C.muted, size: 10, align: "center" });
    curve(ctx, r, [0, BMAX], [0, YMAX], () => 1, { color: C.muted, width: 1.5, n: 2 });
    curve(ctx, r, [0, BMAX], [0, YMAX], abraham, { color: C.blue, width: 2, dash: [6, 4] });
    curve(ctx, r, [0, BMAX], [0, YMAX], gamma, { color: C.gold, width: 2.5, n: 360 });
    text(ctx, "Lorentz–Einstein", r.x + r.w - 8, r.y + 12, { color: C.gold, size: 10, align: "right" });
    text(ctx, "Abraham", X(0.93), Y(abraham(BMAX)) - 8, { color: C.blue, size: 10, align: "right" });
    text(ctx, "Newton", X(0.06), Y(1) - 7, { color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(X(beta), r.y + r.h); ctx.lineTo(X(beta), Y(g)); ctx.stroke(); ctx.setLineDash([]);
    for (const [m, col] of [[1, C.muted], [a, C.blue], [g, C.gold]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(beta), Y(m), 4, 0, 2 * Math.PI); ctx.fill(); }

    // ── Beam in a magnetic field ──
    text(ctx, "beam in a field B", p.x, padT - 9, { color: C.muted, size: 11 });
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.3; ctx.beginPath(); // the field, as crosses in circles
    const nx = 3, ny = 3, cr = Math.max(3.5, h * 0.018);
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = p.x + ((i + 0.6) * p.w) / nx, y = p.y + ((j + 0.7) * p.h) / ny, k = cr * 0.7;
      ctx.moveTo(x + cr, y); ctx.arc(x, y, cr, 0, 2 * Math.PI);
      ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k);
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    // ponytail: arc size is arbitrary (Ru is a drawing scale, not a lab value); only the ratio of the two radii, gamma, is physical
    const Ru = p.h * 0.3, x0 = p.x, y0 = p.y + p.h * 0.1;
    trace(bufN, beta * Ru, x0, y0, p);
    trace(bufR, g * beta * Ru, x0, y0, p);
    ctx.fillStyle = C.muted; ctx.fillRect(x0 - 12, y0 - 3, 12, 6); // the electron gun
    const speed = p.w * 0.45, gap = Math.max(10, p.w * 0.1);
    ctx.save(); ctx.beginPath(); ctx.rect(p.x, p.y, p.w, p.h); ctx.clip();
    beam(ctx, bufN, t, speed, gap, { line: C.muted, dots: C.muted, dash: [4, 4], lw: 1.2, dotR: 2 });
    beam(ctx, bufR, t, speed, gap, { line: "rgba(227,194,127,0.35)", dots: C.gold, dash: [], lw: 2.5, dotR: 2.6 });
    ctx.restore();
    text(ctx, "same speed, same B", p.x, p.y + p.h + 14, { color: C.muted, size: 10 });

    // ── Legend ──
    let lx = 8;
    for (const [label, col, dash] of [["Lorentz–Einstein", C.gold, []], ["Abraham", C.blue, [5, 3]], ["Newton", C.muted, []]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(lx, h - 10); ctx.lineTo(lx + 16, h - 10); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, label, lx + 21, h - 6, { color: C.ink, size: 10 });
      lx += 21 + label.length * 5.4 + 14;
    }

    info.textContent = `v = ${beta.toFixed(2)}c: γ = ${g.toFixed(2)} (Lorentz–Einstein), Abraham ${a.toFixed(2)}, Newton 1.00, in units of m₀. The relativistic beam's path is ${g.toFixed(2)}× wider than Newton's.`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
