// Einstein: time dilation with light clocks. A photon bouncing between two mirrors is a clock. Light has the same speed for every
// observer, so in a clock moving at β the photon follows a longer diagonal path and each tick takes γ = 1/√(1−β²) times longer.
import { C, canvas, controls, slider, button, loop, readout, text } from "./kit.js";

export const title = "Time dilation";
export const caption = "A light clock ticks each time a photon bounces to the far mirror and back. In special relativity light has the same speed for every observer, so in the moving clock the photon takes a longer, diagonal path and each tick lasts γ = 1/√(1−β²) times longer. Watch the moving counter fall behind. Ticks are slowed so you can watch them.";

const T0 = 1.2; // seconds per tick of the resting clock. ponytail: slowed for viewing; a real light clock ticks in nanoseconds or faster
const TR = 260; // trail samples
const tri = u => 1 - Math.abs(2 * u - 1); // photon height (0 = bottom mirror, 1 = top) for phase u in [0, 1)

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Two light clocks side by side, one at rest and one moving to the right. A photon bounces between two mirrors in each. In the moving clock the photon traces a longer diagonal path, so its tick counter runs more slowly." });
  const row = controls(root), info = readout(root);
  let beta = 0.8, pr = 0, pm = 0, s = 0; // tick phases (rest, moving) and the moving clock's distance travelled, in clock heights
  const trS = new Float32Array(TR), trH = new Float32Array(TR);
  let tn = 0, th = 0;
  const gamma = () => 1 / Math.sqrt(1 - beta * beta);

  slider(row, { label: "Speed β", min: 0, max: 0.99, step: 0.01, value: beta, fmt: v => `${v.toFixed(2)} c` }, v => { beta = v; lp.redraw(); });
  button(row, "Restart", () => { pr = pm = s = 0; tn = th = 0; lp.redraw(); });

  function step(dt) {
    pr += dt / T0;
    pm += dt / (gamma() * T0); // proper time of the moving clock: dτ = dt/γ
    s += (beta * 2 * dt) / T0; // light covers 2 clock heights per resting tick, so v = β·2L/T0
    trS[th] = s; trH[th] = tri(pm % 1);
    th = (th + 1) % TR; tn = Math.min(TR, tn + 1);
  }

  function mirror(ctx, x, y, mw, flash, color) {
    if (flash > 0.02) {
      ctx.fillStyle = color; ctx.globalAlpha = 0.45 * flash;
      ctx.fillRect(x - mw / 2 - 3, y - 6, mw + 6, 12);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#cfc8bb"; ctx.fillRect(x - mw / 2, y - 2, mw, 4);
  }
  function photon(ctx, x, y, color) {
    ctx.fillStyle = color; ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.arc(x, y, 9, 0, 2 * Math.PI); ctx.fill();
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 2 * Math.PI); ctx.fill();
  }

  function draw(dt) {
    if (dt) step(dt);
    const { ctx, w, h } = cv, g = gamma();
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);
    const L = h * 0.34, yT = h * 0.15, yB = yT + L, yG = h * 0.55, mw = w * 0.12;
    const rx = w * 0.25, t0 = w * 0.52, tw = w * 0.46, wrapW = tw + mw;
    const X = sv => t0 - mw / 2 + ((sv * L) % wrapW); // screen x of the moving clock after travelling sv clock heights, wrapping around the track

    // Ground, with tick marks so the motion is visible.
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.03, yG); ctx.lineTo(w * 0.97, yG);
    for (let x = w * 0.03; x <= w * 0.97 + 1; x += w * 0.04) { ctx.moveTo(x, yG); ctx.lineTo(x, yG + 5); }
    ctx.stroke(); ctx.globalAlpha = 1;

    text(ctx, "At rest", rx, h * 0.075, { color: C.blue, size: 12, align: "center", weight: 600 });
    text(ctx, `Moving at ${beta.toFixed(2)} c  →`, t0 + tw / 2, h * 0.075, { color: C.gold, size: 12, align: "center", weight: 600 });

    // Resting clock: the photon goes straight up and down.
    const ur = pr % 1;
    ctx.strokeStyle = C.blue; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(rx, yT); ctx.lineTo(rx, yB); ctx.stroke(); ctx.globalAlpha = 1;
    mirror(ctx, rx, yT, mw, Math.exp(-((ur + 0.5) % 1) * T0 * 7), C.blue);
    mirror(ctx, rx, yB, mw, Math.exp(-ur * T0 * 7), C.blue);
    photon(ctx, rx, yB - tri(ur) * L, C.blue);

    // Moving clock: the photon rides along with the clock, so its path through the lab is a diagonal zigzag.
    const um = pm % 1, cx = X(s), period = g * T0;
    ctx.save();
    ctx.beginPath(); ctx.rect(t0 - 1, 0, tw + 2, h); ctx.clip();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.lineCap = "round";
    const BATCH = 5, per = Math.ceil(tn / BATCH);
    for (let b = 0; b < BATCH; b++) {
      ctx.globalAlpha = 0.12 + 0.8 * ((b + 1) / BATCH) ** 1.4;
      ctx.beginPath();
      for (let k = b * per; k < Math.min(tn - 1, (b + 1) * per + 1); k++) {
        const i = (th - tn + k + TR) % TR, j = (i + 1) % TR, xa = X(trS[i]), xb = X(trS[j]);
        if ((s - trS[i]) * L > wrapW || Math.abs(xa - xb) > w / 2) continue; // at most one pass across the track, broken where it wraps
        ctx.moveTo(xa, yB - trH[i] * L); ctx.lineTo(xb, yB - trH[j] * L);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = "butt";
    mirror(ctx, cx, yT, mw, Math.exp(-((um + 0.5) % 1) * period * 7), C.gold);
    mirror(ctx, cx, yB, mw, Math.exp(-um * period * 7), C.gold);
    photon(ctx, cx, yB - tri(um) * L, C.gold);
    ctx.restore();

    // Tick counters.
    text(ctx, `ticks: ${Math.floor(pr)}`, rx, h * 0.68, { color: C.blue, size: 16, align: "center", weight: 700 });
    text(ctx, `ticks: ${Math.floor(pm)}`, t0 + tw / 2, h * 0.68, { color: C.gold, size: 16, align: "center", weight: 700 });

    // Path length of the photon per tick: the cause of the slowdown.
    const bx = w * 0.3, unit = w * 0.085, bh = Math.max(11, h * 0.06), y1 = h * 0.8, y2 = h * 0.88;
    text(ctx, "light's path per tick (same speed, longer path, longer tick)", w * 0.03, h * 0.765, { color: C.muted, size: 10 });
    text(ctx, "at rest", bx - 6, y1 + bh / 2, { color: C.blue, size: 11, align: "right", base: "middle" });
    text(ctx, "moving", bx - 6, y2 + bh / 2, { color: C.gold, size: 11, align: "right", base: "middle" });
    const bw2 = unit * g;
    ctx.fillStyle = C.blue; ctx.fillRect(bx, y1, unit, bh);
    ctx.fillStyle = C.gold; ctx.fillRect(bx, y2, bw2, bh);
    text(ctx, "2L", bx + unit + 6, y1 + bh / 2, { color: C.muted, size: 11, base: "middle" });
    const lab = `2γL, ×${g.toFixed(2)}`, inside = bx + bw2 + 78 > w;
    text(ctx, lab, inside ? bx + bw2 - 5 : bx + bw2 + 6, y2 + bh / 2, { color: inside ? C.bg : C.muted, size: 11, base: "middle", align: inside ? "right" : "left", weight: inside ? 600 : 400 });

    info.textContent = `β = ${beta.toFixed(2)}, γ = ${g.toFixed(3)} · ticks so far: rest ${Math.floor(pr)}, moving ${Math.floor(pm)}`;
  }

  for (let i = 0; i < 72; i++) step(1 / 30); // warm up so the first (or reduced-motion) frame shows a trail and a count
  const lp = loop(row, (t, dt) => draw(dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
