// Bohr (with Wheeler): the liquid-drop picture of fission. A neutron makes a U-235 "drop" wobble, neck and split; in a lattice the freed neutrons can start a chain.
import { C, canvas, controls, slider, button, toggle, loop, readout, text, clamp } from "./kit.js";

export const title = "Splitting the nucleus";
export const caption = "Bohr and Wheeler (1939) pictured the nucleus as a charged liquid drop. A slow neutron sets uranium-235 wobbling until it pinches in two, releasing about 200 MeV and two or three fresh neutrons. In the lattice, k is how many of those neutrons go on to cause another fission: below 1 the chain fizzles, at 1 it holds steady, above 1 it grows. Schematic, not to scale.";

const TAU = 2 * Math.PI, MEV = 200, COLS = 12, ROWS = 6, N = COLS * ROWS;
const FLY = 0.9, WOB = 1.5, NECK = 0.55, S = FLY + WOB + NECK, AFTER = 2.6; // seconds: neutron flight, wobble, necking, then fragments flying (S = the instant of scission)
const PAIRS = { 3: [["Ba-141", 141], ["Kr-92", 92]], 2: [["Xe-140", 140], ["Sr-94", 94]] }; // U-236 -> A + B + n neutrons: 236 − n = A + B
const rnd = Math.random, lerp = (a, b, u) => a + (b - a) * u;
const mix = (a, b, f) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(",")})`;
// 44 "nucleons" as points in a unit disc; the first 27 end up in the heavier fragment, the last 17 in the lighter one (ratio ≈ 141 : 92)
const NUC = Array.from({ length: 44 }, (_, i) => { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.82; return { x: Math.cos(a) * r, y: Math.sin(a) * r, p: rnd() * TAU, q: rnd() * TAU, f: 5 + rnd() * 5, pale: i % 2 === 0, B: i >= 27 }; });

// Outline of the drop for deformation e. e > 0: two overlapping circles pulled apart (the waist shrinks to nothing at e = 1, with the crotch rounded off); e < 0: squashed ellipse. Area stays constant.
function dropPath(ctx, R, e) {
  ctx.beginPath();
  if (e < 0) { const r = 1 + 0.6 * e; ctx.ellipse(0, 0, R * r, R / r, 0, 0, TAU); return { rho: R, d: 0, r }; }
  const q = Math.min(e, 0.999), a = Math.acos(q), rho = R * Math.sqrt(Math.PI / (TAU - 2 * a + 2 * q * Math.sqrt(1 - q * q))), d = q * rho; // rho from area conservation of the union of two circles
  const kk = 0.6 * rho * q * Math.sqrt(1 - q), n = 56;
  const prof = x => { // half-height of the outline at x: the taller of the two circles, plus a small fillet where they cross
    const u = Math.sqrt(Math.max(0, rho * rho - (x + d) ** 2)), v = Math.sqrt(Math.max(0, rho * rho - (x - d) ** 2)), t = Math.max(kk - Math.abs(u - v), 0);
    return Math.max(u, v) + (kk > 1e-6 ? (t * t) / (4 * kk) : 0);
  };
  for (let i = 0; i <= n; i++) { const x = -(d + rho) * Math.cos((Math.PI * i) / n); i ? ctx.lineTo(x, -prof(x)) : ctx.moveTo(x, -prof(x)); }
  for (let i = n; i >= 0; i--) ctx.lineTo(-(d + rho) * Math.cos((Math.PI * i) / n), prof(-(d + rho) * Math.cos((Math.PI * i) / n)));
  ctx.closePath();
  return { rho, d, r: 0 };
}

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A uranium nucleus drawn as a liquid drop. A neutron hits it, it wobbles, stretches into a dumbbell and splits into two fragments plus neutrons, releasing about 200 megaelectronvolts. In chain mode, a lattice of nuclei where released neutrons trigger further fissions, with a bar chart of fissions per generation." });
  const row = controls(root), info = readout(root);
  let chain = false, k = 1.2, clock = 0, one = mkOne(-0.8);
  const st = new Uint8Array(N), tm = new Float32Array(N), gn = new Uint8Array(N), fa = new Float32Array(N).fill(99), fang = new Float32Array(N), genCnt = new Int16Array(100);
  const neutrons = [];
  let gen = 0, fissions = 0, started = false, ended = false, endT = 0, endMsg = "";

  button(row, "Fire a neutron", () => { fire(); if (!lp.playing) { for (let i = 0; i < (chain ? 250 : 170); i++) step(0.02, false); lp.redraw(); } });
  toggle(row, "Chain reaction", false, on => { chain = on; kSl.disabled = !on; if (on) fire(); else one = mkOne(-0.5); lp.redraw(); });
  // ponytail: k is the mean number of neutrons per fission that go on to cause another one; the count per fission is floor(k) or floor(k)+1 (low variance), so the three regimes are easy to see
  const kSl = slider(row, { label: "Neutrons causing a fission (k)", min: 0.8, max: 1.2, step: 0.01, value: k, fmt: v => v.toFixed(2) }, v => { k = v; lp.redraw(); });
  kSl.disabled = true;

  function mkOne(t) { return { t, ang: (rnd() - 0.5) * 1.1 + (rnd() < 0.5 ? Math.PI : 0), nu: rnd() < 0.4 ? 3 : 2, nb: [rnd() * TAU, rnd() * TAU, rnd() * TAU], sp: [0.3 + rnd() * 0.15, 0.3 + rnd() * 0.15, 0.3 + rnd() * 0.15] }; }
  function fire() {
    if (!chain) { one = mkOne(0); return; }
    st.fill(0); tm.fill(0); gn.fill(0); fa.fill(99); genCnt.fill(0); neutrons.length = 0;
    gen = fissions = 0; started = true; ended = false; endT = 0;
    const r0 = (rnd() * ROWS) | 0, j = r0 * COLS;
    st[j] = 1;
    neutrons.push({ x0: -1.7, y0: r0, x1: 0, y1: r0, u: 0, dur: 0.5, target: j, gen: 1 });
  }
  // One nucleus splits: it frees 2 or 3 neutrons, of which floor(k) or floor(k)+1 are sent to nearby unspent nuclei; the rest leak away.
  function split(i) {
    st[i] = 3; fa[i] = 0; fang[i] = rnd() * TAU;
    const g = gn[i], c0 = i % COLS, r0 = (i / COLS) | 0, nu = rnd() < 0.4 ? 3 : 2;
    genCnt[g]++; fissions++; gen = Math.max(gen, g);
    const fl = Math.floor(k + 1e-9), m = Math.min(nu, fl + (rnd() < k - fl ? 1 : 0)), cand = [];
    for (let j = 0; j < N; j++) if (st[j] === 0) { const d = Math.hypot((j % COLS) - c0, ((j / COLS) | 0) - r0); if (d < 3.3) cand.push([d + rnd() * 0.9, j, d]); }
    cand.sort((a, b) => a[0] - b[0]);
    for (let n = 0; n < nu; n++) {
      if (n < m && cand.length) {
        const [, j, d] = cand.shift();
        st[j] = 1;
        neutrons.push({ x0: c0, y0: r0, x1: j % COLS, y1: (j / COLS) | 0, u: 0, dur: Math.max(0.14, d / 8), target: j, gen: g + 1 });
      } else { const a = rnd() * TAU, d = 2 + rnd() * 1.5; neutrons.push({ x0: c0, y0: r0, x1: c0 + Math.cos(a) * d, y1: r0 + Math.sin(a) * d, u: 0, dur: 0.6, target: -1, gen: g + 1 }); }
    }
  }

  function step(dt, auto = true) {
    if (!dt) return;
    clock += dt;
    if (!chain) { one.t += dt; if (auto && one.t > S + AFTER + 0.8) fire(); return; }
    for (let i = 0; i < N; i++) {
      if (st[i] === 2) { if ((tm[i] -= dt) <= 0) split(i); } else if (st[i] === 3) fa[i] += dt;
    }
    let keep = 0;
    for (const n of neutrons) {
      n.u += dt / n.dur;
      if (n.u < 1) neutrons[keep++] = n;
      else if (n.target >= 0) { st[n.target] = 2; tm[n.target] = 0.18; gn[n.target] = n.gen; }
    }
    neutrons.length = keep;
    let busy = keep > 0;
    for (let i = 0; i < N; i++) if (st[i] === 1 || st[i] === 2) busy = true;
    if (started && !ended && !busy) { ended = true; endT = 0; let left = 0; for (let i = 0; i < N; i++) if (st[i] === 0) left++; endMsg = left ? "The chain fizzled out" : "All the fuel is used up"; }
    if (ended) { endT += dt; if (auto && endT > 3.2) fire(); }
  }

  // deformation of the drop at time t (see dropPath)
  function eOf(t) {
    if (t < FLY) return 0.03 * Math.sin(clock * 9);
    if (t < FLY + WOB) { const u = (t - FLY) / WOB; return (0.06 + 0.4 * u ** 1.6) * Math.sin(TAU * 2.25 * u); } // wobbling with growing amplitude, ending on a stretched peak (e = 0.46)
    const v = (t - FLY - WOB) / NECK;
    return 0.46 + 0.54 * v * v; // the neck pinches off faster and faster
  }

  function drawOne(ctx, w, h) {
    const t = one.t, R = Math.min(w * 0.13, h * 0.22), cx = w * 0.5, cy = h * 0.47, [A, B] = PAIRS[one.nu], nr = Math.max(1.5, R * 0.055);
    const stage = t < 0 ? "U-235 nucleus, pictured as a liquid drop" : t < FLY ? "1 · a slow neutron approaches" : t < FLY + WOB ? "2 · captured: U-236 wobbles and stretches" : t < S ? "3 · a neck forms and thins" : `4 · it splits: ${A[0]} + ${B[0]} + ${one.nu} neutrons`;
    text(ctx, stage, 8, 17, { color: C.gold, size: 12, weight: 600 });

    if (t >= 0 && t < FLY) { // the incoming neutron
      const x0 = w * 0.05, x1 = cx - R * 1.04, nx = lerp(x0, x1, t / FLY);
      ctx.strokeStyle = "rgba(79,168,255,0.45)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(Math.max(x0, nx - 28), cy); ctx.lineTo(nx, cy); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(nx, cy, 4.5, 0, TAU); ctx.fill();
      text(ctx, "neutron", clamp(nx, 28, w), cy - 11, { color: C.blue, size: 10, align: "center" });
    }

    if (t < S) { // the drop
      const e = eOf(t), heat = clamp((t - FLY) / (WOB + NECK), 0, 1);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(one.ang);
      const sh = dropPath(ctx, R, e);
      const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R * 1.4);
      g.addColorStop(0, "#f6e3b4"); g.addColorStop(0.55, "#e3c27f"); g.addColorStop(1, "#a07c36");
      ctx.fillStyle = g; ctx.fill();
      if (heat > 0) { ctx.fillStyle = `rgba(255,110,60,${0.38 * heat})`; ctx.fill(); }
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
      const amp = 0.04 + 0.1 * heat;
      for (const n of NUC) { // nucleons jostling inside; they sit in the lobe on their own side
        let px = (n.B ? sh.d : -sh.d) + sh.rho * (n.x + Math.sin(clock * n.f + n.p) * amp), py = sh.rho * (n.y + Math.sin(clock * n.f * 1.3 + n.q) * amp);
        if (sh.r) { px *= sh.r; py /= sh.r; }
        ctx.fillStyle = n.pale ? "rgba(255,248,225,0.8)" : "rgba(120,70,20,0.75)";
        ctx.beginPath(); ctx.arc(px, py, nr, 0, TAU); ctx.fill();
      }
      ctx.restore();
      text(ctx, t < FLY ? "U-235" : "U-236*", cx, cy + R * 1.45 + 6, { color: t < FLY ? C.muted : C.gold, size: 11, align: "center" });
      if (t >= FLY && t < FLY + 0.5) { const u = (t - FLY) / 0.5; ctx.strokeStyle = `rgba(255,236,170,${1 - u})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx - R, cy, 4 + R * 0.9 * u, 0, TAU); ctx.stroke(); }
    } else { // two fragments, thrown apart by their electric repulsion; the lighter one moves faster (equal and opposite momentum)
      const tau = t - S, kk = Math.min(1, tau / 0.2), f = 1 - Math.exp(-tau / 0.3), hot = Math.max(0, 1 - tau / 2), fade = clamp((AFTER - tau) / 0.7, 0, 1);
      const mA = A[1], mB = B[1], M = mA + mB, rA = R * Math.sqrt(mA / 236), rB = R * Math.sqrt(mB / 236), r0 = R * 0.7071, L = Math.min(w * 0.34, h * 0.3);
      const xA = lerp(-r0, -((rA + rB) * mB) / M, kk) - L * f * (mB / M), xB = lerp(r0, ((rA + rB) * mA) / M, kk) + L * f * (mA / M);
      ctx.globalAlpha = fade;
      // a flash at the moment of scission
      if (tau < 0.35) { ctx.strokeStyle = `rgba(255,240,200,${1 - tau / 0.35})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 8 + 70 * tau, 0, TAU); ctx.stroke(); }
      for (const [x, rad, isB, nm] of [[xA, lerp(r0, rA, kk), false, A[0]], [xB, lerp(r0, rB, kk), true, B[0]]]) {
        const fx = cx + Math.cos(one.ang) * x, fy = cy + Math.sin(one.ang) * x;
        const gl = ctx.createRadialGradient(fx, fy, rad * 0.5, fx, fy, rad * 2);
        gl.addColorStop(0, `rgba(255,160,70,${0.55 * hot})`); gl.addColorStop(1, "rgba(255,160,70,0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(fx, fy, rad * 2, 0, TAU); ctx.fill();
        const g = ctx.createRadialGradient(fx - rad * 0.3, fy - rad * 0.35, rad * 0.1, fx, fy, rad * 1.3);
        g.addColorStop(0, mix([246, 227, 180], [255, 245, 210], hot)); g.addColorStop(0.6, mix([227, 194, 127], [255, 160, 80], hot)); g.addColorStop(1, mix([160, 124, 54], [210, 70, 40], hot));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, rad, 0, TAU); ctx.fill();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
        for (const n of NUC) if (n.B === isB) {
          ctx.fillStyle = n.pale ? "rgba(255,248,225,0.8)" : "rgba(120,70,20,0.75)";
          ctx.beginPath(); ctx.arc(fx + rad * (n.x + Math.sin(clock * n.f + n.p) * 0.06), fy + rad * (n.y + Math.sin(clock * n.f * 1.3 + n.q) * 0.06), nr, 0, TAU); ctx.fill();
        }
        text(ctx, nm, clamp(fx, 30, w - 30), clamp(fy - rad - 7, 32, h * 0.8), { color: C.ink, size: 11, align: "center", weight: 600 });
      }
      for (let i = 0; i < one.nu; i++) { // the new neutrons
        const a = one.nb[i], d = tau * one.sp[i] * h, al = clamp(1 - tau / 1.4, 0, 1) * fade, ux = Math.cos(a), uy = Math.sin(a);
        if (al <= 0) continue;
        ctx.strokeStyle = `rgba(79,168,255,${0.45 * al})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx + ux * Math.max(0, d - 24), cy + uy * Math.max(0, d - 24)); ctx.lineTo(cx + ux * d, cy + uy * d); ctx.stroke();
        ctx.fillStyle = `rgba(79,168,255,${al})`; ctx.beginPath(); ctx.arc(cx + ux * d, cy + uy * d, 4, 0, TAU); ctx.fill();
        if (i === 0 && tau > 0.45) text(ctx, "neutrons", clamp(cx + ux * d, 30, w - 30), clamp(cy + uy * d - 9, 30, h * 0.8), { color: `rgba(79,168,255,${al})`, size: 10, align: "center" });
      }
      ctx.globalAlpha = 1;
    }

    // energy released
    const frac = t >= S ? Math.min(1, (t - S) / 0.5) : 0, bx = w * 0.06, bw = w * 0.88, by = h * 0.9;
    text(ctx, `energy released: ${Math.round(frac * MEV)} MeV`, bx, by - 6, { color: frac ? C.gold : C.muted, size: 10 });
    text(ctx, "burning a carbon atom: ~4 eV", bx + bw, by - 6, { color: C.muted, size: 10, align: "right" });
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 7);
    ctx.fillStyle = C.gold; ctx.fillRect(bx + 1, by + 1, (bw - 2) * frac, 6);
  }

  function drawChain(ctx, w, h) {
    const cell = Math.min((w * 0.9) / COLS, (h * 0.5) / ROWS), ox = (w - cell * COLS) / 2, oy = h * 0.12 + (h * 0.5 - cell * ROWS) / 2;
    const PX = c => ox + (c + 0.5) * cell, PY = r => oy + (r + 0.5) * cell, rn = cell * 0.3;
    text(ctx, `Chain reaction · k = ${k.toFixed(2)}`, 8, 17, { color: C.gold, size: 12, weight: 600 });
    for (let i = 0; i < N; i++) {
      const x = PX(i % COLS), y = PY((i / COLS) | 0), s = st[i];
      if (s === 3) { // spent: two fragments fly apart and cool
        const age = fa[i], hot = clamp(1 - age / 3, 0, 1), sp = cell * 0.28 * Math.min(1, age / 0.35), ca = Math.cos(fang[i]), sa = Math.sin(fang[i]);
        if (age < 0.45) { ctx.strokeStyle = `rgba(255,240,200,${0.9 * (1 - age / 0.45)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, cell * (0.3 + 0.9 * (age / 0.45)), 0, TAU); ctx.stroke(); }
        ctx.fillStyle = `rgba(255,${Math.round(100 + 110 * hot)},${Math.round(50 + 60 * hot)},${0.35 + 0.65 * hot})`;
        ctx.beginPath(); ctx.moveTo(x + ca * sp + cell * 0.13, y + sa * sp); ctx.arc(x + ca * sp, y + sa * sp, cell * 0.13, 0, TAU);
        ctx.moveTo(x - ca * sp + cell * 0.13, y - sa * sp); ctx.arc(x - ca * sp, y - sa * sp, cell * 0.13, 0, TAU); ctx.fill();
      } else {
        const ex = s === 2, jx = ex ? Math.sin(clock * 70 + i) * cell * 0.05 : 0, jy = ex ? Math.cos(clock * 63 + i * 2) * cell * 0.05 : 0, rr = ex ? rn * 1.2 : rn;
        ctx.fillStyle = ex ? "#fff1c0" : C.gold; ctx.beginPath(); ctx.arc(x + jx, y + jy, rr, 0, TAU); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.arc(x + jx - rr * 0.3, y + jy - rr * 0.3, rr * 0.3, 0, TAU); ctx.fill();
        if (ex) { ctx.strokeStyle = "rgba(255,110,60,0.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, rr + 3, 0, TAU); ctx.stroke(); }
      }
    }
    for (const n of neutrons) {
      const x0 = PX(n.x0), y0 = PY(n.y0), x1 = PX(n.x1), y1 = PY(n.y1), u = n.u, al = n.target >= 0 ? 1 : 1 - u, hx = lerp(x0, x1, u), hy = lerp(y0, y1, u), u2 = Math.max(0, u - 0.3);
      ctx.strokeStyle = `rgba(79,168,255,${0.5 * al})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, u2), lerp(y0, y1, u2)); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = `rgba(79,168,255,${al})`; ctx.beginPath(); ctx.arc(hx, hy, Math.max(2.2, cell * 0.1), 0, TAU); ctx.fill();
    }
    let lx = ox; const ly = oy + ROWS * cell + 13;
    for (const [col, s] of [[C.gold, "fuel (U-235)"], [C.blue, "neutron"], ["#e08a50", "spent"]]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx + 4, ly - 3, 3.5, 0, TAU); ctx.fill();
      text(ctx, s, lx + 11, ly, { color: C.muted, size: 10 });
      lx += 11 + ctx.measureText(s).width + 14;
    }
    if (ended) {
      const bw = endMsg.length * 7.8 + 28, by = oy + (ROWS * cell) / 2;
      ctx.fillStyle = "rgba(15,13,11,0.85)"; ctx.fillRect(w / 2 - bw / 2, by - 16, bw, 32);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(w / 2 - bw / 2 + 0.5, by - 15.5, bw - 1, 31);
      text(ctx, endMsg, w / 2, by + 5, { align: "center", size: 13, weight: 600 });
    }
    // fissions per generation, bars; ticks mark the expected k^(g−1)
    const cr = { x: w * 0.1, y: h * 0.78, w: w * 0.86, h: h * 0.12 }, nG = Math.max(12, gen + 1), bw2 = cr.w / nG;
    let mx = 3; for (let g = 1; g <= gen; g++) mx = Math.max(mx, genCnt[g]);
    const ymax = mx * 1.1;
    text(ctx, "fissions per generation", cr.x, cr.y - 7, { color: C.muted, size: 10 });
    text(ctx, "ticks: expected k^(g−1)", cr.x + cr.w, cr.y - 7, { color: C.muted, size: 10, align: "right" });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cr.x, cr.y); ctx.lineTo(cr.x, cr.y + cr.h); ctx.lineTo(cr.x + cr.w, cr.y + cr.h); ctx.stroke();
    text(ctx, mx, cr.x - 5, cr.y + 8, { color: C.muted, size: 10, align: "right" });
    text(ctx, "0", cr.x - 5, cr.y + cr.h, { color: C.muted, size: 10, align: "right" });
    ctx.fillStyle = C.gold;
    for (let g = 1; g <= gen; g++) { const bh = (genCnt[g] / ymax) * cr.h; ctx.fillRect(cr.x + (g - 1) * bw2 + 1, cr.y + cr.h - bh, Math.max(1, bw2 - 2), bh); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let g = 1; g <= gen; g++) if (k ** (g - 1) <= ymax) { const y = cr.y + cr.h - (k ** (g - 1) / ymax) * cr.h; ctx.moveTo(cr.x + (g - 1) * bw2 + 1, y); ctx.lineTo(cr.x + g * bw2 - 1, y); }
    ctx.stroke();
    text(ctx, "generation", cr.x + cr.w, cr.y + cr.h + 13, { color: C.muted, size: 10, align: "right" });
    text(ctx, "1", cr.x + bw2 / 2, cr.y + cr.h + 13, { color: C.muted, size: 10, align: "center" });
  }

  function draw(dt) {
    step(dt);
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);
    if (chain) drawChain(ctx, w, h); else drawOne(ctx, w, h);
    const f = chain ? fissions : one.t >= S ? 1 : 0, g = chain ? gen : one.t >= FLY ? 1 : 0;
    info.textContent = `Generation ${g} · fissions ${f} · energy released ${(f * MEV).toLocaleString("en-US")} MeV${chain ? ` · k = ${k.toFixed(2)}` : ""}`;
  }

  const lp = loop(row, (t, dt) => draw(dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
