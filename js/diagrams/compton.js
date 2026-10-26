// Compton: an X-ray photon scatters off a resting electron. λ′ = λ₀ + λC(1 − cos θ); the electron recoils on the other side.
import { C, canvas, controls, slider, loop, readout, text, clamp } from "./kit.js";

export const title = "Compton scattering";
export const caption = "An X-ray photon strikes a resting electron and bounces off with less energy, so its wavelength grows by 2.426 pm × (1 − cos θ). Only a particle carrying momentum explains the shift. Slide the angle: the more the photon is deflected, the harder the electron recoils on the other side. The ruler is to scale; the waves above are exaggerated.";

const L0 = 71.0, LC = 2.426;                          // pm: molybdenum Kα wavelength; electron Compton wavelength h/mₑc
const KEMAX = 1239840 * (1 / L0 - 1 / (L0 + 2 * LC)); // eV: electron kinetic energy at θ = 180° (E = 1239840 eV·pm / λ)
const T1 = 1.4, PERIOD = 4.2;                             // s: photon arrives at the electron; whole loop
const TAU = 2 * Math.PI;
const easeOut = u => 1 - (1 - u) ** 2;

// Sine wave along a ray from (x, y) at angle a, between distances d0 and d1, tapering to nothing at both ends.
function train(ctx, x, y, a, d0, d1, wl, amp) {
  if (d1 - d0 < 1) return;
  const n = Math.ceil((d1 - d0) / Math.min(2.5, wl / 5)), ca = Math.cos(a), sa = Math.sin(a), taper = Math.min(12, (d1 - d0) / 2);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const d = d0 + ((d1 - d0) * i) / n, o = amp * Math.min(1, (d - d0) / taper, (d1 - d) / taper) * Math.sin((TAU * (d - d0)) / wl);
    const px = x + ca * d - sa * o, py = y + sa * d + ca * o;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
}

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "An X-ray wave hits an electron at rest. A scattered X-ray of longer wavelength leaves at the chosen angle and the electron recoils on the opposite side. A ruler below marks both wavelengths to scale." });
  const row = controls(root), info = readout(root);
  let th = 75, tc = T1 + 0.45;
  slider(row, { label: "Scattering angle θ", min: 0, max: 180, step: 1, value: th, fmt: v => `${v}°` }, v => { th = v; tc = T1 + 0.35; lp.redraw(); }); // restart the loop just after the collision so the new angle shows at once
  const lp = loop(row, (_, dt) => { tc = (tc + dt) % PERIOD; draw(); });

  function draw() {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13), sc = w / 600;
    const thr = (th * Math.PI) / 180, lam = L0 + LC * (1 - Math.cos(thr)), dl = lam - L0;
    const phi = Math.atan2(1, (1 + LC / L0) * Math.tan(thr / 2));            // cot φ = (1 + λC/λ₀) tan(θ/2)
    const ke = 1239840 * (1 / L0 - 1 / lam);                                  // eV
    const sTop = h * 0.12, sBot = h * 0.68, cx = w * 0.36, cy = sTop + (sBot - sTop) * 0.5;
    // ponytail: visual wavelengths are exaggerated, and the shift is magnified 8× so λ′ > λ₀ is visible; the ruler below is true to scale.
    const A = Math.max(3.5, 7 * sc), wl0 = Math.max(9, 17 * sc), wl1 = wl0 * (1 + 8 * (lam / L0 - 1)), plen = 0.15 * w, speed = cx / T1;

    text(ctx, `X-ray λ₀ = ${L0.toFixed(1)} pm`, w * 0.03, Math.max(fs + 3, h * 0.08), { color: C.violet, size: fs });
    text(ctx, `scattered λ′ = ${lam.toFixed(1)} pm`, w * 0.97, Math.max(fs + 3, h * 0.08), { color: C.gold, size: fs, align: "right" });

    ctx.save(); ctx.beginPath(); ctx.rect(0, sTop, w, sBot - sTop); ctx.clip();
    // guides and angle arcs
    const rT = 0.085 * w, rP = 0.07 * w, edx = Math.cos(phi), edy = Math.sin(phi);
    ctx.lineWidth = 1; ctx.setLineDash([4, 5]); ctx.globalAlpha = 0.35;
    for (const [col, a] of [[C.violet, 0], [C.gold, -thr], [C.blue, phi]]) { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w); ctx.stroke(); }
    ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.lineWidth = 1.5;
    if (th > 0) {
      ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy, rT, -thr, 0); ctx.stroke();
      ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.arc(cx, cy, rP, 0, phi); ctx.stroke();
    }
    if (th > 10) {
      text(ctx, "θ", cx + Math.cos(-thr / 2) * (rT + 9), cy + Math.sin(-thr / 2) * (rT + 9) + 4, { color: C.gold, size: fs + 1, align: "center", weight: 600 });
      text(ctx, "φ", cx + Math.cos(Math.max(phi / 2, 0.4)) * (rP + 9), cy + Math.sin(Math.max(phi / 2, 0.4)) * (rP + 9) + 4, { color: C.blue, size: fs + 1, align: "center", weight: 600 });
    }

    // incoming photon, then collision flash
    ctx.lineWidth = 2;
    if (tc < T1) { const head = cx * (tc / T1); ctx.strokeStyle = C.violet; train(ctx, 0, cy, 0, Math.max(0, head - plen), head, wl0, A); }
    else if (tc < T1 + 0.4) {
      const f = (tc - T1) / 0.4, r = 6 + 30 * sc * f, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255,255,255,${(1 - f).toFixed(3)})`); g.addColorStop(1, "rgba(255,214,120,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    }
    // scattered photon
    if (tc >= T1) { const d1 = speed * (tc - T1); ctx.strokeStyle = C.gold; train(ctx, cx, cy, -thr, Math.max(0, d1 - plen), d1, wl1, A); }

    // electron: at rest, then recoiling at angle φ. ponytail: distance travelled scales with √KE (a speed), stopping short of the wall.
    const room = Math.min(edx > 1e-3 ? (w - 10 - cx) / edx : Infinity, edy > 1e-3 ? (sBot - 10 - cy) / edy : Infinity);
    const dmax = Math.min(room * 0.9, 240 * sc * Math.sqrt(ke / KEMAX)), dist = tc >= T1 ? dmax * easeOut(clamp((tc - T1) / 1.6, 0, 1)) : 0;
    const ex = cx + edx * dist, ey = cy + edy * dist;
    if (dist > 0.5) { ctx.strokeStyle = C.blue; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(ex, ey, Math.max(4, 6 * sc), 0, TAU); ctx.fill();
    if (tc < T1) text(ctx, "electron at rest", cx - 10, cy + fs + 6, { color: C.blue, size: fs, align: "right" });
    else if (dist > 0.5) text(ctx, "e⁻", ex + 9, ey + 4, { color: C.blue, size: fs, weight: 700 });
    ctx.restore();

    // wavelength ruler, true to scale: 70–77 pm
    const x0 = w * 0.08, x1 = w * 0.92, ya = h * 0.9, xp = pm => x0 + ((pm - 70) / 7) * (x1 - x0);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ya); ctx.lineTo(x1, ya);
    for (let pm = 70; pm <= 77; pm++) { ctx.moveTo(xp(pm), ya); ctx.lineTo(xp(pm), ya + 4); }
    ctx.stroke();
    for (let pm = 70; pm <= 77; pm++) text(ctx, pm === 77 ? "77 pm" : String(pm), xp(pm), ya + fs + 5, { color: C.muted, size: fs - 1 < 10 ? 10 : fs - 1, align: "center" });
    ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.6; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xp(L0), ya); ctx.lineTo(xp(lam), ya); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    for (const [pm, col] of [[L0, C.violet], [lam, C.gold]]) { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(xp(pm), ya + 1); ctx.lineTo(xp(pm), ya - h * 0.08); ctx.stroke(); }
    text(ctx, `λ₀ ${L0.toFixed(1)}`, xp(L0) - 5, ya - h * 0.08 + 1, { color: C.violet, size: fs, align: "right" });
    text(ctx, `λ′ ${lam.toFixed(1)}`, xp(lam) + 5, ya - h * 0.08 + 1, { color: C.gold, size: fs });

    info.textContent = th < 1
      ? `θ = 0°: the photon passes straight on, λ′ = λ₀ = ${L0.toFixed(1)} pm, and the electron stays put.`
      : `θ = ${th}°: λ′ = ${lam.toFixed(2)} pm, Δλ = ${dl.toFixed(2)} pm, electron recoils at φ = ${((phi * 180) / Math.PI).toFixed(0)}° with ${(ke / 1000).toFixed(2)} keV.`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
