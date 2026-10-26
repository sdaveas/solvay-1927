// Debye: polar molecules in an electric field. Each dipole tumbles in 3D by rotational diffusion plus the field's torque, which settles into the Boltzmann weight exp(x cos θ); its mean is the Langevin function L(x).
import { C, canvas, controls, slider, loop, readout, axes, curve, text, clamp } from "./kit.js";

export const title = "Polar molecules";
export const caption = "A water molecule is a tiny electric arrow: negative at one end, positive at the other. Heat tumbles the arrows at random while the field nudges them into line. Debye (1912) described the average alignment, ⟨cos θ⟩, as the Langevin function of pE/kT: more field or less heat, more order. These fields are far stronger than real water could stand, to reach saturation.";

const TAU = 2 * Math.PI, N = 56, COLS = 14, ROWS = 4, XMAX = 9, KB = 1.380649e-23, P_WATER = 1.85 * 3.33564e-30; // dipoles, grid, plot range, J/K, 1.85 debye in C·m
const L = x => (x < 0.05 ? x / 3 - x ** 3 / 45 : 1 / Math.tanh(x) - 1 / x);   // Langevin function coth x − 1/x (series near 0)
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(TAU * Math.random());

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "Rows of water-like dipole arrows between a positive plate on the left and a negative plate on the right. Below, a graph of the average alignment against pE over kT, rising and levelling off, with a marker for the current setting." });
  const row = controls(root), info = readout(root);
  let E = 0.8, T = 300, ms = 0;                                    // field in V/nm, temperature in K, smoothed measured alignment
  const UX = new Float32Array(N), UY = new Float32Array(N), UZ = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const z = 2 * Math.random() - 1, f = Math.random() * TAU, s = Math.sqrt(1 - z * z);
    UX[i] = s * Math.cos(f); UY[i] = s * Math.sin(f); UZ[i] = z;
  }
  const HD = new Float32Array(2 * N), TL = new Float32Array(2 * N);   // arrow head and tail positions
  const xOf = () => (P_WATER * E * 1e9) / (KB * T);                // x = pE/kT
  const mean = () => { let s = 0; for (let i = 0; i < N; i++) s += UX[i]; return s / N; };

  // Rotational diffusion on the sphere with drift Dr·x·(e − (e·u)u), e = the field direction (+x). Stationary distribution ∝ exp(x cos θ).
  // ponytail: the tumbling rate is a visual choice (slowed down, ∝ T), not water's real rotational diffusion.
  function step(dt) {
    const Dr = (3 * T) / 300, a = Dr * xOf(), m = Math.ceil(dt * 60), h = dt / m, s = Math.sqrt(2 * Dr * h);
    for (let k = 0; k < m; k++) for (let i = 0; i < N; i++) {
      const x = UX[i], y = UY[i], z = UZ[i];
      let gx = gauss(), gy = gauss(), gz = gauss();
      const d = gx * x + gy * y + gz * z;
      gx -= d * x; gy -= d * y; gz -= d * z;                       // noise tangent to the sphere
      const nx = x + a * h * (1 - x * x) + s * gx, ny = y - a * h * x * y + s * gy, nz = z - a * h * x * z + s * gz, nr = Math.hypot(nx, ny, nz);
      UX[i] = nx / nr; UY[i] = ny / nr; UZ[i] = nz / nr;
    }
  }
  const settle = () => { for (let k = 0; k < 120; k++) step(1 / 30); ms = mean(); };
  settle();

  slider(row, { label: "Field", min: 0, max: 2, step: 0.05, value: E, fmt: v => `${v.toFixed(2)} V/nm` }, v => { E = v; if (!lp.playing) settle(); lp.redraw(); });
  slider(row, { label: "Temperature", min: 100, max: 500, step: 10, value: T, fmt: v => `${v} K` }, v => { T = v; if (!lp.playing) settle(); lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t, dt));

  function draw(t, dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    if (dt) { step(dt); ms += (mean() - ms) * (1 - Math.exp(-dt / 0.8)); }
    const fs = clamp(w / 52, 10, 13), x = xOf(), pad = 8, plate = 9, cell = (w - 2 * pad - 2 * plate) / COLS;
    const B = { x: pad, y: 24, w: w - 2 * pad, h: cell * ROWS }, fa = 0.05 + 0.3 * Math.sqrt(E / 2);

    // ── the dipoles between two charged plates ──
    text(ctx, "water-like molecules between charged plates", pad, 15, { color: C.muted, size: fs });
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(B.x, B.y, B.w, B.h);
    ctx.fillStyle = "rgba(255,90,78,0.4)"; ctx.fillRect(B.x, B.y, plate, B.h);
    ctx.fillStyle = "rgba(79,168,255,0.4)"; ctx.fillRect(B.x + B.w - plate, B.y, plate, B.h);
    for (let j = 0; j < ROWS; j++) {
      text(ctx, "+", B.x + plate / 2, B.y + (j + 0.5) * cell, { align: "center", base: "middle", size: 11, weight: 700 });
      text(ctx, "−", B.x + B.w - plate / 2, B.y + (j + 0.5) * cell, { align: "center", base: "middle", size: 11, weight: 700 });
    }
    if (E > 0) {                                                   // field lines with chevrons drifting from + to −
      ctx.strokeStyle = `rgba(236,228,214,${fa})`; ctx.lineWidth = 1; ctx.beginPath();
      const gap = cell * 2.2, x0 = B.x + plate, x1 = B.x + B.w - plate;
      for (let j = 1; j < ROWS; j++) {
        const y = B.y + j * cell;
        ctx.moveTo(x0, y); ctx.lineTo(x1, y);
        for (let cx = x0 + ((t * 40) % gap); cx < x1 - 4; cx += gap) { ctx.moveTo(cx - 4, y - 3); ctx.lineTo(cx, y); ctx.lineTo(cx - 4, y + 3); }
      }
      ctx.stroke();
    }
    const rd = Math.max(1.8, cell * 0.1);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.8; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.beginPath();
    for (let i = 0; i < N; i++) {                                  // ponytail: the arrow is the 3D dipole projected onto the page, so one pointing at you looks short
      const cx = B.x + plate + ((i % COLS) + 0.5) * cell, cy = B.y + (Math.floor(i / COLS) + 0.5) * cell;
      const dx = UX[i], dy = -UY[i], lp2 = Math.hypot(dx, dy) || 1e-6, ux = dx / lp2, uy = dy / lp2, len = cell * 0.4 * Math.max(0.3, lp2), a = Math.min(5, len * 0.6);
      const hx = cx + ux * len, hy = cy + uy * len;
      ctx.moveTo(cx - ux * len, cy - uy * len); ctx.lineTo(hx, hy);
      ctx.moveTo(hx - ux * a - uy * a * 0.6, hy - uy * a + ux * a * 0.6); ctx.lineTo(hx, hy); ctx.lineTo(hx - ux * a + uy * a * 0.6, hy - uy * a - ux * a * 0.6);
      HD[2 * i] = hx; HD[2 * i + 1] = hy; TL[2 * i] = cx - ux * len; TL[2 * i + 1] = cy - uy * len;
    }
    ctx.stroke(); ctx.lineCap = "butt";
    for (const [pts, col] of [[HD, C.red], [TL, C.blue]]) {
      ctx.fillStyle = col; ctx.beginPath();
      for (let i = 0; i < pts.length; i += 2) { ctx.moveTo(pts[i] + rd, pts[i + 1]); ctx.arc(pts[i], pts[i + 1], rd, 0, TAU); }
      ctx.fill();
    }

    // ── alignment against x = pE/kT ──
    const pr = { x: 36, y: B.y + B.h + 26, w: Math.round(w * 0.56), h: h - (B.y + B.h + 26) - 38 };
    const PX = v => pr.x + (v / XMAX) * pr.w, PY = v => pr.y + pr.h - v * pr.h;
    axes(ctx, pr, { xLabel: "x = pE / kT", yLabel: "⟨cos θ⟩" });
    for (const v of [0, 3, 6, 9]) text(ctx, v, PX(v), pr.y + pr.h + 13, { align: "center", color: C.muted, size: 10 });
    for (const v of [0, 1]) text(ctx, v, pr.x - 5, PY(v) + 3.5, { align: "right", color: C.muted, size: 10 });
    curve(ctx, pr, [0, XMAX], [0, 1], v => v / 3, { color: C.muted, dash: [5, 4], width: 1.5, n: 90 });
    curve(ctx, pr, [0, XMAX], [0, 1], L, { color: C.gold, width: 2.5, n: 90 });
    const xc = Math.min(x, XMAX);
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(PX(xc), PY(clamp(ms, 0, 1)), 3, 0, TAU); ctx.fill();
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(PX(xc), PY(L(xc)), 4.5, 0, TAU); ctx.fill(); ctx.stroke();
    const lx = pr.x + pr.w - 4, ly = pr.y + pr.h * 0.5;
    text(ctx, "Langevin L(x)", lx, ly, { align: "right", color: C.gold, size: 10 });
    text(ctx, "x/3, weak field", lx, ly + 12, { align: "right", color: C.muted, size: 10 });
    text(ctx, "● simulation", lx, ly + 24, { align: "right", color: C.blue, size: 10 });

    // ── net alignment of the sample ──
    const cx0 = pr.x + pr.w + 14, cw = w - pad - cx0, mid = cx0 + cw / 2, ay = pr.y + pr.h * 0.55, al = (cw / 2 - 4) * clamp(ms, -1, 1);
    text(ctx, "net alignment", mid, pr.y + 8, { align: "center", color: C.muted, size: 10 });
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx0, ay + 12); ctx.lineTo(cx0 + cw, ay + 12); ctx.moveTo(mid, ay + 8); ctx.lineTo(mid, ay + 16); ctx.stroke();
    if (Math.abs(al) > 1) {
      const sg = Math.sign(al);
      ctx.strokeStyle = ctx.fillStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mid, ay); ctx.lineTo(mid + al - sg * 6, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mid + al, ay); ctx.lineTo(mid + al - sg * 9, ay - 6); ctx.lineTo(mid + al - sg * 9, ay + 6); ctx.fill();
    }
    text(ctx, ms.toFixed(2), mid, ay + 28, { align: "center", color: C.gold, size: fs + 1, weight: 600 });

    info.textContent = `x = pE/kT = ${x.toFixed(2)} · alignment ⟨cos θ⟩ = L(x) = ${L(x).toFixed(2)} · water: 1.85 debye`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
