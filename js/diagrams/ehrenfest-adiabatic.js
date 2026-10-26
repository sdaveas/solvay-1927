// Ehrenfest: a ball in a box whose right wall moves in. Squeezed slowly, v·L (= E/ν for m = 1) stays fixed; squeezed suddenly, it jumps.
import { C, canvas, controls, toggle, button, loop, readout, text, map, clamp } from "./kit.js";

export const title = "Adiabatic invariants";
export const caption = "A ball bounces between two walls while the right one moves in. Squeezed slowly, the ball speeds up just enough that v·L stays fixed, and so does E/ν, energy divided by bounce frequency. Squeezed suddenly, the speed is unchanged but L halves, so the invariant jumps. Ehrenfest's adiabatic principle: slowly changed systems keep their quantum numbers. Model units.";

// ponytail: model units (ball mass 1, box length 1 at the start). The sudden squeeze is timed for when the ball is in the left part of the box, so the wall sweeps in without touching it.
const L0 = 1, LF = 0.5, V0 = 2.2, U_SLOW = 0.07, U_FAST = 12, READY = 1.4, HOLD = 3, TMAX = 12, NS = TMAX * 90 + 20;

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A ball bouncing between a fixed left wall and a right wall that moves inward. Below, a graph of v times L against time: nearly flat when the wall moves slowly, dropping in a step when it moves suddenly." });
  const row = controls(root), info = readout(root);
  const tr = new Float32Array(NS), vs = new Float32Array(NS), trail = [];
  let sudden = false, x, vx, L, ph, ct, tsq, teq, n, lastS, kick;
  function reset() { x = 0.3; vx = V0; L = L0; ph = 0; ct = 0; tsq = teq = -1; n = 0; lastS = -1; kick = 0; trail.length = 0; }
  reset();
  // paused (reduced motion): jump ahead to the end of the squeeze so the button still shows something
  const ahead = () => { if (!lp.playing) { for (let i = 0; ph < 2 && i < 2000; i++) step(1 / 60); lp.redraw(); } };
  toggle(row, "Sudden squeeze (else slow)", false, on => { sudden = on; reset(); ahead(); lp.redraw(); });
  button(row, "Squeeze again", () => { reset(); ahead(); lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));

  function step(dt) {
    for (let left = dt; left > 1e-9; ) {
      const hs = Math.min(left, 1 / 240); left -= hs; ct += hs;
      if (ph === 0 && ct >= READY && (!sudden || x < 0.38)) { ph = 1; tsq = ct; }
      const u = ph === 1 ? (sudden ? U_FAST : U_SLOW) : 0;
      if (ph === 1) { L = Math.max(LF, L - u * hs); if (L <= LF) { ph = 2; teq = ct; } }
      x += vx * hs;
      if (x > L) { x = 2 * L - x; vx = -vx - 2 * u; if (u) kick = 1; } // bounce off a wall moving in at speed u: the ball leaves faster by 2u
      if (x < 0) { x = -x; vx = -vx; }
      x = clamp(x, 0, L);
      if (ct - lastS >= 1 / 90 && n < NS) { tr[n] = ct; vs[n++] = (Math.abs(vx) * L) / (V0 * L0); lastS = ct; }
    }
    kick = Math.max(0, kick - dt * 2.2);
    if (ph === 2 && ct - teq > HOLD) reset();
  }

  function draw(dt) {
    if (dt) { step(dt); trail.push(x); if (trail.length > 10) trail.shift(); }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);
    const fs = clamp(w / 50, 10, 12);

    // the box
    const x0 = w * 0.07, sc = w * 0.76, by = h * 0.12, bh = h * 0.24, wx = x0 + L * sc, cy = by + bh / 2, rb = clamp(h * 0.028, 5, 9), speed = Math.abs(vx) / V0;
    text(ctx, ph === 0 ? "a ball bouncing in a box" : ph === 1 ? (sudden ? "sudden squeeze!" : "the wall moves in slowly") : "squeeze finished", 8, 15, { color: C.gold, size: 12, weight: 600 });
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(x0, by, L * sc, bh);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(wx, by); ctx.moveTo(x0, by + bh); ctx.lineTo(wx, by + bh); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, by - 3); ctx.lineTo(x0, by + bh + 3); ctx.stroke(); // fixed wall, hatched
    ctx.lineWidth = 1; ctx.beginPath();
    for (let y = by; y < by + bh + 6; y += 7) { ctx.moveTo(x0, y); ctx.lineTo(x0 - 6, y + 6); }
    ctx.stroke();
    if (L < L0 - 0.001) { ctx.setLineDash([3, 4]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 + L0 * sc, by - 3); ctx.lineTo(x0 + L0 * sc, by + bh + 3); ctx.stroke(); ctx.setLineDash([]); text(ctx, "start", x0 + L0 * sc, by + bh + 14, { color: C.muted, size: 10, align: "center" }); } // where the wall began
    ctx.fillStyle = C.gold; ctx.fillRect(wx, by - 3, 6, bh + 6); // moving wall with its rod
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx + 6, cy); ctx.lineTo(wx + 6 + w * 0.06, cy); ctx.stroke();
    ctx.fillRect(wx + 6 + w * 0.06, cy - 6, 4, 12);
    if (ph === 1) { // arrow: which way the wall is pushed, longer when sudden
      const al = sudden ? 30 : 12, ax = wx + 6 + w * 0.03;
      ctx.strokeStyle = ctx.fillStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax + al / 2, cy - 11); ctx.lineTo(ax - al / 2, cy - 11); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax - al / 2 - 5, cy - 11); ctx.lineTo(ax - al / 2 + 2, cy - 15); ctx.lineTo(ax - al / 2 + 2, cy - 7); ctx.closePath(); ctx.fill();
    }
    if (kick > 0) { // the ball is kicked by the moving wall
      ctx.strokeStyle = `rgba(255,240,200,${kick})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(wx, cy, 4 + 16 * (1 - kick), 0, 2 * Math.PI); ctx.stroke();
      text(ctx, "+2u", wx - 8, by - 7, { color: `rgba(255,240,200,${kick})`, size: 11, align: "right", weight: 600 });
    }

    // the ball: a short trail, a glow that grows with its speed, and a velocity arrow
    for (let i = 0; i < trail.length; i++) { ctx.fillStyle = `rgba(227,194,127,${0.05 + 0.3 * (i / trail.length) ** 2})`; ctx.beginPath(); ctx.arc(x0 + trail[i] * sc, cy, rb * (0.5 + 0.5 * (i / trail.length)), 0, 2 * Math.PI); ctx.fill(); }
    const bx = x0 + x * sc, gr = rb * (1.7 + 0.9 * speed), gg = ctx.createRadialGradient(bx, cy, 0, bx, cy, gr);
    gg.addColorStop(0, "rgba(255,230,170,0.6)"); gg.addColorStop(1, "rgba(255,230,170,0)");
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(bx, cy, gr, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(bx, cy, rb, 0, 2 * Math.PI); ctx.fill();
    const dir = vx >= 0 ? 1 : -1, vl = speed * w * 0.05, ay = cy - rb - 8, ae = clamp(bx + dir * vl, x0 + 8, wx - 8);
    ctx.strokeStyle = ctx.fillStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, ay); ctx.lineTo(ae, ay); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ae + dir * 4, ay); ctx.lineTo(ae - dir * 2, ay - 3.5); ctx.lineTo(ae - dir * 2, ay + 3.5); ctx.closePath(); ctx.fill();
    text(ctx, "v", bx, ay - 6, { color: C.ink, size: 10, align: "center" });

    // the length L
    const ry = by + bh + 16;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ry); ctx.lineTo(wx, ry); ctx.moveTo(x0, ry - 4); ctx.lineTo(x0, ry + 4); ctx.moveTo(wx, ry - 4); ctx.lineTo(wx, ry + 4); ctx.stroke();
    text(ctx, `L = ${L.toFixed(2)}`, (x0 + wx) / 2, ry - 5, { color: C.muted, size: fs, align: "center" });

    // v·L against time
    const r = { x: w * 0.14, y: h * 0.55, w: w * 0.8, h: h * 0.29 }, TW = sudden ? 6 : TMAX, Y1 = 1.4;
    const PX = t => map(t, 0, TW, r.x, r.x + r.w), PY = v => map(clamp(v, 0, Y1), 0, Y1, r.y + r.h, r.y);
    text(ctx, "v·L relative to its starting value (this is E/ν)", r.x, r.y - 8, { color: C.muted, size: 10 });
    if (tsq >= 0) {
      const te = teq >= 0 ? teq : ct;
      if (sudden) { ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX(tsq), r.y); ctx.lineTo(PX(tsq), r.y + r.h); ctx.stroke(); text(ctx, "sudden squeeze", PX(tsq) + 6, r.y + 12, { color: C.gold, size: 10 }); }
      else { ctx.fillStyle = "rgba(227,194,127,0.1)"; ctx.fillRect(PX(tsq), r.y, Math.max(1, PX(te) - PX(tsq)), r.h); text(ctx, "wall moving in", PX(tsq) + 6, r.y + r.h - 6, { color: C.gold, size: 10 }); }
    }
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.stroke();
    ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(r.x, PY(1)); ctx.lineTo(r.x + r.w, PY(1)); ctx.stroke(); ctx.setLineDash([]);
    for (const v of [0, 0.5, 1]) text(ctx, v, r.x - 6, PY(v), { color: C.muted, size: 10, align: "right", base: "middle" });
    for (let t = 0; t <= TW; t += TW / 3) text(ctx, t, PX(t), r.y + r.h + 13, { color: C.muted, size: 10, align: "center" });
    text(ctx, "time (s)", r.x + r.w, r.y + r.h + 27, { color: C.muted, size: 10, align: "right" });
    if (n) {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
      for (let i = 0; i < n; i++) i ? ctx.lineTo(PX(tr[i]), PY(vs[i])) : ctx.moveTo(PX(tr[i]), PY(vs[i]));
      ctx.stroke();
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(PX(tr[n - 1]), PY(vs[n - 1]), 3.5, 0, 2 * Math.PI); ctx.fill();
    }

    const E = 0.5 * vx * vx, nu = Math.abs(vx) / (2 * L);
    info.textContent = `E = ${E.toFixed(2)} · ν = v/2L = ${nu.toFixed(2)} · E/ν = ${(E / nu).toFixed(2)} (model units: ball mass 1, box length 1 at the start)`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
