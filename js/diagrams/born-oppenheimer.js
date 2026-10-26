// Born–Oppenheimer: two protons of H₂ vibrate on a Morse curve while a fuzzy electron cloud re-forms instantly around them.
// V(r) = D·[(1 − e^(−a(r − rₑ)))² − 1]; for total vibration energy E above the minimum the classical motion is exactly
// e^(a(r − rₑ)) = (D + √(DE)·cos ωt) / (D − E), with ω = a·√(2(D − E)/μ).
import { C, canvas, controls, slider, loop, readout, text, axes, curve, map, clamp } from "./kit.js";

export const title = "Born–Oppenheimer";
export const caption = "Protons are about 1,836 times heavier than electrons, so the electron cloud re-forms almost instantly as the nuclei move. That lets you freeze the nuclei, solve for the electrons at each separation, and get a potential curve for the nuclei to move on. Here two protons vibrate on a Morse curve (slowed enormously; nuclei and cloud not to scale).";

const D = 4.75, RE = 0.741, AM = 1.94;        // well depth (eV), equilibrium separation (Å), Morse width (1/Å)
const A0 = 0.529;                              // Bohr radius (Å), sets the size of the cloud
const W0 = (2 * Math.PI) / 1.6;                // ponytail: small-vibration period drawn as 1.6 s; the real one is ~7.6 fs (about 10¹⁴ times faster)
const TAU = 2 * Math.PI;
const V = r => D * ((1 - Math.exp(-AM * (r - RE))) ** 2 - 1);
const overlap = R => Math.exp(-R) * (1 + R + (R * R) / 3);   // overlap of two 1s orbitals, R in Bohr radii
const NS = 44;                                 // electron "sparkles" drawn from the cloud

