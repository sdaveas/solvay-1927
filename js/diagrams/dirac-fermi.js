// Dirac: Fermi–Dirac statistics. Each level holds two electrons (↑↓); occupancy follows f(E) = 1/(e^((E−μ)/kT) + 1).
import { C, canvas, controls, slider, loop, readout, text, clamp } from "./kit.js";

export const title = "Fermi–Dirac statistics";
export const caption = "No two electrons can share a seat, so a cold electron gas fills the ladder up to the Fermi level, E_F. Warm it and only electrons within about kT of the top can hop; deeper ones find every seat taken (red flashes). Curve: f(E) = 1/(e^((E−μ)/kT) + 1). Only ten electrons are drawn, so hopping follows it roughly. Fermi shares the name but is not in the photo.";

// ponytail: ten electrons on an evenly spaced ladder so every hop can be seen (a real metal has ~10²³ in a continuum). With the number fixed, the hopping gas is the canonical ensemble, up to ~0.15 sharper at the Fermi edge than the plotted grand-canonical f(E); the caption says so.
const NL = 14, N = 10, EF = N / 2 - 0.5;            // levels E_j = j (units of the level spacing); N electrons fill N/2 levels, so E_F sits midway between the top filled level and the first empty one
const NS = 2 * NL, HOP = 0.28, RATE = 500;      // slots (level × spin), seconds per hop, hop attempts per second
const TAU = 2 * Math.PI;
const fd = (E, mu, kT) => 1 / (Math.exp((E - mu) / kT) + 1);

// Chemical potential that keeps the average electron number at N. Below kT ≈ 0.4 the shift from E_F is under 10⁻⁶ and is skipped.
function solveMu(kT) {
  if (kT < 0.4) return EF;
  let lo = -20, hi = 40;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    let n = 0;
    for (let j = 0; j < NL; j++) n += 2 * fd(j, mid, kT);
    n < N ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}
