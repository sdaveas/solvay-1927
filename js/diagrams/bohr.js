// Bohr: hydrogen. An electron on orbits n = 1–6 falls between them; each fall emits one photon, 1/λ = R(1/n₁² − 1/n₂²).
import { C, canvas, controls, button, toggle, loop, readout, text, map, clamp, wavelengthColor } from "./kit.js";

export const title = "Hydrogen spectrum";
export const caption = "Bohr let the electron sit only on certain orbits. Each fall from n₂ to n₁ releases one photon with 1/λ = R(1/n₁² − 1/n₂²). Falls that end on n = 2 give the visible Balmer lines at 656, 486, 434 and 410 nm; the rest are invisible ultraviolet or infrared. Orbit sizes and speeds are compressed, not to scale.";

const R = 1.09678e7, N = 6; // Rydberg constant (1/m); highest orbit shown
const SERIES = ["", "Lyman", "Balmer", "Paschen", "Brackett", "Pfund"];
const lam = (n1, n2) => 1e9 / (R * (1 / (n1 * n1) - 1 / (n2 * n2))); // nm
const colorName = nm => nm < 380 ? "ultraviolet" : nm < 450 ? "violet" : nm < 495 ? "blue" : nm < 570 ? "green" : nm < 590 ? "yellow" : nm < 620 ? "orange" : nm <= 750 ? "red" : "infrared";
const ease = u => u * u * (3 - 2 * u);
const OMEGA = 2 * Math.PI * 0.9; // rad/s on orbit n = 1

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A hydrogen atom with six electron orbits, an energy-level ladder, and a spectrum strip. The electron is excited to a higher orbit, then falls back in random jumps, each emitting a photon that lights up a line in the spectrum." });
  const row = controls(root), info = readout(root);
  const LINES = [];
  for (let n2 = 2; n2 <= N; n2++) for (let n1 = 1; n1 < n2; n1++) LINES.push({ n1, n2, nm: lam(n1, n2), count: 0, flash: 0 });
  const lineOf = (n1, n2) => LINES.find(l => l.n1 === n1 && l.n2 === n2);
  let n = 1, nf = 1, from = 1, u = 1, ang = 0, wait = 0, idle = 0.9, pulse = 0, auto = true, last = null, arrow = null, photons = [];

  button(row, "Excite", () => excite());
  toggle(row, "Auto-excite", true, on => { auto = on; });
  button(row, "Clear lines", () => { for (const l of LINES) l.count = l.flash = 0; last = arrow = null; photons = []; lp.redraw(); });

  const geo = () => {
    const { w, h } = cv;
    return { w, h, cx: w * 0.25, cy: h * 0.36, rmax: Math.min(w * 0.22, h * 0.32 - 2), sx: w * 0.06, sw: w * 0.88, sy: h * 0.76, sh: h * 0.09 };
  };
  // ponytail: true radii go as n² (n = 6 would be 36× n = 1). Compressed so n = 1 is not a dot: n² mapped onto 0.18–1, then raised to 0.85.
  const radius = (k, rmax) => rmax * (0.18 + 0.82 * Math.max(0, (k * k - 1) / 35) ** 0.85);
  // Spectrum strip: UV (log, left), visible 380–750 nm (linear), IR (log, right). ponytail: three different scales so all 15 lines fit.
  const specX = (nm, g) => {
    const uvW = g.sw * 0.14, visW = g.sw * 0.56, irW = g.sw * 0.3;
    if (nm < 380) return g.sx + uvW * clamp(Math.log(nm / 85) / Math.log(380 / 85), 0, 1);
    if (nm <= 750) return g.sx + uvW + (visW * (nm - 380)) / 370;
    return g.sx + uvW + visW + irW * clamp(Math.log(nm / 750) / Math.log(8000 / 750), 0, 1);
  };

  function jump(m) { from = nf; n = m; u = 0; wait = 0.55 + Math.random() * 0.7; idle = 0; }
  function excite() {
    if (n >= N) return;
    jump(n === 1 ? 3 + Math.floor(Math.random() * 4) : n + 1 + Math.floor(Math.random() * (N - n)));
    pulse = 1;
    if (!lp.playing) { u = 1; nf = n; lp.redraw(); }
  }
  function emit(n2, n1) {
    const g = geo(), r = radius(nf, g.rmax), l = lineOf(n1, n2);
    photons.push({ l, x0: (g.cx + r * Math.cos(ang)) / g.w, y0: (g.cy + r * Math.sin(ang)) / g.h, u: 0 });
    last = l; arrow = { l, age: 0 };
  }

  function step(dt) {
    if (!dt || !cv.w) return;
    ang += (OMEGA / nf) * dt; // ponytail: true period ∝ n³ (216× slower at n = 6); shown ∝ n so the outer orbits still visibly move
    if (u < 1) { u = Math.min(1, u + dt / 0.45); nf = from + (n - from) * ease(u); }
    else if (n > 1) {
      wait -= dt;
      if (wait <= 0) { const m = 1 + Math.floor(Math.random() * (n - 1)); emit(n, m); jump(m); }
    } else if (auto && (idle += dt) > 1.2) excite();
    pulse = Math.max(0, pulse - dt * 2);
    for (const p of photons) {
      p.u += dt / 0.6;
      if (p.u >= 1) { p.l.count++; p.l.flash = 1; }
    }
    photons = photons.filter(p => p.u < 1);
    if (arrow && (arrow.age += dt) > 1.2) arrow = null;
    for (const l of LINES) l.flash = Math.max(0, l.flash - dt * 1.5);
  }

  function draw(dt) {
    step(dt);
    const { ctx } = cv, g = geo(), { w, h, cx, cy, rmax, sx, sw, sy, sh } = g;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]);

    // The atom: nucleus, six orbits, the current orbit highlighted.
    ctx.lineWidth = 1;
    for (let k = 1; k <= N; k++) {
      ctx.globalAlpha = k === n ? 0.8 : 0.35; ctx.strokeStyle = k === n ? C.gold : C.muted;
      ctx.beginPath(); ctx.arc(cx, cy, radius(k, rmax), 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 2 * Math.PI); ctx.fill();
    const r = radius(nf, rmax), ex = cx + r * Math.cos(ang), ey = cy + r * Math.sin(ang);
    if (pulse > 0) { ctx.globalAlpha = pulse; ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex, ey, 5 + 16 * (1 - pulse), 0, 2 * Math.PI); ctx.stroke(); ctx.globalAlpha = 1; }
    const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 13);
    eg.addColorStop(0, C.gold); eg.addColorStop(0.3, C.gold); eg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.45; ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, 13, 0, 2 * Math.PI); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, 2 * Math.PI); ctx.fill();
    text(ctx, `n = ${n}`, 8, 16, { color: C.gold, size: 12, weight: 600 });

    // Energy ladder, E = −13.6 eV / n². ponytail: levels spaced evenly for readability, not to scale.
    const lx = w * 0.55, lw = w * 0.14, ytop = h * 0.12, ybot = h * 0.6, yN = k => map(k, 1, N, ybot, ytop);
    text(ctx, "energy levels", lx, ytop - 10, { color: C.muted, size: 10 });
    for (let k = 1; k <= N; k++) {
      const on = k === n;
      ctx.strokeStyle = on ? C.gold : C.muted; ctx.lineWidth = on ? 2.5 : 1.5; ctx.globalAlpha = on ? 1 : 0.6;
      ctx.beginPath(); ctx.moveTo(lx + 24, yN(k)); ctx.lineTo(lx + 24 + lw, yN(k)); ctx.stroke();
      ctx.globalAlpha = 1;
      text(ctx, `n=${k}`, lx, yN(k) + 3.5, { color: on ? C.gold : C.muted, size: 10 });
      text(ctx, `${(-13.6 / (k * k)).toFixed(2)} eV`, lx + 28 + lw, yN(k) + 3.5, { color: C.muted, size: 10 });
    }
    if (arrow) { // the latest jump, drawn as an arrow in the photon's colour
      const ax = lx + 24 + lw * 0.82, y1 = yN(arrow.l.n2), y2 = yN(arrow.l.n1);
      ctx.globalAlpha = clamp(1 - arrow.age / 1.2, 0, 1); ctx.strokeStyle = ctx.fillStyle = wavelengthColor(arrow.l.nm, 1); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(ax, y1); ctx.lineTo(ax, y2 - 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, y2); ctx.lineTo(ax - 4, y2 - 7); ctx.lineTo(ax + 4, y2 - 7); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(lx + 24 + lw / 2, yN(nf), 3.5, 0, 2 * Math.PI); ctx.fill();

    // Spectrum strip.
    const uvW = sw * 0.14, visW = sw * 0.56;
    ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(sx, sy, sw, sh);
    for (let nm = 380; nm < 750; nm += 2) { ctx.fillStyle = wavelengthColor(nm, 0.22); ctx.fillRect(specX(nm, g), sy, visW / 185 + 0.6, sh); }
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(sx + uvW, sy); ctx.lineTo(sx + uvW, sy + sh); ctx.moveTo(sx + uvW + visW, sy); ctx.lineTo(sx + uvW + visW, sy + sh); ctx.stroke();
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.globalAlpha = 1;
    text(ctx, "emitted spectrum", sx, sy - 6, { color: C.muted, size: 10 });
    text(ctx, "UV", sx + uvW / 2, sy + sh + 12, { align: "center", color: C.muted, size: 10 });
    text(ctx, "IR", sx + uvW + visW + (sw - uvW - visW) / 2, sy + sh + 12, { align: "center", color: C.muted, size: 10 });
    for (const l of LINES) {
      const x = specX(l.nm, g), dim = l.nm < 380 || l.nm > 750;
      if (l.flash > 0) { ctx.strokeStyle = wavelengthColor(l.nm, l.flash * 0.7); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x, sy + sh); ctx.stroke(); }
      if (!l.count) continue;
      ctx.strokeStyle = wavelengthColor(l.nm, 0.55 + 0.45 * Math.min(1, l.count / 4)); ctx.lineWidth = dim ? 3 : 2;
      ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x, sy + sh); ctx.stroke();
      if (l.n1 === 2) text(ctx, Math.round(l.nm), x, sy + sh + 12 + 11 * (l.n2 % 2), { align: "center", color: wavelengthColor(l.nm, 1), size: 10 }); // Balmer labels, staggered
    }

    // Photons flying from the atom to their place in the spectrum.
    for (const p of photons) {
      const x0 = p.x0 * w, y0 = p.y0 * h, x1 = specX(p.l.nm, g), y1 = sy;
      const hx = x0 + (x1 - x0) * p.u, hy = y0 + (y1 - y0) * p.u, d = Math.hypot(x1 - x0, y1 - y0) || 1;
      const tx = hx - ((x1 - x0) / d) * 16, ty = hy - ((y1 - y0) / d) * 16, dim = p.l.nm < 380 || p.l.nm > 750;
      ctx.strokeStyle = wavelengthColor(p.l.nm, 0.6); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = wavelengthColor(p.l.nm, 1); ctx.beginPath(); ctx.arc(hx, hy, 3.5, 0, 2 * Math.PI); ctx.fill();
      if (dim) { ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(hx, hy, 6, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]); }
      const lab = `${Math.round(p.l.nm)} nm${dim ? (p.l.nm < 380 ? " UV" : " IR") : ""}`, right = hx > w * 0.7;
      if (hy < sy - 24) text(ctx, lab, right ? hx - 9 : hx + 9, hy - 5, { align: right ? "right" : "left", color: dim ? C.muted : C.ink, size: 10 });
    }

    info.textContent = last
      ? `n=${last.n2} → ${last.n1}: ${Math.round(last.nm)} nm, ${colorName(last.nm)} (${SERIES[last.n1]})`
      : "Press Excite: the electron jumps up, then falls back and emits light.";
  }

  const lp = loop(row, (t, dt) => draw(dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
