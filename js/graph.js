// Connections: arcs on the photo, type filter legend, D3 network view, and a per-person list in the dialog.
import * as App from "./app.js";
import { RELATIONS } from "../data/relations.js";

// ponytail: D3 is imported on first use, so a CDN outage only disables the network view, not the whole site.
const D3_URL = "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// out/in: heading in a person's dialog when they are the first/second person of the edge (symmetric types only use out).
const TYPES = {
  mentor:    { label: "Mentor",        color: "#4fa8ff", directed: true, out: "Mentor of", in: "Mentored by" },
  influence: { label: "Influence",     color: "#b18cff", directed: true, out: "Influenced", in: "Influenced by" },
  collab:    { label: "Collaboration", color: "#3fd6a0", out: "Worked with" },
  ally:      { label: "Allies",        color: "#f2d44e", out: "Aligned with" },
  debate:    { label: "Debate",        color: "#ff5a4e", dash: "7 5", out: "Debated" },
  friend:    { label: "Friendship",    color: "#ff8fcf", out: "Friends with" },
  family:    { label: "Family",        color: "#f1e9dc", out: "Related to" },
};
const T = Object.keys(TYPES);
const R = RELATIONS.filter(r => App.byId[r.a] && App.byId[r.b] && TYPES[r.type]);
const adj = {}; // id -> edges
for (const r of R) for (const id of [r.a, r.b]) (adj[id] ||= []).push(r);

const other = (r, id) => (r.a === id ? r.b : r.a);
const bendOf = r => 0.14 + 0.05 * T.indexOf(r.type); // different types between the same pair get different curvature
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);
const short = n => n.replace(/^.*?\s((?:[Dd]e )?\S+)$/, "$1");
const yrs = y => { const [s, e] = y || []; return s ? (e && e !== s ? `${s}–${e}` : `${s}`) : ""; };
const dashAttr = t => (t.dash ? ` stroke-dasharray="${t.dash}"` : "");
const src = r => (r.source?.url ? `<a href="${esc(r.source.url)}" target="_blank" rel="noopener">${esc(r.source.title || "Source")} ↗</a>` : "");

let active = false, runId = 0;
const off = new Set(); // hidden types
let svg, legend, netSec, net, cur;
const vis = id => (adj[id] || []).filter(r => !off.has(r.type));

// Quadratic arc p0 -> p1, trimmed to the two node outlines (ellipses with semi-axes s0/s1, plus gap). hs > 0 adds an arrowhead at p1.
function arc([x0, y0], [x1, y1], bend, s0, s1, gap, hs) {
  const cx = (x0 + x1) / 2 - (y1 - y0) * bend, cy = (y0 + y1) / 2 + (x1 - x0) * bend;
  const out = ([x, y], [a, b]) => {
    const l = Math.hypot(cx - x, cy - y) || 1, ux = (cx - x) / l, uy = (cy - y) / l;
    const r = 1 / Math.hypot(ux / a, uy / b) + gap;
    return [x + ux * r, y + uy * r, ux, uy];
  };
  const [sx, sy] = out([x0, y0], s0);
  let [ex, ey, ux, uy] = out([x1, y1], s1), head = "";
  if (hs) {
    const bx = ex + ux * hs, by = ey + uy * hs, px = -uy * hs * 0.45, py = ux * hs * 0.45;
    head = `M${ex},${ey}L${bx + px},${by + py}L${bx - px},${by - py}Z`;
    ex += ux * hs * 0.8; ey += uy * hs * 0.8;
  }
  return { d: `M${sx},${sy}Q${cx},${cy} ${ex},${ey}`, head };
}

// ── Arcs on the photo ────────────────────────────────────
const center = id => { const [x, y, w, h] = App.byId[id].box; return [x + w / 2, y + h / 2]; };
const semi = id => { const b = App.byId[id].box; return [b[2] / 2, b[3] / 2]; };

