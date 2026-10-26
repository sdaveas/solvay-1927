// Data validator. Run: node tools/check.mjs   (exits 1 on any problem)
import { PEOPLE } from "../data/people.js";
import { RELATIONS } from "../data/relations.js";
import { EVENTS } from "../data/events.js";
import { TOURS } from "../data/tours.js";
import { ITEMS } from "../data/everyday.js";
import { EXTRA_DIAGRAMS } from "../data/diagrams.js";
import { existsSync } from "node:fs";

const ids = new Set(PEOPLE.map(p => p.id));
const errs = [];
const need = (ok, msg) => ok || errs.push(msg);

need(PEOPLE.length === 29 && ids.size === 29, "people: expected 29 unique ids");
for (const p of PEOPLE) {
  for (const k of ["name", "born", "died", "from", "tagline", "hook", "legacy"]) need(p[k], `${p.id}: missing ${k}`);
  need(p.box?.length === 4, `${p.id}: bad box`);
  need(p.story?.length && p.contributions?.length && Array.isArray(p.awards), `${p.id}: missing story/contributions/awards`);
}
const TYPES = ["mentor", "influence", "collab", "ally", "debate", "friend", "family"];
RELATIONS.forEach((r, i) => {
  need(ids.has(r.a) && ids.has(r.b) && r.a !== r.b, `relation ${i}: bad ids ${r.a}/${r.b}`);
  need(TYPES.includes(r.type), `relation ${i}: bad type ${r.type}`);
  need(r.summary && r.source?.url?.startsWith("http"), `relation ${i}: needs summary and source.url`);
});
EVENTS.forEach((e, i) => {
  need(e.year >= 1850 && e.year <= 1990 && e.title, `event ${i}: bad year/title`);
  need(["discovery", "world", "life"].includes(e.kind), `event ${i}: bad kind`);
  need((e.ids || []).every(id => ids.has(id)), `event ${i}: unknown id`);
});
TOURS.forEach(t => t.steps.forEach((s, i) => need(s.text && s.ids.every(id => ids.has(id)), `tour ${t.id} step ${i}: bad`)));

ITEMS.forEach(it => {
  need(it.id && it.icon && it.name && it.blurb && it.links?.length, `item ${it.id}: missing fields`);
  for (const l of it.links) need(ids.has(l.id) && l.how, `item ${it.id}: bad link ${l.id}`);
});

for (const [id, names] of Object.entries(EXTRA_DIAGRAMS)) {
  need(ids.has(id), `extra diagrams: unknown person ${id}`);
  for (const n of names) if (!existsSync(new URL(`../js/diagrams/${n}.js`, import.meta.url))) console.warn(`warning: js/diagrams/${n}.js not written yet`);
}

if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
console.log(`ok: ${PEOPLE.length} people, ${RELATIONS.length} relations, ${EVENTS.length} events, ${TOURS.length} tours, ${ITEMS.length} items`);
