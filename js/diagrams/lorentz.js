// Lorentz: a charge in a magnetic field (into the screen) circles with r = mv/(|q|B). Add an electric field and the circle drifts at E/B.
import { C, canvas, controls, slider, toggle, loop, readout, text } from "./kit.js";

export const title = "The Lorentz force";
export const caption = "A magnetic field pushes a moving charge sideways, never along its path, so it can only turn it. The result is a circle of radius r = mv/(|q|B): faster particles loop wider, stronger fields tighten the loop, and opposite charges circle opposite ways. Add an electric field and the circle drifts sideways at E/B, the same for either sign.";

const TS = 1.6, E0 = 0.9, TRAIL = 420; // model seconds per real second; electric field strength (model units); trail length in samples
const wrap = (x, w) => ((x % w) + w) % w;

function arrow(ctx, x0, y0, x1, y1, color, lw = 2) {
  const a = Math.atan2(y1 - y0, x1 - x0), hs = 5 + lw * 1.5;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hs * 0.7, y1 - Math.sin(a) * hs * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - hs * Math.cos(a - 0.45), y1 - hs * Math.sin(a - 0.45));
  ctx.lineTo(x1 - hs * Math.cos(a + 0.45), y1 - hs * Math.sin(a + 0.45));
  ctx.closePath(); ctx.fill();
}

