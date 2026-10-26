// Schrödinger's cat: a sealed box where P(atom has decayed) = 1 − 2^(−t/T½), T½ = 1 h. Both outcomes are drawn overlaid, faded by their weights, until the box is opened.
import { C, canvas, controls, slider, button, loop, readout, text, axes, curve, map, clamp } from "./kit.js";

export const title = "Schrödinger's cat";
export const caption = "In Schrödinger's 1935 thought experiment, an atom, a Geiger counter, a vial and a cat share a sealed box. The atom's half-life is one hour, so after t hours it has decayed with probability 1 − 2^(−t). Until the box is opened, both outcomes are drawn together, faded by their weights. He meant it as a critique of that picture, not an endorsement.";

const T_HALF = 1, T_MAX = 6;   // half-life and the end of the clock, in hours (ponytail: the clock is sped up to 2 h per second, and the box, counter and cat are a cartoon)
const TAU = 2 * Math.PI;
const pDecay = t => 1 - 2 ** (-t / T_HALF);
const ease = u => u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;
const GOLD = C.gold, VIOLET = C.violet;

// Scene "A" (atom intact, cat awake) and "B" (atom decayed, cat lying down), each drawn in a 100 × 68 unit box with alpha a.
function sceneA(ctx, a, tt) {
  if (a < 0.01) return;
  ctx.globalAlpha = a; ctx.lineWidth = 1.1; ctx.lineJoin = "round"; ctx.lineCap = "round";
  // Atom: nucleus with an electron on a tilted orbit.
  ctx.strokeStyle = GOLD; ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.arc(14, 18, 2.6, 0, TAU); ctx.fill();
  ctx.globalAlpha = a * 0.6; ctx.beginPath(); ctx.ellipse(14, 18, 8.5, 3.6, 0.5, 0, TAU); ctx.stroke(); ctx.globalAlpha = a;
  const ph = tt * 3, ex = 8.5 * Math.cos(ph), ey = 3.6 * Math.sin(ph);
  ctx.beginPath(); ctx.arc(14 + ex * Math.cos(0.5) - ey * Math.sin(0.5), 18 + ex * Math.sin(0.5) + ey * Math.cos(0.5), 1.5, 0, TAU); ctx.fill();
  // Counter needle at rest.
  needle(ctx, -Math.PI + 0.35, GOLD);
  // Hammer raised.
  hammer(ctx, 73, 6, GOLD);
  // Vial, intact, with liquid.
  ctx.fillStyle = "rgba(63,214,160,0.55)"; ctx.beginPath(); ctx.arc(86, 30, 4.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = GOLD; ctx.beginPath(); ctx.arc(86, 30, 5.2, 0, TAU); ctx.stroke();
  ctx.strokeRect(84.4, 21.5, 3.2, 4);
  // Cat sitting up, breathing, tail swaying.
  const br = 1 + 0.04 * Math.sin(tt * 2.3), sw = 4 * Math.sin(tt * 1.7);
  ctx.strokeStyle = ctx.fillStyle = GOLD;
  ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(53, 62); ctx.quadraticCurveTo(64, 62, 63 + sw * 0.4, 50 + sw * 0.2); ctx.stroke(); ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.ellipse(46, 66 - 10 * br, 8, 10 * br, 0, 0, TAU); ctx.fill();
  const hy = 42 - 20 * (br - 1); // head rides on the breathing body
  ctx.beginPath(); ctx.arc(46, hy, 6.5, 0, TAU); ctx.fill();
  ears(ctx, 46, hy, 6.5, 0);
  ctx.fillStyle = C.bg; // open eyes and a tiny nose
  ctx.beginPath(); ctx.arc(43.6, hy - 0.5, 1.1, 0, TAU); ctx.arc(48.4, hy - 0.5, 1.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.bg; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(45.3, hy + 2.6); ctx.lineTo(46.7, hy + 2.6); ctx.stroke();
  ctx.globalAlpha = 1;
}
function sceneB(ctx, a, tt) {
  if (a < 0.01) return;
  ctx.globalAlpha = a; ctx.lineWidth = 1.1; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.strokeStyle = ctx.fillStyle = VIOLET;
  // Decayed atom: a faint dashed nucleus, with a particle flying off towards the counter.
  ctx.globalAlpha = a * 0.7; ctx.setLineDash([1.6, 1.6]); ctx.beginPath(); ctx.arc(14, 18, 2.6, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = a;
  const u = (tt * 0.7) % 1;
  ctx.globalAlpha = a * (1 - u * u); ctx.beginPath(); ctx.arc(lerp(16, 29, u), lerp(18, 17.5, u), 1.5, 0, TAU); ctx.fill(); ctx.globalAlpha = a;
  needle(ctx, -0.35 + 0.07 * Math.sin(tt * 14), VIOLET);
  hammer(ctx, 80, 26, VIOLET);
  // Vial broken: two shards on the shelf and a gentle green mist drifting up.
  ctx.beginPath(); ctx.moveTo(81.5, 35.2); ctx.lineTo(84, 31.5); ctx.lineTo(86, 35.2); ctx.moveTo(88, 35.2); ctx.lineTo(90.2, 32); ctx.lineTo(92, 35.2); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const v = ((tt * 0.35 + i / 3) % 1), x = 86 + 3.5 * Math.sin(tt * 0.9 + i * 2.1), y = 30 - v * 14;
    ctx.globalAlpha = a * 0.3 * (1 - v); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x, y, 2.2 + v * 3.2, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = a; ctx.fillStyle = VIOLET; ctx.strokeStyle = VIOLET;
  // Cat lying down, eyes shown as small crosses.
  ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(60, 62); ctx.quadraticCurveTo(70, 63, 74, 59); ctx.stroke(); ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.ellipse(46, 61, 15, 5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(28, 60, 5.6, 0, TAU); ctx.fill();
  ears(ctx, 28, 60, 5.6, 0.25);
  ctx.strokeStyle = C.bg; ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (const ex of [25.8, 30.4]) { ctx.moveTo(ex - 0.9, 58.4); ctx.lineTo(ex + 0.9, 60.2); ctx.moveTo(ex + 0.9, 58.4); ctx.lineTo(ex - 0.9, 60.2); }
  ctx.stroke();
  ctx.globalAlpha = 1;
}
// Two triangular ears on a head at (cx, cy) with radius r, tilted by rot.
function ears(ctx, cx, cy, r, rot) {
  ctx.beginPath();
  for (const s of [-1, 1]) {
    const a0 = -Math.PI / 2 + rot + s * 0.95, a1 = -Math.PI / 2 + rot + s * 0.25, ap = -Math.PI / 2 + rot + s * 0.65;
    ctx.moveTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r);
    ctx.lineTo(cx + Math.cos(ap) * r * 1.6, cy + Math.sin(ap) * r * 1.6);
    ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
  }
  ctx.fill();
}
// Geiger counter dial needle. Angle in canvas convention (π = pointing left, 0 = pointing right).
function needle(ctx, ang, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(40, 22.5); ctx.lineTo(40 + Math.cos(ang) * 6.5, 22.5 + Math.sin(ang) * 6.5); ctx.stroke();
}
// The relay hammer: a lever from its pivot at (62, 12) to a head at (hx, hy).
function hammer(ctx, hx, hy, color) {
  ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(62, 12); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.beginPath(); ctx.arc(hx, hy, 2, 0, TAU); ctx.fill();
}

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "A sealed box holding an atom, a Geiger counter, a vial and a cat, drawn as two faded overlaid scenes, atom intact with the cat awake and atom decayed with the cat lying down, weighted by their probabilities. Beside it, a clock and a graph of the two probabilities against time. Opening the box shows one outcome." });
  const row = controls(root), info = readout(root);
  let hrs = 0, speed = 0.5, opened = false, op = 0, pOpen = 0, result = false; // result: true = the atom had decayed
  slider(row, { label: "Clock speed", min: 0.1, max: 2, step: 0.1, value: speed, fmt: v => `${v.toFixed(1)} h/s` }, v => { speed = v; });
  button(row, "Open the box", () => {
    if (opened) return;
    pOpen = pDecay(hrs); result = Math.random() < pOpen; opened = true; op = 0;
    if (!lp.playing) op = 1;
    lp.redraw();
  });
  button(row, "Reset", () => { hrs = 0; opened = false; op = 0; lp.redraw(); });
  const lp = loop(row, (tt, dt) => draw(tt, dt));

  function draw(tt, dt) {
    if (dt) {
      if (!opened) hrs = Math.min(T_MAX, hrs + dt * speed);
      else op = Math.min(1, op + dt / 0.7);
    }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    const fs = clamp(w / 52, 10, 13), e = ease(op);
    const P = opened ? pOpen : pDecay(hrs);
    const aDead = lerp(P, result ? 1 : 0, e), aAlive = lerp(1 - P, result ? 0 : 1, e);

    // ── The box ──
    const bw = w * 0.54, k = bw / 100, bh = 68 * k, bx = w * 0.04, by = h * 0.22;
    ctx.fillStyle = "rgba(255,255,255,0.035)"; ctx.fillRect(bx, by, bw, bh);
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    ctx.translate(bx, by); ctx.scale(k, k);
    // Wire from the counter to the hammer, and the shelf under the vial.
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(52, 17); ctx.lineTo(62, 12); ctx.moveTo(76, 35.7); ctx.lineTo(97, 35.7); ctx.stroke();
    ctx.setLineDash([1.5, 2]); ctx.beginPath(); ctx.moveTo(18, 18); ctx.lineTo(28, 17.5); ctx.stroke(); ctx.setLineDash([]);
    // Counter body and dial.
    ctx.lineWidth = 1.2; ctx.strokeRect(28, 8, 24, 20);
    ctx.beginPath(); ctx.arc(40, 22.5, 7.6, Math.PI, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
    sceneA(ctx, aAlive, tt); sceneB(ctx, aDead, tt);
    ctx.restore();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
    if (op > 0 && op < 1) { // a brief flash where the outcome is fixed
      ctx.globalAlpha = 1 - op; ctx.strokeStyle = result ? VIOLET : GOLD; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx + 46 * k, by + 50 * k, (6 + 60 * op) * k, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    }
    // Lid: lifts away when the box is opened.
    ctx.globalAlpha = 1 - 0.75 * e; ctx.fillStyle = C.muted;
    ctx.fillRect(bx - 4, by - 7 - e * h * 0.1, bw + 8, 6);
    ctx.globalAlpha = 1;
    // Labels.
    const lab = (s, ux, uy) => text(ctx, s, bx + ux * k, by + uy * k, { align: "center", color: C.muted, size: fs });
    lab("atom", 14, 33); lab("counter", 40, 33); lab("vial", 87, 42.5);

    // ── Probability bar under the box: the weights of the two outcomes ──
    const yb = h * 0.9, bh2 = Math.max(6, h * 0.03);
    ctx.fillStyle = GOLD; ctx.globalAlpha = 0.9; ctx.fillRect(bx, yb, bw * (1 - P), bh2);
    ctx.fillStyle = VIOLET; ctx.fillRect(bx + bw * (1 - P), yb, bw * P, bh2); ctx.globalAlpha = 1;
    text(ctx, `cat alive ${Math.round((1 - P) * 100)}%`, bx, yb - 5, { color: GOLD, size: fs });
    text(ctx, `cat dead ${Math.round(P * 100)}%`, bx + bw, yb - 5, { color: VIOLET, size: fs, align: "right" });

    // ── Clock: one turn of the hand is one half-life ──
    const cx = w * 0.69, cy = h * 0.14, rc = Math.min(w * 0.05, h * 0.085);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, rc, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 12; i++) { const a = (i * TAU) / 12; ctx.moveTo(cx + Math.sin(a) * rc * 0.82, cy - Math.cos(a) * rc * 0.82); ctx.lineTo(cx + Math.sin(a) * rc * 0.97, cy - Math.cos(a) * rc * 0.97); }
    ctx.stroke();
    const ha = (hrs / T_HALF) * TAU;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ha) * rc * 0.78, cy - Math.cos(ha) * rc * 0.78); ctx.stroke(); ctx.lineCap = "butt";
    text(ctx, `t = ${hrs.toFixed(2)} h`, cx + rc + 7, cy + 4, { size: fs + 1, weight: 700, color: GOLD });
    if (w >= 420) text(ctx, "one turn = one half-life", cx - rc, cy + rc + fs + 3, { color: C.muted, size: fs - 1 });

    // ── Plot: chance of each outcome against time ──
    const r = { x: w * 0.7, y: h * 0.4, w: w * 0.26, h: h * 0.37 };
    text(ctx, "chance", r.x, r.y - 6, { color: C.muted, size: fs });
    axes(ctx, r, { xLabel: "hours" });
    const px = t => map(t, 0, T_MAX, r.x, r.x + r.w), py = p => map(p, 0, 1, r.y + r.h, r.y);
    for (let t = 0; t <= T_MAX; t += 2) text(ctx, t, px(t), r.y + r.h + 14, { align: "center", color: C.muted, size: 10 });
    text(ctx, "1", r.x - 5, r.y + 4, { align: "right", color: C.muted, size: 10 });
    text(ctx, "½", r.x - 5, py(0.5) + 4, { align: "right", color: C.muted, size: 10 });
    text(ctx, "0", r.x - 5, r.y + r.h + 4, { align: "right", color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(r.x, py(0.5)); ctx.lineTo(px(T_HALF), py(0.5)); ctx.lineTo(px(T_HALF), r.y + r.h); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    text(ctx, "1", px(T_HALF), r.y + r.h + 14, { align: "center", color: GOLD, size: 10, weight: 700 });
    curve(ctx, r, [0, T_MAX], [0, 1], t => 2 ** (-t / T_HALF), { color: GOLD, width: 2 });
    curve(ctx, r, [0, T_MAX], [0, 1], pDecay, { color: VIOLET, width: 2 });
    text(ctx, "dead", r.x + r.w - 3, r.y + r.h * 0.4, { color: VIOLET, size: fs, align: "right" });
    text(ctx, "alive", r.x + r.w - 3, r.y + r.h * 0.68, { color: GOLD, size: fs, align: "right" });
    const tm = hrs;
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.4; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(px(tm), r.y); ctx.lineTo(px(tm), r.y + r.h); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    for (const [p, col] of [[1 - P, GOLD], [P, VIOLET]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px(tm), py(p), 3.5, 0, TAU); ctx.fill(); }

    info.textContent = opened
      ? `Opened at t = ${hrs.toFixed(2)} h, when decay was ${Math.round(pOpen * 100)}% likely. This time: ${result ? "the atom had decayed, the cat is dead." : "the atom was intact, the cat is alive."}`
      : `t = ${hrs.toFixed(2)} h · P(decayed) = ${(P * 100).toFixed(0)}% · half-life ${T_HALF} h${hrs >= T_MAX ? " · clock stopped" : ""}`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
