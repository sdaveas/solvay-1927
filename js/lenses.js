// Three colour lenses (age, Nobel, quantum camps), each with a small legend under the photo.
// The photo is black and white and the tint uses a "color" blend, so only hue and saturation show.
import * as App from "./app.js";
import { CAMPS, STANCES } from "../data/stances.js";

const people = App.people;
const short = n => n.match(/(?:\b[dD]e )?\S+$/)[0]; // "Louis de Broglie" -> "de Broglie"
const yearOf = n => n.slice(-4); // "Physics 1903" -> "1903"

let panel, unmount;
function lens(label, fn, html, mount) {
  App.addTool(label, on => {
    unmount?.();
    panel?.remove();
    panel = unmount = null;
    App.setLens(on ? fn : null);
    if (!on) return App.pin(null);
    panel = Object.assign(document.createElement("section"), { className: "lens", innerHTML: html() });
    panel.setAttribute("aria-label", label);
    App.belowPhoto(panel);
    unmount = mount?.(panel);
  }, "lens");
}

// ── Age in 1927: blue (youngest) through purple and red to orange (oldest) ──
const age = p => App.ageAt(p.born);
const ages = people.map(age).sort((a, b) => a - b);
const [lo, hi, median] = [ages[0], ages.at(-1), ages[ages.length >> 1]];
const ageColor = a => `hsl(${215 + ((a - lo) / (hi - lo)) * 180} 85% 55%)`;
const named = a => people.filter(p => age(p) === a).map(p => short(p.name)).join(", ");

lens("Age in 1927", p => ({ color: ageColor(age(p)), label: age(p) }), () => `
  <h2>Age in 1927</h2>
  <div class="bar" style="background: linear-gradient(90deg, ${Array.from({ length: 9 }, (_, i) => ageColor(lo + ((hi - lo) * i) / 8)).join(", ")})"></div>
  <div class="ends"><span>${lo} · ${named(lo)}</span><span>median ${median}</span><span>${hi} · ${named(hi)}</span></div>
  <p class="fine">Age on 24 October 1927, the opening day of the conference. The label under each face is that age in years.</p>`);

// ── Nobel: laureates in gold, labelled with the prize year(s) ──
const GOLD = "#f0b21a";
const laureates = people.filter(p => p.nobel?.length);

lens("Nobel", p => (p.nobel?.length ? { color: GOLD, label: p.nobel.map(yearOf).join(" · ") } : null), () => `
  <h2>Nobel Prizes</h2>
  <div class="row"><span class="swatch" style="--c:${GOLD}"></span>Nobel laureate (${laureates.length} of ${people.length}); the label gives the prize year(s)</div>
  <div class="row"><span class="swatch"></span>No Nobel Prize (${people.length - laureates.length})</div>
  <p class="fine">Years are the year each prize is named for; Planck's, Einstein's, Heisenberg's and Richardson's were announced a year later.
    Marie Curie won twice, in physics and in chemistry.</p>`);

// ── Quantum camps: assignments and sources live in data/stances.js ──
const campOf = id => STANCES[id]?.camp ?? "none";
const members = k => people.filter(p => campOf(p.id) === k);
const ORDER = ["copenhagen", "skeptic", "none"];

function campsHtml() {
  const rows = ORDER.map(k => `
    <div class="camp" data-camp="${k}">
      <div class="row"><span class="swatch" style="--c:${CAMPS[k].color ?? "transparent"}"></span><strong>${CAMPS[k].label}</strong><span class="muted">${CAMPS[k].blurb}</span></div>
      <div class="who">${members(k).map(p => `<button type="button" data-id="${p.id}">${short(p.name)}</button>`).join("")}</div>
    </div>`);
  return `
    <h2>Quantum camps around 1927</h2>${rows.join("")}
    <p class="note" aria-live="polite"></p>
    <p class="fine">A deliberate simplification. Views shifted over time, many attendees took no public side, and only people whose stance
      is clearly documented are placed. Hover a name, a camp or a face for the reason and its source.</p>`;
}

function mountCamps(el) {
  const note = el.querySelector(".note"), idle = "Hover a name, a camp or a face.";
  const show = id => {
    const s = STANCES[id];
    note.innerHTML = `<strong>${App.byId[id].name}</strong> · ${CAMPS[campOf(id)].label}. ` +
      (s ? `${s.note} <a href="${s.url}" target="_blank" rel="noopener">source</a>` : "No side clearly documented in the sources checked.");
  };
  const over = e => {
    const t = e.target.closest("[data-id], [data-camp]");
    if (!t) return;
    if (t.dataset.id) { show(t.dataset.id); App.highlight([t.dataset.id]); }
    else App.highlight(members(t.dataset.camp).map(p => p.id));
  };
  const out = () => { App.highlight(null); note.textContent = idle; };
  const face = e => { const f = e.target.closest(".spot"); if (f) show(f.dataset.id); };
  note.textContent = idle;
  el.addEventListener("pointerover", over);
  el.addEventListener("focusin", over);
  el.addEventListener("pointerout", out);
  el.addEventListener("focusout", out);
  App.stage.addEventListener("pointerover", face);
  App.stage.addEventListener("focusin", face);
  return () => { // panel removal drops its own listeners; the stage ones must be removed here
    App.stage.removeEventListener("pointerover", face);
    App.stage.removeEventListener("focusin", face);
  };
}

lens("Quantum camps", p => {
  const c = CAMPS[campOf(p.id)];
  return c.color ? { color: c.color, label: c.label } : null;
}, campsHtml, mountCamps);
