// Langevin: paramagnetism. Atoms with a moment μ = 1 Bohr magneton tumble in 3D by rotational diffusion plus the field's torque; the mean alignment is M/M_sat = L(μB/kT), L(x) = coth x − 1/x.
import { C, canvas, controls, slider, loop, readout, axes, curve, text, clamp } from "./kit.js";

export const title = "Atomic magnets";
export const caption = "Atoms with a magnetic moment behave like tiny compass needles. A field lines them up; heat shakes them loose. Langevin (1905) showed the magnetisation follows L(μB/kT): proportional to B/T while weak (the dashed straight line), then levelling off as the needles saturate. Debye later applied the same mathematics to electric dipoles. Colder or stronger means more order.";

const TAU = 2 * Math.PI, N = 40, COLS = 10, ROWS = 4, BMAX = 20, MU_K = 9.2740100783e-24 / 1.380649e-23; // atoms, grid, plot range (T), μ_B/k_B in K per tesla
const L = x => (x < 0.05 ? x / 3 - x ** 3 / 45 : 1 / Math.tanh(x) - 1 / x);   // Langevin function (series near 0)
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(TAU * Math.random());
const fmtT = t => `${t < 10 ? t.toFixed(1) : Math.round(t)} K`;

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "A lattice of atoms drawn as compass needles in a magnetic field pointing up, with a gauge of the net magnetisation. Below, a graph of magnetisation against field for the chosen temperature, with Curie's straight-line law dashed and a marker for the current field." });
  const row = controls(root), info = readout(root);
  let B = 6, T = 3, ms = 0;                                        // tesla, kelvin, smoothed measured M/M_sat
  const UX = new Float32Array(N), UY = new Float32Array(N), UZ = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const z = 2 * Math.random() - 1, f = Math.random() * TAU, s = Math.sqrt(1 - z * z);
    UX[i] = s * Math.cos(f); UY[i] = z; UZ[i] = s * Math.sin(f);
  }
  const cxs = new Float32Array(N), cys = new Float32Array(N);       // drawn atom positions
  const xOf = () => (MU_K * B) / T;                                // x = μB/kT
  const mean = () => { let s = 0; for (let i = 0; i < N; i++) s += UY[i]; return s / N; };

  // Rotational diffusion with drift Dr·x·(e − (e·u)u), e = the field direction (+y, up). Stationary distribution ∝ exp(x cos θ).
  // ponytail: the tumbling rate is a visual choice (slower when cold), not a real spin-relaxation time.
  function step(dt) {
    const Dr = 2 * (T / 300) ** 0.3, a = Dr * xOf(), m = Math.ceil(dt * 60), h = dt / m, s = Math.sqrt(2 * Dr * h);
    for (let k = 0; k < m; k++) for (let i = 0; i < N; i++) {
      const x = UX[i], y = UY[i], z = UZ[i];
      let gx = gauss(), gy = gauss(), gz = gauss();
      const d = gx * x + gy * y + gz * z;
      gx -= d * x; gy -= d * y; gz -= d * z;
      const nx = x - a * h * x * y + s * gx, ny = y + a * h * (1 - y * y) + s * gy, nz = z - a * h * y * z + s * gz, nr = Math.hypot(nx, ny, nz);
      UX[i] = nx / nr; UY[i] = ny / nr; UZ[i] = nz / nr;
    }
  }
  const settle = () => { for (let k = 0; k < 120; k++) step(1 / 30); ms = mean(); };
  settle();

  slider(row, { label: "Field B", min: 0, max: BMAX, step: 0.5, value: B, fmt: v => `${v.toFixed(1)} T` }, v => { B = v; if (!lp.playing) settle(); lp.redraw(); });
  slider(row, { label: "Temperature", min: 0, max: 2.48, step: 0.01, value: Math.log10(T), fmt: v => fmtT(10 ** v) }, v => { T = 10 ** v; if (!lp.playing) settle(); lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t, dt));

  function draw(t, dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    if (dt) { step(dt); ms += (mean() - ms) * (1 - Math.exp(-dt / 0.8)); }
    const fs = clamp(w / 52, 10, 13), x = xOf(), pad = 8, pw = Math.round(w * 0.64), cell = pw / COLS;
    const P = { x: pad, y: 24, w: pw, h: cell * ROWS }, fa = 0.06 + 0.3 * Math.sqrt(B / BMAX);

    // ── the lattice of needles ──
    text(ctx, "atoms as needles · B points up", pad, 15, { color: C.muted, size: fs });
    ctx.fillStyle = "rgba(79,168,255,0.04)"; ctx.fillRect(P.x, P.y, P.w, P.h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1);
    if (B > 0) {                                                   // field lines with chevrons drifting up
      ctx.strokeStyle = `rgba(79,168,255,${fa})`; ctx.lineWidth = 1; ctx.beginPath();
      const gap = cell * 1.8;
      for (let j = 1; j < 5; j++) {
        const fx = P.x + (j * P.w) / 5;
        ctx.moveTo(fx, P.y); ctx.lineTo(fx, P.y + P.h);
        for (let cy = P.y + P.h - 5 - ((t * 30) % gap); cy > P.y + 4; cy -= gap) { ctx.moveTo(fx - 3, cy + 4); ctx.lineTo(fx, cy); ctx.lineTo(fx + 3, cy + 4); }
      }
      ctx.stroke();
    }
    const jig = cell * (0.02 + 0.06 * Math.sqrt(T / 300)), cr = cell * 0.36, nl = cell * 0.34;
    ctx.fillStyle = "rgba(177,140,255,0.14)"; ctx.strokeStyle = "rgba(177,140,255,0.55)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const cx = P.x + ((i % COLS) + 0.5) * cell + jig * Math.sin(2.3 * t + i * 1.7), cy = P.y + (Math.floor(i / COLS) + 0.5) * cell + jig * Math.sin(1.9 * t + i * 2.9);
      cxs[i] = cx; cys[i] = cy;
      ctx.moveTo(cx + cr, cy); ctx.arc(cx, cy, cr, 0, TAU);
    }
    ctx.fill(); ctx.stroke();
    ctx.lineWidth = Math.max(2.5, cell * 0.13); ctx.lineCap = "round";
    for (const [sg, col] of [[-1, C.muted], [1, C.gold]]) {          // south half grey, north half gold
      ctx.strokeStyle = col; ctx.beginPath();
      for (let i = 0; i < N; i++) {                                // ponytail: needles are 3D moments projected onto the page, so one pointing at you looks short
        const dx = UX[i], dy = -UY[i], lp2 = Math.hypot(dx, dy) || 1e-6, len = nl * Math.max(0.3, lp2);
        ctx.moveTo(cxs[i], cys[i]); ctx.lineTo(cxs[i] + sg * (dx / lp2) * len, cys[i] + sg * (dy / lp2) * len);
      }
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    // ── magnetisation gauge ──
    const gx = P.x + P.w + 26, gw = Math.max(14, cell * 0.7), g0 = P.y + P.h, tx = L(x);
    text(ctx, "M / M_sat", gx - 14, 15, { color: C.muted, size: fs });
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(gx + 0.5, P.y + 0.5, gw - 1, P.h - 1);
    ctx.fillStyle = C.gold; ctx.globalAlpha = 0.85; ctx.fillRect(gx + 1, g0 - 1 - (P.h - 2) * clamp(ms, 0, 1), gw - 2, (P.h - 2) * clamp(ms, 0, 1)); ctx.globalAlpha = 1;
    text(ctx, "1", gx - 4, P.y + 4, { align: "right", color: C.muted, size: 10 });
    text(ctx, "0", gx - 4, g0, { align: "right", color: C.muted, size: 10 });
    const ty = g0 - (P.h - 2) * tx;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx - 3, ty); ctx.lineTo(gx + gw + 3, ty); ctx.stroke();
    text(ctx, "L(x)", gx + gw + 6, ty + 3.5, { color: C.ink, size: 10 });
    text(ctx, ms.toFixed(2), gx + gw / 2, g0 + 14, { align: "center", color: C.gold, size: fs + 1, weight: 600 });

    // ── magnetisation against field, at this temperature ──
    const pr = { x: 36, y: P.y + P.h + 26, w: Math.round(w * 0.54), h: h - (P.y + P.h + 26) - 38 };
    const PX = v => pr.x + (v / BMAX) * pr.w, PY = v => pr.y + pr.h - v * pr.h;
    axes(ctx, pr, { xLabel: "field B (tesla)", yLabel: "M / M_sat" });
    for (const v of [0, 10, 20]) text(ctx, v, PX(v), pr.y + pr.h + 13, { align: "center", color: C.muted, size: 10 });
    for (const v of [0, 1]) text(ctx, v, pr.x - 5, PY(v) + 3.5, { align: "right", color: C.muted, size: 10 });
    curve(ctx, pr, [0, BMAX], [0, 1], b => (MU_K * b) / (3 * T), { color: C.muted, dash: [5, 4], width: 1.5, n: 90 });
    curve(ctx, pr, [0, BMAX], [0, 1], b => L((MU_K * b) / T), { color: C.gold, width: 2.5, n: 120 });
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(PX(B), PY(clamp(ms, 0, 1)), 3, 0, TAU); ctx.fill();
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(PX(B), PY(tx), 4.5, 0, TAU); ctx.fill(); ctx.stroke();
    const lx = pr.x + pr.w + 14, ly = pr.y + 12;
    text(ctx, "Langevin L(x)", lx, ly, { color: C.gold, size: 10 });
    text(ctx, "Curie: ∝ B/T", lx, ly + 13, { color: C.muted, size: 10 });
    text(ctx, "● simulation", lx, ly + 26, { color: C.blue, size: 10 });

    const cu = x / 3;
    info.textContent = `x = μB/kT = ${x.toFixed(2)} · M/M_sat = ${tx.toFixed(2)} · Curie's law alone: ${cu <= 1 ? cu.toFixed(2) : "over 1, which is impossible"}`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