export function mount(root) {
  const cv = canvas(root, { label: "A charged particle circling in a magnetic field that points into the screen, with arrows for its velocity and for the force on it, and a fading trail." });
  const row = controls(root), info = readout(root);
  let B = 1.5, s = 2.5, sign = 1, withE = false;
  let gx = 0, phi = -Math.PI / 2, r = s / B; // guiding-centre x, orbit phase, current (eased) radius; units are model units, y up
  const tx = new Float32Array(TRAIL), ty = new Float32Array(TRAIL);
  let tn = 0, th = 0;

  slider(row, { label: "Field B", min: 1, max: 3, step: 0.1, value: B, fmt: v => v.toFixed(1) }, v => { B = v; lp.redraw(); });
  slider(row, { label: "Speed v", min: 1, max: 3, step: 0.1, value: s, fmt: v => v.toFixed(1) }, v => { s = v; lp.redraw(); });
  // ponytail: flipping the sign reverses the rotation about the same centre (a charge launched the other way round the same loop), not a mirrored launch
  toggle(row, "Negative charge", false, on => { sign = on ? -1 : 1; lp.redraw(); });
  toggle(row, "Add electric field", false, on => { withE = on; gx = 0; tn = 0; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));

  function draw(dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const U = h * 0.13, cx = w / 2, cy = h / 2, om = sign * B, vd = withE ? E0 / B : 0; // U = pixels per model unit
    if (dt) {
      const d = dt * TS;
      r += (s / B - r) * (1 - Math.exp(-dt * 9));
      phi += om * d; gx -= vd * d; // E x B drift: -x for E up and B into the screen, the same for either sign of charge
      tx[th] = gx + r * Math.cos(phi); ty[th] = r * Math.sin(phi);
      th = (th + 1) % TRAIL; tn = Math.min(TRAIL, tn + 1);
    } else r = s / B;

    // Magnetic field: crosses in circles = pointing into the screen. Field-line density grows with B.
    const sp = (h * 0.34) / Math.sqrt(B), nx = Math.ceil(w / sp) + 1, ny = Math.ceil(h / sp) + 1, rr = Math.max(3.5, h * 0.02);
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.33; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = cx + (i - (nx - 1) / 2) * sp, y = cy + (j - (ny - 1) / 2) * sp, k = rr * 0.7;
      if (x < -rr || x > w + rr || y < -rr || y > h + rr) continue;
      ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, 2 * Math.PI);
      ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k);
    }
    ctx.stroke(); ctx.globalAlpha = 1;

    // Electric field: faint green arrows pointing up.
    if (withE) {
      const ex = w / 8;
      for (let i = 0; i < 8; i++) for (const fy of [0.3, 0.78]) {
        ctx.globalAlpha = 0.4;
        arrow(ctx, (i + 0.5) * ex, h * fy + h * 0.06, (i + 0.5) * ex, h * fy - h * 0.06, C.green, 1.5);
      }
      ctx.globalAlpha = 1;
    }

    // Orbit guide (drawn three times so it stays whole across the wrap-around edge).
    const gxs = wrap(cx + gx * U, w), gys = cy;
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
    for (const o of [-w, 0, w]) { ctx.beginPath(); ctx.arc(gxs + o, gys, Math.max(1, r * U), 0, 2 * Math.PI); ctx.stroke(); }
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // Fading trail (gold), broken where it wraps around the edge.
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.lineCap = "round";
    const BATCH = 6, per = Math.ceil(tn / BATCH);
    for (let b = 0; b < BATCH; b++) {
      ctx.globalAlpha = 0.12 + 0.75 * ((b + 1) / BATCH) ** 1.5;
      ctx.beginPath();
      for (let k = b * per; k < Math.min(tn - 1, (b + 1) * per + 1); k++) {
        const i = (th - tn + k + TRAIL) % TRAIL, j = (i + 1) % TRAIL;
        const xa = wrap(cx + tx[i] * U, w), xb = wrap(cx + tx[j] * U, w);
        if (Math.abs(xa - xb) > w / 2) continue;
        ctx.moveTo(xa, cy - ty[i] * U); ctx.lineTo(xb, cy - ty[j] * U);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = "butt";

    // The charge, with arrows for velocity v (white) and the magnetic force F (red).
    const px = wrap(cx + (gx + r * Math.cos(phi)) * U, w), py = cy - r * Math.sin(phi) * U;
    const vx = -r * om * Math.sin(phi) - vd, vy = r * om * Math.cos(phi), vm = Math.hypot(vx, vy) || 1;
    const Fm = r * om * om, fdx = -Math.cos(phi), fdy = Math.sin(phi);
    const rad = Math.max(7.5, h * 0.04), vl = rad + 4 + vm * 0.45 * U, fl = rad + 4 + Fm * 0.18 * U; // arrows start at the disc edge; their visible length is proportional to |v| and |F|
    const vux = vx / vm, vuy = -vy / vm;
    arrow(ctx, px + vux * rad, py + vuy * rad, px + vux * vl, py + vuy * vl, C.ink, 2);
    text(ctx, "v", px + vux * (vl + 10), py + vuy * (vl + 10), { color: C.ink, size: 12, align: "center", base: "middle", weight: 600 });
    arrow(ctx, px + fdx * rad, py + fdy * rad, px + fdx * fl, py + fdy * fl, C.red, 2);
    text(ctx, "F", px + fdx * (fl + 10), py + fdy * (fl + 10), { color: C.red, size: 12, align: "center", base: "middle", weight: 600 });
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(px, py, rad, 0, 2 * Math.PI); ctx.fill();
    text(ctx, sign > 0 ? "+" : "−", px, py + 0.5, { color: C.bg, size: Math.max(11, Math.round(rad * 1.5)), align: "center", base: "middle", weight: 700 });

    // Labels, on a dark chip so the field crosses don't cut through the text.
    ctx.fillStyle = "rgba(15,13,11,0.75)";
    ctx.fillRect(4, 4, 124, 22); ctx.fillRect(4, h - 24, 142, 20);
    text(ctx, "F = q(E + v × B)", 10, 19, { color: C.ink, size: 13, weight: 600 });
    text(ctx, "⊗  B into the screen", 10, h - 10, { color: C.muted, size: 11 });
    if (withE) text(ctx, "E ↑", w - 10, h - 10, { color: C.green, size: 12, align: "right", weight: 600 });
    text(ctx, sign > 0 ? "positive charge" : "negative charge", w - 10, 18, { color: C.muted, size: 11, align: "right" });

    info.textContent = `r = mv/(|q|B) = ${r.toFixed(2)} units (v = ${s.toFixed(1)}, B = ${B.toFixed(1)}), turning ${sign > 0 ? "counter-clockwise" : "clockwise"}` + (withE ? `; drift E/B = ${(E0 / B).toFixed(2)}` : "");
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
