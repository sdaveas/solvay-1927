// Langevin: the twin paradox on a spacetime diagram. The traveller flies to a star D = 4 light-years away and back at speed β; proper time τ = (2D/β)√(1−β²).
import { C, canvas, controls, slider, button, loop, readout, text, map, clamp } from "./kit.js";

export const title = "The twin paradox";
export const caption = "On a spacetime diagram the Earth twin stays put while the traveller flies to a star 4 light-years away and back. Each dot is one tick of that twin's own clock; the traveller's ticks come further apart, so fewer of them fit. Only the traveller turns round, which is why the two are not equal. Langevin posed this puzzle in 1911. Time axis stretched to fit.";

const TAU = 2 * Math.PI, D = 4, ANIM = 9, HOLD = 3.2; // star distance (light-years), seconds per trip, pause at the reunion
const niceStep = v => [0.5, 1, 2, 5, 10, 20].find(s => s >= v) ?? 20;
const f1 = v => v.toFixed(1);

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A spacetime diagram with distance across and time upward. The Earth twin's worldline is a vertical line. The traveller's worldline goes out to a star four light-years away and back. Dots along each line mark one year of that twin's own clock; the traveller has fewer dots. Two panels show each twin's age as the trip runs." });
  const row = controls(root), info = readout(root);
  let beta = 0.8, p = 0, hold = 0;
  const gam = () => 1 / Math.sqrt(1 - beta * beta), total = () => (2 * D) / beta;
  slider(row, { label: "Traveller speed β", min: 0.1, max: 0.99, step: 0.01, value: beta, fmt: v => `${v.toFixed(2)} c` }, v => { beta = v; p = 0; hold = 0; lp.redraw(); });
  button(row, "Replay", () => { p = 0; hold = 0; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));

  function face(ctx, x, y, r, col, helmet) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    if (helmet) { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x, y, r + 3, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.2, r * 0.1, 0, TAU); ctx.arc(x + r * 0.35, y - r * 0.2, r * 0.1, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + r * 0.05, r * 0.5, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke();
  }

  function draw(dt) {
    if (dt) { if (p < 1) p = Math.min(1, p + dt / ANIM); else if ((hold += dt) > HOLD) { p = 0; hold = 0; } }
    const { ctx, w, h } = cv, g = gam(), T = total(), tau = T / g, tE = p * T, tT = tE / g;
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);

    // diagram
    const r = { x: w * 0.13, y: h * 0.07, w: w * 0.48, h: h * 0.74 }, xmin = -0.5, xmax = D + 0.5, tmax = T * 1.05;
    const X = x => map(x, xmin, xmax, r.x, r.x + r.w), Y = t => map(t, 0, tmax, r.y + r.h, r.y);
    const xs = t => (t <= T / 2 ? beta * t : 2 * D - beta * t); // traveller's position at Earth time t
    const step = niceStep(T / 12);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.stroke();
    for (let x = 0; x <= D; x++) text(ctx, x, X(x), r.y + r.h + 13, { color: C.muted, size: 10, align: "center" });
    text(ctx, "distance (light-years)", r.x + r.w, r.y + r.h + 27, { color: C.muted, size: 10, align: "right" });
    ctx.save(); ctx.translate(r.x - 30, r.y + 4); ctx.rotate(-Math.PI / 2); text(ctx, "time (years)", 0, 0, { color: C.muted, size: 10, align: "right" }); ctx.restore();
    for (let t = 0; t <= T + 1e-6; t += step) text(ctx, +t.toFixed(1), r.x - 6, Y(t), { color: C.muted, size: 10, align: "right", base: "middle" });

    // the star's worldline and a light ray, for reference
    ctx.setLineDash([2, 4]); ctx.strokeStyle = "rgba(255,244,200,0.35)"; ctx.beginPath(); ctx.moveTo(X(D), Y(0)); ctx.lineTo(X(D), Y(T)); ctx.stroke();
    ctx.setLineDash([6, 5]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(D), Y(D)); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "light", X(D) - 5, Y(D) + 14, { color: C.muted, size: 10, align: "right" });
    text(ctx, `star, ${D} ly away`, X(D) - 5, r.y + 10, { color: "#f6e3b4", size: 10, align: "right" });

    // worldlines: solid so far, faint ahead
    const cx = X(xs(tE)), cy = Y(tE), ax = X(D), ay = Y(T / 2);
    ctx.strokeStyle = "rgba(79,168,255,0.3)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(T)); ctx.stroke();
    ctx.strokeStyle = "rgba(227,194,127,0.35)"; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(ax, ay); ctx.lineTo(X(0), Y(T)); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), cy); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); if (tE > T / 2) ctx.lineTo(ax, ay); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(ax, ay, 3, 0, TAU); ctx.fill();
    text(ctx, "turns round", ax - 6, ay - 6, { color: C.gold, size: 10, align: "right" });

    // clock ticks: one dot per year of each twin's own time; they flare as the clock passes them
    for (let t = 0; t <= T + 1e-6; t += step) { // Earth
      const age = tE - t, lit = age >= 0;
      ctx.fillStyle = lit ? C.blue : "rgba(79,168,255,0.35)"; ctx.beginPath(); ctx.arc(X(0), Y(t), 3, 0, TAU); ctx.fill();
      if (lit && age < 0.5) { ctx.strokeStyle = `rgba(79,168,255,${1 - age / 0.5})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(0), Y(t), 3 + 10 * age, 0, TAU); ctx.stroke(); }
    }
    for (let n = 0; n * step <= tau + 1e-6; n++) { // traveller: its n-th tick happens at Earth time n·step·γ
      const t = n * step * g, age = tE - t, lit = age >= 0;
      ctx.fillStyle = lit ? C.gold : "rgba(227,194,127,0.4)"; ctx.beginPath(); ctx.arc(X(xs(t)), Y(t), 3, 0, TAU); ctx.fill();
      if (lit && age < 0.5) { ctx.strokeStyle = `rgba(227,194,127,${1 - age / 0.5})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(xs(t)), Y(t), 3 + 10 * age, 0, TAU); ctx.stroke(); }
    }

    // "now" in Earth's frame, and the two travellers
    ctx.strokeStyle = "rgba(240,235,225,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(0), cy); ctx.lineTo(cx, cy); ctx.moveTo(cx, cy); ctx.lineTo(cx, r.y + r.h - 9); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(X(0), cy, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill();
    // on the axis: Earth, the star, and the ship at its present distance
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(X(0), r.y + r.h - 5, 5, 0, TAU); ctx.fill();
    const sg = ctx.createRadialGradient(X(D), r.y + r.h - 5, 0, X(D), r.y + r.h - 5, 10); sg.addColorStop(0, "#fff4c8"); sg.addColorStop(1, "rgba(255,244,200,0)");
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(X(D), r.y + r.h - 5, 10, 0, TAU); ctx.fill();
    const dir = tE > T / 2 ? -1 : 1, sx = X(xs(tE)), sy = r.y + r.h - 9;
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(sx + dir * 8, sy); ctx.lineTo(sx - dir * 5, sy - 5); ctx.lineTo(sx - dir * 5, sy + 5); ctx.closePath(); ctx.fill();

    // the two clocks
    const px = w * 0.66, pw = w * 0.31, ph = h * 0.22, fr = clamp(h * 0.05, 9, 14), fs = clamp(w / 36, 12, 16);
    for (const [i, nm, col, val, helmet] of [[0, "Earth twin", C.blue, tE, false], [1, "Traveller", C.gold, tT, true]]) {
      const y = r.y + i * (ph + 8);
      ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(px, y, pw, ph); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, y + 0.5, pw - 1, ph - 1);
      face(ctx, px + fr + 8, y + ph / 2, fr, col, helmet);
      text(ctx, nm, px + fr * 2 + 18, y + ph / 2 - 5, { color: col, size: 11, weight: 600 });
      text(ctx, `${f1(val)} yr`, px + fr * 2 + 18, y + ph / 2 + 5 + fs * 0.8, { color: col, size: fs, weight: 600 });
    }
    const vy = r.y + 2 * (ph + 8) + 8;
    text(ctx, `γ = ${g.toFixed(2)}`, px, vy + 8, { color: C.ink, size: 11 });
    text(ctx, "moving clocks lag", px, vy + 21, { color: C.muted, size: 10 });
    if (p >= 1) {
      text(ctx, "Traveller is", px, vy + 40, { color: C.gold, size: 11, weight: 600 });
      text(ctx, `${f1(T - tau)} yr younger`, px, vy + 53, { color: C.gold, size: 11, weight: 600 });
    }

    info.textContent = `β = ${beta.toFixed(2)}, γ = ${g.toFixed(2)} · at the reunion: Earth twin ${f1(T)} yr older, traveller ${f1(tau)} yr older (${f1(T - tau)} yr younger)`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
