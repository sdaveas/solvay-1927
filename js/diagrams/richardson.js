// Richardson: thermionic emission, J = A·T²·exp(−W/kT), for a tungsten filament in a vacuum tube.
import { C, canvas, controls, slider, loop, readout, axes, curve, text, map, clamp, kelvinColor } from "./kit.js";

export const title = "Thermionic emission";
export const caption = "A glowing filament boils electrons off, and an anode collects them. Richardson's law, J = A T² exp(−W/kT), says the current climbs steeply with temperature: the exponential beats everything else. The graph is logarithmic, and the number of electrons drawn follows log J, not J itself, so the animation hugely understates the real change.";

const A = 1.2e6, W = 4.5, KB = 8.617e-5; // A in A m⁻² K⁻², W in eV (tungsten), k in eV/K
const J = T => A * T * T * Math.exp(-W / (KB * T)); // A/m²
const logJ = T => Math.log10(J(T) / 1e4); // log10 of A/cm²
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const sup = n => String(n).replace(/./g, c => SUP[c] ?? c);
const sci = x => { const [m, e] = x.toExponential(1).split("e"); return `${m}×10${sup(+e)}`; };
const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "A vacuum tube with a glowing filament releasing electrons towards an anode, above a logarithmic graph of emission current density against filament temperature." });
  const row = controls(root), info = readout(root);
  let T = 2400, spawn = 0;
  const E = Array.from({ length: 160 }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0 }));
  slider(row, { label: "Filament", min: 1500, max: 3000, step: 50, value: T, fmt: v => `${v} K` }, v => { T = v; lp.redraw(); });
  const lp = loop(row, (_, dt) => { step(dt); draw(); });

  // Tube geometry (shared by step and draw).
  const geo = () => {
    const { w, h } = cv, tx = 10, ty = 10, tw = w - 20, th = Math.round(h * 0.46) - 20;
    return { tx, ty, tw, th, fx: tx + tw * 0.16, fy: ty + th * 0.42, fh: th * 0.26, ax: tx + tw * 0.82, k: w / 600 };
  };
  function step(dt) {
    if (!dt) return;
    const g = geo();
    // ponytail: the visual emission rate follows log J (about 6 to 80 electrons/s), not J, which spans eight decades and could not be drawn.
    spawn += dt * (3 + (80 * (logJ(T) + 7)) / 8.5);
    while (spawn >= 1) {
      spawn--;
      const e = E.find(p => !p.on);
      if (e) Object.assign(e, { on: true, x: g.fx + 5, y: g.fy + (Math.random() * 2 - 1) * g.fh, vx: (15 + Math.random() * 40) * g.k, vy: (Math.random() - 0.5) * 70 * g.k });
    }
    for (const e of E) {
      if (!e.on) continue;
      e.vx += 700 * g.k * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.vy *= 1 - 0.8 * dt; // pulled towards the positive anode
      e.y = clamp(e.y, g.ty + 6, g.ty + g.th - 22);
      if (e.x >= g.ax - 3) e.on = false;
    }
  }

  function draw() {
    const { ctx, w, h } = cv, g = geo(), { tx, ty, tw, th, fx, fy, fh, ax } = g;
    ctx.clearRect(0, 0, w, h);

    // ── The tube ────────────────────────────────────────────
    rr(ctx, tx, ty, tw, th, 16);
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1.5; ctx.stroke();
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, fh * 1.8), heat = (T - 1500) / 1500;
    glow.addColorStop(0, kelvinColor(T, 0.55 + 0.45 * heat)); glow.addColorStop(0.45, kelvinColor(T, 0.2 + 0.3 * heat)); glow.addColorStop(1, kelvinColor(T, 0));
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(fx, fy, fh * 1.8, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C.muted; ctx.fillRect(ax - 3, ty + 10, 6, th - 34);
    ctx.fillStyle = C.blue;
    ctx.beginPath();
    const er = clamp(w / 200, 1.8, 3.2);
    for (const e of E) if (e.on) { ctx.moveTo(e.x + er, e.y); ctx.arc(e.x, e.y, er, 0, 2 * Math.PI); }
    ctx.fill();
    const amp = clamp(w / 53, 6, 13);
    ctx.strokeStyle = kelvinColor(T); ctx.lineWidth = clamp(w / 120, 2.5, 5); ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(fx, fy - fh - 8); ctx.lineTo(fx, fy - fh);
    for (let i = 0; i <= 8; i++) ctx.lineTo(fx + (i % 2 ? amp : -amp), fy - fh + (i * 2 * fh) / 8);
    ctx.lineTo(fx, fy + fh); ctx.lineTo(fx, fy + fh + 8); ctx.stroke();
    text(ctx, "hot filament", fx, ty + th - 6, { color: C.muted, size: 10, align: "center" });
    text(ctx, "anode (+)", ax, ty + th - 6, { color: C.muted, size: 10, align: "center" });
    text(ctx, "vacuum", (fx + ax) / 2, ty + th - 6, { color: C.muted, size: 10, align: "center" });

    // ── log J against T ─────────────────────────────────────
    const pr = { x: 54, y: ty + th + 32, w: w - 70, h: h - (ty + th + 32) - 36 };
    const X = v => map(v, 1500, 3000, pr.x, pr.x + pr.w), Yp = v => map(v, -8, 2, pr.y + pr.h, pr.y);
    ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
    for (const e of [-8, -6, -4, -2, 0, 2]) {
      if (e > -8) { ctx.beginPath(); ctx.moveTo(pr.x, Yp(e)); ctx.lineTo(pr.x + pr.w, Yp(e)); ctx.stroke(); }
      text(ctx, `10${sup(e)}`, pr.x - 5, Yp(e) + 3, { color: C.muted, size: 10, align: "right" });
    }
    axes(ctx, pr);
    text(ctx, "J, A/cm² (log scale) · tungsten, W = 4.5 eV", 10, pr.y - 12, { color: C.muted, size: 10 });
    for (const v of [1500, 2000, 2500, 3000]) text(ctx, v, X(v), pr.y + pr.h + 13, { color: C.muted, size: 10, align: "center" });
    text(ctx, "filament temperature (K)", pr.x + pr.w, pr.y + pr.h + 26, { color: C.muted, size: 10, align: "right" });
    curve(ctx, pr, [1500, 3000], [-8, 2], logJ, { color: C.gold, width: 2.5 });
    const my = Yp(logJ(T));
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(X(T), pr.y + pr.h); ctx.lineTo(X(T), my); ctx.lineTo(pr.x, my); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = kelvinColor(T); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X(T), my, 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();

    info.textContent = `T = ${T.toLocaleString("en-US")} K · J = ${sci(J(T) / 1e4)} A/cm² · another +100 K here multiplies J by ${(J(T + 100) / J(T)).toFixed(1)}`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
