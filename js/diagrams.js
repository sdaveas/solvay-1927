// Loads the animated diagram(s) for whoever is open in the detail dialog (js/diagrams/<id>.js, see DIAGRAMS.md).
// People with several key contributions get one tab per diagram (data/diagrams.js lists the extras).
import { EXTRA_DIAGRAMS } from "../data/diagrams.js";

const slot = document.getElementById("d-diagram");
const dlg = document.getElementById("detail");
let cleanup = null, run = 0;

function unmount() {
  try { cleanup?.(); } catch (err) { console.error(err); }
  cleanup = null;
}
function clear() { unmount(); slot.replaceChildren(); }

document.addEventListener("person:open", async e => {
  const me = ++run, id = e.detail.id;
  clear();
  const names = [id, ...(EXTRA_DIAGRAMS[id] || [])];
  const loaded = await Promise.allSettled(names.map(n => import(`./diagrams/${n}.js`)));
  if (me !== run || !dlg.open) return; // user moved on while it loaded
  loaded.forEach(r => r.status === "rejected" && console.error(r.reason));
  const mods = loaded.filter(r => r.status === "fulfilled").map(r => r.value);
  if (!mods.length) return;

  const sec = document.createElement("section");
  sec.className = "dg";
  sec.innerHTML = mods.length > 1
    ? `<h3>Key contributions</h3><div class="dg-tabs" role="tablist" aria-label="Diagrams">${mods.map((m, i) =>
        `<button role="tab" id="dg-tab-${i}" aria-controls="dg-panel" aria-selected="${!i}" tabindex="${i ? -1 : 0}">${m.title}</button>`).join("")}</div>
       <div id="dg-panel" role="tabpanel"><div class="dg-body"></div><p class="dg-caption"></p></div>`
    : `<h3>${mods[0].title}</h3><div class="dg-body"></div><p class="dg-caption"></p>`;
  slot.append(sec);

  const show = i => {
    unmount();
    const body = document.createElement("div");
    body.className = "dg-body";
    sec.querySelector(".dg-body").replaceWith(body);
    sec.querySelector(".dg-caption").innerHTML = mods[i].caption;
    sec.querySelectorAll("[role=tab]").forEach((t, k) => { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; });
    sec.querySelector("[role=tabpanel]")?.setAttribute("aria-labelledby", `dg-tab-${i}`);
    try { cleanup = mods[i].mount(body) || null; } catch (err) { console.error(err); }
  };
  const tabs = [...sec.querySelectorAll("[role=tab]")];
  tabs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  sec.querySelector("[role=tablist]")?.addEventListener("keydown", ev => { // arrow keys move between tabs (ARIA tabs pattern)
    const i = tabs.indexOf(document.activeElement), d = { ArrowRight: 1, ArrowLeft: -1 }[ev.key];
    if (i < 0 || !d) return;
    const n = (i + d + tabs.length) % tabs.length;
    tabs[n].focus(); show(n);
  });
  show(0);
});
// Stop animations as soon as the dialog closes. Watching the open attribute beats the "close" event, which
// arrives late (or not at all while the page is hidden) and could wipe a diagram for someone opened since.
new MutationObserver(() => { if (!dlg.open) { run++; clear(); } }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
