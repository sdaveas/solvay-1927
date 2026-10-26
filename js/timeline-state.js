// Pure per-year timeline state: no DOM, no app.js. Used by timeline.js and tools/timeline-check.mjs.
import { PEOPLE } from "../data/people.js";
import { EVENTS } from "../data/events.js";

export const MIN = 1895, MAX = 1965;
const yr = s => +String(s).slice(0, 4);
const prizeYears = p => (p.nobel || []).map(n => +n.slice(-4)).sort((a, b) => a - b); // "Physics 1903" -> 1903

// Year of each person's first key breakthrough: the event marked first: true.
export const firstYear = {};
for (const e of EVENTS) if (e.first) for (const id of e.ids) firstYear[id] = e.year;

// unborn -> waiting (alive, no breakthrough yet) -> lit -> dead. A person counts as dead from the year of death.
export function statusAt(p, year) {
  if (year < yr(p.born)) return "unborn";
  if (year >= yr(p.died)) return "dead";
  return year >= firstYear[p.id] ? "lit" : "waiting";
}

// "★1903·1911" (Nobel years) from the first prize year on, then "†" after death; null when there is nothing to show.
export function labelAt(p, year) {
  const won = prizeYears(p).filter(y => y <= year);
  const parts = [];
  if (won.length) parts.push(`★${won.join("·")}`);
  if (statusAt(p, year) === "dead") parts.push("†");
  return parts.join(" ") || null;
}

export function stateAt(year) {
  const status = {}, labels = {}, lit = [];
  for (const p of PEOPLE) {
    status[p.id] = statusAt(p, year);
    labels[p.id] = labelAt(p, year);
    if (status[p.id] === "lit") lit.push(p.id);
  }
  return { year, status, labels, lit };
}

// Curated events for the year plus births, deaths and Nobel Prizes derived from people.js.
const RANK = { world: 0, discovery: 1, life: 2, nobel: 3, death: 4, birth: 5 };
export function eventsAt(year) {
  const out = EVENTS.filter(e => e.year === year).map(e => ({ ...e, ids: e.ids || [] }));
  const prizes = {};
  for (const p of PEOPLE) for (const n of p.nobel || []) if (+n.slice(-4) === year) (prizes[n.split(" ")[0]] ||= []).push(p);
  for (const [field, ps] of Object.entries(prizes))
    out.push({ year, kind: "nobel", ids: ps.map(p => p.id), title: `Nobel Prize in ${field} ${year}: ${ps.map(p => p.name).join(", ")}` });
  for (const p of PEOPLE) {
    if (yr(p.born) === year) out.push({ year, kind: "birth", ids: [p.id], title: `${p.name} is born` });
    if (yr(p.died) === year) out.push({ year, kind: "death", ids: [p.id], title: `${p.name} dies` });
  }
  return out.sort((a, b) => RANK[a.kind] - RANK[b.kind]); // stable: file order within a kind
}
