// Shared helpers for the per-person diagrams (js/diagrams/<id>.js). See DIAGRAMS.md for the contract.
export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(`--${n}`).trim();
export const C = {
  ink: cssVar("ink"), muted: cssVar("muted"), gold: cssVar("gold"), line: cssVar("line"), panel: cssVar("panel"), bg: "#0f0d0b",
  blue: "#4fa8ff", red: "#ff5a4e", green: "#3fd6a0", violet: "#b18cff", pink: "#ff8fcf",
};
export const map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Canvas filling root's width at a fixed aspect ratio, crisp on retina. Draw in CSS pixels using c.w / c.h.
export function canvas(root, { aspect = 16 / 9, label = "" } = {}) {
  const cv = document.createElement("canvas");
  cv.setAttribute("role", "img");
  cv.setAttribute("aria-label", label);
  root.append(cv);
  const c = { cv, ctx: cv.getContext("2d"), w: 0, h: 0, onResize: null };
  // Fading/shrinking effects can overshoot to a tiny negative radius for one frame; browsers throw on that.
  const arc = c.ctx.arc.bind(c.ctx), ellipse = c.ctx.ellipse.bind(c.ctx);
  c.ctx.arc = (x, y, r, ...a) => arc(x, y, Math.max(0, r), ...a);
  c.ctx.ellipse = (x, y, rx, ry, ...a) => ellipse(x, y, Math.max(0, rx), Math.max(0, ry), ...a);
  const fit = () => {
    const w = root.clientWidth;
    if (!w || w === c.w) return;
    const dpr = devicePixelRatio || 1;
    c.w = w; c.h = Math.round(w / aspect);
    cv.width = w * dpr; cv.height = c.h * dpr; cv.style.height = `${c.h}px`;
    c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.onResize?.();
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(root);
  c.dispose = () => ro.disconnect();
  return c;
}

// ── Controls ─────────────────────────────────────────────
export function controls(root) {
  const d = document.createElement("div");
  d.className = "dg-controls";
  root.append(d);
  return d;
}
export function slider(row, { label, min, max, step = 1, value, fmt = v => v }, onInput) {
  const l = document.createElement("label");
  l.className = "dg-slider";
  l.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output></output>`;
  const inp = l.querySelector("input"), out = l.querySelector("output");
  const upd = () => { out.textContent = fmt(+inp.value); onInput?.(+inp.value); };
  inp.addEventListener("input", upd);
  out.textContent = fmt(+inp.value);
  row.append(l);
  return inp;
}
export function button(row, label, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.onclick = onClick;
  row.append(b);
  return b;
}
export function toggle(row, label, checked, onChange) {
  const l = document.createElement("label");
  l.className = "dg-toggle";
  l.innerHTML = `<input type="checkbox"${checked ? " checked" : ""}><span>${label}</span>`;
  const inp = l.querySelector("input");
  inp.addEventListener("change", () => onChange(inp.checked));
  row.append(l);
  return inp;
}
// Plain text line for live numbers (deliberately not aria-live: it updates every frame).
export function readout(root) {
  const p = document.createElement("p");
  p.className = "dg-readout";
  root.append(p);
  return p;
}

// Animation loop with a Play/Pause button. frame(t, dt) gets seconds; dt is 0 for redraws while paused.
// Starts paused (one static frame) when the user prefers reduced motion.
export function loop(row, frame) {
  let raf = 0, last = 0, t = 0, on = false;
  const btn = button(row, "", () => (on ? pause() : play()));
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    frame(t, dt);
    raf = requestAnimationFrame(tick);
  };
  function play() { on = true; btn.textContent = "❚❚ Pause"; last = performance.now(); raf = requestAnimationFrame(tick); }
  function pause() { on = false; btn.textContent = "▶ Play"; cancelAnimationFrame(raf); }
  if (reduced) { pause(); requestAnimationFrame(() => frame(0, 0)); } else play();
  return { stop: () => cancelAnimationFrame(raf), redraw: () => { if (!on) frame(t, 0); }, get playing() { return on; } };
}

// ── Drawing ──────────────────────────────────────────────
export function text(ctx, s, x, y, { color = C.ink, size = 12, align = "left", base = "alphabetic", weight = 400 } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillText(s, x, y);
}
// Axes for a plot rectangle r = {x, y, w, h} (y is the top edge).
export function axes(ctx, r, { xLabel = "", yLabel = "" } = {}) {
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.stroke();
  if (xLabel) text(ctx, xLabel, r.x + r.w, r.y + r.h + 34, { color: C.muted, size: 11, align: "right" }); // below any tick labels
  if (yLabel) {
    ctx.save(); ctx.translate(r.x - 10, r.y); ctx.rotate(-Math.PI / 2);
    text(ctx, yLabel, 0, 0, { color: C.muted, size: 11, align: "right" });
    ctx.restore();
  }
}
// Plots y = f(x) over [x0, x1] inside r, with y mapped from [y0, y1]. Clipped to r.
export function curve(ctx, r, [x0, x1], [y0, y1], f, { color = C.gold, width = 2, dash = [], n = 240 } = {}) {
  ctx.save();
  ctx.beginPath(); ctx.rect(r.x, r.y - 1, r.w, r.h + 2); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n, y = f(x);
    const px = map(x, x0, x1, r.x, r.x + r.w), py = map(Math.min(y, y1 * 10), y0, y1, r.y + r.h, r.y);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

// Approximate colour of light at a wavelength (nm). Outside 380–750 nm returns a dim UV violet or IR red.
export function wavelengthColor(nm, alpha = 1) {
  if (nm < 380) return `rgba(150,120,255,${0.45 * alpha})`;
  if (nm > 750) return `rgba(140,40,30,${0.6 * alpha})`;
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = (440 - nm) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = (645 - nm) / 65; }
  else r = 1;
  const f = nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 700 ? 0.3 + (0.7 * (750 - nm)) / 50 : 1; // dimmer at the edges of vision
  return `rgba(${Math.round(255 * r * f)},${Math.round(255 * g * f)},${Math.round(255 * b * f)},${alpha})`;
}
// Approximate colour of a blackbody at temperature T (K), after Tanner Helland's fit. Good for 1000–12000 K.
export function kelvinColor(T, alpha = 1) {
  const t = T / 100;
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = v => Math.round(clamp(v, 0, 255));
  return `rgba(${c(r)},${c(g)},${c(b)},${alpha})`;
}
