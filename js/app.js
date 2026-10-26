// Core: photo, face hotspots, hover tooltip, detail dialog, narration.
// Feature modules (graph, timeline, tours...) import the API exported at the bottom.
import { PEOPLE } from "../data/people.js";

// 2000px copy of the Commons original (Couprie, 1927). Rights: see README before publishing.
export const IMG = "assets/solvay-1927.jpg";
export const W = 3000, H = 2171; // original pixel size; face boxes are in these units
export const CONFERENCE_DATE = "1927-10-24";

export const people = PEOPLE;
export const byId = Object.fromEntries(PEOPLE.map(p => [p.id, p]));

const $ = id => document.getElementById(id);
const stage = $("stage"), tip = $("tip"), dlg = $("detail");
const spots = {};

export function ageAt(born, on = CONFERENCE_DATE) {
  const b = new Date(born), d = new Date(on);
  let a = d.getUTCFullYear() - b.getUTCFullYear();
  if (d.getUTCMonth() < b.getUTCMonth() || (d.getUTCMonth() === b.getUTCMonth() && d.getUTCDate() < b.getUTCDate())) a--;
  return a;
}
const years = p => `${p.born.slice(0, 4)}–${p.died.slice(0, 4)}`;
const meta = p => `${p.from} · ${years(p)} · age ${ageAt(p.born)} in 1927`;

// CSS background that shows exactly one face box, scaled to the element's width.
export function cropStyle([x, y, w, h]) {
  return {
    backgroundImage: `url("${IMG}")`,
    backgroundSize: `${(W / w) * 100}% auto`,
    backgroundPosition: `${(x / (W - w)) * 100}% ${(y / (H - h)) * 100}%`,
    aspectRatio: `${w} / ${h}`,
  };
}
const cropVar = ([x, y, w, h]) =>
  `url("${IMG}") ${(x / (W - w)) * 100}% ${(y / (H - h)) * 100}% / ${(W / w) * 100}% auto`;

// Face centre in % of the stage, for modules that draw on top of the photo.
export function faceCenter(id) {
  const [x, y, w, h] = byId[id].box;
  return { x: ((x + w / 2) / W) * 100, y: ((y + h / 2) / H) * 100 };
}

// ── Highlight & lenses (public) ──────────────────────────
let pinned = null; // ids highlighted by a module (tour, graph); hover falls back to these
export function highlight(ids) {
  const set = new Set(ids || []);
  stage.classList.toggle("dim", set.size > 0);
  for (const [id, el] of Object.entries(spots)) el.classList.toggle("lit", set.has(id));
}
export function pin(ids) { pinned = ids; highlight(ids); }

// fn(person) -> { color?, label? } | null. Pass null to clear.
export function setLens(fn) {
  for (const p of PEOPLE) {
    const el = spots[p.id], r = fn ? fn(p) : null;
    el.style.removeProperty("--tint");
    el.querySelector(".label")?.remove();
    if (r?.color) el.style.setProperty("--tint", r.color);
    if (r?.label != null) el.insertAdjacentHTML("beforeend", `<span class="label">${r.label}</span>`);
  }
}

// Adds a toggle button to the toolbar; onToggle(active) runs on every change.
// Tools sharing a group are exclusive: turning one on turns the others off first.
const tools = [];
export function addTool(label, onToggle, group = null) {
  const b = document.createElement("button");
  const t = { b, group, set(on) { b.setAttribute("aria-pressed", String(on)); onToggle(on, b); } };
  b.textContent = label;
  b.setAttribute("aria-pressed", "false");
  b.onclick = () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    if (on && group) tools.filter(o => o !== t && o.group === group && o.b.getAttribute("aria-pressed") === "true").forEach(o => o.set(false));
    t.set(on);
  };
  tools.push(t);
  $("tools").append(b);
  return b;
}

// While set, clicking a face calls fn(id) instead of opening the detail view (used by the quiz).
let clickHandler = null;
export function setClickHandler(fn) { clickHandler = fn; }

export { stage };

// Inserts a module's panel directly below the photo (outside the mobile scroller, so sticky positioning still works).
export function belowPhoto(el) { stage.parentElement.after(el); }

// ── Hotspots & tooltip ───────────────────────────────────
$("photo").src = IMG;
const scroller = stage.parentElement; // on phones the photo is wider than the screen; start at the centre (Einstein, Lorentz)
requestAnimationFrame(() => { scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2; });
for (const p of PEOPLE) {
  const [x, y, w, h] = p.box;
  const b = document.createElement("button");
  b.className = "spot";
  b.dataset.id = p.id;
  b.setAttribute("aria-label", `${p.name}: ${p.tagline}`);
  Object.assign(b.style, { left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, width: `${(w / W) * 100}%`, height: `${(h / H) * 100}%` });
  b.style.setProperty("--crop", cropVar(p.box));
  spots[p.id] = b;
  stage.append(b);
}

const chips = p => (p.nobel || []).map(n => `<span class="chip">Nobel · ${n}</span>`).join("");

