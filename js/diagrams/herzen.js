// Herzen: capillary rise (Jurin's law) h = 2γ cosθ / (ρ g r) in three glass tubes. Heights are to scale; tube widths are not.
import { C, canvas, controls, button, loop, readout, text } from "./kit.js";

export const title = "Surface tension";
export const caption = "Herzen wrote his 1902 thesis on surface tension, the pull that draws a liquid up a narrow tube until the column's weight balances it: h = 2γ cosθ / (ρgr). Halve the radius and the column doubles. Mercury does not wet glass (contact angle about 140°), so it is pushed down instead. Tube widths are exaggerated; heights are to scale.";

const G = 9.81, RADII = [0.25, 0.5, 1]; // m/s², tube radii in mm
const LIQ = [
  { name: "Water", g: 0.0728, th: 0, rho: 1000, rgb: "79,168,255", a: 0.3 },
  { name: "Ethanol", g: 0.0223, th: 0, rho: 789, rgb: "177,140,255", a: 0.3 },
  { name: "Mercury", g: 0.485, th: 140, rho: 13534, rgb: "208,213,224", a: 0.6 },
];
const jurin = (L, r) => ((2 * L.g * Math.cos((L.th * Math.PI) / 180)) / (L.rho * G * (r / 1000))) * 1000; // mm; negative = depression
const signed = v => `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(1)} mm`;
const ZETA = [0.8, 0.55, 0.35], WN = 9; // ponytail: damping chosen for looks (narrow tubes damp more); a real column's dynamics depend on viscosity

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Three glass tubes of different widths dipped in a dish of liquid. Water and ethanol climb higher in narrower tubes; mercury is pushed below the dish level. A ruler marks height in millimetres." });
  const row = controls(root), info = readout(root);
  let li = 0;
  const hh = [0, 0, 0], vv = [0, 0, 0];
  const btns = LIQ.map((L, i) => button(row, L.name, () => { li = i; mark(); lp.redraw(); }));
  const mark = () => btns.forEach((b, i) => { b.setAttribute?.("aria-pressed", String(i === li)); if (b.style) { b.style.color = i === li ? C.gold : ""; b.style.borderColor = i === li ? C.gold : ""; } });
  mark();
  const lp = loop(row, (t, dt) => draw(t, dt));

  function draw(time, dt) {
    const { ctx, w, h: H } = cv;
    ctx.clearRect(0, 0, w, H);
    const L = LIQ[li], tgt = RADII.map(r => jurin(L, r));
    if (dt) {
      for (let i = 0; i < 3; i++) { vv[i] += (-WN * WN * (hh[i] - tgt[i]) - 2 * ZETA[i] * WN * vv[i]) * dt; hh[i] += vv[i] * dt; }
    } else for (let i = 0; i < 3; i++) { hh[i] = tgt[i]; vv[i] = 0; }

    // Vertical scale: 1 mm = s px, true for all heights. Room for 62 mm above the dish surface and 36 mm of dish below it.
    const s = (H - 56) / 98, ys = 46 + 62 * s, yb = ys + 36 * s, yTop = 38, yBot = ys + 30 * s;
    const sc = w / 320, wd = [6, 12, 24].map(v => v * sc);   // ponytail: drawn tube widths in the ratio 1:2:4 like the radii, but about 5x wider than true scale
    const cxs = [0.17, 0.35, 0.53].map(v => v * w), bx0 = Math.round(w * 0.04), bx1 = Math.round(w * 0.64);

    // Dish with liquid.
    ctx.fillStyle = `rgba(${L.rgb},${L.a})`; ctx.fillRect(bx0, ys, bx1 - bx0, yb - ys);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
    ctx.moveTo(bx0, ys - 8); ctx.lineTo(bx0, yb); ctx.lineTo(bx1, yb); ctx.lineTo(bx1, ys - 8); ctx.stroke();
    ctx.strokeStyle = `rgba(${L.rgb},0.9)`; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = bx0; x <= bx1; x += 6) { const y = ys + Math.sin(x * 0.14 + time * 2) * 0.8; x === bx0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();

    // Ruler in mm (tick every 10, label every 20).
    const rx = bx0 + 8;
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.8; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(rx, ys - 60 * s); ctx.lineTo(rx, ys + 30 * s);
    for (let m = -30; m <= 60; m += 10) { ctx.moveTo(rx, ys - m * s); ctx.lineTo(rx + (m % 20 === 0 ? 6 : 3), ys - m * s); }
    ctx.stroke(); ctx.globalAlpha = 1;
    for (let m = -20; m <= 60; m += 20) text(ctx, m < 0 ? `−${-m}` : m, rx + 9, ys - m * s, { color: C.muted, size: 10, base: "middle" });
    text(ctx, "mm", rx + 9, ys + 30 * s, { color: C.muted, size: 10, base: "middle" });

    // Surface level across the tubes.
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cxs[0] - 18 * sc, ys); ctx.lineTo(cxs[2] + 26 * sc, ys); ctx.stroke(); ctx.setLineDash([]);

    // Tubes.
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cxs[0] - 22 * sc, yTop - 4); ctx.lineTo(cxs[2] + 30 * sc, yTop - 4); ctx.stroke(); // holder
    const cosT = Math.cos((L.th * Math.PI) / 180), sinT = Math.sin((L.th * Math.PI) / 180);
    const shape = Math.abs(cosT) < 1e-3 ? 0 : (1 - sinT) / cosT; // meniscus depth / tube radius: +1 hemispherical cup (θ = 0), negative = dome
    for (let i = 0; i < 3; i++) {
      const cx = cxs[i], xl = cx - wd[i] / 2, xr = cx + wd[i] / 2, yc = ys - hh[i] * s, sag = (wd[i] / 2) * shape;
      if (yc > ys) { ctx.fillStyle = C.bg; ctx.fillRect(xl + 1, ys - 1, wd[i] - 2, yc - ys + 1); } // depressed liquid leaves air above it inside the tube
      ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(xl, yTop, wd[i], yc - yTop - sag > 0 ? yc - yTop - sag : 0);
      ctx.fillStyle = `rgba(${L.rgb},${Math.min(0.9, L.a + 0.3)})`;
      ctx.beginPath(); ctx.moveTo(xl, yc - sag); ctx.quadraticCurveTo(cx, yc + sag, xr, yc - sag); ctx.lineTo(xr, yBot); ctx.lineTo(xl, yBot); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(${L.rgb},1)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xl, yc - sag); ctx.quadraticCurveTo(cx, yc + sag, xr, yc - sag); ctx.stroke();
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xl, yTop); ctx.lineTo(xl, yBot); ctx.moveTo(xr, yTop); ctx.lineTo(xr, yBot); ctx.stroke();
      // Height marker (gold) beside the tube, from the dish level to the meniscus.
      if (Math.abs(hh[i]) * s > 1) {
        const mx = xr + 6;
        ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(mx, ys); ctx.lineTo(mx, yc); ctx.moveTo(mx - 3, yc); ctx.lineTo(mx + 3, yc); ctx.moveTo(mx - 3, ys); ctx.lineTo(mx + 3, ys); ctx.stroke();
      }
      text(ctx, `r ${RADII[i]} mm`, cx, 14, { color: C.muted, size: 10, align: "center" });
      text(ctx, signed(hh[i]), cx, 27, { color: C.gold, size: 11, align: "center", weight: 600 });
    }

    // Liquid facts.
    const x0 = Math.round(w * 0.68), fs = w < 340 ? 10 : 11;
    text(ctx, L.name, x0, 52, { color: C.gold, size: 14, weight: 700 });
    text(ctx, `γ = ${L.g} N/m`, x0, 72, { size: fs });
    text(ctx, `θ = ${L.th}°`, x0, 88, { size: fs });
    text(ctx, `ρ = ${L.rho.toLocaleString("en-US")} kg/m³`, x0, 104, { size: fs });
    text(ctx, "h = 2γcosθ/(ρgr)", x0, 130, { color: C.muted, size: fs });
    text(ctx, "tube widths", x0, H - 24, { color: C.muted, size: 10 });
    text(ctx, "exaggerated", x0, H - 12, { color: C.muted, size: 10 });

    info.textContent = `${L.name}: ` + tgt.map((v, i) => `${signed(v)} (r = ${RADII[i]} mm)`).join(" · ") + (L.th > 90 ? " — it does not wet glass, so it sinks." : "");
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
