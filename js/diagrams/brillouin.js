// Brillouin: nearly-free electrons in a 1D lattice. Gaps of 2|V| open at the zone boundaries; filling decides metal or insulator.
import { C, canvas, controls, slider, toggle, loop, readout, axes, curve, text, clamp } from "./kit.js";

export const title = "Bands and gaps";
export const caption = "Electrons in a crystal are waves; the lattice reflects them at the zone edges and opens energy gaps of size 2V. One electron per atom half-fills the lowest band: a metal. Two fill it completely, with a gap above: an insulator. Switch on a field and the electrons shift in k: a half-full band carries current, a full one cannot. Dots are filled states, two electrons each.";

const TAU = 2 * Math.PI, EMIN = -0.4, EMAX = 5, VC = 0.02;          // plotted energy range; below VC the gap is treated as closed
const BND = [-2, -1, 1, 2];                                          // zone boundaries in units of π/a (gaps at ±π/a and ±2π/a)
const E = { e: 0, d: 0 };                                            // result of band(): energy and dE/dk, in units of the zone-edge free-electron energy

// ponytail: E(k) = k² plus the two-band shift of each boundary b (G = 2b), E± = avg ± √(Δ² + V²), faded in within 0.75 of the boundary so the curve stays continuous.
// The same V is used at both gaps, and every gap is exactly 2V wide.
function band(k, V) {
  let e = k * k, d = 2 * k;
  for (let i = 0; i < 4; i++) {
    const b = BND[i], dist = Math.abs(k - b);
    if (dist >= 0.75) continue;
    const u = Math.min(1, (0.75 - dist) / 0.5), wt = u * u * (3 - 2 * u);   // 1 within 0.25 of the boundary, smoothly 0 beyond 0.75
    const G = 2 * b, D = G * (k - b), s = Math.hypot(D, V), ad = Math.abs(D);
    const shift = Math.sign(D) * (s - ad), dshift = s ? G * (ad / s - 1) : 0;
    const dw = u < 1 ? 6 * u * (1 - u) * (-Math.sign(k - b) / 0.5) : 0;
    e += wt * shift; d += dw * shift + wt * dshift;
  }
  E.e = e; E.d = d;
}

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "Graph of electron energy against wavevector for a crystal. A dashed parabola shows free electrons; the gold curve, with the lattice potential, has gaps at the zone edges. Dots mark filled states for one or two electrons per atom, and a bar shows the current when an electric field is applied." });
  const row = controls(root), info = readout(root);
  let V = 0.35, two = false, field = false, s = 0;
  slider(row, { label: "Lattice potential V", min: 0, max: 0.8, step: 0.01, value: V, fmt: v => v.toFixed(2) }, v => { V = v; lp.redraw(); });
  toggle(row, "2 electrons per atom", two, v => { two = v; lp.redraw(); });
  toggle(row, "Electric field", field, v => { field = v; if (!lp.playing) s = v ? 0.3 : 0; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t, dt));

  function draw(t, dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13);
    s += ((field ? 0.3 : 0) - s) * (1 - Math.exp(-dt / 0.6));       // the Fermi sea drifts in k, then settles where scattering balances the field
    const r = { x: w * 0.1, y: h * 0.06, w: w * 0.84, h: h * 0.62 };
    const X = k => r.x + ((k + 2) / 4) * r.w, Y = e => r.y + r.h - ((e - EMIN) / (EMAX - EMIN)) * r.h;

    // first Brillouin zone, and the forbidden energy ranges across the whole plot
    ctx.fillStyle = "rgba(227,194,127,0.07)"; ctx.fillRect(X(-1), r.y, X(1) - X(-1), r.h);
    text(ctx, "first Brillouin zone", X(0), r.y + 12, { color: C.gold, size: fs, align: "center" });
    let gapY = 0;
    if (V > 0.005) {
      ctx.fillStyle = "rgba(255,90,78,0.13)";
      for (const b of [1, 2]) {
        band(b - 1e-6, V); const lo = E.e; band(b + 1e-6, V); const hi = E.e;
        ctx.fillRect(r.x, Y(hi), r.w, Y(lo) - Y(hi));
        if (b === 1) gapY = (Y(hi) + Y(lo)) / 2;
      }
      text(ctx, "gap = 2V", r.x + r.w - 4, gapY + 4, { color: C.red, size: fs, align: "right" });
    }
    axes(ctx, r, { yLabel: "energy" });
    for (const [k, s2] of [[-2, "−2π/a"], [-1, "−π/a"], [0, "0"], [1, "π/a"], [2, "2π/a"]]) text(ctx, s2, X(k), r.y + r.h + 14, { align: "center", color: C.muted, size: 10 });
    text(ctx, "k", r.x + r.w + 4, r.y + r.h + 4, { color: C.muted, size: fs });

    // free parabola (dashed), and the bands: three pieces, since E(k) jumps across each gap
    curve(ctx, r, [-2, 2], [EMIN, EMAX], k => k * k, { color: C.muted, dash: [5, 4], width: 1.5 });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    for (const [k0, k1, n] of [[-2 + 1e-6, -1 - 1e-6, 60], [-1 + 1e-6, 1 - 1e-6, 100], [1 + 1e-6, 2 - 1e-6, 60]]) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) { const k = k0 + ((k1 - k0) * i) / n; band(k, V); i ? ctx.lineTo(X(k), Y(E.e)) : ctx.moveTo(X(k), Y(E.e)); }
      ctx.stroke();
    }
    // legend, inside the first zone where the curves leave room
    const lx = X(0) - r.w * 0.16, ly = r.y + r.h * 0.3;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(lx, ly - 4); ctx.lineTo(lx + 18, ly - 4); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(lx, ly + fs + 1); ctx.lineTo(lx + 18, ly + fs + 1); ctx.stroke();
    text(ctx, "free electrons", lx + 24, ly, { color: C.muted, size: fs });
    text(ctx, "with lattice", lx + 24, ly + fs + 5, { color: C.gold, size: fs });

    // filled states: 20 atoms give 20 k-states per band, each holding two electrons. One electron per atom fills |k| < π/2a; two fill the band.
    const kF = two ? 1 : 0.5, wrap = V >= VC;                         // with a gap, a state pushed past the zone edge is Bragg-reflected to the other side
    let J = 0;
    ctx.fillStyle = C.blue; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    for (let j = -10; j < 10; j++) {
      const k = (j + 0.5) * 0.1;
      if (Math.abs(k) > kF) continue;
      let kd = k + s;
      if (wrap) kd = ((((kd + 1) % 2) + 2) % 2) - 1;
      const kc = wrap ? clamp(kd, -1 + 1e-4, 1 - 1e-4) : kd;
      band(kc, V); J += E.d;
      const kv = kc + 0.012 * Math.sin(3 * t + j * 1.7);              // a little thermal jiggle, for show only
      band(kv, V);
      ctx.beginPath(); ctx.arc(X(kv), Y(E.e), 3.4, 0, TAU); ctx.fill(); ctx.stroke();
    }
    J = J < 0.15 ? 0 : J;                                             // a full band cancels to zero (the tiny remainder is coarse-sum error); never shown negative

    // current meter and verdict
    const full = two, gap = V >= VC, metal = !full || !gap, y1 = h * 0.835, bx = r.x + 10 + 11 * fs * 0.56, bw = w * 0.34, frac = clamp(J / 12, 0, 1);
    text(ctx, "net current", r.x, y1 + 4, { color: C.muted, size: fs });
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(bx, y1 - 4, bw, 8);
    ctx.fillStyle = C.green; ctx.fillRect(bx + 1, y1 - 3, (bw - 2) * frac, 6);
    text(ctx, field ? "field on →" : "field off", bx + bw + 10, y1 + 4, { color: field ? C.gold : C.muted, size: fs });
    const verdict = !full ? "Metal: band only half full" : gap ? "Insulator: full band, gap above" : "Metal: no gap in the way";
    text(ctx, verdict, w / 2, h * 0.95, { color: metal ? C.green : C.pink, size: fs + 1, align: "center", weight: 600 });

    info.textContent = `Gap 2V = ${(2 * V).toFixed(2)} (zone-edge energy units) · ${full ? 2 : 1} electron${full ? "s" : ""} per atom · current ${(J / 6).toFixed(2)} (relative)`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
