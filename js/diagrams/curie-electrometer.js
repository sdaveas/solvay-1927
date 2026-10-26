// Curie: an ionisation chamber. Rays from a sample ionise the air; the freed charges cross the gap and a meter needle shows the current.
import { C, canvas, controls, button, loop, readout, text, map, clamp } from "./kit.js";

export const title = "Measuring radioactivity";
export const caption = "Radiation ionises the air in this chamber; the freed charges cross the gap and the meter needle shows the current. Uranium metal and uranium oxide read alike for the same uranium, so radioactivity belongs to the atom, not its chemistry. Thorium radiates too. Pitchblende reads higher than its uranium explains, a clue to new elements. Readings are illustrative.";

const TAU = 2 * Math.PI, rnd = Math.random;
const RATE = 9, PAIRS = 4, SPEED = 420, TM = 1.4, SCALE = 3.6; // rays per second at reading 1, ion pairs per ray, ray speed (px/s), meter time constant (s), dial full scale
const TYPES = [{ col: C.gold, name: "uranium" }, { col: "#8d949c", name: "oxygen" }, { col: C.violet, name: "thorium" }, { col: C.pink, name: "unknown" }];
// ponytail: the readings are qualitative, not measurements. Relative to uranium metal = 1: oxide the same (same uranium), thorium lower, pitchblende several times higher.
// cells(i): which atom sits in cell i (0..31) of the picture; src(): which kind of atom a ray comes from.
const SAMPLES = [
  { name: "Uranium metal", A: 1, note: "uranium metal: the reference reading", lump: ["#6a727b", "#c9d1da"], cells: () => 0, src: () => 0 },
  { name: "Uranium oxide", A: 1, note: "same uranium, different chemistry: same reading", lump: ["#2c3629", "#5d7650"], cells: i => (i % 11 < 3 ? 0 : 1), src: () => 0 },
  { name: "Thorium", A: 0.6, note: "thorium radiates too", lump: ["#85838f", "#d0cde0"], cells: () => 2, src: () => 2 },
  { name: "Pitchblende", A: 3, note: "more than its uranium explains: new elements?", lump: ["#25221e", "#7a6650"], cells: i => (i === 7 || i === 17 || i === 26 ? 3 : i % 4 === 0 ? 0 : 1), src: () => (rnd() < 1 / 3 ? 0 : 3) },
];
for (const s of SAMPLES) {
  s.types = Array.from({ length: 32 }, (_, i) => s.cells(i));
  s.legend = [...new Set(s.types)].sort();
  s.idx = TYPES.map((_, t) => s.types.flatMap((v, i) => (v === t ? [i] : [])));
}
const specks = Array.from({ length: 40 }, () => ({ u: rnd(), v: rnd(), p: rnd() * TAU, f: 0.6 + rnd() * 1.2 }));

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "An ionisation chamber: a radioactive sample sits on the lower plate and fires rays through the air; each ray leaves pairs of positive and negative ions that drift to the plates, and the charge flows along a wire to a meter whose needle shows the current. A panel shows the atoms inside the chosen sample." });
  const row = controls(root), info = readout(root);
  let si = 0, cur = RATE * PAIRS * SAMPLES[0].A, mean = cur, events = 0, nextRay = 0.4, clock = 0, glow = 0;
  const rays = [], ions = [], packets = [], flash = new Float32Array(32), btns = [];

  SAMPLES.forEach((s, i) => btns.push(button(row, s.name, () => { si = i; nextRay = 0.2; mark(); lp.redraw(); })));
  const mark = () => btns.forEach((b, i) => { if (b.style) { b.style.borderColor = i === si ? C.gold : ""; b.style.color = i === si ? C.gold : ""; } });
  mark();

  function geo() {
    const { w, h } = cv, bw = w * 0.55, bx = w * 0.05, topY = h * 0.25, botY = h * 0.66, rD = Math.min(w * 0.14, h * 0.26);
    return { w, h, bx, bw, by: h * 0.14, bh: h * 0.68, topY, botY, gap: botY - topY, px0: bx + bw * 0.05, px1: bx + bw * 0.95, sx: bx + bw / 2, lumpW: bw * 0.2, lumpH: bw * 0.2 * 0.38, dcx: w * 0.82, dcy: h * 0.48, rD };
  }
  function emit() {
    const g = geo(), s = SAMPLES[si];
    const x0 = g.sx + (rnd() - 0.5) * g.lumpW * 0.7, y0 = g.botY - g.lumpH * (0.6 + 0.3 * rnd());
    const a = Math.PI * (0.1 + 0.8 * rnd()), dx = Math.cos(a), dy = -Math.sin(a);
    let L = g.gap * (0.55 + 0.4 * rnd());
    if (dx > 0.01) L = Math.min(L, (g.bx + g.bw - 4 - x0) / dx); else if (dx < -0.01) L = Math.min(L, (x0 - g.bx - 4) / -dx);
    L = Math.max(12, Math.min(L, (y0 - g.topY - 3) / -dy));
    // ionisation is densest towards the end of the ray's range
    const f = Array.from({ length: PAIRS }, () => 1 - 0.9 * rnd() * rnd()).sort((p, q) => p - q);
    rays.push({ x0, y0, dx, dy, L, head: 0, f, next: 0, age: 0 });
    const cells = s.idx[s.src()];
    flash[cells[(rnd() * cells.length) | 0]] = 1;
    glow = Math.min(1, glow + 0.3);
  }

  function step(dt) {
    if (!dt) return;
    clock += dt;
    const g = geo(), R = RATE * SAMPLES[si].A, vp = g.gap * 0.9, vn = g.gap * 1.4;
    nextRay -= dt;
    while (nextRay <= 0) { emit(); nextRay += -Math.log(1 - rnd()) / R; }
    let k = 0;
    for (const r of rays) {
      r.head = Math.min(r.L, r.head + SPEED * dt);
      while (r.next < r.f.length && r.f[r.next] * r.L <= r.head) {
        const x = r.x0 + r.dx * r.f[r.next] * r.L, y = r.y0 + r.dy * r.f[r.next] * r.L;
        ions.push({ x, y, s: 1, vx: (rnd() - 0.5) * 14 }, { x, y, s: -1, vx: (rnd() - 0.5) * 14 });
        r.next++;
      }
      if (r.head >= r.L) r.age += dt;
      if (r.age < 0.3) rays[k++] = r;
    }
    rays.length = k;
    k = 0;
    for (const p of ions) { // positive ions fall to the collecting plate (and into the wire), electrons rise to the + plate
      p.y += (p.s > 0 ? vp : -vn) * dt; p.x = clamp(p.x + p.vx * dt, g.px0, g.px1);
      if (p.s > 0 && p.y >= g.botY - 1) { packets.push(0); events++; } else if (p.s < 0 && p.y <= g.topY + 3) { /* absorbed */ } else ions[k++] = p;
    }
    ions.length = k;
    k = 0;
    for (let i = 0; i < packets.length; i++) { packets[i] += dt / 0.8; if (packets[i] < 1) packets[k++] = packets[i]; }
    packets.length = k;
    cur = cur * Math.exp(-dt / TM) + events / TM; events = 0; // running average of the ion arrival rate
    // ponytail: the rays drawn are a thin sample of a far higher real rate, so the needle follows the damped mean (75%) and only trembles with the visible count (25%)
    mean += (RATE * PAIRS * SAMPLES[si].A - mean) * (1 - Math.exp(-dt / TM));
    glow = Math.max(0, glow - dt * 3);
    for (let i = 0; i < 32; i++) flash[i] = Math.max(0, flash[i] - dt * 2.5);
  }

  function draw(dt) {
    step(dt);
    const { ctx } = cv, g = geo(), { w, h, bx, bw, by, bh, topY, botY, px0, px1, sx, lumpW, lumpH, dcx, dcy, rD } = g, s = SAMPLES[si], fs = clamp(w / 52, 10, 12);
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);
    text(ctx, s.note, 8, 17, { color: C.gold, size: fs, weight: 600 });

    // chamber and the air in it
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = "rgba(200,190,170,0.28)";
    for (const p of specks) { ctx.beginPath(); ctx.arc(px0 + p.u * (px1 - px0) + Math.sin(clock * p.f + p.p) * 2.5, topY + 6 + p.v * (botY - topY - 10) + Math.cos(clock * p.f * 0.8 + p.p) * 2.5, 1.4, 0, TAU); ctx.fill(); }

    // rays: a bright head, a fading track
    for (const r of rays) {
      const fade = r.head >= r.L ? 1 - r.age / 0.3 : 1, hx = r.x0 + r.dx * r.head, hy = r.y0 + r.dy * r.head, tl = Math.min(r.head, 36);
      ctx.strokeStyle = `rgba(160,215,255,${0.22 * fade})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x0, r.y0); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = `rgba(190,230,255,${0.9 * fade})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx - r.dx * tl, hy - r.dy * tl); ctx.lineTo(hx, hy); ctx.stroke();
      if (r.head < r.L) { ctx.fillStyle = "#e6f4ff"; ctx.beginPath(); ctx.arc(hx, hy, 2.5, 0, TAU); ctx.fill(); }
    }
    // ions: + (red) and − (blue)
    const ir = clamp(w / 140, 3, 4.2);
    ctx.fillStyle = C.red; ctx.beginPath();
    for (const p of ions) if (p.s > 0) { ctx.moveTo(p.x + ir, p.y); ctx.arc(p.x, p.y, ir, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = C.blue; ctx.beginPath();
    for (const p of ions) if (p.s < 0) { ctx.moveTo(p.x + ir, p.y); ctx.arc(p.x, p.y, ir, 0, TAU); }
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = 1; ctx.beginPath();
    for (const p of ions) { ctx.moveTo(p.x - ir * 0.55, p.y); ctx.lineTo(p.x + ir * 0.55, p.y); if (p.s > 0) { ctx.moveTo(p.x, p.y - ir * 0.55); ctx.lineTo(p.x, p.y + ir * 0.55); } }
    ctx.stroke();

    // plates and the sample
    ctx.fillStyle = C.muted; ctx.fillRect(px0, topY - 3, px1 - px0, 5); ctx.fillRect(px0, botY, px1 - px0, 5);
    text(ctx, "+ plate", px1, topY - 8, { color: C.muted, size: 10, align: "right" });
    text(ctx, "collector", px1, botY - 6, { color: C.muted, size: 10, align: "right" });
    if (glow > 0) {
      const gg = ctx.createRadialGradient(sx, botY - lumpH, 0, sx, botY - lumpH, lumpW);
      gg.addColorStop(0, `rgba(160,215,255,${0.4 * glow})`); gg.addColorStop(1, "rgba(160,215,255,0)");
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(sx, botY - lumpH, lumpW, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = s.lump[0];
    ctx.beginPath(); ctx.ellipse(sx, botY, lumpW / 2, lumpH, 0, Math.PI, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx - lumpW * 0.22, botY, lumpW * 0.22, lumpH * 0.75, 0, Math.PI, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + lumpW * 0.26, botY, lumpW * 0.2, lumpH * 0.6, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = s.lump[1]; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.ellipse(sx - lumpW * 0.08, botY - lumpH * 0.55, lumpW * 0.14, lumpH * 0.22, -0.2, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    text(ctx, s.name, sx, botY + 17, { color: C.gold, size: fs, align: "center", weight: 600 });
    text(ctx, "ionisation chamber", bx + 6, by + 12, { color: C.muted, size: 10 });

    // wire from the collecting plate to the meter, with charge packets flowing along it
    const mL = dcx - rD * 1.2, xm = (bx + bw + mL) / 2, wy = dcy + 16, pts = [[px1, botY + 2], [xm, botY + 2], [xm, wy], [mL, wy]];
    const seg = [], tot = pts.slice(1).reduce((a, p, i) => (seg.push(Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), a + seg[i]), 0);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.beginPath();
    for (const u of packets) {
      let d = u * tot, i = 0;
      while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
      const f = clamp(d / seg[i], 0, 1), x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
      ctx.moveTo(x + 2, y); ctx.arc(x, y, 2, 0, TAU);
    }
    ctx.fill();

    // the meter
    const rel = clamp((0.75 * mean + 0.25 * cur) / (RATE * PAIRS), 0, SCALE), ang = v => -Math.PI / 2 + map(v, 0, SCALE, -0.95, 0.95), ra = rD * 0.95;
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(mL, dcy - rD * 1.05, rD * 2.4, rD * 1.05 + 32);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(mL + 0.5, dcy - rD * 1.05 + 0.5, rD * 2.4 - 1, rD * 1.05 + 31);
    ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.beginPath(); ctx.moveTo(dcx, dcy); ctx.arc(dcx, dcy, ra, ang(0), ang(SCALE)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(dcx, dcy, ra, ang(0), ang(SCALE)); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath();
    for (let v = 0; v <= 3.5; v += 0.5) { const a = ang(v), l = v % 1 ? 0.06 : 0.12; ctx.moveTo(dcx + Math.cos(a) * ra, dcy + Math.sin(a) * ra); ctx.lineTo(dcx + Math.cos(a) * ra * (1 - l), dcy + Math.sin(a) * ra * (1 - l)); }
    ctx.stroke();
    for (let v = 0; v <= 3; v++) text(ctx, v, dcx + Math.cos(ang(v)) * ra * 0.72, dcy + Math.sin(ang(v)) * ra * 0.72, { color: C.muted, size: 10, align: "center", base: "middle" });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(dcx, dcy); ctx.lineTo(dcx + Math.cos(ang(rel)) * ra * 0.92, dcy + Math.sin(ang(rel)) * ra * 0.92); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(dcx, dcy, 4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(mL, wy, 3, 0, TAU); ctx.fill();
    text(ctx, "relative current", dcx, dcy + 16, { color: C.ink, size: 10, align: "center" });
    text(ctx, "(illustrative)", dcx, dcy + 28, { color: C.muted, size: 10, align: "center" });

    // inside the sample: which atoms there are, and which of them flash when a ray leaves
    const qx = mL, qw = rD * 2.4, qy = h * 0.74, qh = h * 0.17, cw = qw / 8, ch = qh / 4;
    text(ctx, "inside the sample", qx, qy - 6, { color: C.muted, size: 10 });
    ctx.strokeStyle = C.line; ctx.strokeRect(qx + 0.5, qy + 0.5, qw - 1, qh - 1);
    const ar = Math.min(cw, ch) * 0.3;
    for (let i = 0; i < 32; i++) {
      const t = s.types[i], x = qx + (i % 8 + 0.5) * cw, y = qy + (((i / 8) | 0) + 0.5) * ch, f = flash[i], big = t === 1 ? 0.7 : 1;
      if (f > 0) { ctx.strokeStyle = `rgba(255,255,255,${f})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, ar * 1.2 + ar * 1.6 * (1 - f), 0, TAU); ctx.stroke(); }
      ctx.fillStyle = TYPES[t].col; ctx.globalAlpha = t === 1 ? 0.7 : 0.55 + 0.45 * f; ctx.beginPath(); ctx.arc(x, y, ar * big * (1 + 0.3 * f), 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // legends
    let lx = bx; const l1 = h * 0.895, l2 = h * 0.955;
    for (const [col, lab] of [[C.red, "positive ion"], [C.blue, "electron"]]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx + 4, l1 - 3, 3.5, 0, TAU); ctx.fill();
      text(ctx, lab, lx + 11, l1, { color: C.muted, size: 10 }); lx += 11 + ctx.measureText(lab).width + 14;
    }
    lx = bx;
    for (const t of s.legend) {
      ctx.fillStyle = TYPES[t].col; ctx.beginPath(); ctx.arc(lx + 4, l2 - 3, 3.5, 0, TAU); ctx.fill();
      text(ctx, `${TYPES[t].name} atom`, lx + 11, l2, { color: C.muted, size: 10 }); lx += 11 + ctx.measureText(`${TYPES[t].name} atom`).width + 14;
    }

    info.textContent = `${s.name} · relative current ${s.A.toFixed(1)} (illustrative, uranium metal = 1) · needle ${rel.toFixed(2)}`;
  }

  const lp = loop(row, (t, dt) => draw(dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
