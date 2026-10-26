// Pauli: the exclusion principle builds the periodic table. Aufbau filling of 1s 2s 2p 3s 3p (Z = 1–18), Hund's rule inside p.
import { C, canvas, controls, slider, button, loop, readout, text, clamp } from "./kit.js";

export const title = "Exclusion principle";
export const caption = "No two electrons in an atom may share the same quantum state, so each orbital box holds at most two: one spin up, one spin down. That one rule pushes electrons into ever higher boxes and builds the periodic table's shells. Slide Z from H to Ar (within p, electrons spread out before pairing), then try forcing in a third electron.";

const SUBS = [["1s", 1], ["2s", 1], ["2p", 3], ["3s", 1], ["3p", 3]]; // subshells, bottom to top, with their box counts
const SUBOF = [0, 1, 2, 2, 2, 3, 4, 4, 4], COLOF = [0, 0, 0, 1, 2, 0, 0, 1, 2]; // box → subshell, column within its row
const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar".split(" ");
const NAME = "Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon".split(" ");
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹", sup = k => String(k).replace(/\d/g, d => SUP[d]);
const BLOCKED = "Blocked: two electrons in 1s already use both spin states.";

// Electron k (0-based) goes to SLOT[k] = [box, spin]. Aufbau order; in a p subshell every box gets an ↑ before any gets a ↓ (Hund's rule).
const SLOT = [];
let b0 = 0;
for (const [, nb] of SUBS) {
  const spins = nb === 1 ? [[0, 1], [0, -1]] : [[0, 1], [1, 1], [2, 1], [0, -1], [1, -1], [2, -1]];
  for (const [j, s] of spins) SLOT.push([b0 + j, s]);
  b0 += nb;
}

