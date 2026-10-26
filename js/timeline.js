// Timeline tool: a year slider (1895-1965) that lights each face from its first key discovery until death,
// labels Nobel years and deaths, and lists that year's events. State maths lives in timeline-state.js.
import * as App from "./app.js";
import { MIN, MAX, stateAt, eventsAt } from "./timeline-state.js";

const START = 1927, STEP_MS = 650;
const NONE = ["-"]; // pin() of an empty list would undim the photo, so dim everyone with an id nobody has
const KIND = { discovery: "Discovery", world: "World", life: "Life", nobel: "Nobel", birth: "Born", death: "Died" };
const rm = matchMedia("(prefers-reduced-motion: reduce)");
const h = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls, textContent: text });
const at = y => (y - MIN) / (MAX - MIN); // slider fraction, drives tick positions in css

let year = START, lit = [], selected = null, shown = NONE, timer = null;
let panel, play, slider, out, stats, list;

function build() {
  const ticks = [];
  for (let y = 1900; y <= MAX; y += 10) ticks.push(`<span style="--f:${at(y)}">${y}</span>`);
  panel = h("section", "tl");
  panel.setAttribute("aria-label", "Timeline");
  panel.innerHTML = `
    <div class="tl-bar">
      <button class="tl-play" type="button"></button>
      <output class="tl-year" aria-live="off"></output>
      <div class="tl-slide">
        <input type="range" min="${MIN}" max="${MAX}" step="1" aria-label="Year">
        <div class="tl-ticks" aria-hidden="true">${ticks.join("")}</div>
        <button class="mark" type="button" style="--f:${at(START)}">▲ ${START}, the photograph</button>
      </div>
    </div>
    <p class="tl-stats"></p>
    <ul class="tl-events" aria-label="Events this year"></ul>
    <p class="tl-note">A face lights up once its owner has made a first key discovery, and stays lit until death (†). ★ marks Nobel Prize years.
      Dim faces: not yet born, not yet broken through, or deceased. Hover or click an event to see who was involved.</p>`;
  [play, out, slider, stats, list] = [".tl-play", ".tl-year", "input", ".tl-stats", ".tl-events"].map(s => panel.querySelector(s));
  slider.oninput = () => { stop(); set(+slider.value); };
  play.onclick = () => (timer ? stop() : start());
  panel.querySelector(".mark").onclick = () => { stop(); set(START); };
  syncMotion();
  rm.addEventListener("change", syncMotion);
}

// Autoplay is motion, so it stays off for users who ask the system for reduced motion; the slider still works.
function syncMotion() {
  play.disabled = rm.matches;
  play.title = rm.matches ? "Autoplay is off because your system prefers reduced motion. Use the slider or arrow keys." : "";
  if (rm.matches) stop();
  paintPlay();
}
function paintPlay() { play.textContent = timer ? "❚❚ Pause" : "▶ Play"; }
function start() {
  if (year >= MAX) set(MIN);
  timer = setInterval(() => { set(year + 1); if (year >= MAX) stop(); }, STEP_MS);
  paintPlay();
}
function stop() { clearInterval(timer); timer = null; if (play) paintPlay(); }

// The faces to keep highlighted: the clicked event's people, else everyone lit this year.
function apply() {
  shown = selected?.ids.length ? selected.ids : lit.length ? lit : NONE;
  App.pin(shown);
}

function row(e) {
  const li = h("li", `ev ${e.kind}`);
  const body = e.ids.length ? h("button", "") : h("span", "ev-plain");
  body.append(h("span", "ev-kind", KIND[e.kind]), h("span", "ev-title", e.title));
  if (e.ids.length) {
    body.type = "button";
    body._e = e;
    body.setAttribute("aria-pressed", "false");
    body.onpointerenter = body.onfocus = () => App.highlight(e.ids);
    body.onpointerleave = body.onblur = () => App.highlight(shown);
    body.onclick = () => {
      selected = selected === e ? null : e;
      apply();
      list.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b._e === selected)));
    };
  }
  li.append(body);
  if (e.source) {
    const a = h("a", "ev-src", "source");
    Object.assign(a, { href: e.source.url, target: "_blank", rel: "noopener", title: e.source.title });
    a.setAttribute("aria-label", `Source: ${e.source.title}`);
    li.append(a);
  }
  return li;
}

function render() {
  const st = stateAt(year), events = eventsAt(year);
  const n = s => Object.values(st.status).filter(v => v === s).length;
  lit = st.lit;
  slider.value = year;
  out.textContent = year;
  stats.textContent = `${n("lit")} lit · ${n("waiting")} yet to break through · ${n("unborn")} not yet born · ${n("dead")} deceased`;
  list.replaceChildren(...(events.length ? events.map(row) : [h("li", "ev-empty", "No recorded events this year.")]));
  App.setLens(p => (st.labels[p.id] ? { label: st.labels[p.id] } : null));
  apply();
}

function set(y) {
  year = Math.min(MAX, Math.max(MIN, y));
  selected = null;
  render();
}

App.addTool("Timeline", on => {
  if (on) {
    build();
    App.belowPhoto(panel);
    set(year);
  } else {
    stop();
    rm.removeEventListener("change", syncMotion);
    App.setLens(null);
    App.pin(null);
    panel?.remove();
    panel = null;
  }
}, "lens");