// Spin arrow centred on (x, y), length s.
function arrow(ctx, x, y, up, s, color) {
  const d = up ? -1 : 1, y0 = y - (d * s) / 2, y1 = y + (d * s) / 2;
  ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - d * s * 0.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - s * 0.24, y1 - d * s * 0.34); ctx.lineTo(x + s * 0.24, y1 - d * s * 0.34); ctx.closePath(); ctx.fill();
}

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Left: a ladder of energy levels with two seats each, spin up and spin down, filled with electrons that hop up and down near the top. Right: the Fermi–Dirac curve of occupation against energy, smeared out as temperature rises." });
  const row = controls(root), info = readout(root);
  const occ = new Int8Array(NS);                 // 1 if the slot holds (or is receiving) an electron
  const el = [];                                 // electrons: slot, previous slot, hop progress 0–1
  let x = 0.12, kT = x * EF, mu = solveMu(kT), acc = 0, cool = 0, flashes = [];
  for (let j = 0; j < N / 2; j++) for (const s of [0, 1]) { occ[2 * j + s] = 1; el.push({ s: 2 * j + s, from: 2 * j + s, u: 1 }); }

  // One Metropolis attempt: a random electron tries a random free seat with the same spin; accepted with probability min(1, e^(−ΔE/kT)).
  function attempt(instant) {
    const e = el[(Math.random() * N) | 0];
    if (e.u < 1) return;
    const j0 = e.s >> 1, j1 = (Math.random() * NL) | 0, t = 2 * j1 + (e.s & 1);
    if (j1 === j0) return;
    const dE = j1 - j0, ok = dE <= 0 || Math.random() < Math.exp(-dE / kT);
    if (!ok) return;
    if (occ[t]) { // allowed by energy but the seat is taken: the exclusion principle at work
      if (!instant && cool <= 0 && Math.abs(dE) <= 3 && flashes.length < 6) { flashes.push({ s: t, age: 0 }); cool = 0.12; }
      return;
    }
    occ[e.s] = 0; occ[t] = 1; e.from = e.s; e.s = t; e.u = instant ? 1 : 0;
  }
  const settle = () => { for (const e of el) e.u = 1; for (let i = 0; i < 4000; i++) attempt(true); };
  settle();

  slider(row, { label: "Temperature kT/E_F", min: 0, max: 0.5, step: 0.01, value: x, fmt: v => v.toFixed(2) }, v => {
    x = v; kT = Math.max(x * EF, 0.004); mu = solveMu(kT);
    if (!lp.playing) settle();
    lp.redraw();
  });
  const lp = loop(row, (t, dt) => draw(dt));

  function draw(dt) {
    if (dt) {
      acc += dt * RATE; cool -= dt;
      while (acc >= 1) { acc--; attempt(false); }
      for (const e of el) e.u = Math.min(1, e.u + dt / HOP);
      for (const f of flashes) f.age += dt;
      flashes = flashes.filter(f => f.age < 0.45);
    }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    const fs = clamp(w / 52, 10, 13);
    const lx = w * 0.17, lw = w * 0.32, px0 = w * 0.6, pw = w * 0.26, yt = h * 0.15, yb = h * 0.8, sp = (yb - yt) / NL;
    const yE = E => yb - (E + 0.5) * sp, sx = s => lx + lw * (s & 1 ? 0.7 : 0.3), sy = s => yE(s >> 1), as = Math.min(sp * 0.8, 15);

    text(ctx, "2 seats per level", lx, h * 0.075, { color: C.muted, size: fs });
    text(ctx, "occupation f(E)", px0, h * 0.075, { color: C.muted, size: fs });

    // Energy axis with E_F marked (the T = 0 Fermi level), and the thermal band μ ± kT.
    const ax = w * 0.07;
    ctx.strokeStyle = C.muted; ctx.fillStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ax, yb); ctx.lineTo(ax, yt); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, yt - 5); ctx.lineTo(ax - 3.5, yt + 2); ctx.lineTo(ax + 3.5, yt + 2); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(ax - 6, yt); ctx.rotate(-Math.PI / 2); text(ctx, "energy", 0, 0, { color: C.muted, size: 10, align: "right" }); ctx.restore();
    ctx.beginPath(); ctx.moveTo(ax - 3, yE(EF)); ctx.lineTo(ax + 3, yE(EF)); ctx.stroke();
    text(ctx, "E_F", lx - 6, yE(EF) + 4, { color: C.muted, size: fs, align: "right" });
    const bandT = clamp(yE(mu + kT), yt, yb), bandB = clamp(yE(mu - kT), yt, yb);
    ctx.fillStyle = "rgba(227,194,127,0.09)"; ctx.fillRect(lx - 3, bandT, px0 + pw - lx + 3, Math.max(1, bandB - bandT));

    // Faint guides from each level across to its point on the f(E) plot.
    ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.14; ctx.beginPath();
    for (let j = 0; j < NL; j++) { ctx.moveTo(lx + lw, yE(j)); ctx.lineTo(px0 + pw, yE(j)); }
    ctx.stroke(); ctx.globalAlpha = 1;

    // Ladder: level lines and seats.
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.55; ctx.beginPath();
    for (let j = 0; j < NL; j++) { ctx.moveTo(lx, yE(j)); ctx.lineTo(lx + lw, yE(j)); }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(168,156,138,0.4)"; ctx.beginPath();
    for (let s = 0; s < NS; s++) if (!occ[s]) { ctx.moveTo(sx(s) + 3.5, sy(s)); ctx.arc(sx(s), sy(s), 3.5, 0, TAU); }
    ctx.stroke();

    // Pauli blocks: a seat that was wanted but is taken.
    ctx.lineWidth = 2; ctx.strokeStyle = C.red;
    for (const f of flashes) { ctx.globalAlpha = 1 - f.age / 0.45; ctx.beginPath(); ctx.arc(sx(f.s), sy(f.s), as * (0.45 + f.age * 1.3), 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;

    // Electrons (hopping ones arc out to the side).
    for (const e of el) {
      const u = e.u, k = u * u * (3 - 2 * u), x0 = sx(e.from), y0 = sy(e.from), x1 = sx(e.s), y1 = sy(e.s);
      const bulge = u < 1 ? Math.sin(Math.PI * u) * lw * 0.18 * ((e.s & 1) ? 1 : -1) : 0;
      arrow(ctx, x0 + (x1 - x0) * k + bulge, y0 + (y1 - y0) * k, !(e.s & 1), as, e.s & 1 ? C.blue : C.gold);
    }

    // f(E): the smooth curve (solid), the T = 0 step (dashed), and the value at each level.
    const fx = f => px0 + f * pw;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px0, yt); ctx.lineTo(px0, yb); ctx.lineTo(px0 + pw, yb); ctx.stroke();
    for (const [f, s] of [[0, "0"], [0.5, "½"], [1, "1"]]) text(ctx, s, fx(f), yb + 13, { align: "center", color: C.muted, size: 10 });
    ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(fx(1), yb); ctx.lineTo(fx(1), yE(EF)); ctx.lineTo(fx(0), yE(EF)); ctx.lineTo(fx(0), yt); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const E = -0.5 + (NL * i) / 120, X = fx(fd(E, mu, kT)), Y = yE(E); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.stroke();
    ctx.fillStyle = C.ink;
    for (let j = 0; j < NL; j++) { ctx.beginPath(); ctx.arc(fx(fd(j, mu, kT)), yE(j), 2.8, 0, TAU); ctx.fill(); }
    // μ line.
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.globalAlpha = 0.8; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(lx - 3, yE(mu)); ctx.lineTo(px0 + pw, yE(mu)); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    text(ctx, "μ", px0 + pw + 5, yE(mu) + 4, { color: C.gold, size: fs, weight: 700 });

    // Legend under the ladder.
    const wide = w >= 420;
    text(ctx, wide ? "↑ spin up" : "↑ up", lx, yb + 16, { color: C.gold, size: fs });
    text(ctx, wide ? "↓ spin down" : "↓ down", lx + lw, yb + 16, { color: C.blue, size: fs, align: "right" });
    text(ctx, "shaded: within kT of μ", px0, yb + 30, { color: C.muted, size: 10 });

    let hot = 0;
    for (const e of el) if (e.s >> 1 > EF) hot++;
    info.textContent = `kT/E_F = ${x.toFixed(2)} · ${hot} of ${N} electrons above E_F · f = ½ exactly at E = μ · copper at room temperature: kT/E_F ≈ 0.004`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