// Spin arrow centred on (x, y), length s, pointing up or down.
function arrow(ctx, x, y, up, s, color) {
  const d = up ? -1 : 1, y0 = y - (d * s) / 2, y1 = y + (d * s) / 2;
  ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - d * s * 0.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - s * 0.22, y1 - d * s * 0.32); ctx.lineTo(x + s * 0.22, y1 - d * s * 0.32); ctx.closePath(); ctx.fill();
}

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Orbital boxes for the 1s, 2s, 2p, 3s and 3p subshells, filled with spin-up and spin-down electron arrows as the atomic number Z goes from 1 to 18, next to the element's symbol, name and electron configuration." });
  const row = controls(root), info = readout(root);
  const prog = new Float64Array(18), flash = new Float64Array(18), cnt = new Int8Array(9);
  let Z = 7, msg = "", msgT = 0, ghost = null;
  for (let k = 0; k < Z; k++) prog[k] = -k * 0.35; // electrons drop in one after another when the diagram first appears

  const setZ = v => {
    for (let k = Z; k < v; k++) { prog[k] = -(k - Z) * 0.35; flash[k] = 0; }
    Z = v; msg = ""; ghost = null;
  };
  slider(row, { label: "Atomic number Z", min: 1, max: 18, step: 1, value: Z, fmt: v => `${v} ${SYM[v - 1]}` }, v => { setZ(v); lp.redraw(); });
  button(row, "Add a third electron to 1s", () => {
    if (Z < 2) { msg = "1s has room for one more electron (spin down). Raise Z to 2 first."; msgT = 5; }
    else {
      const L = lay();
      msg = BLOCKED; msgT = 5;
      ghost = { x: -8, y: L.box(0).y + L.bs / 2, vx: L.w * 0.7, vy: 0, hit: false, t: 0 };
    }
    lp.redraw();
  });

  function lay() {
    const { w, h } = cv, rowH = h * 0.17, y0 = h * 0.06, bs = Math.min(rowH * 0.8, w * 0.085), gap = bs * 0.12;
    const cx = w * 0.04 + Math.max(26, w * 0.07) + (3 * bs + 2 * gap) / 2;
    const box = i => {
      const s = SUBOF[i], nb = SUBS[s][1];
      return { x: cx - (nb * bs + (nb - 1) * gap) / 2 + COLOF[i] * (bs + gap), y: y0 + (4 - s) * rowH + (rowH - bs) / 2 };
    };
    return { w, h, rowH, y0, bs, box };
  }

  function step(dt) {
    if (!dt) { for (let k = 0; k < Z; k++) { prog[k] = 1; flash[k] = 0; } return; } // paused: no animation, just show the final state
    for (let k = 0; k < Z; k++) {
      if (prog[k] < 1 && (prog[k] += dt / 0.55) >= 1) { prog[k] = 1; flash[k] = 1; }
      flash[k] = Math.max(0, flash[k] - dt * 2.5);
    }
    if (msg && (msgT -= dt) <= 0) msg = "";
    if (ghost) {
      const L = lay(), b = L.box(0);
      ghost.x += ghost.vx * dt; ghost.y += ghost.vy * dt;
      if (!ghost.hit && ghost.x >= b.x - 3) { ghost.hit = true; ghost.vx = -L.w * 0.25; ghost.vy = -L.h * 0.2; }
      if (ghost.hit && (ghost.t += dt) > 0.8) ghost = null;
    }
  }

  // Word-wrap s to maxW pixels in the font text() last set.
  function wrap(ctx, s, maxW) {
    const lines = [];
    let cur = "";
    for (const word of s.split(" ")) {
      const t = cur ? `${cur} ${word}` : word;
      if (cur && ctx.measureText(t).width > maxW) { lines.push(cur); cur = word; } else cur = t;
    }
    return [...lines, cur];
  }

  function draw(t, dt) {
    step(dt);
    const { ctx, w, h } = cv, L = lay(), { bs } = L;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]);

    // Fill counts per box, then the boxes and their row labels.
    cnt.fill(0);
    for (let k = 0; k < Z; k++) cnt[SLOT[k][0]]++;
    const blockT = ghost && ghost.hit ? ghost.t : 9;
    SUBS.forEach(([name], s) => text(ctx, name, w * 0.04, L.y0 + (4 - s) * L.rowH + L.rowH / 2 + 4, { color: C.muted, size: 12 }));
    for (let i = 0; i < 9; i++) {
      const { x, y } = L.box(i), full = cnt[i] === 2, bad = i === 0 && blockT < 0.5;
      ctx.fillStyle = cnt[i] ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)"; ctx.fillRect(x, y, bs, bs);
      ctx.strokeStyle = bad ? C.red : full ? C.gold : C.muted; ctx.lineWidth = bad || full ? 2 : 1.2; ctx.strokeRect(x, y, bs, bs);
    }
    if (blockT < 0.5) { // ripple at the 1s box where the third electron was refused
      const { x, y } = L.box(0);
      ctx.globalAlpha = 1 - blockT / 0.5; ctx.strokeStyle = C.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + bs / 2, y + bs / 2, bs * (0.6 + blockT * 1.4), 0, 2 * Math.PI); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Electrons: the newest drop in from just above their box, then flash as they land.
    for (let k = 0; k < Z; k++) {
      const p = prog[k];
      if (p < 0) continue;
      const [i, spin] = SLOT[k], { x, y } = L.box(i), off = p < 1 ? -L.rowH * 1.4 * (1 - p * p) : 0;
      if (flash[k] > 0) { ctx.globalAlpha = flash[k] * 0.5; ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x + bs / 2, y + bs / 2, bs * 0.75, 0, 2 * Math.PI); ctx.fill(); }
      ctx.globalAlpha = p < 1 ? clamp(p * 4, 0, 1) : 1;
      arrow(ctx, x + bs * (spin > 0 ? 0.3 : 0.7), y + bs / 2 + off, spin > 0, bs * 0.62, spin > 0 ? C.gold : C.blue);
      ctx.globalAlpha = 1;
    }

    // The refused third electron arrives from the left, hits the full 1s box and bounces away.
    if (ghost) {
      ctx.globalAlpha = ghost.hit ? Math.max(0, 1 - ghost.t / 0.8) : 1;
      arrow(ctx, ghost.x, ghost.y, true, bs * 0.62, C.red);
      ctx.globalAlpha = 1;
    }

    // Element card: symbol, name, configuration, and any message.
    const cxC = w * 0.76, sym = clamp(h * 0.2, 34, 72), small = clamp(w * 0.036, 11, 15);
    text(ctx, `Z = ${Z}`, cxC, h * 0.1, { align: "center", color: C.muted, size: 12 });
    text(ctx, SYM[Z - 1], cxC, h * 0.1 + sym * 1.05, { align: "center", color: C.gold, size: sym, weight: 700 });
    text(ctx, NAME[Z - 1], cxC, h * 0.1 + sym * 1.05 + 14 + sym * 0.25, { align: "center", size: clamp(w * 0.04, 13, 17) });
    if (Z === 2 || Z === 10 || Z === 18) text(ctx, "full shell", cxC, h * 0.1 + sym * 1.05 + 32 + sym * 0.25, { align: "center", color: C.green, size: 11 });
    const cfg = SUBS.map(([name], s) => {
      let c = 0;
      for (let k = 0; k < Z; k++) if (SUBOF[SLOT[k][0]] === s) c++;
      return c ? name + sup(c) : "";
    }).filter(Boolean).join(" ");
    text(ctx, cfg, cxC, h * 0.64, { align: "center", color: C.gold, size: small + 1 });
    if (msg) {
      text(ctx, "", 0, 0, { size: 11 });
      wrap(ctx, msg, w * 0.4).forEach((ln, i) => text(ctx, ln, cxC, h * 0.74 + i * 14, { align: "center", color: C.red, size: 11 }));
    }

    let unpaired = 0;
    for (let i = 0; i < 9; i++) if (cnt[i] === 1) unpaired++;
    info.textContent = msg || `Z = ${Z}: ${NAME[Z - 1].toLowerCase()} · ${unpaired} unpaired electron${unpaired === 1 ? "" : "s"}`;
  }

  const lp = loop(row, draw);
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
