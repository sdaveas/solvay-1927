// Piccard: a balloon climbs through the standard atmosphere. Pressure falls, the gas expands (V ∝ T/P), and the sky goes dark.
import { C, canvas, controls, slider, loop, readout, text, clamp } from "./kit.js";

export const title = "Into the stratosphere";
export const caption = "In 1931 Piccard and Paul Kipfer rose to nearly sixteen kilometres in a sealed gondola under a hydrogen balloon, to study cosmic rays high above the air. Thin air lets the gas expand (volume ∝ T/P), so the balloon starts partly filled and rounds out. Standard-atmosphere model. Balloon not to scale; the counter is illustrative.";

const P0 = 101325, T0 = 288.15, VFULL = 9; // sea-level pressure (Pa) and temperature (K); drawn envelope is full at 9x its launch volume
const MARKS = [[8.85, "Everest 8.85 km", 0], [11, "Airliner ~11 km", 0], [15.78, "1931 · 15.78 km", 1], [16.2, "1932 · 16.2 km", 2]]; // km, label, 0 plain / 1 flight, label below / 2 flight, label above
function atm(km) { // standard atmosphere, 0-20 km
  const h = km * 1000;
  if (h <= 11000) { const T = T0 - 0.0065 * h; return { T, P: P0 * (T / T0) ** 5.2559 }; }
  return { T: 216.65, P: 22632 * Math.exp(-0.0001577 * (h - 11000)) };
}
const mix = (a, b, f) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(",")})`;
const setSlider = (inp, v, fmt) => { inp.value = v; const o = inp.nextElementSibling; if (o) o.textContent = fmt(v); };
const rnd = () => Math.random();

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "A balloon with a sealed gondola rising from the ground through darkening sky. It starts as a slack teardrop and rounds out as the air thins. A panel on the left shows altitude with Everest, airliner height and the 1931 and 1932 flights marked." });
  const row = controls(root), info = readout(root);
  let alt = 0, dirn = 1, hold = 0.8, clicks = 0, flash = 0;
  const stars = Array.from({ length: 45 }, () => ({ x: rnd(), y: rnd() * 0.75, p: rnd() * 6.28 }));
  const air = Array.from({ length: 90 }, () => ({ x: rnd(), y: rnd(), vx: (rnd() - 0.5) * 0.05, vy: (rnd() - 0.5) * 0.05, u: rnd() }));
  const clouds = [0.8, 1.6, 2.8, 4.2, 6, 8.5, 10.5].map((a, i) => ({ a, x: (i * 0.37) % 1, s: 0.05 + 0.025 * ((i * 7) % 3) }));
  const fmt = v => `${v.toFixed(1)} km`;
  const sl = slider(row, { label: "Altitude", min: 0, max: 17, step: 0.1, value: alt, fmt }, v => { alt = v; hold = 1.2; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(t, dt));

  function draw(time, dt) {
    const { ctx, w, h: H } = cv;
    if (dt) {
      if (hold > 0) hold -= dt;
      else {
        alt += dirn * (dirn > 0 ? 1.1 : 3.5) * dt;
        if (alt >= 17) { alt = 17; dirn = -1; hold = 1.5; } else if (alt <= 0) { alt = 0; dirn = 1; hold = 0.8; clicks = 0; }
        setSlider(sl, alt, fmt);
      }
    }
    const { T, P } = atm(alt), pr = P / P0, dens = pr / (T / T0), vol = (T / T0) / pr; // pressure and density ratios to sea level; gas volume relative to launch
    const bright = pr ** 1.2; // how much blue is left in the sky

    // ── Sky ──
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, mix([3, 4, 10], [32, 92, 190], bright)); sky.addColorStop(1, mix([9, 11, 24], [150, 205, 245], bright ** 0.6));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, H);
    const so = clamp((0.35 - bright) / 0.3, 0, 1);
    if (so > 0) for (const s of stars) { ctx.globalAlpha = so * (0.5 + 0.5 * Math.sin(time * 1.5 + s.p)); ctx.fillStyle = "#fff"; ctx.fillRect(s.x * w, s.y * H, 1.6, 1.6); }
    ctx.globalAlpha = 1;

    // ── Scene geometry: the balloon stays put and the world scrolls past ──
    const R = 0.19 * H, yTop = 0.1 * H, gr = 0.2 * R, yG = yTop + 2.6 * R + 0.35 * R + 2 * gr; // yG: gondola bottom = ground level at 0 km
    const kmPx = 0.055 * H, cx = w * 0.68 + Math.sin(time * 0.8) * w * 0.006;
    for (const c of clouds) { // clouds, each at its own altitude
      const y = yG + (alt - c.a) * kmPx;
      if (y < -30 || y > H + 30) continue;
      const x = ((c.x + time * 0.004) % 1) * (w + 80) - 40, s = c.s * w;
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath();
      for (const [dx, dy, k] of [[-1, 0.25, 0.8], [-0.3, -0.15, 1], [0.5, 0, 0.9], [1.2, 0.25, 0.7]]) { ctx.moveTo(x + dx * s + k * s * 0.6, y + dy * s); ctx.arc(x + dx * s, y + dy * s, k * s * 0.6, 0, 2 * Math.PI); }
      ctx.fill();
    }
    const yg = yG + alt * kmPx; // ground
    if (yg < H) {
      ctx.fillStyle = "#2c4630"; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, yg + Math.sin(x * 0.02) * 5 + Math.sin(x * 0.05 + 1) * 3);
      ctx.lineTo(w, H); ctx.closePath(); ctx.fill();
    }
    // Air molecules: fewer and fewer as the air thins.
    ctx.fillStyle = "#fff";
    for (const a of air) {
      if (dt) { a.x = (a.x + a.vx * dt + 1) % 1; a.y = (a.y + a.vy * dt + 1) % 1; }
      const al = clamp((dens - a.u) * 8, 0, 1);
      if (al > 0.05) { ctx.globalAlpha = al * 0.45; ctx.beginPath(); ctx.arc(a.x * w, a.y * H, 1.8, 0, 2 * Math.PI); ctx.fill(); }
    }
    ctx.globalAlpha = 1;

    // ── Balloon: gas bubble at the top, slack fabric tapering down to the load ring ──
    // ponytail: the drawn volume is capped at 9x launch (full by about 17 km); the readout shows the true T/P ratio.
    const f = clamp(vol / VFULL, 0.05, 1), rb = R * Math.cbrt(f), yc = yTop + rb, yA = yTop + 2.6 * R, d = Math.max(yA - yc, rb * 1.05);
    const bulb = (dd, r) => { // teardrop of radius r whose point is dd below its centre
      const a = Math.acos(r / dd);
      ctx.beginPath(); ctx.moveTo(cx, yc + dd);
      ctx.lineTo(cx + r * Math.cos(Math.PI / 2 - a), yc + r * Math.sin(Math.PI / 2 - a));
      ctx.arc(cx, yc, r, Math.PI / 2 - a, Math.PI / 2 + a, true); ctx.closePath();
    };
    bulb(d, rb); ctx.fillStyle = "rgba(227,194,127,0.28)"; ctx.fill(); // the whole envelope, mostly slack at launch
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
    const gg = ctx.createRadialGradient(cx - rb * 0.35, yc - rb * 0.35, rb * 0.1, cx, yc, rb * 1.05);
    gg.addColorStop(0, "#f6e3b4"); gg.addColorStop(0.6, "#e3c27f"); gg.addColorStop(1, "#a07c36");
    bulb(rb * (1.05 + 0.9 * (1 - f) ** 1.2), rb); ctx.fillStyle = gg; ctx.fill(); // the gas: a teardrop that rounds into a sphere as it expands
    ctx.stroke();
    const gcx = cx + Math.sin(time * 1.4) * gr * 0.25, gcy = yA + 0.35 * R + gr; // gondola
    ctx.strokeStyle = "rgba(240,240,240,0.7)"; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(cx, yA); ctx.lineTo(gcx - gr * 0.8, gcy - gr * 0.6); ctx.moveTo(cx, yA); ctx.lineTo(gcx + gr * 0.8, gcy - gr * 0.6); ctx.stroke();
    const sg = ctx.createRadialGradient(gcx - gr * 0.3, gcy - gr * 0.3, gr * 0.1, gcx, gcy, gr);
    sg.addColorStop(0, "#eef1f5"); sg.addColorStop(1, "#7f8691");
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(gcx, gcy, gr, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#1a2230"; ctx.beginPath(); ctx.arc(gcx + gr * 0.25, gcy - gr * 0.1, gr * 0.28, 0, 2 * Math.PI); ctx.fill();

    // ── Altitude panel ──
    const pw = clamp(Math.round(w * 0.4), 124, 150), ax = 26, y17 = 24, y0 = H - 20, ky = (y0 - y17) / 17, Y = a => y0 - a * ky;
    ctx.fillStyle = "rgba(15,13,11,0.66)"; ctx.fillRect(4, 4, pw, H - 8);
    text(ctx, "altitude (km)", 10, 15, { color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, Y(0)); ctx.lineTo(ax, Y(17));
    for (const a of [0, 5, 10, 15]) { ctx.moveTo(ax, Y(a)); ctx.lineTo(ax + 5, Y(a)); }
    ctx.stroke();
    for (const a of [0, 5, 10, 15]) text(ctx, a, ax - 5, Y(a), { color: C.muted, size: 10, align: "right", base: "middle" });
    for (const [a, label, k] of MARKS) {
      ctx.strokeStyle = k ? C.gold : C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax - 3, Y(a)); ctx.lineTo(ax + 9, Y(a)); ctx.stroke();
      text(ctx, label, ax + 13, k === 2 ? Y(a) - 3 : k === 1 ? Y(a) + 11 : Y(a) + 4, { color: k ? C.gold : C.ink, size: 10 });
    }
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ax, Y(alt), 5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();

    // ── Cosmic-ray counter (illustrative) ──
    if (dt) { const rate = 0.6 + 9 * (alt / 17) ** 2; if (rnd() < rate * dt) { clicks++; flash = 1; } flash = Math.max(0, flash - dt * 6); }
    const bw = 146, bx = w - bw - 6, by = H - 46;
    ctx.fillStyle = "rgba(15,13,11,0.75)"; ctx.fillRect(bx, by, bw, 40);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 39);
    ctx.fillStyle = flash > 0.05 ? C.gold : "#4a4036"; ctx.beginPath(); ctx.arc(bx + 12, by + 13, 4, 0, 2 * Math.PI); ctx.fill();
    text(ctx, "cosmic-ray counter", bx + 22, by + 17, { size: 10 });
    text(ctx, `clicks ${clicks}`, bx + 10, by + 33, { color: C.gold, size: 11, weight: 600 });
    text(ctx, "(illustrative)", bx + bw - 6, by + 33, { color: C.muted, size: 10, align: "right" });

    info.textContent = `${alt.toFixed(1)} km · ${(P / 100).toFixed(0)} hPa (${(pr * 100).toFixed(0)}% of sea level) · ${(T - 273.15).toFixed(1)} °C · gas volume ×${vol.toFixed(1)} the launch volume`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
