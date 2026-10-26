// Einstein: the photoelectric effect. Photon energy E = hc/λ; if E > W each photon frees one electron with KE = E − W.
import { C, canvas, controls, slider, button, loop, readout, text, map, clamp, wavelengthColor } from "./kit.js";

export const title = "Photoelectric effect";
export const caption = "Light arrives in packets, each carrying energy E = 1240/λ eV (λ in nm). A packet frees an electron only if E exceeds the metal's work function W, and the surplus becomes the electron's speed. Brighter light sends more packets, so more electrons, never faster ones. Below threshold, no brightness helps. Not to scale: real lamps emit vastly more photons.";

const HC = 1240, EMAX = 6.5; // hc in eV·nm; top of the energy axis in eV
const METALS = [
  { name: "Sodium", W: 2.28, plate: ["#d3d6e0", "#7d8296"] },
  { name: "Zinc", W: 4.3, plate: ["#a3b3cb", "#5d6b82"] },
];

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A lamp shines photons onto a metal plate. When each photon's energy exceeds the metal's work function, electrons fly off the plate; otherwise none do. A bar chart on the right compares photon energy with the work function." });
  const row = controls(root), info = readout(root);
  let nm = 400, rate = 12, metal = 0, photons = [], electrons = [], rings = [], acc = 0;

  slider(row, { label: "Wavelength", min: 200, max: 700, step: 5, value: nm, fmt: v => `${v} nm` }, v => { nm = v; lp.redraw(); });
  slider(row, { label: "Intensity", min: 1, max: 40, step: 1, value: rate, fmt: v => `${v}/s` }, v => { rate = v; lp.redraw(); });
  const btns = METALS.map((m, i) => button(row, "", () => { metal = i; mark(); lp.redraw(); }));
  const mark = () => METALS.forEach((m, i) => {
    btns[i].textContent = `${i === metal ? "●" : "○"} ${m.name} (${m.W} eV)`;
    btns[i].setAttribute?.("aria-pressed", String(i === metal));
  });
  mark();

  // Scene occupies the left 70%; the energy bar chart lives on the right.
  const geo = () => { const sw = cv.w * 0.7, H = cv.h; return { sw, H, lx: sw * 0.12, ly: H * 0.2, py: H * 0.8 }; };
  const targetX = (g, f) => g.sw * (0.4 + 0.5 * f);

  function step(dt) {
    if (!dt || !cv.w) return;
    const g = geo(), W = METALS[metal].W;
    // ponytail: photons/s is a visual rate; a real lamp emits ~10^18 per second.
    acc += dt * rate;
    while (acc >= 1) { acc--; photons.push({ f: Math.random(), u: -Math.random() * 0.08, nm, E: HC / nm }); }
    for (const p of photons) {
      const x = targetX(g, p.f), len = Math.hypot(x - g.lx, g.py - g.ly);
      p.u += (dt * 1.5 * g.H) / len;
      if (p.u < 1) continue;
      if (p.E > W) {
        // Speed ∝ √KE (ponytail: ejection angle is a random fan around the normal, for looks).
        const v = 0.3 * g.H * Math.sqrt(p.E - W), a = (Math.random() - 0.5) * 1.4;
        electrons.push({ x, y: g.py, vx: v * Math.sin(a), vy: -v * Math.cos(a), age: 0 });
      } else rings.push({ x, age: 0 });
    }
    photons = photons.filter(p => p.u < 1);
    for (const e of electrons) { e.x += e.vx * dt; e.y += e.vy * dt; e.age += dt; }
    electrons = electrons.filter(e => e.age < 2.4 && e.y > 0 && e.x > 0 && e.x < g.sw);
    if (electrons.length > 250) electrons.splice(0, electrons.length - 250);
    for (const r of rings) r.age += dt;
    rings = rings.filter(r => r.age < 0.6);
  }

  // A short wavy photon packet whose head is at (hx, hy), travelling at angle a.
  function squiggle(ctx, hx, hy, a, per, color) {
    const ca = Math.cos(a), sa = Math.sin(a);
    ctx.beginPath();
    for (let s = 0; s <= 20; s++) {
      const o = 3 * Math.sin((s * 2 * Math.PI) / per);
      const x = hx - ca * s - sa * o, y = hy - sa * s + ca * o;
      s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = 3.2; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1; ctx.stroke(); // pale core, so dim violet and UV photons still show
  }

  function draw(dt) {
    step(dt);
    const { ctx, w } = cv, g = geo(), { sw, H, lx, ly, py } = g;
    const m = METALS[metal], W = m.W, E = HC / nm;
    ctx.clearRect(0, 0, w, H);
    ctx.setLineDash([]);

    // Beam of light from the lamp to the plate.
    ctx.fillStyle = wavelengthColor(nm, 0.09 + 0.1 * (rate / 40));
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(sw * 0.34, py); ctx.lineTo(sw * 0.94, py); ctx.closePath(); ctx.fill();

    // The metal plate.
    const px = sw * 0.28, pw = sw * 0.68, ph = H * 0.06;
    const pg = ctx.createLinearGradient(0, py, 0, py + ph);
    pg.addColorStop(0, m.plate[0]); pg.addColorStop(1, m.plate[1]);
    ctx.fillStyle = pg; ctx.fillRect(px, py, pw, ph);
    text(ctx, `${m.name}, W = ${W} eV`, px + pw / 2, py + ph + 14, { align: "center", color: C.muted, size: 11 });

    // The lamp.
    const lr = H * 0.045 * (0.8 + 0.5 * (rate / 40));
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr * 2.4);
    lg.addColorStop(0, "rgba(255,255,255,0.85)"); lg.addColorStop(0.25, wavelengthColor(nm, 1)); lg.addColorStop(0.6, wavelengthColor(nm, 0.45)); lg.addColorStop(1, wavelengthColor(nm, 0));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(lx, ly, lr * 2.4, 0, 2 * Math.PI); ctx.fill();
    text(ctx, "lamp", lx, ly + lr * 2.4 + 12, { align: "center", color: C.muted, size: 10 });

    // Photons (wave period shortens with wavelength; ponytail: packet length and period are not to scale).
    for (const p of photons) {
      if (p.u < 0) continue;
      const x1 = targetX(g, p.f), a = Math.atan2(py - ly, x1 - lx);
      squiggle(ctx, lx + (x1 - lx) * p.u, ly + (py - ly) * p.u, a, map(p.nm, 200, 700, 6, 15), wavelengthColor(p.nm, 1));
    }

    // Electrons, with a short streak that shows their speed.
    for (const e of electrons) {
      const al = clamp((2.4 - e.age) / 0.6, 0, 1);
      ctx.globalAlpha = al * 0.55; ctx.strokeStyle = C.blue; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(e.x - e.vx * 0.06, e.y - e.vy * 0.06); ctx.lineTo(e.x, e.y); ctx.stroke();
      ctx.globalAlpha = al; ctx.fillStyle = C.blue;
      ctx.beginPath(); ctx.arc(e.x, e.y, 3, 0, 2 * Math.PI); ctx.fill();
    }
    // Photons that were absorbed without freeing anything just warm the plate.
    ctx.lineWidth = 1.5; ctx.strokeStyle = C.red;
    for (const r of rings) {
      ctx.globalAlpha = 1 - r.age / 0.6;
      ctx.beginPath(); ctx.arc(r.x, py, 3 + r.age * 26, Math.PI, 2 * Math.PI); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    text(ctx, E > W ? "E > W: electrons escape" : "E < W: no electrons", sw - 4, 14, { align: "right", size: 11, color: E > W ? C.green : C.red });

    // Energy chart: photon energy against the work function.
    const ax = w * 0.725, top = H * 0.15, bot = H * 0.82, yE = e => map(clamp(e, 0, EMAX), 0, EMAX, bot, top);
    const bx = ax + 6, bw = clamp(w * 0.05, 12, 30);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, bot); ctx.stroke();
    for (const e of [0, 2, 4, 6]) {
      ctx.beginPath(); ctx.moveTo(ax - 3, yE(e)); ctx.lineTo(ax, yE(e)); ctx.stroke();
      text(ctx, e, ax - 6, yE(e) + 3.5, { align: "right", color: C.muted, size: 10 });
    }
    text(ctx, "energy (eV)", ax - 4, top - 10, { color: C.muted, size: 10 });
    ctx.fillStyle = wavelengthColor(nm, 0.95); ctx.fillRect(bx, yE(E), bw, bot - yE(E));
    if (E > W) {
      ctx.fillStyle = C.gold; ctx.fillRect(bx, yE(E), bw, yE(W) - yE(E));
      if (yE(W) - yE(E) >= 14) text(ctx, "KE", bx + bw + 4, (yE(E) + yE(W)) / 2 + 3.5, { color: C.gold, size: 10 });
    }
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.red; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ax, yE(W)); ctx.lineTo(w - 4, yE(W)); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `W = ${W} eV`, w - 4, yE(W) + 12, { align: "right", color: C.red, size: 10 });
    text(ctx, "photon", bx + bw / 2, bot + 13, { align: "center", color: C.muted, size: 10 });

    const band = nm < 380 ? " (ultraviolet)" : nm > 750 ? " (infrared)" : "";
    info.textContent = `λ = ${nm} nm${band}: photon ${E.toFixed(2)} eV · W = ${W} eV · ${E > W ? `max KE ${(E - W).toFixed(2)} eV` : "no electrons"}`;
  }

  for (let i = 0; i < 45; i++) step(1 / 30); // warm up so the first (or reduced-motion) frame is not empty
  const lp = loop(row, (t, dt) => draw(dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
