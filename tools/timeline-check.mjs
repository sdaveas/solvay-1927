// Checks timeline state and event/stance data. Run: node tools/timeline-check.mjs   (throws on the first failure)
import assert from "node:assert/strict";
import { PEOPLE } from "../data/people.js";
import { EVENTS } from "../data/events.js";
import { CAMPS, STANCES } from "../data/stances.js";
import { MIN, MAX, firstYear, statusAt, labelAt, stateAt, eventsAt } from "../js/timeline-state.js";

const P = Object.fromEntries(PEOPLE.map(p => [p.id, p]));
const eq = assert.equal;

// status
eq(statusAt(P.lorentz, 1927), "lit");
eq(statusAt(P.lorentz, 1928), "dead"); // died February 1928: dead from that year
eq(statusAt(P.lorentz, 1929), "dead");
eq(statusAt(P.pauli, 1899), "unborn");
eq(statusAt(P.pauli, 1900), "waiting");
eq(statusAt(P.pauli, 1925), "lit");
eq(statusAt(P.piccard, 1916), "waiting");
eq(statusAt(P.piccard, 1917), "lit");
// Everyone in the photograph had made their mark by the conference, so the photo year must light every face.
for (const p of PEOPLE) eq(statusAt(p, 1927), "lit", `${p.id} should be lit in 1927`);

// labels
eq(labelAt(P.einstein, 1925), "★1921");
eq(labelAt(P.einstein, 1920), null);
eq(labelAt(P.curie, 1905), "★1903");
eq(labelAt(P.curie, 1911), "★1903·1911");
eq(labelAt(P.lorentz, 1930), "★1902 †");
eq(labelAt(P.ehrenfest, 1934), "†");
eq(labelAt(P.pauli, 1899), null);

// whole-year state
eq(stateAt(1895).lit.join(), "lorentz");
const s27 = stateAt(1927);
eq(s27.lit.length, 29); // the photo year: everyone lit

// events
const t27 = eventsAt(1927).map(e => e.title);
assert.ok(t27.some(t => /uncertainty/i.test(t)) && t27.some(t => /Nobel Prize in Physics 1927: Arthur Compton, C\. T\. R\. Wilson/.test(t)), "1927 events");
eq(eventsAt(1927)[0].kind, "world");
assert.ok(eventsAt(1900).some(e => e.kind === "birth" && e.ids[0] === "pauli"));
assert.ok(eventsAt(1928).some(e => e.kind === "death" && e.ids[0] === "lorentz"));
eq(eventsAt(1903).filter(e => e.kind === "nobel")[0].ids.join(), "curie");

// event data
const first = EVENTS.filter(e => e.first);
eq(first.length, 29);
for (const p of PEOPLE) {
  assert.ok(firstYear[p.id], `${p.id}: no first-breakthrough event`);
  assert.ok(firstYear[p.id] >= +p.born.slice(0, 4) && firstYear[p.id] < +p.died.slice(0, 4), `${p.id}: first breakthrough outside lifetime`);
}
assert.ok(first.every(e => e.kind === "discovery" && e.ids.length === 1), "first events: one person each");
const major = EVENTS.filter(e => e.kind === "discovery" && !e.first).length, world = EVENTS.filter(e => e.kind === "world").length;
assert.ok(major >= 10, `major discoveries: ${major}`);
assert.ok(world >= 8 && world <= 12, `world events: ${world}`);
for (const e of EVENTS) assert.ok(e.source?.title && /^https?:\/\//.test(e.source.url), `no source: ${e.year} ${e.title}`);
assert.ok(EVENTS.every(e => e.year >= MIN - 5 && e.year <= MAX), "event years in range");

// stances
for (const [id, s] of Object.entries(STANCES)) {
  assert.ok(P[id] && CAMPS[s.camp], `stance ${id}: bad id or camp`);
  assert.ok(s.note && /^https?:\/\//.test(s.url), `stance ${id}: needs note and url`);
}
for (const k of ["copenhagen", "skeptic"]) assert.ok(Object.values(STANCES).some(s => s.camp === k), `no one in ${k}`);

console.log(`ok: timeline ${MIN}-${MAX}, ${EVENTS.length} events (${first.length} first, ${major} major, ${world} world), ${Object.keys(STANCES).length} stances`);
