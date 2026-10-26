// Lorentz: the (normal) Zeeman effect. In a magnetic field B a spectral line splits into three, Δλ = λ²eB/(4π mₑ c) either side of the original.
// Lorentz's classical picture: an electron turning one way about B is pulled inward and speeds up, the other way slows down, and motion along B is unchanged.
import { C, canvas, controls, slider, loop, readout, text, wavelengthColor } from "./kit.js";

export const title = "Zeeman effect";
export const caption = "A magnetic field splits one spectral line into three. In Lorentz's classical picture, an electron circling the atom is pushed inward and speeds up when it turns one way, slows when it turns the other way, and is unaffected moving along the field. The shift is only about 19 pm per tesla; the zoom and the orbit speeds here are greatly exaggerated.";

const LAM0 = 643.8e-9, E = 1.602176634e-19, ME = 9.1093837015e-31, CC = 2.99792458e8;
const DL_T = ((LAM0 * LAM0 * E) / (4 * Math.PI * ME * CC)) * 1e9; // Δλ per tesla in nm, ≈ 0.0194
const WIN = 0.12;   // spectrum window, nm. ponytail: the strip is magnified ~5000× in wavelength (0.12 nm out of 644 nm) so the splitting can be seen
const SIG = 0.0035; // drawn line width (σ, nm). ponytail: wide enough that lines merge below ~0.2 T; real lamp lines are narrower
const W3 = [1, 2, 1]; // intensities of the −, π, + lines seen across the field (2 : 1 : 1 from the three classical oscillators)
const OM = 2.4, KICK = 0.4; // orbit speed (rad/s) and its drawn fractional change at 2 T. ponytail: the real change is ~0.003%
const TAU = 2 * Math.PI;

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "A zoomed spectrum of the cadmium red line that is one line without a magnetic field and splits into three as the field grows, with three small pictures of an electron orbit below: one speeding up, one unchanged, one slowing down." });
  const row = controls(root), info = readout(root);
  let B = 1, pL = 0, pC = 0, pR = 0;
  slider(row, { label: "Magnetic field B", min: 0, max: 2, step: 0.05, value: B, fmt: v => `${v.toFixed(2)} T` }, v => { B = v; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));

  const g = (x, m) => Math.exp(-((x - m) ** 2) / (2 * SIG * SIG));
  const arrowUp = (ctx, x, y0, y1, color, a) => {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.globalAlpha = a; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 + 5); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 4, y1 + 8); ctx.lineTo(x + 4, y1 + 8); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  };
  // An electron on a tilted circular orbit about the field axis (which points up). sgn +1 = counter-clockwise seen from above.
  function orbit(ctx, cx, cy, rx, ry, p, sgn) {
    const a = sgn * p, ex = cx + rx * Math.cos(a), ey = cy - ry * Math.sin(a), far = Math.sin(a) > 0;
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    for (let k = 1; k <= 12; k++) {
      const a0 = a - sgn * (k - 1) * 0.11, a1 = a - sgn * k * 0.11;
      ctx.globalAlpha = 0.6 * (1 - k / 13);
      ctx.beginPath(); ctx.moveTo(cx + rx * Math.cos(a0), cy - ry * Math.sin(a0)); ctx.lineTo(cx + rx * Math.cos(a1), cy - ry * Math.sin(a1)); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = "butt";
    const dot = () => { ctx.fillStyle = C.gold; ctx.globalAlpha = far ? 0.65 : 1; ctx.beginPath(); ctx.arc(ex, ey, far ? 3.8 : 5.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; };
    if (far) dot();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, TAU); ctx.fill();
    if (!far) dot();
    text(ctx, "e⁻", ex + (Math.cos(a) > 0 ? 9 : -9), ey - 7, { color: C.gold, size: 11, weight: 600, align: Math.cos(a) > 0 ? "left" : "right" });
  }

  function draw(dt) {
    const { ctx, w, h } = cv;
    const d = (B * DL_T);                          // Δλ, nm
    if (dt) { const k = KICK * (B / 2); pL += OM * (1 + k) * dt; pC += OM * dt; pR += OM * (1 - k) * dt; }
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);

    // The spectrum strip: the three lines, brightest in the middle.
    const sx0 = w * 0.06, sw = w * 0.88, sy0 = h * 0.15, sy1 = h * 0.32, xc = sx0 + sw / 2, pxNm = sw / WIN;
    const I = l => (W3[0] * g(l, LAM0 * 1e9 - d) + W3[1] * g(l, LAM0 * 1e9) + W3[2] * g(l, LAM0 * 1e9 + d)) / 4;
    const L0 = LAM0 * 1e9;
    ctx.fillStyle = "#150f0d"; ctx.fillRect(sx0, sy0, sw, sy1 - sy0);
    const step = 2;
    for (let x = 0; x < sw; x += step) {
      const l = L0 + ((x + step / 2 - sw / 2) / sw) * WIN, a = 1 - Math.exp(-3 * I(l));
      if (a < 0.01) continue;
      ctx.fillStyle = wavelengthColor(l, a); ctx.fillRect(sx0 + x, sy0, step, sy1 - sy0);
    }
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x <= sw; x += 3) {
      const l = L0 + ((x - sw / 2) / sw) * WIN, y = sy1 - (1 - Math.exp(-3 * I(l))) * (sy1 - sy0) * 0.92;
      x ? ctx.lineTo(sx0 + x, y) : ctx.moveTo(sx0 + x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(sx0 - 0.5, sy0 - 0.5, sw + 1, sy1 - sy0 + 1);
    text(ctx, "Cadmium 643.8 nm line, zoomed (0.12 nm wide)", sx0, h * 0.052, { color: C.muted, size: 11 });
    for (const off of [-0.04, 0, 0.04]) {
      const x = xc + off * pxNm;
      ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(x, sy0 - 4); ctx.lineTo(x, sy0); ctx.stroke();
      text(ctx, (L0 + off).toFixed(2), x, sy0 - 6, { color: C.muted, size: 10, align: "center" });
    }

    // Δλ marker between the central line and the upper one.
    if (d * pxNm > 28) {
      const y = sy1 - 5, xa = xc, xb = xc + d * pxNm;
      ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(xa + 3, y); ctx.lineTo(xb - 3, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xb - 1, y); ctx.lineTo(xb - 6, y - 3); ctx.lineTo(xb - 6, y + 3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(xa + 1, y); ctx.lineTo(xa + 6, y - 3); ctx.lineTo(xa + 6, y + 3); ctx.closePath(); ctx.fill();
      text(ctx, "Δλ", (xa + xb) / 2, y - 6, { color: C.ink, size: 11, align: "center", weight: 600 });
    }

    // Three motions of the electron, three lines. The fan of connectors closes up as the field goes to zero.
    const pcx = [w * 0.2, w * 0.5, w * 0.8], lx = [xc - d * pxNm, xc, xc + d * pxNm], pTop = h * 0.43;
    ctx.strokeStyle = wavelengthColor(643.8, 0.6); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) { ctx.moveTo(lx[i], sy1 + 1); ctx.lineTo(pcx[i], pTop); }
    ctx.stroke();

    const cy = h * 0.65, rx = w * 0.1, ry = rx * 0.32, ax = h * 0.17, ay0 = cy + ax, ay1 = cy - ax;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(pcx[i] - w * 0.15, pTop, w * 0.3, h * 0.42);
      arrowUp(ctx, pcx[i], ay0, ay1, C.ink, 0.25 + 0.5 * (B / 2));
      text(ctx, "B", pcx[i] + 8, ay1 + 10, { color: C.ink, size: 11, weight: 600 });
    }
    orbit(ctx, pcx[0], cy, rx, ry, pL, 1);
    orbit(ctx, pcx[2], cy, rx, ry, pR, -1);
    // Middle: motion along the field axis, unaffected.
    const ey = cy - Math.sin(pC) * h * 0.11;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    for (let k = 1; k <= 12; k++) {
      ctx.globalAlpha = 0.6 * (1 - k / 13);
      ctx.beginPath(); ctx.moveTo(pcx[1], cy - Math.sin(pC - (k - 1) * 0.11) * h * 0.11); ctx.lineTo(pcx[1], cy - Math.sin(pC - k * 0.11) * h * 0.11); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = "butt";
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(pcx[1], cy, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(pcx[1], ey, 5, 0, TAU); ctx.fill();
    text(ctx, "e⁻", pcx[1] + 10, ey + 4, { color: C.gold, size: 11, weight: 600 });

    const lab = [["faster orbit", "shorter λ"], ["along B, no change", "same λ"], ["slower orbit", "longer λ"]];
    for (let i = 0; i < 3; i++) {
      text(ctx, lab[i][0], pcx[i], h * 0.915, { color: C.ink, size: 10, align: "center" });
      text(ctx, lab[i][1], pcx[i], h * 0.98, { color: C.muted, size: 10, align: "center" });
    }

    info.textContent = d > 0 ? `B = ${B.toFixed(2)} T → Δλ = ${(d * 1000).toFixed(1)} pm either side of the central line (643.8 nm)` : "B = 0: one line, no splitting";
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