function show(id, redraw = cur !== id) { // redraw=false: the core re-highlighted the same face (e.g. pointer moved onto its label)
  cur = id;
  const es = vis(id), k = svg.getBoundingClientRect().width / App.W || 0.4; // px per photo unit, to keep heads a constant size
  if (redraw) svg.innerHTML = es.map(r => {
    const t = TYPES[r.type], g = arc(center(r.a), center(r.b), bendOf(r), semi(r.a), semi(r.b), 6 / k, t.directed ? 12 / k : 0);
    return `<path class="cx-line" d="${g.d}" stroke="${t.color}"${dashAttr(t)}/>${g.head ? `<path d="${g.head}" fill="${t.color}"/>` : ""}`;
  }).join("");
  App.highlight([id, ...es.map(r => other(r, id))]);
}
function clear() { cur = null; svg?.replaceChildren(); } // the core restores the pinned highlight on pointerout/focusout

// Core listeners on the stage run first (app.js loads before this file); these run after and override its highlight.
const faceOf = e => (active ? e.target.closest(".spot")?.dataset.id : null);
const leaving = e => faceOf(e) && !e.relatedTarget?.closest?.(".spot");
App.stage.addEventListener("pointerover", e => { const id = faceOf(e); if (id) show(id); });
App.stage.addEventListener("focusin", e => { const id = faceOf(e); if (id) show(id); });
App.stage.addEventListener("pointerout", e => { if (leaving(e)) clear(); });
App.stage.addEventListener("focusout", e => { if (leaving(e)) clear(); });

// ── Legend with type filters ─────────────────────────────
function mkLegend() {
  const n = {};
  for (const r of R) n[r.type] = (n[r.type] || 0) + 1;
  const el = document.createElement("div");
  el.className = "cx-legend";
  el.setAttribute("role", "group");
  el.setAttribute("aria-label", "Connection types");
  el.innerHTML = `<span class="cx-hint">Hover or focus a face</span>` + T.filter(t => n[t]).map(t => {
    const x = TYPES[t];
    return `<button class="cx-chip" data-t="${t}" aria-pressed="${!off.has(t)}" style="--c:${x.color}"${x.directed ? ' title="Arrow points to the student / the one influenced"' : ""}>` +
      `<i class="${x.dash ? "dash" : ""}"></i>${x.label}${x.directed ? " →" : ""} <b>${n[t]}</b></button>`;
  }).join("");
  el.onclick = e => {
    const b = e.target.closest(".cx-chip");
    if (!b) return;
    const t = b.dataset.t;
    off.has(t) ? off.delete(t) : off.add(t);
    b.setAttribute("aria-pressed", String(!off.has(t)));
    if (cur) show(cur, true);
    net?.filter();
  };
  return el;
}

