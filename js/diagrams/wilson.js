// Wilson: a cloud chamber. Fast charged particles leave trails of droplets that drift down and fade; a magnetic field curls them.
import { C, canvas, controls, toggle, loop, readout, text, clamp } from "./kit.js";

export const title = "Cloud chamber";
export const caption = "Fast charged particles leave a trail of ions in supersaturated air, and each ion seeds a droplet. Alphas draw short, fat, straight lines; betas thin, wandering ones; muons long straight ones that cross the whole chamber. Switch on the magnetic field and tracks bend by momentum over charge, so a positron curls the other way. Field strength and rates are not to scale.";

const N = 1500, LIFE = 2, TAU = 2 * Math.PI;      // droplet pool size; seconds a droplet lasts
const KINDS = [                                    // α, β, μ, e⁺
  { sym: "α", name: "alpha", rgb: "255,243,222", col: "#fff3de" },
  { sym: "β", name: "beta", rgb: "200,224,255", col: "#c8e0ff" },
  { sym: "μ", name: "muon", rgb: "190,255,236", col: "#beffec" },
  { sym: "e⁺", name: "positron", rgb: "255,170,200", col: "#ffaac8" },
];

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "A dark cloud chamber. Particles cross it leaving trails of droplets that drift down and fade: short thick alpha tracks, thin wiggly beta tracks and long straight muon tracks. With a magnetic field on, tracks curve; positrons curl the opposite way." });
  const row = controls(root), info = readout(root);
  const px = new Float32Array(N), py = new Float32Array(N), pb = new Float32Array(N).fill(-1e9), pr = new Float32Array(N), pk = new Uint8Array(N);
  const labels = Array.from({ length: 12 }, () => ({ x: 0, y: 0, t: -1e9, k: 0 }));
  const counts = [0, 0, 0, 0];
  let head = 0, lab = 0, T = 0, field = false, src = false;

  toggle(row, "Magnetic field", field, v => { field = v; spawn(1, T - 0.45); if (v) spawn(3, T - 0.4); lp.redraw(); });
  toggle(row, "Radioactive source", src, v => { src = v; if (v) { spawn(0, T - 0.45, true); spawn(0, T - 0.3, true); spawn(1, T - 0.4, true); } lp.redraw(); });
  const lp = loop(row, (_, dt) => draw(dt));

  const box = () => ({ x: cv.w * 0.03, y: cv.h * 0.04, w: cv.w * 0.94, h: cv.h * 0.8 });
  const put = (x, y, b, k, r) => { px[head] = x; py[head] = y; pb[head] = b; pk[head] = k; pr[head] = r; head = (head + 1) % N; };

  // Lay a whole track down at once; droplets get birth times along the path so it appears to be drawn as the particle flies.
  // ponytail: arrival rates, track lengths and speeds are for show, not real fluxes or ranges.
  // ponytail: the alpha:beta radius ratio under the field is compressed (about 20:1 here, closer to 100:1 in reality) so betas still show an arc.
  function spawn(kind, born, fromSrc = false, silent = false) {
    const w = cv.w, B = box(), sc = clamp(w / 600, 0.75, 1.2);
    let x, y, a, L, R, sgn = 1;
    if (kind === 2) { x = B.x + 4 + Math.random() * (B.w - 8); y = B.y + 2; a = Math.PI / 2 + (Math.random() - 0.5) * 0.7; L = 2 * B.h; R = 7 * w; sgn = Math.random() < 0.5 ? 1 : -1; }
    else {
      if (fromSrc) { x = B.x + 8; y = B.y + B.h / 2 + (Math.random() - 0.5) * 10; a = (Math.random() - 0.5) * 1.2; }
      else { x = B.x + 10 + Math.random() * (B.w - 20); y = B.y + 10 + Math.random() * (B.h - 20); a = Math.random() * TAU; }
      if (kind === 0) { L = (0.15 + 0.05 * Math.random()) * w; R = 1.8 * w; sgn = -1; }   // alphas are positive: curl one way, barely
      else { L = (0.3 + 0.18 * Math.random()) * w; R = (0.05 + 0.1 * Math.random()) * w; sgn = kind === 1 ? 1 : -1; }
    }
    const wiggly = kind === 1 || kind === 3, ds = (kind === 0 ? 2.2 : kind === 2 ? 3.4 : 3.2) * sc, r = (kind === 0 ? 2.2 : kind === 2 ? 1.4 : 1.6) * sc;
    let hdg = a, qx = x, qy = y, s = 0;
    while (s < L) {
      const Rs = wiggly ? R * (1 - (0.6 * s) / L) : R; // slow particles curl tighter
      hdg += (field ? sgn / Rs : 0) * ds + (wiggly ? (Math.random() + Math.random() + Math.random() - 1.5) * 0.18 : 0);
      qx += Math.cos(hdg) * ds; qy += Math.sin(hdg) * ds; s += ds;
      if (qx < B.x + 2 || qx > B.x + B.w - 2 || qy < B.y + 2 || qy > B.y + B.h - 2) break;
      const n = kind === 0 ? 2 : Math.random() < 0.9 ? 1 : 0;
      for (let j = 0; j < n; j++) put(qx + (Math.random() - 0.5) * 2.4, qy + (Math.random() - 0.5) * 2.4, born + s / (1.2 * w), kind, r);
    }
    const l = labels[lab]; lab = (lab + 1) % labels.length;
    l.x = qx; l.y = qy; l.t = born + s / (1.2 * w); l.k = kind;
    if (!silent) counts[kind]++;
  }
  const seed = () => { pb.fill(-1e9); for (const l of labels) l.t = -1e9; spawn(0, -0.55, false, true); spawn(1, -0.8, false, true); spawn(2, -0.35, false, true); spawn(1, -1.2, false, true); spawn(0, -1.1, false, true); };
  if (cv.w) { seed(); counts[0] = 2; counts[1] = 2; counts[2] = 1; } // the five tracks already showing count as seen
  cv.onResize = () => { if (cv.w) seed(); lp.redraw(); };

  function draw(dt) {
    T += dt;
    if (dt > 0) {
      if (Math.random() < 0.55 * dt) spawn(0, T);
      if (Math.random() < 0.85 * dt) spawn(1, T);
      if (Math.random() < 0.38 * dt) spawn(2, T);
      if (field && Math.random() < 0.2 * dt) spawn(3, T);
      if (src) { if (Math.random() < 1.5 * dt) spawn(0, T, true); if (Math.random() < 1.2 * dt) spawn(1, T, true); }
    }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13), B = box(), sc = clamp(w / 600, 0.6, 1.2);
    const bg = ctx.createLinearGradient(0, B.y, 0, B.y + B.h);
    bg.addColorStop(0, "#1d1916"); bg.addColorStop(1, "#0b0908");
    ctx.fillStyle = bg; ctx.fillRect(B.x, B.y, B.w, B.h);
    ctx.save(); ctx.beginPath(); ctx.rect(B.x, B.y, B.w, B.h); ctx.clip();
    const lg = ctx.createRadialGradient(B.x + B.w * 0.3, B.y + B.h * 0.1, 0, B.x + B.w * 0.3, B.y + B.h * 0.1, B.w * 0.8);
    lg.addColorStop(0, "rgba(255,244,225,0.10)"); lg.addColorStop(1, "rgba(255,244,225,0)");
    ctx.fillStyle = lg; ctx.fillRect(B.x, B.y, B.w, B.h);
    if (field) { // × grid: field pointing into the page
      const g = 34 * sc; ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = B.x + g / 2; x < B.x + B.w; x += g) for (let y = B.y + g / 2; y < B.y + B.h; y += g) { ctx.moveTo(x - 2.5, y - 2.5); ctx.lineTo(x + 2.5, y + 2.5); ctx.moveTo(x + 2.5, y - 2.5); ctx.lineTo(x - 2.5, y + 2.5); }
      ctx.stroke();
    }
    // droplets, one colour per kind
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = `rgb(${KINDS[k].rgb})`;
      for (let i = 0; i < N; i++) {
        if (pk[i] !== k) continue;
        const age = T - pb[i];
        if (age < 0 || age > LIFE) continue;
        ctx.globalAlpha = Math.min(1, age / 0.06) * (age < 0.4 ? 1 : 1 - (age - 0.4) / (LIFE - 0.4)) ** 1.3; // bright at first, gone by LIFE
        ctx.beginPath(); ctx.arc(px[i] + Math.sin(age * 3 + i) * 1.6, py[i] + 10 * sc * age, pr[i] * (0.8 + 0.5 * Math.min(1, age / 0.4)), 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // track labels fade quickly; a positron's stays a little longer
    for (const l of labels) {
      const age = T - l.t, life = l.k === 3 ? 2 : 1.3;
      if (age < 0 || age > life) continue;
      ctx.globalAlpha = Math.min(1, (life - age) / 0.4);
      text(ctx, KINDS[l.k].sym, clamp(l.x + 6, B.x + 4, B.x + B.w - 22), clamp(l.y - 4, B.y + fs + 2, B.y + B.h - 4), { color: KINDS[l.k].col, size: fs, weight: 700 });
    }
    ctx.globalAlpha = 1;
    if (src) { // the source, with a gentle pulse
      const my = B.y + B.h / 2, pulse = 0.5 + 0.5 * Math.sin(T * 6), g = ctx.createRadialGradient(B.x, my, 0, B.x, my, 24 * sc + 6);
      g.addColorStop(0, `rgba(255,214,120,${(0.35 + 0.3 * pulse).toFixed(3)})`); g.addColorStop(1, "rgba(255,214,120,0)");
      ctx.fillStyle = g; ctx.fillRect(B.x, my - 40, 50, 80);
      ctx.fillStyle = C.gold; ctx.fillRect(B.x, my - 9 * sc - 3, 6, 18 * sc + 6);
      text(ctx, "source", B.x + 9, my - 14 * sc - 5, { color: C.gold, size: fs });
    }
    ctx.restore();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(B.x, B.y, B.w, B.h);
    text(ctx, "cloud chamber", B.x + 6, B.y + fs + 2, { color: C.muted, size: fs });
    if (field) text(ctx, "B into page", B.x + B.w - 6, B.y + fs + 2, { color: C.muted, size: fs, align: "right" });

    let lx = B.x;
    for (const k of KINDS) {
      ctx.fillStyle = k.col; ctx.beginPath(); ctx.arc(lx + 4, h * 0.935, 4, 0, TAU); ctx.fill();
      const s = `${k.sym} ${k.name}`;
      text(ctx, s, lx + 12, h * 0.935 + 4, { color: C.muted, size: fs });
      lx += 12 + s.length * fs * 0.56 + 12;
    }
    info.textContent = `Tracks seen: ${counts[0]} alpha, ${counts[1]} beta, ${counts[2]} muon, ${counts[3]} positron.`;
  }
  return () => { lp.stop(); cv.dispose(); };
}
