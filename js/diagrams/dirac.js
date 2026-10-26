// Dirac: hole theory. A photon lifts an electron out of the negative-energy sea; the hole it leaves is a positron.
import { C, canvas, controls, slider, button, loop, readout, text, clamp } from "./kit.js";

export const title = "Antimatter from the sea";
export const caption = "Dirac's equation allowed electrons of negative energy. Picture every such state filled: an unseen sea. A photon above 1.022 MeV can lift one electron out, and the hole it leaves acts as a positron, with the electron's mass and opposite charge. A nearby nucleus absorbs the recoil. When the pair meets, two 511 keV photons fly apart, the signal a PET scanner reads. Track sizes are not to scale.";

const MC2 = 0.511, GAP = 2 * MC2;   // electron rest energy and the forbidden gap (MeV)
const T_FLY = 0.9, TRACK = 1.7;     // seconds: photon in flight, then the pair's tracks draw out
const TAU = 2 * Math.PI;
const lerp = (a, b, u) => a + (b - a) * u;
const ease = u => u * u * (3 - 2 * u);
const easeOut = u => 1 - (1 - u) ** 2;
const P = { x: 0, y: 0 }, G = { r0: 0, S: 0 };

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

// Track geometry for a pair that shares `ke` MeV each: path length S and starting radius r0, in design px (a 600 px canvas).
// ponytail: radii are in arbitrary B-field units (r ∝ p), and the radius shrinks linearly to stand in for energy loss.
function geom(ke) { G.r0 = 10 + 52 * Math.sqrt(ke * (ke + GAP)); G.S = 30 + 190 * Math.sqrt(ke); }
// Walk a spiral track (sgn +1 curls down: the electron; −1 curls up: the positron) for arc length sEnd.
// Ends at offset (P.x, P.y) in design px; if ctx is given the path is stroked, scaled by k, from (ox, oy).
function walk(sgn, sEnd, ctx, ox, oy, k) {
  const { r0, S } = G, ds = clamp(0.15 * r0, 0.8, 2.5);
  let x = 0, y = 0, s = 0;
  if (ctx) { ctx.beginPath(); ctx.moveTo(ox, oy); }
  while (s < sEnd) {
    const step = Math.min(ds, sEnd - s), th = (-S / (0.85 * r0)) * Math.log(1 - (0.85 * Math.min(s + step / 2, S)) / S);
    x += Math.cos(sgn * th) * step; y += Math.sin(sgn * th) * step; s += step;
    if (ctx) ctx.lineTo(ox + x * k, oy + y * k);
  }
  if (ctx) ctx.stroke();
  P.x = x; P.y = y;
}

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Left: energy levels with a filled negative-energy sea, a forbidden gap and free electron states. Right: a nucleus in a magnetic field, where a photon creates an electron and a positron that curl in opposite directions." });
  const row = controls(root), info = readout(root);
  let E = 2, mode = "idle", t = 0, fE = 2, ke = 0, u0 = 1, ang = 0, auto = true, wait = 0, note = 0;
  const take = () => (auto = false);
  slider(row, { label: "Photon energy", min: 0.5, max: 3, step: 0.01, value: E, fmt: v => `${v.toFixed(2)} MeV` }, v => { E = v; take(); lp.redraw(); });
  button(row, "Fire photon", () => { take(); fire(); if (!lp.playing) { step(T_FLY + (mode === "fly" ? TRACK + 0.3 : 0.6)); lp.redraw(); } });
  button(row, "Annihilate", () => { take(); annihilate(); if (!lp.playing) { step(2.1); lp.redraw(); } });
  const lp = loop(row, (_, dt) => draw(dt));

  // ponytail: the spare kinetic energy is split equally between e⁻ and e⁺ (in reality the nucleus's recoil makes the split uneven)
  function fire() { fE = E; ke = Math.max(0, (E - GAP) / 2); mode = E >= GAP ? "fly" : "fail"; t = 0; note = 0; }
  function annihilate() {
    if (mode !== "pair") { note = 2.5; return; }
    u0 = clamp(t / TRACK, 0, 1); ang = (Math.random() - 0.5) * 1.2; mode = "ann"; t = 0;
  }
  function step(dt) {
    t += dt; note = Math.max(0, note - dt);
    if (mode === "fly" && t >= T_FLY) { mode = "pair"; t -= T_FLY; }
    else if ((mode === "fail" && t > 2.6) || (mode === "ann" && t > 3.4)) { mode = "idle"; t = 0; }
    if (auto) { // a short demo loop until the user touches a control
      if (mode === "idle") { if ((wait += dt) > 0.8) { wait = 0; fire(); } }
      else if (mode === "pair" && t > TRACK + 1.4) annihilate();
    }
  }
  const status = () => {
    if (note > 0) return "No pair yet: fire a photon of at least 1.022 MeV first.";
    if (mode === "fail" && t > T_FLY) return "Not enough energy: pair creation needs 1.022 MeV.";
    if (mode === "pair") return `Pair created: each particle gets ${ke.toFixed(2)} MeV of kinetic energy. A nearby nucleus takes the recoil.`;
    if (mode === "ann") return t < 0.8 ? "The positron slows down and meets an electron..." : "Annihilation: two 511 keV photons fly apart back to back.";
    return `Photon ${E.toFixed(2)} MeV, threshold 1.022 MeV` + (E >= GAP ? `: ${(E - GAP).toFixed(2)} MeV left over as kinetic energy.` : ": too weak.");
  };

  function draw(dt) {
    step(dt);
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13);
    const L = { x: w * 0.14, y: h * 0.12, w: w * 0.34, h: h * 0.7 };          // energy panel
    const R = { x: w * 0.54, y: L.y, w: w * 0.44, h: L.h };                    // space panel
    const yE = e => L.y + L.h / 2 - (e / 1.75) * (L.h / 2);
    const dx = clamp(L.w / 8, 15, 28), xc = L.x + 1.5 * dx;                     // sea dot spacing, and the column we pick from
    const k2 = R.w / 264, nx = R.x + R.w * 0.28, ny = R.y + R.h / 2;
    const idle = mode === "idle", eF = idle ? E : fE, keF = idle ? Math.max(0, (E - GAP) / 2) : ke;
    const yS = yE(-(MC2 + (eF >= GAP ? keF : 0.1)));                            // where the target electron sits in the sea
    const disc = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
    const electron = y => { disc(xc, y, 5, C.blue); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(xc, y, 5, 0, TAU); ctx.stroke(); };
    const seaDisc = (y, r) => { disc(xc, y, r, C.bg); disc(xc, y, r, "rgba(79,168,255,0.16)"); };
    const tag = (s2, x, y, col) => { ctx.fillStyle = "rgba(15,13,11,0.7)"; ctx.fillRect(x - 2, y - fs + 1, s2.length * fs * 0.56 + 4, fs + 3); text(ctx, s2, x, y, { color: col, size: fs, weight: 700 }); };
    const hole = (y, a) => { seaDisc(y, 7); ctx.globalAlpha = a; ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xc, y, 4.5, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; };

    text(ctx, "Energy (MeV)", L.x + L.w / 2, h * 0.075, { align: "center", color: C.muted, size: fs });
    text(ctx, "Seen in space", R.x + R.w / 2, h * 0.075, { align: "center", color: C.muted, size: fs });

    // ── Energy levels ──
    ctx.fillStyle = "rgba(79,168,255,0.07)"; ctx.fillRect(L.x, L.y, L.w, yE(MC2) - L.y);
    ctx.fillStyle = "rgba(79,168,255,0.16)"; ctx.fillRect(L.x, yE(-MC2), L.w, L.y + L.h - yE(-MC2));
    ctx.fillStyle = "rgba(79,168,255,0.85)"; ctx.beginPath();
    for (let y = yE(-MC2) + 8; y < L.y + L.h - fs - 8; y += 11) for (let x = L.x + dx / 2; x < L.x + L.w - 5; x += dx) { ctx.moveTo(x + 2.5, y); ctx.arc(x, y, 2.5, 0, TAU); }
    ctx.fill();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); for (const e of [MC2, -MC2]) { ctx.moveTo(L.x, yE(e)); ctx.lineTo(L.x + L.w, yE(e)); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.line; ctx.strokeRect(L.x, L.y, L.w, L.h);
    for (const [s, e] of [["+0.511", MC2], ["0", 0], ["−0.511", -MC2]]) text(ctx, s, L.x - 5, yE(e) + 3.5, { align: "right", color: C.muted, size: fs - 1 < 10 ? 10 : fs - 1 });
    ctx.globalAlpha = idle ? 1 : 0.5;
    text(ctx, L.w > 180 ? "free electron states" : "free states", L.x + L.w - 4, L.y + fs + 3, { align: "right", color: C.muted, size: fs });
    text(ctx, "forbidden gap", L.x + L.w - 4, yE(0) - 1, { align: "right", color: C.muted, size: fs });
    text(ctx, "2mc² = 1.022", L.x + L.w - 4, yE(0) + fs + 1, { align: "right", color: C.muted, size: fs });
    if (idle) text(ctx, L.w > 180 ? "negative-energy sea" : "filled sea", L.x + L.w - 4, L.y + L.h - 5, { align: "right", color: C.blue, size: fs });
    ctx.globalAlpha = 1;

    ctx.save(); ctx.beginPath(); ctx.rect(L.x, L.y, L.w, L.h); ctx.clip();
    const photonE = (mode === "fly" || mode === "fail") && t < T_FLY;
    if (idle || photonE) { seaDisc(yS, 6); electron(yS); }
    if (idle) { // preview: how far this photon would lift the electron
      const top = yS - E * (L.h / 3.5);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(xc - 13, yS); ctx.lineTo(xc - 13, top); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(xc, top, 5, 0, TAU); ctx.strokeStyle = E >= GAP ? C.blue : C.red; ctx.stroke(); ctx.globalAlpha = 1;
      if (E < GAP) text(ctx, "✕", xc + 10, top + 5, { color: C.red, size: fs + 3, weight: 700 });
    }
    if (photonE) {
      const d = (t / T_FLY) * (xc - 8 - L.x);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; train(ctx, L.x, yS, 0, Math.max(0, d - 40), d, 10, 3.5);
    } else if (mode === "fail") {
      const hu = clamp((t - T_FLY) / 0.8, 0, 1), y = yS - eF * (L.h / 3.5) * 0.97 * Math.sin(Math.PI * hu);
      if (hu < 1) hole(yS, 0.45);
      electron(y);
      if (hu > 0.25 && hu < 0.8) text(ctx, "✕", xc + 10, y + 5, { color: C.red, size: fs + 3, weight: 700 });
    } else if (mode === "pair") {
      const lift = ease(clamp(t / 0.9, 0, 1)), y = lerp(yS, yE(MC2 + keF), lift);
      hole(yS, 1);
      if (yS - y > 8) { // the photon's energy, drawn as the height the electron climbs
        ctx.strokeStyle = C.gold; ctx.fillStyle = C.gold; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(xc - 13, yS); ctx.lineTo(xc - 13, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xc - 13, y - 1); ctx.lineTo(xc - 17, y + 6); ctx.lineTo(xc - 9, y + 6); ctx.closePath(); ctx.fill();
      }
      electron(y);
      if (lift > 0.6) {
        tag("e⁻", xc + 9, y + 4, C.blue);
        tag("hole = e⁺", xc + 9, yS + 4, C.red);
      }
    } else if (mode === "ann") {
      const a = ease(clamp(t / 0.8, 0, 1)), f = ease(clamp((t - 0.8) / 0.55, 0, 1)), top = lerp(MC2 + keF, MC2, a);
      const yh = yE(-MC2);
      if (f < 1) hole(yE(-top), 1);
      electron(f > 0 ? lerp(yE(MC2), yh, f) : yE(top));
      if (t > 1.35) {
        const d = 70 * (t - 1.35); ctx.globalAlpha = clamp(1 - (t - 1.35) / 1.8, 0, 1);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        train(ctx, xc, yh, 0, Math.max(0, d - 28), d, 10, 3.5); train(ctx, xc, yh, Math.PI, Math.max(0, d - 28), d, 10, 3.5);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();

    // ── Space: nucleus, magnetic field, tracks ──
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(R.x, R.y, R.w, R.h);
    const g = Math.max(14, 30 * k2);
    ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.beginPath();
    for (let x = R.x + g / 2; x < R.x + R.w; x += g) for (let y = R.y + g / 2; y < R.y + R.h; y += g) { ctx.moveTo(x - 2.2, y - 2.2); ctx.lineTo(x + 2.2, y + 2.2); ctx.moveTo(x + 2.2, y - 2.2); ctx.lineTo(x - 2.2, y + 2.2); }
    ctx.stroke();
    text(ctx, "× B into page", R.x + 5, R.y + fs + 2, { color: C.muted, size: fs });
    ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
    const nr = Math.max(4, 5 * k2);
    disc(nx, ny, nr, C.violet);
    if (idle || mode === "fly" || mode === "fail") text(ctx, "nucleus", nx, ny + nr + fs + 2, { align: "center", color: C.violet, size: fs });
    // ponytail: photon wavelength is drawn shorter for higher energy, but the scale is for show
    const wl = clamp((30 * k2) / eF, 7, 44 * k2), plen = 46 * k2;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
    if (mode === "fly" || mode === "fail") {
      const hx = R.x + (nx - R.x) * (t / T_FLY); // when too weak the photon just sails on past the nucleus
      ctx.globalAlpha = mode === "fail" ? clamp(1 - (t - T_FLY) / 1.4, 0, 1) : 1;
      train(ctx, R.x, ny, 0, Math.max(0, hx - R.x - plen), hx - R.x, wl, 5 * k2);
      ctx.globalAlpha = 1;
    }
    if (mode === "pair" || mode === "ann") {
      geom(ke);
      const faded = mode === "ann", u = faded ? u0 : clamp(t / TRACK, 0, 1), s = G.S * easeOut(u);
      if (mode === "pair" && t < 0.5) { // flash at the nucleus as the pair appears
        const fr = Math.max(1, (4 + 30 * k2 * (t / 0.5)) * 1), gr = ctx.createRadialGradient(nx, ny, 0, nx, ny, fr);
        gr.addColorStop(0, `rgba(255,214,120,${1 - t / 0.5})`); gr.addColorStop(1, "rgba(255,214,120,0)");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(nx, ny, fr, 0, TAU); ctx.fill();
      }
      const a = faded ? ease(clamp(t / 0.8, 0, 1)) : 0;
      for (const [sgn, col, lab] of [[1, C.blue, "e⁻"], [-1, C.red, "e⁺"]]) {
        ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.globalAlpha = faded ? 0.3 : 1;
        walk(sgn, s, ctx, nx, ny, k2);
        ctx.globalAlpha = 1;
        const hx = nx + P.x * k2, hy = ny + P.y * k2 * (1 - a);
        if (!faded || t < 0.85) {
          disc(hx, hy, Math.max(3.5, 4 * k2), col);
          text(ctx, lab, hx + 7, hy + (sgn > 0 ? 12 : -5), { color: col, size: fs, weight: 700 });
        }
        if (sgn > 0 && faded && t >= 0.8) { // meeting point
          const mx = hx, dt2 = t - 0.8, fr = Math.max(1, 6 + 30 * k2 * Math.min(1, dt2 / 0.5));
          const gr = ctx.createRadialGradient(mx, ny, 0, mx, ny, fr);
          gr.addColorStop(0, `rgba(255,255,255,${clamp(1 - dt2 / 0.5, 0, 1)})`); gr.addColorStop(1, "rgba(255,214,120,0)");
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(mx, ny, fr, 0, TAU); ctx.fill();
          const d = 170 * k2 * dt2; ctx.globalAlpha = clamp(1 - dt2 / 2.2, 0, 1);
          ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
          for (const a2 of [ang, ang + Math.PI]) train(ctx, mx, ny, a2, Math.max(0, d - 40 * k2), d, 9 * k2 + 3, 4 * k2 + 1);
          ctx.globalAlpha = 1;
        }
      }
      if (mode === "ann" && t >= 0.8) text(ctx, "2 × 511 keV photons", R.x + R.w / 2, R.y + R.h - 5, { align: "center", color: C.gold, size: fs });
    }
    ctx.restore();

    // ── Legend ──
    let lx = L.x - 10;
    for (const [col, s] of [[C.blue, "e⁻ electron"], [C.red, "e⁺ positron"], [C.gold, "γ photon"]]) {
      disc(lx + 4, h * 0.935, 4, col);
      text(ctx, s, lx + 12, h * 0.935 + 4, { color: C.muted, size: fs });
      lx += 12 + s.length * fs * 0.56 + 12;
    }
    info.textContent = status();
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
