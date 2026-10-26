// de Broglie–Bohm pilot wave: a double slit made of two freely spreading Gaussian packets (ħ = m = 1).
// ψⱼ ∝ τ^(−1/2) exp(−(y − yⱼ)² / (4σ₀²τ)), τ = 1 + it/(2σ₀²), guidance velocity v_y = Im(∂ᵧψ/ψ).
import { C, reduced, canvas, controls, button, toggle, loop, readout, text, clamp } from "./kit.js";

export const title = "Pilot-wave paths";
export const caption = "In the pilot-wave picture every particle is real and always has a position, steered by a wave. Two spreading packets leave the slits and overlap. The paths follow the wave's phase: none crosses the midline, and they bunch into the bright fringes. Switch on |ψ|² to see the guiding wave. Forward distance is drawn proportional to time. Revived later by Bohm.";

const S0 = 1, A = 8, TE = 40;                  // packet width σ₀, half the slit separation, run length (units: ħ = m = 1)
const Y = 44, NT = 40, NP = 120, NB = 44;      // vertical half-range shown, trajectories, path samples, screen bins
const RUN_T = 8, HOLD = 1.6;                   // seconds on screen per run, then a pause before the next sample
const TAU = 2 * Math.PI;
const out = new Float64Array(4);

// out = [Re ψ, Im ψ, Re ∂ᵧψ, Im ∂ᵧψ] at (y, t), for ψ = ψ(slit at +A) + ψ(slit at −A).
function psi(y, t) {
  const ti = t / (2 * S0 * S0), m2 = 1 + ti * ti, ir = 1 / m2, ii = -ti / m2;       // 1/τ
  const arg = -Math.atan2(ti, 1) / 2, mag = m2 ** -0.25, pr = mag * Math.cos(arg), pi = mag * Math.sin(arg); // τ^(−1/2)
  let R = 0, I = 0, DR = 0, DI = 0;
  for (let sgn = -1; sgn <= 1; sgn += 2) {
    const d = y - sgn * A, q = (-d * d) / (4 * S0 * S0), e = Math.exp(q * ir), er = e * Math.cos(q * ii), ei = e * Math.sin(q * ii);
    const gr = er * pr - ei * pi, gi = er * pi + ei * pr;                          // ψⱼ
    const cr = (-d / (2 * S0 * S0)) * ir, ci = (-d / (2 * S0 * S0)) * ii;          // ∂ᵧ ln ψⱼ
    R += gr; I += gi; DR += gr * cr - gi * ci; DI += gr * ci + gi * cr;
  }
  out[0] = R; out[1] = I; out[2] = DR; out[3] = DI;
}
const dens = (y, t) => { psi(y, t); return out[0] * out[0] + out[1] * out[1]; };
const vel = (y, t) => { psi(y, t); const d = out[0] * out[0] + out[1] * out[1]; return d > 1e-300 ? (out[3] * out[0] - out[2] * out[1]) / d : 0; };

