// Verschaffelt: CO2 in a sealed tube. Liquid and vapour densities approach the critical density as T -> Tc, and the meniscus vanishes.
import { C, canvas, controls, slider, button, loop, readout, axes, text, map, clamp } from "./kit.js";

export const title = "The critical point";
export const caption = "Verschaffelt studied liquefied carbon dioxide near its critical point, where real fluids depart from van der Waals's simple theory. Warm the tube: the liquid thins, the vapour thickens, and the meniscus flattens until it vanishes at 31 °C. Just either side, the fluid turns milky. The densities follow a power law with exponent 0.325, a model fit, not Verschaffelt's data.";

const TC = 31.0, TCK = 304.15, RHOC = 0.468, BETA = 0.325, NP = 240; // °C, K, g/cm³, exponent, drawn molecules
// ponytail: ρ_l,v = ρ_mid ± ρc·B·t^β with a straight-line mid-point ("rectilinear diameter"). The symmetric law ρc(1 ± B·t^β) alone cannot give both
// 0.82 and 0.16 g/cm³ at 15 °C (it gives 0.82 and 0.12), so the mid-point slope is fitted to make both match.
const T15 = (TC - 15) / TCK, B_AMP = 0.33 / (RHOC * T15 ** BETA), A_MID = (0.49 - RHOC) / (TC - 15);
function dens(T) { // T in °C; x = liquid fraction of the tube (critical filling: x·ρl + (1-x)·ρv = ρc)
  if (T >= TC) return { l: RHOC, v: RHOC, x: 0, two: false, t: 0 };
  const t = (TC - T) / TCK, half = RHOC * B_AMP * t ** BETA, mid = RHOC + A_MID * (TC - T), l = mid + half, v = mid - half;
  return { l, v, x: (RHOC - v) / (l - v), two: true, t };
}
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const setSlider = (inp, v, fmt) => { inp.value = v; const o = inp.nextElementSibling; if (o) o.textContent = fmt(v); };

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Left: a sealed glass tube of carbon dioxide with liquid below and vapour above, the dividing meniscus flattening and disappearing as the temperature rises to 31 degrees Celsius, with a milky look just around that temperature. Right: the coexistence curve of density against temperature with a marker." });
  const row = controls(root), info = readout(root);
  let T = 22;
  const px = new Float32Array(NP), py = new Float32Array(NP), vx = new Float32Array(NP), vy = new Float32Array(NP), fac = new Float32Array(NP);
  const aim = i => { const a = Math.random() * 2 * Math.PI; vx[i] = Math.cos(a); vy[i] = Math.sin(a); };
  for (let i = 0; i < NP; i++) { px[i] = Math.random(); py[i] = Math.random(); fac[i] = 0.6 + 0.8 * Math.random(); aim(i); }
  const fmtT = v => `${v.toFixed(1)} °C`;
  const sl = slider(row, { label: "Temperature", min: 15, max: 35, step: 0.1, value: T, fmt: fmtT }, v => { T = v; lp.redraw(); });
  button(row, "Go to Tc", () => { T = TC; setSlider(sl, TC, fmtT); lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t, dt));

  function draw(time, dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const d = dens(T), op = clamp(1 - Math.abs(T - TC) / 0.5, 0, 1);

    // ── The tube ──
    const tw = clamp(Math.round(w * 0.16), 44, 120), tx = Math.round(w * 0.08), ty = 28, th = h - ty - 14, cr = tw / 2;
    const y0 = ty + cr, hs = th - 2 * cr;                 // straight part of the tube: molecule coordinates run 0..1 over it
    const ym = y0 + (d.two ? 1 - d.x : 0) * hs;           // meniscus height (centre)
    const sag = d.two ? tw * 0.1 * clamp((d.t / T15) ** 1.26, 0, 1) : 0; // surface tension fades as (1 - T/Tc)^1.26 (Widom)
    const alpha = rho => 0.06 + 0.5 * rho;
    const tube = (x, y, wd, ht) => { const r = wd / 2; ctx.beginPath(); ctx.moveTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, 2 * Math.PI); ctx.lineTo(x + wd, y + ht - r); ctx.arc(x + r, y + ht - r, r, 0, Math.PI); ctx.closePath(); };
    ctx.save(); tube(tx, ty, tw, th); ctx.clip();
    ctx.fillStyle = `rgba(79,168,255,${alpha(d.v)})`; ctx.fillRect(tx, ty, tw, th);
    if (d.two) {
      ctx.fillStyle = `rgba(79,168,255,${alpha(d.l)})`;
      ctx.beginPath(); ctx.moveTo(tx - 2, ym - sag); ctx.quadraticCurveTo(tx + tw / 2, ym + sag, tx + tw + 2, ym - sag);
      ctx.lineTo(tx + tw + 2, ty + th + 2); ctx.lineTo(tx - 2, ty + th + 2); ctx.closePath(); ctx.fill();
    }
    // Critical opalescence: a milky, flickering haze within 0.5 K of Tc.
    if (op > 0) {
      const fl = 0.7 + 0.3 * Math.sin(time * 11 + 2 * Math.sin(time * 4.3));
      ctx.fillStyle = `rgba(238,234,224,${0.42 * op * fl})`; ctx.fillRect(tx, ty, tw, th);
      const fr = Math.floor(time * 9);
      for (let k = 0; k < 26; k++) {
        const bx = tx + hash(k + fr * 7.3) * tw, by = y0 + hash(k * 3.1 + fr * 1.7 + 50) * hs, br = tw * (0.1 + 0.16 * hash(k + 99));
        ctx.fillStyle = `rgba(250,246,236,${0.16 * op})`; ctx.beginPath(); ctx.arc(bx, by, br, 0, 2 * Math.PI); ctx.fill();
      }
    }
    // Molecules: the first Nl belong to the liquid, the rest to the vapour. Their number follows density × volume.
    const Nl = d.two ? Math.round((NP * d.l * d.x) / RHOC) : NP;
    const vm = d.two ? 1 - d.x : 0, sagN = sag / hs, tf = Math.sqrt((T + 273.15) / 288.15), mr = tw * 0.035 + 0.3;
    ctx.fillStyle = C.gold; ctx.globalAlpha = 0.9; ctx.beginPath();
    for (let i = 0; i < NP; i++) {
      const liq = i < Nl, rho = d.two ? (liq ? d.l : d.v) : RHOC;
      const lo = d.two ? (liq ? vm : 0) : 0, hi = d.two ? (liq ? 1 : Math.max(0, vm - sagN)) : 1;
      if (dt) {
        if (Math.random() < dt * 1.5) aim(i);
        const sp = fac[i] * tf * tw * (2.4 - 2.0 * clamp((rho - 0.1) / 0.75, 0, 1)); // gas molecules dart, liquid ones jostle
        px[i] += (vx[i] * sp * dt) / tw; py[i] += (vy[i] * sp * dt) / hs;
        if (px[i] < 0 || px[i] > 1) { px[i] = clamp(px[i], 0, 1); vx[i] = -vx[i]; }
        if (py[i] < lo) { py[i] += (lo - py[i]) * Math.min(1, 8 * dt); vy[i] = Math.abs(vy[i]); }
        else if (py[i] > hi) { py[i] += (hi - py[i]) * Math.min(1, 8 * dt); vy[i] = -Math.abs(vy[i]); }
      } else py[i] = clamp(py[i], lo, hi);
      const x = tx + 3 + px[i] * (tw - 6), y = y0 + py[i] * hs;
      ctx.moveTo(x + mr, y); ctx.arc(x, y, mr, 0, 2 * Math.PI);
    }
    ctx.fill(); ctx.globalAlpha = 1;
    if (sag > 0.15) { // the meniscus
      ctx.strokeStyle = C.ink; ctx.globalAlpha = clamp(sag / (tw * 0.04), 0, 1) * 0.9; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(tx - 2, ym - sag); ctx.quadraticCurveTo(tx + tw / 2, ym + sag, tx + tw + 2, ym - sag); ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 2; tube(tx - 2, ty - 2, tw + 4, th + 4); ctx.stroke(); // glass
    ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx + 5, y0 + 6); ctx.lineTo(tx + 5, y0 + hs - 6); ctx.stroke();

    text(ctx, "carbon dioxide", tx - 2, 17, { color: C.muted, size: 11 });
    const lx = tx + tw + 10;
    if (d.two) {
      text(ctx, "vapour", lx, (y0 + ym) / 2 - 3, { size: 11 });
      text(ctx, `${d.v.toFixed(2)} g/cm³`, lx, (y0 + ym) / 2 + 10, { color: C.muted, size: 10 });
      text(ctx, "liquid", lx, (ym + y0 + hs) / 2 - 3, { size: 11 });
      text(ctx, `${d.l.toFixed(2)} g/cm³`, lx, (ym + y0 + hs) / 2 + 10, { color: C.muted, size: 10 });
    } else {
      text(ctx, "one fluid", lx, y0 + hs * 0.25, { size: 11 });
      text(ctx, `${RHOC.toFixed(2)} g/cm³`, lx, y0 + hs * 0.25 + 13, { color: C.muted, size: 10 });
    }
    if (op > 0.05) {
      text(ctx, "critical", lx, y0 + hs * 0.5 - 2, { color: C.gold, size: 10 });
      text(ctx, "opalescence", lx, y0 + hs * 0.5 + 10, { color: C.gold, size: 10 });
    }

    // ── Coexistence curve ──
    const px0 = Math.round(w * 0.6), r = { x: px0, y: 30, w: w - px0 - 14, h: h - 30 - 44 };
    const X = v => map(v, 0, 1, r.x, r.x + r.w), Y = v => map(v, 15, 35, r.y + r.h, r.y);
    text(ctx, "coexistence curve", r.x - 22, 17, { color: C.muted, size: 11 });
    axes(ctx, r, { xLabel: "density (g/cm³)" });
    for (const v of [20, 25, 30, 35]) text(ctx, `${v}°`, r.x - 5, Y(v), { color: C.muted, size: 10, align: "right", base: "middle" });
    for (const v of [0, 0.5, 1]) text(ctx, v, X(v), r.y + r.h + 14, { color: C.muted, size: 10, align: "center" });
    ctx.beginPath(); // the dome: vapour branch up to the critical point, liquid branch back down
    const U = 36;
    for (let k = 0; k <= U; k++) { const u = 1 - k / U, e = dens(TC - u * u * (TC - 15) - 1e-9); k ? ctx.lineTo(X(e.v), Y(TC - u * u * (TC - 15))) : ctx.moveTo(X(e.v), Y(15)); }
    for (let k = 0; k <= U; k++) { const u = k / U, e = dens(TC - u * u * (TC - 15) - 1e-9); ctx.lineTo(X(e.l), Y(TC - u * u * (TC - 15))); }
    ctx.closePath(); ctx.fillStyle = "rgba(227,194,127,0.09)"; ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(r.x, Y(TC)); ctx.lineTo(r.x + r.w, Y(TC)); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, "Tc 31 °C", r.x + 4, Y(TC) - 4, { color: C.muted, size: 10 });
    text(ctx, "one fluid", r.x + r.w - 4, Y(TC) - 4, { color: C.muted, size: 10, align: "right" });
    text(ctx, "two phases", X(0.49), Y(17.2), { color: C.muted, size: 10, align: "center" });
    ctx.fillStyle = C.gold;
    if (d.two) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(d.v), Y(T)); ctx.lineTo(X(d.l), Y(T)); ctx.stroke(); ctx.setLineDash([]);
      for (const v of [d.v, d.l]) { ctx.beginPath(); ctx.arc(X(v), Y(T), 4, 0, 2 * Math.PI); ctx.fill(); }
    } else { ctx.beginPath(); ctx.arc(X(RHOC), Y(T), 4, 0, 2 * Math.PI); ctx.fill(); }

    info.textContent = d.two
      ? `T = ${T.toFixed(1)} °C: liquid ${d.l.toFixed(3)} g/cm³, vapour ${d.v.toFixed(3)} g/cm³, difference ${(d.l - d.v).toFixed(3)}.` + (op > 0 ? " Within 0.5 K of Tc: critical opalescence." : "")
      : `T = ${T.toFixed(1)} °C, ${Math.abs(T - TC) < 0.05 ? "at" : "above"} Tc (31.0 °C): one fluid of ${RHOC} g/cm³, no meniscus.` + (op > 0 ? " Within 0.5 K of Tc: critical opalescence." : "");
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
