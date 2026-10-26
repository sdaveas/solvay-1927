// Piccard: a bathyscaphe descends on iron-shot ballast, floated by a gasoline tank, and rises when the shot is let go. P = 1 atm + ρgh.
import { C, canvas, controls, slider, button, loop, readout, text, clamp } from "./kit.js";

export const title = "Deep-sea dive";
export const caption = "Seawater pressure grows by about one atmosphere every 10 metres (P = P₀ + ρgh), reaching roughly 1,080 atm at the bottom of the Challenger Deep, where Trieste dived in 1960. A bathyscaphe floats on gasoline, lighter than water, and sinks on iron-shot ballast; releasing the shot lets it rise. Depth axis and arrow sizes are compressed, not to scale.";

const TAU = 2 * Math.PI, rnd = Math.random;
const DMAX = 10900, P0 = 101325, RHO = 1025, G = 9.81; // m, Pa, kg/m³, m/s²
const pa = d => P0 + RHO * G * d, atm = d => pa(d) / P0, kgf = d => pa(d) / 98066.5; // 1 kgf/cm² = 98,066.5 Pa
// ponytail: the scene scrolls on a log depth axis (L = ln(1 + d/50)), with the last 1,000 m on a linear one so the sea floor rises into view gradually. The descent is timed on the same scroll, so the first 200 m of fading light get as much screen time as the long dark drop (about 18 s in all).
const Lg = d => Math.log(1 + d / 50), TAUD = 2.6, FIN = 1000, ZL = 0.115, ZF = 0.5;
const zOf = d => ZL * Lg(d) + ZF * clamp((d - (DMAX - FIN)) / FIN, 0, 1); // scene scroll position, in canvas heights
const dzdd = d => ZL / (d + 50) + (d > DMAX - FIN ? ZF / FIN : 0);
const SHALLOW = [34, 140, 200], DEEP = [2, 4, 10];
const mix = (a, b, f) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(",")})`;
const fmtP = v => (v < 10 ? v.toFixed(2) : v.toFixed(0));
const MARKS = [[200, "sunlight fades", "~200 m"], [3800, "Titanic wreck", "~3,800 m"], [DMAX, "Challenger Deep", "10,900 m"]];

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "A bathyscaphe, a gasoline float above a small steel crew sphere with iron-shot ballast hoppers, descending through water that darkens with depth. A gauge on the left marks sunlight fading near 200 metres, the Titanic wreck near 3,800 metres and the Challenger Deep at 10,900 metres. A panel shows weight against buoyancy; releasing the ballast lets the vessel rise." });
  const row = controls(root), info = readout(root);
  let d = 0, rel = false, level = 1, landed = false, hold = 0.8, spawn = 0, pellets = [], puffs = [];
  const snow = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), par: 0.7 + rnd() * 0.6, glow: rnd() < 0.12, p: rnd() * TAU }));
  const stones = Array.from({ length: 16 }, () => ({ x: rnd(), s: 0.4 + rnd() * 0.8, y: rnd() }));
  const fmt = v => `${Math.round(v * v).toLocaleString("en-US")} m`;
  const setSlider = (inp, v) => { inp.value = v; const o = inp.nextElementSibling; if (o) o.textContent = fmt(v); };
  // ponytail: the slider is on a square-root scale so the shallow, bright part is not squeezed into a few pixels; its label still reads in metres.
  const sl = slider(row, { label: "Depth", min: 0, max: Math.sqrt(DMAX), step: "any", value: 0, fmt }, v => { d = v * v; hold = 1.5; lp.redraw(); });
  const btn = button(row, "Release ballast", () => {
    if (rel) { rel = false; level = 1; landed = d >= DMAX; pellets.length = 0; hold = 0.3; } else rel = true;
    if (!lp.playing) { for (let i = 0; i < 100; i++) update(0.05); lp.redraw(); }
  });

  function geom() {
    const { w, h } = cv, pw = clamp(Math.round(w * 0.42), 138, 170), ws = w - pw - 8, hl = ws * 0.62, hh = h * 0.1, rS = h * 0.045, yRef = h * 0.46;
    const yH = yRef - h * 0.125;
    return { w, h, pw, xs: pw + 4 + ws / 2, hl, hh, rS, yRef, yH, yHb: yH + hh / 2, sh: h * 0.07, hang: h * 0.125 };
  }

  function update(dt) {
    const g = geom(), z0 = zOf(d);
    if (hold > 0) hold -= dt;
    else {
      if (rel) level = Math.max(0, level - dt * 0.45);
      const net = 0.82 + 0.28 * level - 1; // weight − buoyancy (relative units): + sinks, − rises
      const fac = clamp(net / 0.1, -1.3, 1), ramp = clamp((d - (DMAX - FIN)) / FIN, 0, 1);
      d += (((ZL / TAUD) * fac * (1 + 5 * ramp * (fac > 0 ? clamp((DMAX - d) / 150, 0.12, 1) : 1))) / dzdd(d)) * dt; // constant scroll speed on the scene's own axis; quickens through the last stretch, then eases onto the bottom
      if (d >= DMAX) {
        d = DMAX;
        if (!landed) { landed = true; hold = 1.2; for (let i = 0; i < 18; i++) puffs.push({ x: g.xs + (rnd() - 0.5) * g.rS * 5, y: g.yRef + g.rS, r: 3 + rnd() * 3, vx: (rnd() - 0.5) * 16, vy: -(8 + rnd() * 14), age: -rnd() * 0.3 }); }
        else if (!rel) rel = true; // rested on the bottom for a moment, now lets the shot go
      } else if (d <= 0) {
        d = 0;
        if (rel) { rel = false; level = 1; landed = false; hold = 1.6; pellets.length = 0; }
      }
    }
    const dy = -(zOf(d) - z0) * g.h; // the water column scrolls past the vessel
    if (rel && level > 0) { // iron shot pours out of the two hoppers
      spawn += dt * 110;
      while (spawn >= 1 && pellets.length < 140) { spawn--; pellets.push({ x: g.xs + (rnd() < 0.5 ? -0.3 : 0.3) * g.hl + (rnd() - 0.5) * 4, y: g.yHb + g.sh, vx: (rnd() - 0.5) * 14, vy: 30 + rnd() * 50 }); }
      spawn = Math.min(spawn, 1);
    }
    let k = 0;
    for (const p of pellets) { p.vy = Math.min(230, p.vy + 260 * dt); p.y += p.vy * dt + dy; p.x += p.vx * dt; if (p.y < g.h + 8 && p.y > -10) pellets[k++] = p; }
    pellets.length = k;
    k = 0;
    for (const p of puffs) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt + dy; if (p.age < 2.2) puffs[k++] = p; }
    puffs.length = k;
  }

  function draw(time, dt) {
    if (dt) { update(dt); setSlider(sl, Math.sqrt(d)); }
    const { ctx } = cv, g = geom(), { w, h, pw, xs, hl, hh, rS, yRef, yH, yHb, sh, hang } = g;
    const Zc = zOf(d), bright = Math.exp(-d / 65), ys = yRef - hang - Zc * h, top = Math.max(0, ys), Y = md => yRef - hang + (zOf(md) - Zc) * h;
    btn.textContent = rel ? "Dive again" : "Release ballast"; btn.disabled = !rel && d < 1;
    ctx.clearRect(0, 0, w, h); ctx.setLineDash([]);

    // sky and sea: the sea darkens as the light is absorbed, bright ≈ e^(−d/65)
    if (ys > 0) { const sk = ctx.createLinearGradient(0, 0, 0, ys); sk.addColorStop(0, "rgb(150,205,245)"); sk.addColorStop(1, "rgb(205,232,248)"); ctx.fillStyle = sk; ctx.fillRect(0, 0, w, ys); }
    const sea = ctx.createLinearGradient(0, top, 0, h);
    for (let j = 0; j <= 6; j++) { const y = top + ((h - top) * j) / 6, dep = 50 * (Math.exp(clamp((Zc + (y - (yRef - hang)) / h) / ZL, 0, 6)) - 1); sea.addColorStop(j / 6, mix(DEEP, SHALLOW, Math.exp(-dep / 65) ** 0.8)); }
    ctx.fillStyle = sea; ctx.fillRect(0, top, w, h - top);
    if (ys > -4 && ys < h) {
      ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let x = 0; x <= w + 6; x += 6) { const y = ys + Math.sin(x * 0.06 + time * 2) * 2.2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }

    // sea floor
    const ySea = yRef + (zOf(DMAX) - Zc) * h + rS * 1.05;
    if (ySea < h) {
      const fl = ctx.createLinearGradient(0, ySea, 0, h); fl.addColorStop(0, "#4a443a"); fl.addColorStop(1, "#14110d");
      ctx.fillStyle = fl; ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, ySea + Math.sin(x * 0.03) * 2 + Math.sin(x * 0.11 + 1) * 1.2);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(120,110,95,0.5)";
      for (const s of stones) { const x = pw + 8 + s.x * (w - pw - 16), y = ySea + 6 + s.y * (h - ySea - 8); if (y < h) { ctx.beginPath(); ctx.ellipse(x, y, 2 + 3 * s.s, 1.2 + 1.5 * s.s, 0, 0, TAU); ctx.fill(); } }
    }

    // depth markers in the water
    for (const [md, name] of MARKS.slice(0, 2)) {
      const y = Y(md);
      if (y < 4 || y > h - 4) continue;
      ctx.strokeStyle = "rgba(240,235,225,0.5)"; ctx.lineWidth = 1; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(pw + 8, y); ctx.lineTo(w, y); ctx.stroke(); ctx.setLineDash([]);
      if (y < 64) continue; // keep clear of the forces panel
      const lab = md === 200 ? "sunlight fades ~200 m" : "Titanic wreck ~3,800 m";
      text(ctx, lab, w - 6, y + 14, { color: C.ink, size: 10, align: "right" }); // below the line, clear of the vessel's pressure label
      if (md === 3800) { const x = w - 12 - ctx.measureText(lab).width - 18; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x, y + 11); ctx.lineTo(x + 14, y + 11); ctx.lineTo(x + 11, y + 16); ctx.lineTo(x + 2, y + 16); ctx.closePath(); ctx.fill(); ctx.fillRect(x + 5, y + 7, 2, 4); ctx.fillRect(x + 9, y + 7, 2, 4); }
    }

    // marine snow and the occasional glimmer
    const dark = clamp(1 - bright * 1.5, 0, 1);
    for (const p of snow) {
      const y = (((p.y * h - Zc * h * p.par) % h) + h) % h, x = pw + 8 + p.x * (w - pw - 16);
      if (y < ys) continue;
      if (p.glow) { if (dark < 0.6 || d < 300) continue; ctx.fillStyle = `rgba(110,255,230,${0.35 + 0.4 * Math.sin(time * 3 + p.p)})`; ctx.fillRect(x, y, 2, 2); }
      else { ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * dark})`; ctx.fillRect(x, y, 1.6, 1.6); }
    }

    // the vessel: gasoline float, steel crew sphere, two iron-shot hoppers
    const sway = Math.sin(time * 0.9) * w * 0.004, cx = xs + sway, py = yRef - rS * 0.1;
    if (dark > 0.05) { // lamp
      const lx = cx + rS * 0.3, cg = ctx.createLinearGradient(lx, 0, lx + w * 0.3, 0);
      cg.addColorStop(0, `rgba(255,240,190,${0.4 * dark})`); cg.addColorStop(1, "rgba(255,240,190,0)");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(lx, py); ctx.lineTo(lx + w * 0.3, py - h * 0.09); ctx.lineTo(lx + w * 0.3, py + h * 0.14); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#8d949c"; ctx.fillRect(cx - rS * 0.25, yHb - 1, rS * 0.5, yRef - rS * 0.9 - yHb + 2);
    const r = hh / 2, x0 = cx - hl / 2 + r, x1 = cx + hl / 2 - r, hg = ctx.createLinearGradient(0, yH - r, 0, yH + r);
    hg.addColorStop(0, "#f6e3b4"); hg.addColorStop(0.5, "#e3c27f"); hg.addColorStop(1, "#a07c36");
    ctx.beginPath(); ctx.moveTo(x0, yH - r); ctx.lineTo(x1, yH - r); ctx.arc(x1, yH, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x0, yH + r); ctx.arc(x0, yH, r, Math.PI / 2, (3 * Math.PI) / 2); ctx.closePath();
    ctx.fillStyle = hg; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = "rgba(60,40,10,0.3)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 5; i++) { const x = cx - hl / 2 + (hl * i) / 5; ctx.moveTo(x, yH - r * 0.8); ctx.lineTo(x, yH + r * 0.8); }
    ctx.stroke();
    text(ctx, "gasoline", cx, yH + 3.5, { color: "#2a1f08", size: 10, align: "center", weight: 600 });
    for (const sx of [-0.3, 0.3]) { // hoppers: iron shot fills them from the bottom up to `level`
      const hx = cx + sx * hl, tw = hl * 0.06, bw = hl * 0.018, yb = yHb + sh;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(hx - tw, yHb); ctx.lineTo(hx + tw, yHb); ctx.lineTo(hx + bw, yb); ctx.lineTo(hx - bw, yb); ctx.closePath();
      ctx.fillStyle = "#1f1c19"; ctx.fill(); ctx.clip();
      ctx.fillStyle = "#524c46"; ctx.fillRect(hx - tw, yb - sh * level, tw * 2, sh * level + 1);
      ctx.fillStyle = "#948a7c";
      for (let rr = 0; rr < 4; rr++) for (let cc = -1; cc <= 1; cc++) if ((rr + 0.5) / 4 <= level) { ctx.beginPath(); ctx.arc(hx + cc * tw * 0.5 + (rr % 2) * 1.2, yb - ((rr + 0.5) / 4) * sh, 1.5, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = "#8d949c"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(hx - tw, yHb); ctx.lineTo(hx - bw, yb); ctx.lineTo(hx + bw, yb); ctx.lineTo(hx + tw, yHb); ctx.stroke();
    }
    const sg = ctx.createRadialGradient(cx - rS * 0.3, yRef - rS * 0.3, rS * 0.1, cx, yRef, rS);
    sg.addColorStop(0, "#eef1f5"); sg.addColorStop(1, "#7f8691");
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, yRef, rS, 0, TAU); ctx.fill();
    ctx.fillStyle = dark > 0.3 ? "#ffe9a8" : "#1a2230"; ctx.beginPath(); ctx.arc(cx + rS * 0.3, py, rS * 0.28, 0, TAU); ctx.fill();

    // pressure arrows on the sphere, then iron shot and sediment
    // ponytail: arrow length goes as log(atm), not as the pressure itself
    const al = rS * (0.35 + (1.0 * Math.log10(atm(d))) / Math.log10(atm(DMAX)));
    ctx.strokeStyle = ctx.fillStyle = C.red; ctx.lineWidth = 1.8;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI) / 4, ux = Math.cos(a), uy = Math.sin(a), tip = rS + 4, tail = tip + al;
      ctx.beginPath(); ctx.moveTo(cx + ux * tail, yRef + uy * tail); ctx.lineTo(cx + ux * (tip + 3), yRef + uy * (tip + 3)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + ux * tip, yRef + uy * tip); ctx.lineTo(cx + ux * (tip + 6) - uy * 3.5, yRef + uy * (tip + 6) + ux * 3.5); ctx.lineTo(cx + ux * (tip + 6) + uy * 3.5, yRef + uy * (tip + 6) - ux * 3.5); ctx.closePath(); ctx.fill();
    }
    text(ctx, `${Math.round(atm(d)).toLocaleString("en-US")} atm`, cx + rS + 4 + al + 8, yRef + 4, { color: C.gold, size: clamp(w / 45, 10, 12), weight: 600 });
    ctx.fillStyle = "#6e675f"; ctx.beginPath();
    for (const p of pellets) { ctx.moveTo(p.x + 1.8, p.y); ctx.arc(p.x, p.y, 1.8, 0, TAU); }
    ctx.fill();
    for (const p of puffs) { if (p.age < 0) continue; ctx.fillStyle = `rgba(150,138,118,${0.32 * (1 - p.age / 2.2)})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + p.age * 9, 0, TAU); ctx.fill(); }

    // weight against buoyancy
    const B = 1, W = 0.82 + 0.28 * level, fx = w - 112, fy = 6;
    ctx.fillStyle = "rgba(15,13,11,0.7)"; ctx.fillRect(fx, fy, 106, 50);
    text(ctx, "buoyancy", fx + 6, fy + 14, { color: C.muted, size: 10 }); text(ctx, "weight", fx + 6, fy + 28, { color: C.muted, size: 10 });
    ctx.fillStyle = C.blue; ctx.fillRect(fx + 56, fy + 7, 44 * B, 8);
    ctx.fillStyle = C.red; ctx.fillRect(fx + 56, fy + 21, 44 * W, 8);
    text(ctx, W > B + 0.01 ? "heavier: sinks" : W < B - 0.01 ? "lighter: rises" : "balanced", fx + 6, fy + 43, { color: C.ink, size: 10 });

    // depth gauge (square-root scale)
    // ponytail: the gauge is on a square-root scale so 200 m, 3,800 m and 10,900 m are all readable.
    const ax = 42, yT = 40, y0 = h - 18, GY = md => yT + Math.sqrt(md / DMAX) * (y0 - yT); // depth grows downward, like the dive
    ctx.fillStyle = "rgba(15,13,11,0.7)"; ctx.fillRect(4, 4, pw, h - 8);
    text(ctx, "depth (m), compressed", 10, 16, { color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, GY(0)); ctx.lineTo(ax, GY(DMAX));
    for (const a of [0, 1000, 5000, 10000]) { ctx.moveTo(ax, GY(a)); ctx.lineTo(ax + 5, GY(a)); }
    ctx.stroke();
    for (const a of [0, 1000, 5000, 10000]) text(ctx, a.toLocaleString("en-US"), ax - 5, GY(a), { color: C.muted, size: 10, align: "right", base: "middle" });
    for (const [md, n1, n2] of MARKS) {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax - 3, GY(md)); ctx.lineTo(ax + 9, GY(md)); ctx.stroke();
      text(ctx, n1, ax + 13, GY(md) - 1, { color: C.ink, size: 10 }); text(ctx, n2, ax + 13, GY(md) + 10, { color: C.muted, size: 10 });
    }
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ax, GY(d), 5, 0, TAU); ctx.fill(); ctx.stroke();

    const status = rel ? "ballast released, rising" : landed && d >= DMAX ? "on the bottom" : d < 1 ? "at the surface" : "sinking";
    info.textContent = `${Math.round(d).toLocaleString("en-US")} m · ${fmtP(atm(d))} atm · ${fmtP(kgf(d))} kgf/cm² · ${status}`;
  }

  const lp = loop(row, (t, dt) => draw(t, dt));
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