// ── Network view (D3 force layout, face crops as nodes) ──
function buildNet(d3, box) {
  const nodes = Object.keys(adj).map(id => ({ id, p: App.byId[id] }));
  if (!nodes.length) return void (box.innerHTML = `<p class="cx-load">No connections recorded yet.</p>`);
  let w = box.clientWidth, h = box.clientHeight;
  const nw = w < 520 ? 28 : w < 900 ? 38 : 48;
  for (const n of nodes) {
    n.hh = (nw * n.p.box[3]) / n.p.box[2] / 2;
    n.r = Math.max(n.hh + 15, short(n.p.name).length * 3.6 + 6); // collision radius covers the face and its name label
  }
  const byNode = Object.fromEntries(nodes.map(n => [n.id, n]));
  const links = R.map(r => ({ r, t: TYPES[r.type], s: byNode[r.a], e: byNode[r.b], bend: bendOf(r) }));
  // One layout spring per pair, however many relation types connect them (Born–Einstein has three).
  const pairs = [...new Map(R.map(r => [[r.a, r.b].sort().join("|"), { source: r.a, target: r.b }])).values()];

  box.innerHTML = `<svg class="cx-edges" aria-hidden="true">${links.map((l, i) =>
    `<g class="cx-edge" data-i="${i}"><path class="cx-hit"/><path class="cx-line" stroke="${l.t.color}"${dashAttr(l.t)}/>${l.t.directed ? `<path class="cx-head" fill="${l.t.color}"/>` : ""}</g>`).join("")}</svg>` +
    `<div class="cx-nodes"></div><div class="cx-card" hidden></div>`;
  const svgEl = box.querySelector("svg"), card = box.querySelector(".cx-card");
  svgEl.querySelectorAll(".cx-edge").forEach((g, i) => {
    Object.assign(links[i], { g, hit: g.children[0], line: g.children[1], head: g.children[2] });
  });

  const sel = d3.select(box.querySelector(".cx-nodes")).selectAll("button").data(nodes).join("button")
    .attr("class", "cx-node").attr("aria-label", d => d.p.name)
    .style("width", `${nw}px`)
    .each(function (d) { d.el = this; Object.assign(this.style, App.cropStyle(d.p.box)); })
    .html(d => `<span class="cx-name">${esc(short(d.p.name))}</span>`)
    .on("click", (e, d) => App.openDetail(d.id))
    .on("pointerenter focus", (e, d) => {
      const nb = new Set([d.id, ...vis(d.id).map(r => other(r, d.id))]);
      box.classList.add("hl");
      for (const n of nodes) n.el.classList.toggle("on", nb.has(n.id));
      for (const l of links) l.g.classList.toggle("on", !off.has(l.r.type) && (l.r.a === d.id || l.r.b === d.id));
    })
    .on("pointerleave blur", () => box.classList.remove("hl"))
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.15).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = d.fy = null; }));

  const place = l => {
    const g = arc([l.s.x, l.s.y], [l.e.x, l.e.y], l.bend, [nw / 2, l.s.hh], [nw / 2, l.e.hh], 3, l.t.directed ? 9 : 0);
    l.hit.setAttribute("d", g.d); l.line.setAttribute("d", g.d);
    l.head?.setAttribute("d", g.head);
  };
  const render = () => {
    for (const n of nodes) n.el.style.transform = `translate(${n.x - nw / 2}px,${n.y - n.hh}px)`;
    for (const l of links) if (!off.has(l.r.type)) place(l);
  };
  // Soft walls: nudges nodes (and their labels) back inside. A hard clamp jams them against the edge on top of each other.
  const bounds = alpha => {
    for (const n of nodes) {
      const x0 = n.r, x1 = w - n.r, y0 = n.hh + 6, y1 = h - n.hh - 22, k = 0.3; // constant, so walls stay firm as the layout cools
      if (n.x < x0) n.vx += (x0 - n.x) * k; else if (n.x > x1) n.vx -= (n.x - x1) * k;
      if (n.y < y0) n.vy += (y0 - n.y) * k; else if (n.y > y1) n.vy -= (n.y - y1) * k;
    }
  };
  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(pairs).id(d => d.id).distance(nw * 2.4))
    .force("charge", d3.forceManyBody().strength(-nw * 9))
    .force("collide", d3.forceCollide(d => d.r).iterations(3))
    .force("x", d3.forceX(w / 2).strength(0.04))
    .force("y", d3.forceY(h / 2).strength(0.06))
    .force("bounds", bounds)
    .on("tick", render)
    .stop();
  // Lay out off-screen to convergence, then show it still: no initial tangle settling in front of the reader.
  const settle = n => { sim.tick(n); render(); };
  settle(400);

  const hideCard = () => { card.hidden = true; };
  let hideT;
  const showCard = e => {
    const g = e.target.closest(".cx-edge");
    if (!g) return;
    clearTimeout(hideT);
    if (!card.hidden && card.dataset.i === g.dataset.i) return;
    const { r, t } = links[g.dataset.i];
    card.dataset.i = g.dataset.i;
    card.innerHTML = `<p class="cx-ct" style="--c:${t.color}"><i class="${t.dash ? "dash" : ""}"></i>${t.label}${yrs(r.years) ? ` · ${yrs(r.years)}` : ""}</p>` +
      `<p><b>${esc(App.byId[r.a].name)}</b> ${t.directed ? "→" : "–"} <b>${esc(App.byId[r.b].name)}</b></p><p>${esc(r.summary)}</p>${src(r)}`;
    card.hidden = false;
    const b = box.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, ch = card.offsetHeight;
    card.style.left = `${Math.max(8, Math.min(w - card.offsetWidth - 8, x + 12))}px`;
    card.style.top = `${y + 14 + ch > h ? Math.max(8, y - 14 - ch) : y + 14}px`;
  };
  const later = e => { if (e.pointerType === "mouse") hideT = setTimeout(hideCard, 350); }; // lets the pointer travel onto the card to click its link
  svgEl.addEventListener("pointerover", showCard);
  svgEl.addEventListener("click", showCard);
  svgEl.addEventListener("pointerout", e => { if (e.target.closest(".cx-edge")) later(e); });
  card.addEventListener("pointerenter", () => clearTimeout(hideT));
  card.addEventListener("pointerleave", later);
  box.addEventListener("pointerdown", e => { if (!e.target.closest(".cx-card, .cx-edge")) hideCard(); });

  const ro = new ResizeObserver(() => {
    if (box.clientWidth === w && box.clientHeight === h) return;
    w = box.clientWidth; h = box.clientHeight;
    sim.force("x").x(w / 2); sim.force("y").y(h / 2);
    sim.alpha(0.5); settle(200);
  });
  ro.observe(box);

  const filter = () => { // filters change what's drawn, not the layout, so nobody jumps around
    for (const l of links) l.g.style.display = off.has(l.r.type) ? "none" : "";
    sel.classed("iso", d => !vis(d.id).length);
    hideCard();
    render();
  };
  filter();
  return { filter, stop() { sim.stop(); ro.disconnect(); } };
}