// Starting points: stratified samples of |ψ(y, 0)|² (one per equal-probability slice), so the paths are evenly spread.
const G0 = 2400, Y0 = A + 8, cdf0 = new Float64Array(G0 + 1);
for (let i = 0; i < G0; i++) cdf0[i + 1] = cdf0[i] + dens(-Y0 + (2 * Y0 * (i + 0.5)) / G0, 0);
const start = u => {
  const r = u * cdf0[G0];
  let lo = 1, hi = G0;
  while (lo < hi) { const m = (lo + hi) >> 1; cdf0[m] >= r ? (hi = m) : (lo = m + 1); }
  return -Y0 + ((lo - 1 + (r - cdf0[lo - 1]) / (cdf0[lo] - cdf0[lo - 1] || 1)) * 2 * Y0) / G0;
};
// Total probability under |ψ(y, TE)|², to scale the expected screen curve.
let ZE = 0;
for (let i = 0; i < 3000; i++) ZE += dens(-150 + (300 * (i + 0.5)) / 3000, TE) * (300 / 3000);

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "A double slit seen from above. About forty particle paths leave two slits on the left, bend and bunch into interference fringes, and land on a screen on the right where a histogram builds up. A faint violet map can show the guiding wave's intensity. No path crosses the centre line." });
  const row = controls(root), info = readout(root);
  const paths = new Float32Array(NT * (NP + 1)), counts = new Int32Array(NB);
  let prog = reduced ? 1 : 0, hold = 0, run = 0, hits = 0, maxC = 0, counted = false, wave = true, cache = null;

  toggle(row, "Show |ψ|²", true, on => { wave = on; lp.redraw(); });
  button(row, "New run", () => { newRun(); if (!lp.playing) { prog = 1; finish(); } lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));

  function newRun() {
    for (let k = 0; k < NT; k++) {
      let y = start((k + Math.random()) / NT);
      paths[k * (NP + 1)] = y;
      for (let i = 0; i < NP; i++) { // RK4, three sub-steps per sample
        const h = TE / NP / 3;
        for (let s = 0; s < 3; s++) {
          const t = ((i * 3 + s) * TE) / NP / 3;
          const k1 = vel(y, t), k2 = vel(y + (h / 2) * k1, t + h / 2), k3 = vel(y + (h / 2) * k2, t + h / 2), k4 = vel(y + h * k3, t + h);
          y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        }
        paths[k * (NP + 1) + i + 1] = y;
      }
    }
    run++; prog = 0; hold = 0; counted = false;
  }
  function finish() { // the run is over: add where each particle landed to the screen histogram
    if (counted) return;
    counted = true;
    if (hits > 3000) { counts.fill(0); hits = maxC = 0; }
    for (let k = 0; k < NT; k++) {
      const y = paths[k * (NP + 1) + NP], b = Math.floor(((y + Y) / (2 * Y)) * NB);
      if (b >= 0 && b < NB) { maxC = Math.max(maxC, ++counts[b]); hits++; }
    }
  }
  newRun();
  if (reduced) finish();

  // |ψ|² as vertical strips, one per instant, each filled with a cached gradient (rebuilt only when the canvas size changes).
  function field(L) {
    const key = `${L.x0}|${L.xs}|${L.yt}|${L.yb}`;
    if (cache && cache.key === key) return cache.cols;
    const { ctx } = cv, NC = 64, NR = 36, cols = [];
    for (let c = 0; c < NC; c++) {
      const g = ctx.createLinearGradient(0, L.yt, 0, L.yb), t = (TE * (c + 0.5)) / NC;
      g.addColorStop(0, "rgba(177,140,255,0)");
      for (let r = 0; r < NR; r++) g.addColorStop((r + 0.5) / NR, `rgba(177,140,255,${Math.min(0.8, 0.95 * Math.sqrt(dens(-Y + (2 * Y * (r + 0.5)) / NR, t))).toFixed(3)})`); // ponytail: square-root brightness so the late, spread-out wave stays visible
      g.addColorStop(1, "rgba(177,140,255,0)");
      cols.push(g);
    }
    cache = { key, cols };
    return cols;
  }

  function draw(dt) {
    if (dt) {
      if (prog < 1) { prog = Math.min(1, prog + dt / RUN_T); if (prog >= 1) finish(); }
      else if ((hold += dt) > HOLD) newRun();
    }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    const fs = clamp(w / 52, 10, 13);
    const yc = h * 0.5, hh = h * 0.4, yS = y => yc - (y / Y) * hh;
    const L = { x0: w * 0.1, xs: w * 0.78, yt: yS(Y), yb: yS(-Y) }, xT = t => L.x0 + ((L.xs - L.x0) * t) / TE;

    if (wave) {
      const cols = field(L), dx = (L.xs - L.x0) / cols.length;
      for (let c = 0; c < cols.length; c++) { // strips snapped to whole pixels so no seams show
        const a = Math.round(L.x0 + c * dx), b = Math.round(L.x0 + (c + 1) * dx);
        ctx.fillStyle = cols[c]; ctx.fillRect(a, L.yt, b - a, L.yb - L.yt);
      }
    }
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(L.x0, L.yt, L.xs - L.x0, L.yb - L.yt);

    // Midline: the paths can never cross it.
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.6; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(L.x0, yc); ctx.lineTo(L.xs, yc); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;

    // Barrier with two slits at ±A, each about 4σ₀ wide.
    ctx.fillStyle = C.muted;
    const gaps = [yS(A + 2 * S0), yS(A - 2 * S0), yS(-A + 2 * S0), yS(-A - 2 * S0)];
    ctx.fillRect(L.x0 - 2, L.yt, 4, gaps[0] - L.yt); ctx.fillRect(L.x0 - 2, gaps[1], 4, gaps[2] - gaps[1]); ctx.fillRect(L.x0 - 2, gaps[3], 4, L.yb - gaps[3]);
    text(ctx, "slits", L.x0, L.yt - 6, { align: "center", color: C.muted, size: fs });
    text(ctx, "time →", (L.x0 + L.xs) / 2, L.yt - 6, { align: "center", color: C.muted, size: fs });
    text(ctx, "screen", (L.xs + w * 0.985) / 2, L.yt - 6, { align: "center", color: C.muted, size: fs });

    // Paths drawn out to the current time, with a dot at each head.
    const fade = prog < 1 ? 1 : clamp((HOLD - hold) / 0.4, 0, 1); // paths fade out just before the next run
    const kf = prog * NP, ki = Math.min(NP, Math.floor(kf)), fr = kf - ki;
    ctx.save(); ctx.beginPath(); ctx.rect(L.x0, L.yt, L.xs - L.x0 + 4, L.yb - L.yt); ctx.clip();
    ctx.lineWidth = 1.3;
    let crossed = 0;
    for (let k = 0; k < NT; k++) {
      const o = k * (NP + 1), up = paths[o] > 0;
      ctx.strokeStyle = ctx.fillStyle = up ? C.gold : C.green; ctx.globalAlpha = 0.9 * fade;
      ctx.beginPath(); ctx.moveTo(xT(0), yS(paths[o]));
      let bad = false;
      for (let i = 1; i <= ki; i++) { ctx.lineTo(xT((i * TE) / NP), yS(paths[o + i])); if (up ? paths[o + i] < 0 : paths[o + i] > 0) bad = true; }
      if (bad) crossed++;
      let hy = paths[o + ki], hx = xT((ki * TE) / NP);
      if (ki < NP) { hy += fr * (paths[o + ki + 1] - hy); hx = xT(((ki + fr) * TE) / NP); ctx.lineTo(hx, yS(hy)); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(hx, yS(hy), 2.6, 0, TAU); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;

    // Screen histogram, with the expected |ψ|² profile when the wave is shown.
    const hx0 = L.xs + 5, hw = w * 0.985 - hx0, bh = (L.yb - L.yt) / NB, Neff = Math.max(hits, NT);
    const expect = y => (Neff * dens(y, TE) * ((2 * Y) / NB)) / ZE, S = Math.max(maxC, expect(0), 3) * 1.15;
    ctx.fillStyle = C.gold; ctx.globalAlpha = 0.65;
    for (let b = 0; b < NB; b++) if (counts[b]) ctx.fillRect(hx0, L.yt + (NB - 1 - b) * bh + 0.5, (counts[b] / S) * hw, Math.max(1, bh - 1));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx0, L.yt); ctx.lineTo(hx0, L.yb); ctx.stroke();
    if (wave) {
      ctx.strokeStyle = C.violet; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i <= 100; i++) { const y = -Y + (2 * Y * i) / 100, x = hx0 + Math.min(1.1, expect(y) / S) * hw; i ? ctx.lineTo(x, yS(y)) : ctx.moveTo(x, yS(y)); }
      ctx.stroke();
    }

    // Legend.
    const ly = h * 0.955;
    ctx.lineWidth = 2;
    for (const [col, s, x, dash] of [[C.gold, "upper slit", L.x0, []], [C.green, "lower slit", L.x0 + w * 0.27, []], [C.muted, "midline", L.x0 + w * 0.54, [4, 3]]]) {
      ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x, ly - 3); ctx.lineTo(x + 14, ly - 3); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, s, x + 19, ly, { color: C.muted, size: fs - 1 < 10 ? 10 : fs - 1 });
    }

    info.textContent = `Run ${run} · ${hits} particles on the screen · paths that crossed the midline: ${crossed} of ${NT}`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