// Docked: the tooltip sits in a top corner of the photo (sky and building, no faces) instead of following the pointer.
// Used while lines are drawn on the photo, so the card never covers them.
let docked = false, tipFor = null;
export function dockTip(on) { docked = on; tip.classList.toggle("docked", on); }

function showTip(p, x, y) {
  tipFor = p;
  tip.innerHTML = `
    <div class="row"><div class="portrait"></div>
      <div><h4>${p.name}</h4><p class="meta">${meta(p)}</p></div></div>
    <p class="tagline">${p.tagline}</p>
    <div class="chips">${chips(p)}</div>
    <p>${p.hook}</p>
    <p class="hint">Click for the full story</p>`;
  Object.assign(tip.querySelector(".portrait").style, cropStyle(p.box));
  tip.hidden = false;
  moveTip(x, y);
  highlight([p.id]);
}
function moveTip(x, y) {
  const r = tip.getBoundingClientRect(), pad = 18;
  if (docked) { // corner opposite the hovered face
    const s = stage.getBoundingClientRect(), right = faceCenter(tipFor.id).x < 50;
    tip.style.left = `${right ? Math.max(8, s.right - r.width - 12) : Math.max(8, s.left + 12)}px`;
    tip.style.top = `${Math.max(8, s.top + 12)}px`;
    return;
  }
  const left = x + pad + r.width > innerWidth ? x - pad - r.width : x + pad;
  const top = Math.min(y + pad, innerHeight - r.height - 8);
  tip.style.left = `${Math.max(8, left)}px`;
  tip.style.top = `${Math.max(8, top)}px`;
}
function hideTip() { tip.hidden = true; highlight(pinned); }

stage.addEventListener("pointerover", e => {
  const el = e.target.closest(".spot");
  if (el && e.pointerType !== "touch") showTip(byId[el.dataset.id], e.clientX, e.clientY); // touch: a tap opens the dialog instead
});
stage.addEventListener("pointermove", e => { if (!tip.hidden) moveTip(e.clientX, e.clientY); });
stage.addEventListener("pointerout", e => { if (e.target.closest(".spot") && !e.relatedTarget?.closest?.(".spot")) hideTip(); });
stage.addEventListener("focusin", e => {
  const el = e.target.closest(".spot");
  if (!el) return;
  const r = el.getBoundingClientRect();
  showTip(byId[el.dataset.id], r.right, r.top);
});
stage.addEventListener("focusout", hideTip);
stage.addEventListener("click", e => {
  const el = e.target.closest(".spot");
  if (el) (clickHandler || openDetail)(el.dataset.id);
});

// ── Detail dialog & narration ────────────────────────────
let current = null;

export function openDetail(id) {
  const p = byId[id];
  current = id;
  stopNarration();
  hideTip();
  Object.assign($("d-portrait").style, cropStyle(p.box));
  $("d-name").textContent = p.name;
  $("d-meta").textContent = meta(p);
  $("d-tagline").textContent = p.tagline;
  $("d-nobel").innerHTML = chips(p);
  $("d-story").innerHTML = p.story.map(t => `<p>${t}</p>`).join("");
  $("d-contrib").innerHTML = p.contributions.map(t => `<li>${t}</li>`).join("");
  $("d-awards").innerHTML = (p.awards.length ? p.awards : ["No major prizes; his name lives on in physics instead."])
    .map(t => `<li>${t}</li>`).join("");
  $("d-legacy").textContent = p.legacy;
  $("d-extra").replaceChildren(); // modules refill this on "person:open"
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
  document.dispatchEvent(new CustomEvent("person:open", { detail: { id } }));
}

function step(delta) {
  const i = PEOPLE.findIndex(p => p.id === current);
  openDetail(PEOPLE[(i + delta + PEOPLE.length) % PEOPLE.length].id);
}
$("d-prev").onclick = () => step(-1);
$("d-next").onclick = () => step(1);
dlg.querySelector("[data-close]").onclick = () => dlg.close();
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // backdrop click
dlg.addEventListener("close", stopNarration);
dlg.addEventListener("keydown", e => {
  if (e.target.closest("input, select, textarea, [role=tablist]")) return; // sliders and diagram tabs own their arrow keys
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

const narrateBtn = $("d-narrate");
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
  return vs.find(v => /Premium|Enhanced|Natural/.test(v.name)) || vs.find(v => v.localService) || vs[0];
}
function stopNarration() {
  speechSynthesis.cancel();
  narrateBtn.textContent = "▶ Narrate";
  dlg.querySelectorAll(".speaking").forEach(el => el.classList.remove("speaking"));
}
narrateBtn.onclick = () => {
  if (speechSynthesis.speaking) return stopNarration();
  const els = [...$("d-story").children, $("d-legacy")];
  const voice = pickVoice();
  els.forEach((el, i) => {
    const u = new SpeechSynthesisUtterance(el.textContent);
    u.voice = voice;
    u.rate = 0.95;
    u.onstart = () => { els.forEach(e => e.classList.remove("speaking")); el.classList.add("speaking"); };
    if (i === els.length - 1) u.onend = stopNarration;
    speechSynthesis.speak(u);
  });
  narrateBtn.textContent = "■ Stop";
};