export function mount(root) {
  const cv = canvas(root, { aspect: 3 / 2, label: "Left: two protons of an H2 molecule vibrate, with a blue electron cloud that stretches and squeezes to follow them. Right: the Morse potential energy curve against separation, with a marker that slides along it in step with the vibration." });
  const row = controls(root), info = readout(root);
  const sp = new Float32Array(NS * 3);          // sparkles: lobe (0 = proton A, 1 = proton B, 2 = bond), then two offsets in cloud units
  let E = 1.5, phase = 1, since = 1;
  slider(row, { label: "Vibration energy", min: 0.3, max: 4.4, step: 0.1, value: E, fmt: v => `${v.toFixed(1)} eV` }, v => { E = v; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(TAU * Math.random());

  // Resample the electron sparkles for the current separation (R in Bohr radii): weights of the two atomic lobes and the bonding lobe.
  function resample(R) {
    const S = overlap(R), wb = (2 * S) / (1 + S), wa = 1 - wb / 2;
    for (let i = 0; i < NS; i++) {
      const u = Math.random() * (2 * wa + wb), lobe = u < wa ? 0 : u < 2 * wa ? 1 : 2;
      sp[i * 3] = lobe;
      if (lobe < 2) { const r = Math.min(3, -0.5 * (Math.log(1 - Math.random()) + Math.log(1 - Math.random()))), a = TAU * Math.random(); sp[i * 3 + 1] = r * Math.cos(a); sp[i * 3 + 2] = r * Math.sin(a); }
      else { sp[i * 3 + 1] = gauss() * 0.45; sp[i * 3 + 2] = gauss() * 0.4; }
    }
  }

  function draw(dt) {
    if (dt) { phase += dt * W0 * Math.sqrt(1 - E / D); since += dt; }
    // Separation from the exact classical Morse solution.
    const r = RE + Math.log((D + Math.sqrt(D * E) * Math.cos(phase)) / (D - E)) / AM, Rb = r / A0, S = overlap(Rb);
    if (since > 0.05) { since = 0; resample(Rb); }
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    const fs = clamp(w / 52, 10, 13);

    // ── The molecule ──
    const P = { x: w * 0.03, y: h * 0.1, w: w * 0.57, h: h * 0.72 }, kA = w * 0.18, a0k = A0 * kA; // px per Å and per Bohr radius
    const cx = P.x + P.w / 2, cy = P.y + P.h * 0.45, xa = cx - (r * kA) / 2, xb = cx + (r * kA) / 2;
    text(ctx, "H₂ molecule", P.x, P.y - 6, { color: C.muted, size: fs });
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(P.x, P.y, P.w, P.h);
    ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
    // Cloud: one 1s blob per proton, plus a blob between them that grows with the orbital overlap (the bond).
    ctx.globalCompositeOperation = "lighter";
    const blob = (x, y, sx, sy, a) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      for (const [o, f] of [[0, 1], [0.12, 0.55], [0.3, 0.25], [0.6, 0.07], [1, 0]]) g.addColorStop(o, `rgba(79,168,255,${(a * f).toFixed(3)})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
    };
    const ra = 2.2 * a0k;
    blob(xa, cy, ra, ra, 0.85); blob(xb, cy, ra, ra, 0.85);
    blob(cx, cy, (r * kA) / 2 + 1.1 * a0k, 1.1 * a0k, (1.3 * S) / (1 + S));
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(214,232,255,0.75)"; ctx.beginPath();
    for (let i = 0; i < NS; i++) {
      const lobe = sp[i * 3], o1 = sp[i * 3 + 1], o2 = sp[i * 3 + 2];
      const x = lobe < 2 ? (lobe ? xb : xa) + o1 * a0k : cx + o1 * ((r * kA) / 2 + 0.6 * a0k), y = cy + o2 * a0k;
      ctx.moveTo(x + 1.4, y); ctx.arc(x, y, 1.4, 0, TAU);
    }
    ctx.fill();
    // The protons, and a dimension line for the separation.
    const pr = Math.max(5, w * 0.014);
    for (const x of [xa, xb]) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, cy, pr, 0, TAU); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
    const yd = P.y + P.h - 24;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(xa, yd); ctx.lineTo(xb, yd); ctx.moveTo(xa, yd - 4); ctx.lineTo(xa, yd + 4); ctx.moveTo(xb, yd - 4); ctx.lineTo(xb, yd + 4); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(xa, cy + pr); ctx.lineTo(xa, yd - 4); ctx.moveTo(xb, cy + pr); ctx.lineTo(xb, yd - 4); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    text(ctx, `r = ${r.toFixed(2)} Å`, cx, yd + 15, { align: "center", color: C.ink, size: fs });
    ctx.restore();

    // ── Potential curve ──
    const Rc = { x: w * 0.71, y: h * 0.14, w: w * 0.26, h: h * 0.58 }, R0 = 0.3, R1 = 3.2, Y0 = -5.5, Y1 = 1.4;
    const px = v => map(v, R0, R1, Rc.x, Rc.x + Rc.w), py = e => map(e, Y0, Y1, Rc.y + Rc.h, Rc.y);
    text(ctx, "energy (eV)", Rc.x + Rc.w, Rc.y - 8, { align: "right", color: C.muted, size: fs });
    axes(ctx, Rc, {});
    for (const v of [1, 2, 3]) text(ctx, v, px(v), Rc.y + Rc.h + 13, { align: "center", color: C.muted, size: 10 });
    text(ctx, "separation (Å)", Rc.x + Rc.w, Rc.y + Rc.h + 27, { align: "right", color: C.muted, size: 10 });
    text(ctx, "0", Rc.x - 5, py(0) + 4, { align: "right", color: C.muted, size: 10 });
    text(ctx, "−4.75", Rc.x - 5, py(-D) + 4, { align: "right", color: C.muted, size: 10 });
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.6; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(Rc.x, py(0)); ctx.lineTo(Rc.x + Rc.w, py(0)); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    text(ctx, "atoms apart", Rc.x + 12, py(0) - 4, { color: C.muted, size: 10 });
    curve(ctx, Rc, [R0, R1], [Y0, Y1], V, { color: C.gold, width: 2.2, n: 160 });
    const Et = -D + E, rMin = RE + Math.log((D - Math.sqrt(D * E)) / (D - E)) / AM, rMax = RE + Math.log((D + Math.sqrt(D * E)) / (D - E)) / AM;
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(Rc.x, py(Et)); ctx.lineTo(Rc.x + Rc.w, py(Et)); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 0.85; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px(rMin), py(Et)); ctx.lineTo(px(clamp(rMax, R0, R1)), py(Et)); ctx.stroke(); ctx.globalAlpha = 1;
    text(ctx, "E", Rc.x + Rc.w - 2, py(Et) + 12, { align: "right", color: C.ink, size: 10 });
    ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5; // kinetic energy: the gap between the curve and the total energy
    ctx.beginPath(); ctx.moveTo(px(r), py(V(r))); ctx.lineTo(px(r), py(Et)); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(px(r), py(V(r)), 4.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg; ctx.lineWidth = 1.5; ctx.stroke();

    // ── Legend ──
    const ly = h * 0.95;
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(P.x + 5, ly - 3, 4, 0, TAU); ctx.fill();
    text(ctx, "proton", P.x + 14, ly, { color: C.muted, size: fs });
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(P.x + w * 0.17, ly - 3, 4, 0, TAU); ctx.fill();
    text(ctx, w < 420 ? "electron cloud" : "electron cloud: follows at once", P.x + w * 0.17 + 9, ly, { color: C.muted, size: fs });

    info.textContent = `Separation ${r.toFixed(2)} Å · vibration energy ${E.toFixed(1)} eV above the bond minimum · bond breaks at ${D} eV`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
