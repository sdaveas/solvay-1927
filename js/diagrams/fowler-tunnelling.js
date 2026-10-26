// Fowler–Nordheim: field emission. Energy against distance at a metal surface; a field F tilts the work-function step W into a triangle of width d = W/F, and electrons at the Fermi level tunnel through it.
import { C, canvas, controls, slider, loop, readout, axes, curve, text, clamp } from "./kit.js";

export const title = "Field emission";
export const caption = "Electrons in a metal are held in by a barrier, the work function W. A strong field tilts it into a triangle that thins as it grows, until electrons can tunnel through. Fowler and Nordheim (1928) found the current J ∝ F² exp(−6.83 W^(3/2)/F), so a modest rise in field multiplies it enormously. Escapes are drawn on a log scale; low fields look far busier than they are.";

const TAU = 2 * Math.PI, W = 4.5, BFN = 6.83, X0 = -2, X1 = 5.4, E0 = -3, E1 = 5.8, ACC = 0.5;   // eV, eV^(-3/2)·V/nm, plot ranges (nm, eV), visual acceleration
const lj = F => 2 * Math.log10(F) - Math.LOG10E * BFN * W ** 1.5 / F;     // log10 of F²·exp(−b·W^1.5/F)
const rel = F => lj(F) - lj(10), LJMIN = rel(1);                           // log10 of J relative to J at 10 V/nm
const sup = n => [...String(n)].map(c => (c === "-" ? "⁻" : "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c])).join("");
const sci = lg => { let e = Math.floor(lg), m = 10 ** (lg - e); if (m >= 9.95) { m = 1; e++; } return `${m.toFixed(1)}×10${sup(e)}`; };
const LEVELS = [0, -0.1, -0.2, -0.35, -0.5, -0.8, -1.2, -1.6, -1.9];       // electron energies below the Fermi level (eV)

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "Left: an energy diagram of a metal surface. Electrons fill the metal up to the Fermi level and bounce against the surface; a field tilts the vacuum side into a triangular barrier, and now and then an electron tunnels through and speeds away. Right: a graph of the logarithm of the emitted current against field." });
  const row = controls(root), info = readout(root);
  let F = 5;
  const el = LEVELS.map(E => ({ E, x: -1.9 * Math.random(), v: (Math.random() < 0.5 ? -1 : 1) * (1.8 + 1.2 * Math.random()), s: 0, t: 0, f: 0 }));   // s: 0 bouncing, 1 inside the barrier, 2 flying away, 3 waiting to be replaced
  slider(row, { label: "Field F", min: 1, max: 10, step: 0.1, value: F, fmt: v => `${v.toFixed(1)} V/nm` }, v => { F = v; lp.redraw(); });
  const lp = loop(row, (_, dt) => draw(dt));

  function step(dt) {
    // ponytail: the chance that a surface hit tunnels is a log-scaled visual rate (0.06 at 1 V/nm up to 0.8 at 10 V/nm), not the true probability (about 1e-28 at 1 V/nm).
    // Its energy dependence is real: an electron e below the Fermi level faces the exponent 6.83((W+e)^1.5 − W^1.5)/F more.
    const p0 = 0.06 + 0.74 * (1 - rel(F) / LJMIN);
    for (const e of el) {
      e.f = Math.max(0, e.f - dt * 3);
      if (e.s === 0) {
        e.x += e.v * dt;
        if (e.x < X0 + 0.1) { e.x = X0 + 0.1; e.v = Math.abs(e.v); }
        if (e.x > 0) {
          e.x = 0; e.v = -Math.abs(e.v); e.f = 1;
          if (Math.random() < p0 * Math.exp((-BFN / F) * ((W - e.E) ** 1.5 - W ** 1.5))) { e.s = 1; e.t = 0; }
        }
      } else if (e.s === 1) { if ((e.t += dt) >= 0.5) { e.s = 2; e.t = 0; } }
      else if (e.s === 2) { e.t += dt; if ((W - e.E) / F + 0.5 * ACC * F * e.t * e.t > X1) { e.s = 3; e.t = 0; } }
      else if ((e.t += dt) > 0.6) { e.s = 0; e.x = X0 + 0.1; e.v = Math.abs(e.v); }
    }
  }

  function draw(dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    if (dt) step(dt);
    const fs = clamp(w / 52, 10, 13), d = W / F, ED = { x: 34, y: 24, w: Math.round(w * 0.5), h: h - 24 - 46 };
    const PX = v => ED.x + ((v - X0) / (X1 - X0)) * ED.w, PY = e => ED.y + ED.h - ((e - E0) / (E1 - E0)) * ED.h, ppn = ED.w / (X1 - X0);

    // ── energy diagram ──
    text(ctx, "energy of an electron at the surface", ED.x, 15, { color: C.muted, size: fs });
    ctx.fillStyle = "rgba(79,168,255,0.2)"; ctx.fillRect(ED.x, PY(0), PX(0) - ED.x, PY(E0) - PY(0));     // filled states
    axes(ctx, ED, { xLabel: "distance from surface (nm)", yLabel: "energy (eV)" });
    for (const v of [0, 2, 4]) text(ctx, v, PX(v), ED.y + ED.h + 13, { align: "center", color: C.muted, size: 10 });
    ctx.save(); ctx.beginPath(); ctx.rect(ED.x, ED.y, ED.w, ED.h); ctx.clip();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);                                  // Fermi level and the field-free vacuum level
    ctx.beginPath(); ctx.moveTo(ED.x, PY(0)); ctx.lineTo(ED.x + ED.w, PY(0)); ctx.moveTo(PX(0), PY(W)); ctx.lineTo(ED.x + ED.w, PY(W)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(227,194,127,0.22)"; ctx.beginPath(); ctx.moveTo(PX(0), PY(0)); ctx.lineTo(PX(0), PY(W)); ctx.lineTo(PX(d), PY(0)); ctx.fill();   // the barrier
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(PX(0), PY(E0)); ctx.lineTo(PX(0), PY(W)); ctx.lineTo(PX(X1), PY(W - F * X1)); ctx.stroke();   // surface wall, then the tilted vacuum level W − F·x
    text(ctx, "E_F", ED.x + 3, PY(0) - 4, { color: C.muted, size: 10 });
    text(ctx, "metal", (ED.x + PX(0)) / 2, PY(1.1), { align: "center", color: C.muted, size: 10 });
    text(ctx, "filled", (ED.x + PX(0)) / 2, PY(-2.7), { align: "center", color: C.blue, size: 10 });
    text(ctx, "vacuum level", ED.x + ED.w - 3, PY(W) - 5, { align: "right", color: C.muted, size: 10 });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath();                                            // W and d brackets
    const bx = PX(-0.3), dy = PY(-2.7);
    ctx.moveTo(bx - 3, PY(0)); ctx.lineTo(bx + 3, PY(0)); ctx.moveTo(bx, PY(0)); ctx.lineTo(bx, PY(W)); ctx.moveTo(bx - 3, PY(W)); ctx.lineTo(bx + 3, PY(W));
    ctx.moveTo(PX(0), dy - 3); ctx.lineTo(PX(0), dy + 3); ctx.moveTo(PX(0), dy); ctx.lineTo(PX(d), dy); ctx.moveTo(PX(d), dy - 3); ctx.lineTo(PX(d), dy + 3); ctx.stroke();
    text(ctx, "W", bx - 4, PY(W / 2) + 4, { align: "right", color: C.ink, size: fs, weight: 600 });
    text(ctx, "d", (PX(0) + PX(d)) / 2, dy - 5, { align: "center", color: C.ink, size: fs, weight: 600 });

    for (const e of el) {                                                                                    // electrons
      const py = PY(e.E), dE = (W - e.E) / F;
      if (e.f > 0) { ctx.strokeStyle = `rgba(227,194,127,${e.f})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(PX(0), py, 3 + 9 * (1 - e.f), 0, TAU); ctx.stroke(); }
      if (e.s === 0) { ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(PX(e.x), py, 3.2, 0, TAU); ctx.fill(); }
      else if (e.s === 1) {                                                                                  // a dim ghost crossing the barrier at constant energy
        const gx = PX(dE * Math.min(1, e.t / 0.5));
        ctx.strokeStyle = "rgba(227,194,127,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(PX(0), py); ctx.lineTo(gx, py); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(227,194,127,0.5)"; ctx.beginPath(); ctx.arc(gx, py, 3.2, 0, TAU); ctx.fill();
      } else if (e.s === 2) {                                                                                // out in the vacuum, gaining speed from the field
        const gx = PX(dE + 0.5 * ACC * F * e.t * e.t), tail = clamp(ACC * F * e.t * 0.12 * ppn, 3, 70);
        const g = ctx.createLinearGradient(gx - tail, 0, gx, 0);
        g.addColorStop(0, "rgba(227,194,127,0)"); g.addColorStop(1, "rgba(227,194,127,0.9)");
        ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx - tail, py); ctx.lineTo(gx, py); ctx.stroke();
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(gx, py, 3.6, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();

    // ── log J against F ──
    const x0 = ED.x + ED.w + 16, r = { x: x0 + 28, y: 38, w: w - 10 - (x0 + 28), h: Math.round(h * 0.4) };
    const PX2 = v => r.x + ((v - 1) / 9) * r.w, PY2 = v => r.y + r.h - ((v - LJMIN + 1.5) / (1.5 - LJMIN + 1)) * r.h;
    axes(ctx, r, { xLabel: "F (V/nm)" });
    text(ctx, "log₁₀ J (relative)", r.x - 26, r.y - 8, { color: C.muted, size: 10 });
    for (const v of [1, 5, 10]) text(ctx, v, PX2(v), r.y + r.h + 13, { align: v === 1 ? "left" : "center", color: C.muted, size: 10 });
    for (const v of [0, -10, -20]) text(ctx, v === 0 ? "0" : `−${-v}`, r.x - 5, PY2(v) + 3.5, { align: "right", color: C.muted, size: 10 });
    curve(ctx, r, [1, 10], [LJMIN - 1.5, 1], rel, { color: C.gold, width: 2.5, n: 90 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(PX2(F), r.y + r.h); ctx.lineTo(PX2(F), PY2(rel(F))); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(PX2(F), PY2(rel(F)), 4.5, 0, TAU); ctx.fill(); ctx.stroke();

    const ky = r.y + r.h + 52;
    text(ctx, `W = ${W} eV`, x0, ky, { size: 10, color: C.muted });
    text(ctx, `F = ${F.toFixed(1)} V/nm`, x0, ky + 13, { size: 10, color: C.muted });
    text(ctx, `d = W/F = ${d.toFixed(2)} nm`, x0, ky + 26, { size: 10, color: C.gold });

    info.textContent = `Barrier width d = ${d.toFixed(2)} nm · current ${sci(rel(F))} of its value at 10 V/nm`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
