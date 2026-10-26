// Einstein: bending starlight. Light follows the straightest path through spacetime curved by the Sun, so starlight grazing the Sun is
// deflected by θ = 1.75″ × (R☉/b) and the star appears displaced away from the Sun.
import { C, canvas, controls, slider, loop, readout, text } from "./kit.js";

export const title = "Bending starlight";
export const caption = "Mass curves spacetime, and light follows the curve. Starlight passing the Sun at distance b is bent by 1.75″ × (R☉/b), so the star appears pushed away from the Sun. Einstein's 1915 general relativity predicted this; the 1919 eclipse confirmed it. Not to scale: the bend is drawn about 35,000 times too large, and the distances are schematic.";

const LIMB = 1.75;  // deflection at the Sun's edge, arcseconds
const K = 0.3;      // drawn deflection at b = 1 R☉, radians. ponytail: the real angle is 8.5e-6 rad, so this is ~35,000× exaggerated (and ∝ 1/b like the real one)
const N = 40;       // samples along the light path

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 9, label: "A star's light passes close to the Sun across a warped spacetime grid and bends toward it on the way to Earth. A hollow star marks where the star appears to be, pushed away from the Sun, next to its true position." });
  const row = controls(root), info = readout(root);
  let b = 1.5, ph = 0;
  const px = new Float32Array(N + 1), py = new Float32Array(N + 1), cum = new Float32Array(N + 1); // light path polyline and cumulative length
  const at = { x: 0, y: 0, dx: 1, dy: 0 };

  slider(row, { label: "Impact parameter b", min: 1, max: 10, step: 0.1, value: b, fmt: v => `${v.toFixed(1)} R☉` }, v => { b = v; lp.redraw(); });
  const lp = loop(row, (t, dt) => { ph += dt; draw(); });

  // Point and direction at distance s along the stored light path.
  function pointAt(s) {
    s = Math.max(0, Math.min(cum[N], s));
    let i = 1;
    while (i < N && cum[i] < s) i++;
    const seg = cum[i] - cum[i - 1] || 1, f = (s - cum[i - 1]) / seg, dx = px[i] - px[i - 1], dy = py[i] - py[i - 1], d = Math.hypot(dx, dy) || 1;
    at.x = px[i - 1] + dx * f; at.y = py[i - 1] + dy * f; at.dx = dx / d; at.dy = dy / d;
  }
  function star(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
      i ? ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)) : ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
    }
    ctx.closePath();
  }

  function draw() {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);
    // Geometry. The ray's closest approach is fixed on screen at bpx above the Sun's centre; the Sun's drawn radius is bpx/b.
    // ponytail: that makes b a zoom (a small b = a big Sun), which keeps the star, ray and Earth on screen for every b while b/R☉ stays exact.
    const cx = w * 0.5, cy = h * 0.56, bpx = h * 0.17, Rs = bpx / b, ex = w * 0.92, xs = w * 0.07;
    const th = K / b;                                   // drawn deflection, radians
    const a2 = Math.atan2(bpx, ex - cx), a1 = a2 - th;  // ray direction after / before the Sun (screen angle, y down)
    const d1x = Math.cos(a1), d1y = Math.sin(a1), d2x = Math.cos(a2), d2y = Math.sin(a2);
    const Px = cx, Py = cy - bpx;
    const sy = Py - Math.tan(a1) * (cx - xs);           // true star height
    const ay = cy - Math.tan(a2) * (ex - xs);           // apparent star height: back along the ray as it arrives at Earth

    // Spacetime grid, pulled in toward the Sun (r' = r(1 − A R²/(r²+R²))).
    const sp = h * 0.075;
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.3; ctx.lineWidth = 1;
    ctx.beginPath();
    const warp = (x, y, first) => {
      const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy, f = 1 - (0.8 * Rs * Rs) / (r2 + Rs * Rs);
      first ? ctx.moveTo(cx + dx * f, cy + dy * f) : ctx.lineTo(cx + dx * f, cy + dy * f);
    };
    for (let y = cy % sp; y < h + 1; y += sp) for (let i = 0; i <= 48; i++) warp((w * i) / 48, y, !i);
    for (let x = cx % sp; x < w + 1; x += sp) for (let i = 0; i <= 28; i++) warp(x, (h * i) / 28, !i);
    ctx.stroke(); ctx.globalAlpha = 1;

    // The Sun.
    const R = Math.max(Rs, 4);
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.6);
    g.addColorStop(0, "rgba(255,214,120,0.55)"); g.addColorStop(0.4, "rgba(255,170,60,0.22)"); g.addColorStop(1, "rgba(255,150,40,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 2.6, 0, 2 * Math.PI); ctx.fill();
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, "#fff3c4"); g.addColorStop(0.7, "#ffc04a"); g.addColorStop(1, "#ff9a2e");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.fill();
    text(ctx, "Sun", cx, cy + R + 14, { color: C.muted, size: 11, align: "center" });

    // Impact parameter: a ruler in solar radii from the Sun's centre to the ray.
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.7; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, Py);
    const every = Math.max(1, Math.ceil(5 / Rs));
    for (let k = every; k * Rs < bpx - 2; k += every) { ctx.moveTo(cx - 3, cy - k * Rs); ctx.lineTo(cx + 3, cy - k * Rs); }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(15,13,11,0.75)"; ctx.fillRect(cx + 4, cy - bpx / 2 - 8, 70, 17);
    text(ctx, `b = ${b.toFixed(1)} R☉`, cx + 8, cy - bpx / 2 + 4, { color: C.ink, size: 11 });

    // Where the light would have gone with no gravity.
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.7; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(Px, Py); ctx.lineTo(ex, Py + (d1y / d1x) * (ex - Px)); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // The bent path: straight in, a smooth cubic bend through the closest-approach point, straight out.
    const r = w * 0.25, q1x = Px - d1x * r, q1y = Py - d1y * r, q2x = Px + d2x * r, q2y = Py + d2y * r, k = (4 / 3) * r;
    const c1x = q1x + d1x * k, c1y = q1y + d1y * k, c2x = q2x - d2x * k, c2y = q2y - d2y * k;
    const nS = 6, nB = N - 2 * nS; // samples on each straight part / on the bend
    for (let i = 0; i <= N; i++) {
      let x, y;
      if (i <= nS) { const f = i / nS; x = xs + (q1x - xs) * f; y = sy + (q1y - sy) * f; }
      else if (i >= N - nS) { const f = (i - (N - nS)) / nS; x = q2x + (ex - q2x) * f; y = q2y + (cy - q2y) * f; }
      else {
        const u = (i - nS) / nB, v = 1 - u;
        x = v * v * v * q1x + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * q2x;
        y = v * v * v * q1y + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * q2y;
      }
      px[i] = x; py[i] = y; cum[i] = i ? cum[i - 1] + Math.hypot(x - px[i - 1], y - py[i - 1]) : 0;
    }
    ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(px[0], py[0]); for (let i = 1; i <= N; i++) ctx.lineTo(px[i], py[i]); ctx.stroke(); ctx.globalAlpha = 1;

    // Light pulses travelling from the star to Earth.
    const total = cum[N], gap = total / 4, head = (ph * total * 0.4) % gap;
    for (let p = 0; p < 4; p++) {
      const s0 = head + p * gap;
      ctx.beginPath();
      for (let q = 0; q <= 20; q++) {
        pointAt(s0 - q * 2);
        const o = 3.2 * Math.sin(q * 0.9) * (1 - q / 22);
        const x = at.x - at.dy * o, y = at.y + at.dx * o;
        q ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1; ctx.stroke();
    }

    // What the eye sees: the line of sight back along the arriving ray, to the apparent star.
    ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(ex, cy); ctx.lineTo(xs, ay); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // The deflection angle θ at the closest-approach point.
    const ar = Math.min(w * 0.1, 60);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(Px, Py, ar, a1, a2); ctx.stroke();
    text(ctx, "θ", Px + (ar + 9) * Math.cos((a1 + a2) / 2), Py + (ar + 9) * Math.sin((a1 + a2) / 2) + 4, { color: C.ink, size: 12, align: "center", weight: 600 });

    // Stars: the true one (white), the apparent one (gold outline), and the shift between them.
    const ssz = Math.max(6, h * 0.03);
    ctx.fillStyle = C.ink; star(ctx, xs, sy, ssz); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.6; ctx.setLineDash([2, 2]); star(ctx, xs, ay, ssz); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "apparent position", xs - ssz * 0.3, ay - ssz - 5, { color: C.gold, size: 11 });
    text(ctx, "true position", xs - ssz * 0.3, sy + ssz + 14, { color: C.ink, size: 11 });
    if (sy - ay > ssz * 3) {
      ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xs + ssz + 5, sy - ssz); ctx.lineTo(xs + ssz + 5, ay + ssz + 1); ctx.stroke();
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(xs + ssz + 5, ay + ssz - 4); ctx.lineTo(xs + ssz + 1, ay + ssz + 3); ctx.lineTo(xs + ssz + 9, ay + ssz + 3); ctx.closePath(); ctx.fill();
    }

    // Earth.
    g = ctx.createRadialGradient(ex - 2, cy - 2, 1, ex, cy, 8);
    g.addColorStop(0, "#8fd0ff"); g.addColorStop(1, "#1f6fb8");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, cy, 7, 0, 2 * Math.PI); ctx.fill();
    text(ctx, "Earth", ex, cy + 24, { color: C.muted, size: 11, align: "center" });

    info.textContent = `b = ${b.toFixed(1)} R☉ → deflection θ = ${(LIMB / b).toFixed(2)}″ (1.75″ at the Sun's edge); the drawn angle is ×35,000`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
