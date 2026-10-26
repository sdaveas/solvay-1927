// Headless smoke test for diagrams. Run: node tools/diagram-smoke.mjs [js/diagrams/<id>.js ...]   (no args = all)
// Mounts each diagram against a fake DOM/canvas, runs frames, drives every slider/button/toggle,
// and fails on exceptions, NaN/Infinity passed to the canvas, or missing exports. Not a visual check.
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join, basename, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "js/diagrams");
const files = process.argv.slice(2).length ? process.argv.slice(2).map(f => resolve(f))
  : readdirSync(dir).filter(f => f.endsWith(".js") && f !== "kit.js").map(f => join(dir, f));

// Minimal browser globals so the real kit.js loads.
const el = () => new Proxy({ style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} }, children: [], clientWidth: 600 }, {
  get: (t, k) => (k in t ? t[k] : typeof k === "string" ? (k.startsWith("on") ? null : () => el()) : undefined),
  set: (t, k, v) => ((t[k] = v), true),
});
Object.assign(globalThis, {
  matchMedia: () => ({ matches: false }),
  getComputedStyle: () => ({ getPropertyValue: () => "#cccccc" }),
  document: { documentElement: {}, createElement: el, createElementNS: el, getElementById: el, querySelector: el },
  devicePixelRatio: 2, performance: { now: () => 0 }, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  ResizeObserver: class { observe() {} disconnect() {} },
});

let errors = [];
const check = (name, args) => {
  for (const a of args) if (typeof a === "number" && !Number.isFinite(a)) errors.push(`ctx.${name} got ${a}`);
  // browsers throw on negative radii
  if (name === "arc" && args[2] < 0) errors.push(`ctx.arc negative radius ${args[2]}`);
  if (name === "ellipse" && (args[2] < 0 || args[3] < 0)) errors.push(`ctx.ellipse negative radius`);
  if (name === "createRadialGradient" && (args[2] < 0 || args[5] < 0)) errors.push(`createRadialGradient negative radius`);
};
const gradient = () => ({ addColorStop: (o, c) => check("addColorStop", [o]) });
const ctx = new Proxy({}, {
  get: (t, k) => k in t ? t[k] : k === "createRadialGradient" || k === "createLinearGradient" ? (...a) => (check(k, a), gradient())
    : k === "measureText" ? s => ({ width: String(s).length * 6 }) : k === "getImageData" ? () => ({ data: new Uint8ClampedArray(4) })
    : (...a) => check(k, a),
  set: (t, k, v) => { if (typeof v === "number") check(k, [v]); t[k] = v; return true; },
});

const real = pathToFileURL(join(dir, "kit.js")).href;
const stub = `
export * from ${JSON.stringify(real)};
export const UI = { sliders: [], buttons: [], toggles: [], frames: [] };
export function canvas(root, o = {}) { const w = globalThis.__w; return { cv: {}, ctx: globalThis.__ctx, w, h: Math.round(w / (o.aspect || 16 / 9)), onResize: null, dispose() {} }; }
export function controls() { return {}; }
export function slider(row, o, fn) { UI.sliders.push({ o, fn }); return { value: o.value }; }
export function button(row, label, fn) { UI.buttons.push({ label, fn }); return { textContent: label }; }
export function toggle(row, label, v, fn) { UI.toggles.push({ label, fn, v }); return { checked: v }; }
export function readout() { return { textContent: "" }; }
export function loop(row, frame) { UI.frames.push(frame); return { stop() {}, redraw() { frame(0, 0); }, playing: true }; }
`;
globalThis.__ctx = ctx;
const tmp = mkdtempSync(join(tmpdir(), "dg-"));
writeFileSync(join(tmp, "kit.js"), stub);

let failed = 0;
for (const f of files) for (const width of [600, 320]) {
  errors = [];
  globalThis.__w = width;
  const copy = join(tmp, basename(f));
  writeFileSync(copy, readFileSync(f, "utf8"));
  try {
    const m = await import(pathToFileURL(copy).href + `?${Date.now()}`);
    const { UI } = await import(pathToFileURL(join(tmp, "kit.js")).href);
    for (const k of ["sliders", "buttons", "toggles", "frames"]) UI[k].length = 0;
    if (typeof m.title !== "string" || typeof m.caption !== "string" || typeof m.mount !== "function") throw new Error("must export title, caption, mount");
    const cleanup = m.mount(el());
    if (typeof cleanup !== "function") throw new Error("mount must return a cleanup function");
    let t = 0;
    const run = n => { for (let i = 0; i < n; i++) { const dt = i % 3 ? 1 / 60 : 0.05 * Math.random(); for (const fr of UI.frames) fr((t += dt), dt); } }; // mix in uneven frame times
    run(180);
    for (const { o, fn } of UI.sliders) for (const v of [o.min, o.max, o.value]) { fn?.(v); run(30); }
    for (const b of UI.buttons) { b.fn(); run(60); }
    for (const tg of UI.toggles) { tg.fn(!tg.v); run(60); tg.fn(tg.v); run(30); }
    cleanup();
    if (!UI.frames.length) errors.push("no animation loop (use kit.loop)");
  } catch (err) { errors.push(err.stack?.split("\n").slice(0, 3).join(" | ") || String(err)); }
  const uniq = [...new Set(errors)];
  console.log(`${uniq.length ? "FAIL" : "ok  "} ${basename(f)} @${width}px${uniq.length ? "\n  " + uniq.slice(0, 6).join("\n  ") : ""}`);
  if (uniq.length) failed++;
}
rmSync(tmp, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
