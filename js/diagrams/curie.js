// Curie: radioactive decay. 400 nuclei each decay at random; the crowd follows N₀·2^(−t/T½).
import { C, canvas, controls, slider, button, toggle, loop, readout, axes, curve, text, map, clamp } from "./kit.js";

export const title = "Radioactive decay";
export const caption = "Every nucleus has the same chance of decaying in any instant, yet nobody can say which one goes next. Watch the alpha flashes pop up at random while the total follows a smooth curve: half left after one half-life, a quarter after two. Marie Curie, with Pierre Curie, discovered polonium and radium in 1898. Here the two isotopes differ only in the time labels.";

// ponytail: animation time is compressed, about two seconds per half-life at the default speed, whatever the isotope.
const N0 = 400, COLS = 20, TMAX = 8, STEP = 0.05, LIFE = 0.4; // TMAX in half-lives
const ISO = [
  { name: "Polonium-210", half: "138.4 days", per: 138.4, unit: "days" },
  { name: "Radium-226", half: "1,600 years", per: 1600, unit: "years" },
];
const clock = (hl, iso) => `${Math.round(hl * iso.per).toLocaleString("en-US")} ${iso.unit}`;

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A grid of 400 nuclei that flash and fade as they decay at random, beside a graph of the number remaining falling along a smooth exponential curve." });
  const row = controls(root), info = readout(root);
  let ri = 0, speed = 0.45, alive, n, t, hist, hn, hold, flashes;
  const reset = () => { alive = new Uint8Array(N0).fill(1); n = N0; t = 0; hist = new Float32Array(TMAX / STEP + 2); hist[0] = N0; hn = 1; hold = 0; flashes = []; };
  reset();
  toggle(row, "Radium-226 (else polonium-210)", false, on => { ri = +on; reset(); lp.redraw(); });
  slider(row, { label: "Speed", min: 0.1, max: 1.5, step: 0.05, value: speed, fmt: v => `${v.toFixed(2)} T½/s` }, v => { speed = v; });
  button(row, "Reset", () => { reset(); lp.redraw(); });
  const lp = loop(row, (_, dt) => { advance(dt); draw(); });

  function advance(dt) {
    if (!dt) return;
    flashes = flashes.filter(f => (f.age += dt) < LIFE);
    if (t >= TMAX) { if ((hold += dt) > 2.5) reset(); return; } // hold the final picture, then start over
    const dh = speed * dt, p = 1 - 2 ** -dh; // chance that one nucleus decays during this tick
    for (let i = 0; i < N0; i++) if (alive[i] && Math.random() < p) { alive[i] = 0; n--; flashes.push({ i, age: 0, a: Math.random() * 2 * Math.PI }); }
    t = Math.min(TMAX, t + dh);
    while (hn * STEP <= t && hn < hist.length) hist[hn++] = n;
  }

  function draw() {
    const { ctx, w, h } = cv, iso = ISO[ri];
    ctx.clearRect(0, 0, w, h);
    text(ctx, `${iso.name} · half-life ${iso.half}`, 10, 18, { color: C.gold, size: 12, weight: 600 });

    // The nuclei: gold = still radioactive, dim = decayed (now a different atom), flash + alpha particle at the moment of decay.
    const gx = 12, gy = 30, gs = Math.min(w * 0.44, h - 60), cell = gs / COLS;
    const at = i => [gx + ((i % COLS) + 0.5) * cell, gy + (((i / COLS) | 0) + 0.5) * cell];
    ctx.fillStyle = "rgba(200,180,150,0.16)";
    ctx.beginPath();
    for (let i = 0; i < N0; i++) if (!alive[i]) { const [x, y] = at(i); ctx.moveTo(x + cell * 0.16, y); ctx.arc(x, y, cell * 0.16, 0, 2 * Math.PI); }
    ctx.fill();
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    for (let i = 0; i < N0; i++) if (alive[i]) { const [x, y] = at(i); ctx.moveTo(x + cell * 0.34, y); ctx.arc(x, y, cell * 0.34, 0, 2 * Math.PI); }
    ctx.fill();
    for (const f of flashes) {
      const k = f.age / LIFE, [x, y] = at(f.i);
      ctx.strokeStyle = `rgba(255,236,170,${1 - k})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, cell * (0.3 + 0.8 * k), 0, 2 * Math.PI); ctx.stroke();
      ctx.fillStyle = `rgba(150,215,255,${1 - k})`;
      ctx.beginPath(); ctx.arc(clamp(x + Math.cos(f.a) * cell * 3.5 * k, 2, w - 2), clamp(y + Math.sin(f.a) * cell * 3.5 * k, 2, h - 2), cell * 0.22, 0, 2 * Math.PI); ctx.fill(); // ponytail: the alpha particle's flight is for show, kept inside the canvas
    }
    text(ctx, "one dot = one nucleus", 10, gy + gs + 14, { color: C.muted, size: 10 });

    // The graph: dashed = N₀·2^(−t/T½), solid = this run.
    const px = gx + gs + 40, pr = { x: px, y: gy, w: w - px - 12, h: gs }, Y = N0 * 1.05;
    const X = v => map(v, 0, TMAX, pr.x, pr.x + pr.w), Yp = v => map(v, 0, Y, pr.y + pr.h, pr.y);
    axes(ctx, pr);
    for (const v of [0, 200, 400]) text(ctx, v, pr.x - 5, Yp(v) + 3, { color: C.muted, size: 10, align: "right" });
    for (const v of [0, 2, 4, 6, 8]) text(ctx, v, X(v), pr.y + pr.h + 13, { color: C.muted, size: 10, align: "center" });
    text(ctx, "half-lives elapsed", pr.x + pr.w, pr.y + pr.h + 26, { color: C.muted, size: 10, align: "right" });
    curve(ctx, pr, [0, TMAX], [0, Y], x => N0 * 2 ** -x, { color: C.muted, dash: [5, 4], width: 1.5 });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i < hn; i++) i ? ctx.lineTo(X(i * STEP), Yp(hist[i])) : ctx.moveTo(X(0), Yp(hist[0]));
    ctx.lineTo(X(t), Yp(n));
    ctx.stroke();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(t), Yp(n), 3.5, 0, 2 * Math.PI); ctx.fill();
    text(ctx, "this run", pr.x + pr.w - 4, pr.y + 12, { color: C.gold, size: 10, align: "right" });
    text(ctx, "N₀·2^(−t/T½)", pr.x + pr.w - 4, pr.y + 25, { color: C.muted, size: 10, align: "right" });

    info.textContent = `Elapsed ${t.toFixed(2)} half-lives = ${clock(t, iso)} · ${n} of ${N0} nuclei left (the curve predicts ${Math.round(N0 * 2 ** -t)})`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
