// Guided tours: a menu of tours, then a caption player that pins each step's faces and can read it aloud.
import * as App from "./app.js";
import { TOURS } from "../data/tours.js";
import { ITEMS } from "../data/everyday.js";

const main = document.querySelector("main");
const synth = window.speechSynthesis;
let panel = null, tour = null, i = 0, narrating = false, token = 0; // token invalidates stale "end" events
let stuck = null; // item id kept lit by a click/tap in the pocket tour

const q = sel => panel.querySelector(sel);

function pickVoice() {
  const vs = synth.getVoices().filter(v => v.lang.startsWith("en"));
  return vs.find(v => /Premium|Enhanced|Natural/.test(v.name)) || vs.find(v => v.localService) || vs[0];
}

function hush() { token++; synth?.cancel(); }

// One utterance per sentence: long utterances get cut off silently in some browsers.
function speak() {
  hush();
  if (!narrating) return;
  const mine = token, voice = pickVoice(), parts = tour.steps[i].text.match(/[^.!?]+[.!?]*/g);
  parts.forEach((s, k) => {
    const u = new SpeechSynthesisUtterance(s);
    if (voice) u.voice = voice;
    u.rate = 0.95;
    if (k === parts.length - 1) u.onend = () => { if (mine === token && i < tour.steps.length - 1) go(i + 1); };
    synth.speak(u);
  });
}

// Scroll just enough that the lit faces sit above the sticky caption (the photo is taller than most screens).
export function reveal(ids, box) {
  const r = App.stage.getBoundingClientRect(), free = innerHeight - box.offsetHeight - 24;
  const ys = ids.map(id => r.top + (App.faceCenter(id).y / 100) * r.height);
  const lo = Math.min(...ys), hi = Math.max(...ys);
  if (lo >= 24 && hi <= free) return;
  window.scrollBy({ top: (lo + hi) / 2 - free / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function menu() {
  hush();
  tour = null;
  App.pin(null);
  panel.className = "mode-panel tours";
  panel.innerHTML = `
    <h2 class="mode-title">Guided tours</h2>
    <p class="mode-sub">Each stop lights up the faces in the story. Click a lit face to open their full profile.</p>
    <div class="tour-cards">${TOURS.map((t, k) => `
      <button class="tour-card" data-k="${k}"><strong>${t.title}</strong><span>${t.blurb}</span><em>${t.steps.length} stops</em></button>`).join("")}
    </div>`;
}

const live = () => q(".tour-body").setAttribute("aria-live", narrating ? "off" : "polite"); // don't double-read

function play(k) {
  tour = TOURS[k];
  panel.className = "mode-panel tours playing";
  panel.innerHTML = `
    <div class="tour-head"><h2 class="mode-title"></h2><button data-a="menu">All tours</button></div>
    <div class="tour-body" aria-live="polite" aria-atomic="true"></div>
    ${tour.id === "pocket" ? `
    <div class="pocket" role="group" aria-label="Everyday technology">
      <p class="pocket-hint">Point at something you use to light up the people behind it. Click or tap to keep it open.</p>
      <div class="pocket-items">${ITEMS.map(it => `
        <button class="pocket-item" data-item="${it.id}" aria-pressed="false"><span aria-hidden="true">${it.icon}</span>${it.name}</button>`).join("")}
      </div>
    </div>` : ""}
    <div class="tour-bar">
      <button data-a="prev">← Back</button>
      <button data-a="next" class="primary">Next →</button>
      ${synth ? `<button data-a="narr" aria-pressed="${narrating}">Read aloud</button>` : ""}
    </div>
    <p class="tour-keys">Arrow keys move between stops. Escape returns to all tours.</p>`;
  q("h2").textContent = tour.title;
  live();
  go(0);
}

function showStep() {
  const last = tour.steps.length - 1, s = tour.steps[i];
  App.pin(s.ids);
  q(".tour-body").innerHTML = `<p class="tour-step">Stop ${i + 1} of ${last + 1}</p><p class="tour-text">${s.text}</p>`;
}

function go(n) {
  const last = tour.steps.length - 1;
  i = n;
  setStuck(null);
  showStep();
  q('[data-a="prev"]').disabled = n === 0;
  q('[data-a="next"]').textContent = n === last ? "Finish" : "Next →";
  reveal(tour.steps[n].ids, panel);
  speak();
}

// ── Pocket tour: modern items light up the people behind them ──
function showItem(id) {
  const it = ITEMS.find(x => x.id === id), ids = it.links.map(l => l.id);
  App.pin(ids);
  q(".tour-body").innerHTML = `<p class="tour-step"><span aria-hidden="true">${it.icon}</span> ${it.name}</p>
    <p class="pocket-blurb">${it.blurb}</p>
    <ul class="pocket-links">${it.links.map(l => `<li><b>${App.byId[l.id].name}</b>: ${l.how}${l.source ? ` <a class="pocket-src" href="${l.source.url}" target="_blank" rel="noopener" title="${l.source.title}">source ↗</a>` : ""}</li>`).join("")}</ul>`;
  reveal(ids, panel);
}
function setStuck(id) {
  stuck = id;
  panel?.querySelectorAll(".pocket-item").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.item === id)));
}
const itemOf = e => e.target.closest?.(".pocket-item")?.dataset.item;
function onOver(e) { const id = tour && itemOf(e); if (id) showItem(id); }
function onOut(e) {
  if (!tour || !itemOf(e) || e.relatedTarget?.closest?.(".pocket-item")) return;
  stuck ? showItem(stuck) : showStep();
}

const step = d => { const n = i + d; if (n >= 0 && n < tour.steps.length) go(n); };
const toMenu = () => { menu(); q(".tour-card").focus(); };

function onClick(e) {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.k) { play(+b.dataset.k); return q('[data-a="next"]').focus({ preventScroll: true }); }
  if (b.dataset.item) { setStuck(stuck === b.dataset.item ? null : b.dataset.item); return stuck ? showItem(stuck) : showStep(); }
  switch (b.dataset.a) {
    case "prev": return step(-1);
    case "next": return i === tour.steps.length - 1 ? toMenu() : step(1);
    case "menu": return toMenu();
    case "narr":
      narrating = !narrating;
      b.setAttribute("aria-pressed", narrating);
      live();
      return speak();
  }
}

document.addEventListener("keydown", e => {
  if (!tour || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (document.querySelector("dialog[open]") || e.target.closest?.("input, select, textarea")) return; // dialog and sliders own the arrows
  if (e.key === "ArrowRight") step(1);
  else if (e.key === "ArrowLeft") step(-1);
  else if (e.key === "Escape") toMenu();
});

// Opening a profile pauses narration; the user can switch it back on.
document.addEventListener("person:open", () => {
  if (!tour || !narrating) return;
  narrating = false;
  q('[data-a="narr"]').setAttribute("aria-pressed", "false");
  live();
  hush();
});

App.addTool("Tours", on => {
  if (on) {
    panel = document.createElement("section");
    panel.setAttribute("aria-label", "Guided tours");
    panel.onclick = onClick;
    panel.addEventListener("pointerover", onOver);
    panel.addEventListener("pointerout", onOut);
    panel.addEventListener("focusin", onOver);
    panel.addEventListener("focusout", onOut);
    main.append(panel);
    menu();
  } else {
    const p = panel;
    panel = tour = stuck = null; // first, so focus events fired by the removal below are ignored
    hush();
    App.pin(null);
    p?.remove();
    narrating = false;
  }
}, "mode");