async function mkNet() {
  const id = ++runId;
  netSec = document.createElement("section");
  netSec.className = "cx-net";
  netSec.setAttribute("aria-labelledby", "cx-net-h");
  netSec.innerHTML = `<h2 id="cx-net-h">The network</h2>
    <p class="cx-sub">Everyone in the photo who is linked to someone else. Drag a face to pull the web around, hover a line for the story and its source, click a face to open their page.</p>
    <div class="cx-graph"><p class="cx-load">Loading…</p></div>`;
  document.querySelector("main").append(netSec);
  const box = netSec.querySelector(".cx-graph");
  let d3;
  try { d3 = await import(D3_URL); } catch (err) {
    console.error(err);
    if (id === runId) box.innerHTML = `<p class="cx-load">The network view needs D3 from a CDN and couldn’t load it. Check your connection and toggle Connections again.</p>`;
    return;
  }
  if (id === runId && active) net = buildNet(d3, box);
}

// ── Tool ─────────────────────────────────────────────────
function start() {
  active = true;
  App.dockTip(true);
  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "cx-overlay");
  svg.setAttribute("viewBox", `0 0 ${App.W} ${App.H}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("aria-hidden", "true");
  App.stage.insertBefore(svg, App.stage.querySelector(".spot")); // under the face buttons, so lit faces sit on top of the arc ends
  legend = mkLegend();
  App.belowPhoto(legend);
  mkNet();
}
function stop() {
  active = false; runId++;
  App.dockTip(false);
  net?.stop(); net = null;
  svg?.remove(); legend?.remove(); netSec?.remove();
  cur = null;
}
App.addTool("Connections", on => (on ? start() : stop()));

// ── Dialog section (always on) ───────────────────────────
document.addEventListener("person:open", e => {
  if (active) clear(); // the dialog is covering the photo
  const id = e.detail.id, rs = adj[id];
  if (!rs) return;
  const rows = [...rs].sort((x, y) => T.indexOf(x.type) - T.indexOf(y.type) || (y.a === id) - (x.a === id));
  let html = "", last = "";
  for (const r of rows) {
    const t = TYPES[r.type], lab = t.directed && r.a !== id ? t.in : t.out, key = r.type + lab;
    if (key !== last) {
      html += `${last ? "</ul>" : ""}<h4 style="--c:${t.color}"><i class="${t.dash ? "dash" : ""}"></i>${lab}</h4><ul>`;
      last = key;
    }
    const o = other(r, id), y = yrs(r.years);
    html += `<li><button class="cx-who" data-id="${o}">${esc(App.byId[o].name)}</button>${y ? `<span class="cx-yrs">${y}</span>` : ""}` +
      `<p>${esc(r.summary)} ${src(r)}</p></li>`;
  }
  const sec = document.createElement("section");
  sec.className = "cx-dlg";
  sec.innerHTML = `<h3>Connections</h3>${html}</ul>`;
  sec.onclick = ev => { const b = ev.target.closest(".cx-who"); if (b) App.openDetail(b.dataset.id); };
  document.getElementById("d-extra").append(sec);
});
