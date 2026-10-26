// Langevin: dv = -(γ/m) v dt + (√(2γkT)/m) dW per axis (m = 1). 200 hidden grains give the mean squared displacement; the first one is drawn.
import { C, canvas, controls, slider, button, loop, readout, axes, text, map, clamp } from "./kit.js";

export const title = "Brownian motion";
export const caption = "A heavy grain is kicked about by molecules too small to see. Langevin's 1908 equation replaces the countless kicks with friction plus random noise. Each path is unpredictable, yet the average squared distance travelled grows along a straight line, 4Dt, with D = kT/γ. Hotter or slipperier means faster spreading. The molecule collisions drawn here are schematic.";

const N = 200, M = 100, TS = 1.5, TRL = 360, HMAX = 800; // grains, drawn molecules, model seconds per real second, trail samples, history samples
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
const niceCeil = v => { const e = 10 ** Math.floor(Math.log10(v)), m = v / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; };
const fmtN = v => String(+v.toPrecision(2));

export function mount(root) {
  const cv = canvas(root, { label: "Left: a large grain jiggling among many small molecules, with its trail. Right: graph of the mean squared displacement of 200 grains against time, growing along the straight line 4Dt." });
  const row = controls(root), info = readout(root);
  let kT = 1, gam = 1;
  const X = new Float64Array(N), Y = new Float64Array(N), VX = new Float64Array(N), VY = new Float64Array(N);
  const trx = new Float32Array(TRL), try_ = new Float32Array(TRL);
  const ht = new Float32Array(HMAX), hv = new Float32Array(HMAX);
  const mx = new Float32Array(M), my = new Float32Array(M), mvx = new Float32Array(M), mvy = new Float32Array(M), mh = new Float32Array(M);
  let t = 0, msd = 0, xmax = 8, every = 0.05, nextS = 0, hn = 0, tn = 0, th = 0, camx = 0, camy = 0;
  for (let i = 0; i < M; i++) {
    const a = Math.random() * 2 * Math.PI, sp = 0.35 + 0.35 * Math.random();
    mx[i] = Math.random(); my[i] = Math.random(); mvx[i] = Math.cos(a) * sp; mvy[i] = Math.sin(a) * sp;
  }
  function reset() {
    for (let i = 0; i < N; i++) { X[i] = Y[i] = 0; VX[i] = gauss() * Math.sqrt(kT); VY[i] = gauss() * Math.sqrt(kT); }
    t = 0; msd = 0; xmax = 8; every = 0.05; nextS = every; hn = 1; ht[0] = 0; hv[0] = 0; tn = 0; th = 0; camx = camy = 0;
  }
  reset();
  slider(row, { label: "Temperature", min: 0.2, max: 3, step: 0.1, value: kT, fmt: v => `${v.toFixed(1)} kT` }, v => { kT = v; reset(); lp.redraw(); });
  slider(row, { label: "Friction γ", min: 0.5, max: 5, step: 0.1, value: gam, fmt: v => v.toFixed(1) }, v => { gam = v; reset(); lp.redraw(); });
  button(row, "Reset", () => { reset(); lp.redraw(); });
  const lp = loop(row, (_, dt) => draw(dt));

  function step(dt) {
    const dtm = dt * TS, n = Math.ceil(dtm / 0.01), h = dtm / n, a = Math.exp(-gam * h), b = Math.sqrt(kT * (1 - a * a));
    for (let k = 0; k < n; k++) for (let i = 0; i < N; i++) {
      const vx = VX[i] * a + b * gauss(), vy = VY[i] * a + b * gauss();
      X[i] += 0.5 * (VX[i] + vx) * h; Y[i] += 0.5 * (VY[i] + vy) * h; VX[i] = vx; VY[i] = vy;
    }
    t += dtm;
    let s = 0; for (let i = 0; i < N; i++) s += X[i] * X[i] + Y[i] * Y[i];
    msd = s / N;
    while (t >= nextS) {
      ht[hn] = t; hv[hn] = msd; hn++; nextS += every;
      if (hn === HMAX) { for (let i = 0; i < HMAX / 2; i++) { ht[i] = ht[2 * i]; hv[i] = hv[2 * i]; } hn = HMAX / 2; every *= 2; }
    }
    while (t > xmax * 0.98) xmax *= 2;
    trx[th] = X[0]; try_[th] = Y[0]; th = (th + 1) % TRL; tn = Math.min(TRL, tn + 1);
    // camera follows the tracked grain with a lag, so its kicks stay visible
    const k = 1 - Math.exp(-dt / 0.4);
    camx += (X[0] - camx) * k; camy += (Y[0] - camy) * k;
    const dx = X[0] - camx, dy = Y[0] - camy, d = Math.hypot(dx, dy);
    if (d > 2.5) { camx = X[0] - (dx / d) * 2.5; camy = Y[0] - (dy / d) * 2.5; }
  }

  function draw(dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    if (dt) step(dt);
    const D = kT / gam;
    const S = Math.round(Math.min(h - 46, w * 0.44)), A = { x: 8, y: 24 }, sc = S / 8; // arena side, origin, px per model unit

    // ── Arena ──
    text(ctx, "grain and molecules", A.x, 16, { color: C.muted, size: 11 });
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(A.x, A.y, S, S);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(A.x + 0.5, A.y + 0.5, S - 1, S - 1);
    ctx.save(); ctx.beginPath(); ctx.rect(A.x, A.y, S, S); ctx.clip();
    const acx = A.x + S / 2, acy = A.y + S / 2, wx = v => acx + (v - camx) * sc, wy = v => acy - (v - camy) * sc;
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.beginPath(); // fixed lattice in the lab frame: shows the camera moving
    for (let i = Math.floor((camx - 4) / 2); i <= Math.ceil((camx + 4) / 2); i++) for (let j = Math.floor((camy - 4) / 2); j <= Math.ceil((camy + 4) / 2); j++) {
      const x = wx(i * 2), y = wy(j * 2);
      ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 3);
    }
    ctx.stroke();
    // trail
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.lineJoin = "round";
    const BATCH = 6, per = Math.ceil(tn / BATCH);
    for (let b = 0; b < BATCH; b++) {
      ctx.globalAlpha = 0.1 + 0.7 * ((b + 1) / BATCH) ** 1.5;
      ctx.beginPath();
      for (let k = b * per; k <= Math.min(tn - 1, (b + 1) * per); k++) {
        const i = (th - tn + k + TRL) % TRL;
        k === b * per ? ctx.moveTo(wx(trx[i]), wy(try_[i])) : ctx.lineTo(wx(trx[i]), wy(try_[i]));
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // molecules (cosmetic: they bounce off the walls and the grain, but do not push it; the grain's motion is the SDE above)
    // ponytail: schematic molecules; an honest many-body collision model would need the grain mass and molecule speeds tied to kT
    const gnx = 0.5 + (X[0] - camx) / 8, gny = 0.5 - (Y[0] - camy) / 8, rg = 0.075, rm = 0.013, sq = Math.sqrt(kT);
    for (let i = 0; i < M; i++) {
      if (dt) {
        mx[i] += mvx[i] * sq * dt; my[i] += mvy[i] * sq * dt;
        if (mx[i] < 0 || mx[i] > 1) { mx[i] = clamp(mx[i], 0, 1); mvx[i] = -mvx[i]; }
        if (my[i] < 0 || my[i] > 1) { my[i] = clamp(my[i], 0, 1); mvy[i] = -mvy[i]; }
        const dx = mx[i] - gnx, dy = my[i] - gny, d = Math.hypot(dx, dy) || 1e-6;
        if (d < rg + rm) {
          const nx = dx / d, ny = dy / d, vd = mvx[i] * nx + mvy[i] * ny;
          if (vd < 0) { mvx[i] -= 2 * vd * nx; mvy[i] -= 2 * vd * ny; mh[i] = 1; }
          mx[i] = gnx + nx * (rg + rm); my[i] = gny + ny * (rg + rm);
        }
        mh[i] = Math.max(0, mh[i] - dt * 4);
      }
    }
    const mr = Math.max(1.8, S * 0.014);
    ctx.fillStyle = C.blue; ctx.globalAlpha = 0.75; ctx.beginPath();
    for (let i = 0; i < M; i++) if (mh[i] < 0.05) { const x = A.x + mx[i] * S, y = A.y + my[i] * S; ctx.moveTo(x + mr, y); ctx.arc(x, y, mr, 0, 2 * Math.PI); }
    ctx.fill();
    ctx.fillStyle = C.gold;
    for (let i = 0; i < M; i++) if (mh[i] >= 0.05) { ctx.globalAlpha = mh[i]; ctx.beginPath(); ctx.arc(A.x + mx[i] * S, A.y + my[i] * S, mr * 1.4, 0, 2 * Math.PI); ctx.fill(); }
    ctx.globalAlpha = 1;
    // the grain
    const gx = A.x + gnx * S, gy = A.y + gny * S, gr = rg * S;
    const gg = ctx.createRadialGradient(gx - gr * 0.3, gy - gr * 0.3, gr * 0.1, gx, gy, gr);
    gg.addColorStop(0, "#f6e3b4"); gg.addColorStop(1, "#b88a3e");
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    text(ctx, "molecule kicks: schematic", A.x, A.y + S + 13, { color: C.muted, size: 10 });

    // ── Mean squared displacement ──
    const r = { x: A.x + S + 44, y: A.y, w: w - (A.x + S + 44) - 12, h: S - 24 };
    const ymax = niceCeil(1.25 * 4 * D * xmax);
    const PXm = v => map(v, 0, xmax, r.x, r.x + r.w), PYm = v => map(clamp(v, 0, ymax), 0, ymax, r.y + r.h, r.y);
    text(ctx, "mean squared displacement", r.x - 36, 16, { color: C.muted, size: 11 });
    axes(ctx, r, { xLabel: "time (model units)" });
    for (const v of [0, ymax / 2, ymax]) text(ctx, v === 0 ? "0" : fmtN(v), r.x - 5, PYm(v), { color: C.muted, size: 10, align: "right", base: "middle" });
    for (const v of [0, xmax / 2, xmax]) text(ctx, v, PXm(v), r.y + r.h + 14, { color: C.muted, size: 10, align: v === 0 ? "left" : v === xmax ? "right" : "center" });
    ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(PXm(0), PYm(0)); ctx.lineTo(PXm(xmax), PYm(4 * D * xmax)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(PXm(0), PYm(0));
    for (let i = 1; i < hn; i++) ctx.lineTo(PXm(ht[i]), PYm(hv[i]));
    ctx.lineTo(PXm(t), PYm(msd)); ctx.stroke();
    text(ctx, "mean of 200 grains", r.x + 8, r.y + 13, { color: C.gold, size: 10 });
    text(ctx, "4Dt, D = kT/γ", r.x + 8, r.y + 26, { color: C.red, size: 10 });

    info.textContent = `D = kT/γ = ${D.toFixed(2)} · at t = ${t.toFixed(1)}: ⟨r²⟩ = ${msd.toFixed(1)} against 4Dt = ${(4 * D * t).toFixed(1)} (model units)`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
