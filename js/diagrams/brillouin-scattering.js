// Brillouin scattering: laser light (532 nm) scatters off a travelling sound wave in glass. The moving density grating Doppler-shifts it by Δν = 2n·v·sin(θ/2)/λ.
import { C, canvas, controls, slider, toggle, loop, readout, axes, text, clamp, wavelengthColor } from "./kit.js";

export const title = "Light off sound";
export const caption = "Sound in glass is a moving pattern of denser and thinner layers, and light bounces off it. Brillouin predicted this in 1922. Because the layers move, the scattered light is Doppler-shifted by Δν = 2n·vₛ·sin(θ/2)/λ: tens of GHz, under 0.01% of the light's own frequency. Sound running the other way gives the opposite shift. Wavelengths and speeds are not to scale.";

const TAU = 2 * Math.PI, LAM = 532, NG = 1.45, VS = 5960, HW = 1.2, FMAX = 40;     // nm, glass index, sound speed (m/s), peak half-width and plot range (GHz)
const dnuOf = th => (2 * NG * VS * Math.sin(th / 2)) / (LAM * 1e-9) / 1e9;           // GHz
const exitT = (px, py, dx, dy, r) => Math.min(dx > 0 ? (r.x + r.w - px) / dx : dx < 0 ? (r.x - px) / dx : Infinity, dy > 0 ? (r.y + r.h - py) / dy : dy < 0 ? (r.y - py) / dy : Infinity);

export function mount(root) {
  const cv = canvas(root, { aspect: 4 / 3, label: "Top: a green laser beam enters a glass block holding a moving grating of sound; some light scatters off at the chosen angle. Bottom: a spectrum with an unshifted central line and two side peaks, at minus and plus the Brillouin shift, that move apart as the angle grows." });
  const row = controls(root), info = readout(root);
  let deg = 135, dir = 1;                                                            // dir = +1: sound runs along q = k_in − k_out, which gives the down-shifted (Stokes) line
  slider(row, { label: "Scattering angle θ", min: 10, max: 180, step: 1, value: deg, fmt: v => `${v}°` }, v => { deg = v; lp.redraw(); });
  toggle(row, "Sound runs the other way", false, v => { dir = v ? -1 : 1; lp.redraw(); });
  const lp = loop(row, t => draw(t));

  function draw(t) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    const fs = clamp(w / 52, 10, 13), th = (deg * Math.PI) / 180, sh = Math.sin(th / 2), dnu = dnuOf(th);
    const S = { x: 6, y: 20, w: w - 12, h: Math.round(h * 0.42) }, cy = S.y + S.h * 0.64, cxp = S.x + S.w * 0.56;
    const bk = { x: S.x + S.w * 0.26, y: S.y + S.h * 0.28, w: S.w * 0.6, h: S.h * 0.72 - 2 };

    // ── scene: laser, glass block, moving sound grating ──
    text(ctx, "laser light in glass, with a travelling sound wave", S.x + 2, 13, { color: C.muted, size: fs });
    const lx = S.x + 4, lw = S.w * 0.1;
    ctx.fillStyle = C.panel; ctx.fillRect(lx, cy - 8, lw, 16); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(lx + 0.5, cy - 7.5, lw - 1, 15);
    text(ctx, "532 nm laser", lx, cy + 25, { color: C.muted, size: 10 });
    ctx.fillStyle = wavelengthColor(LAM); ctx.fillRect(lx + lw - 4, cy - 2.5, 4, 5);
    ctx.fillStyle = "rgba(150,200,230,0.07)"; ctx.fillRect(bk.x, bk.y, bk.w, bk.h);

    // ponytail: wavelengths are exaggerated (the light wave is ~13–26 px, the real one 367 nm in glass), but the ratio is right: sound wavelength = (light wavelength in glass)/(2 sin(θ/2)).
    const Lm = clamp(w / 26, 11, 26), Lam = Lm / (2 * sh), qa = Math.atan2(Math.sin(th), 1 - Math.cos(th)), qx = Math.cos(qa), qy = Math.sin(qa), E = Math.hypot(bk.w, bk.h);
    ctx.save(); ctx.beginPath(); ctx.rect(bk.x, bk.y, bk.w, bk.h); ctx.clip();
    ctx.strokeStyle = "rgba(120,180,255,0.17)"; ctx.lineWidth = Lam * 0.5; ctx.beginPath();
    const off = (((dir * 14 * t) % Lam) + Lam) % Lam;                                 // ponytail: the grating crawls at 14 px/s against light at 90 px/s; the real ratio is about 1 : 50,000
    for (let s = -Math.floor(E / Lam) * Lam + off; s <= E; s += Lam) {
      const px = cxp + qx * s, py = cy + qy * s;
      ctx.moveTo(px + qy * E, py - qx * E); ctx.lineTo(px - qy * E, py + qx * E);
    }
    ctx.stroke(); ctx.restore();
    ctx.strokeStyle = "rgba(150,200,230,0.45)"; ctx.lineWidth = 1; ctx.strokeRect(bk.x + 0.5, bk.y + 0.5, bk.w - 1, bk.h - 1);
    text(ctx, "glass, n = 1.45", bk.x + bk.w - 5, bk.y + bk.h - 5, { align: "right", color: C.muted, size: 10 });
    const ax = bk.x + 22, ay = bk.y + bk.h - 15, al = 11 * dir;                       // the sound's direction of travel
    ctx.strokeStyle = ctx.fillStyle = C.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax - qx * al, ay - qy * al); ctx.lineTo(ax + qx * al, ay + qy * al); ctx.stroke();
    const hx = ax + qx * al, hy = ay + qy * al, sg = Math.sign(al);
    ctx.beginPath(); ctx.moveTo(hx + qx * sg * 2, hy + qy * sg * 2); ctx.lineTo(hx - qx * sg * 5 + qy * 3.5, hy - qy * sg * 5 - qx * 3.5); ctx.lineTo(hx - qx * sg * 5 - qy * 3.5, hy - qy * sg * 5 + qx * 3.5); ctx.fill();
    text(ctx, "sound", ax + 18, ay + 4, { color: C.blue, size: 10 });

    // light waves: wavelength n times longer in air than in glass, same frequency, so the crests line up across the surface
    const ka = TAU / (NG * Lm), km = TAU / Lm, om = ka * 90, col = wavelengthColor(LAM, 0.95);
    const wave = (x0, y0, ux, uy, len, s0, s1, amp, lineW) => {
      const ph = s => ka * Math.min(s, s0) + km * clamp(s - s0, 0, s1 - s0) + ka * Math.max(0, s - s1);
      ctx.strokeStyle = col; ctx.lineWidth = lineW; ctx.lineJoin = "round"; ctx.beginPath();
      for (let s = 0; s <= len; s += 2) {
        const a = amp * Math.min(1, s / 14, (len - s) / 14) * Math.sin(ph(s) - om * t);
        const px = x0 + ux * s - uy * a, py = y0 + uy * s + ux * a;
        s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    };
    const bx0 = lx + lw;
    wave(bx0, cy, 1, 0, S.x + S.w - 4 - bx0, bk.x - bx0, bk.x + bk.w - bx0, 4.5, 2);
    const ux = Math.cos(th), uy = -Math.sin(th), sx = cxp - uy * 9, sy = cy + ux * 9;  // scattered ray leaves the middle of the grating (nudged aside so it stays visible when it retraces the beam)
    const s1 = exitT(sx, sy, ux, uy, bk), len = Math.max(s1, exitT(sx, sy, ux, uy, { x: S.x + 3, y: S.y + 3, w: S.w - 6, h: S.h - 6 }));
    wave(sx, sy, ux, uy, len, 0, s1, 3.2, 1.6);
    const lm = s1 + (len - s1) * 0.45, tw = 9 * fs * 0.56 + 6;                    // "scattered" label beside the ray, kept inside the scene
    const lxp = Math.min(sx + ux * lm - uy * 12, S.x + S.w - tw), lyp = Math.max(sy + uy * lm + ux * 12, S.y + fs + 2);
    ctx.fillStyle = "rgba(15,13,11,0.75)"; ctx.fillRect(lxp - 3, lyp - fs, tw, fs + 4);
    text(ctx, "scattered", lxp, lyp, { color: col, size: fs });

    // ── spectrum ──
    const pr = { x: 28, y: S.y + S.h + 18, w: w - 28 - 12, h: h - (S.y + S.h + 18) - 38 };
    const PX = g => pr.x + ((g + FMAX) / (2 * FMAX)) * pr.w, PY = v => pr.y + pr.h - (v / 1.35) * pr.h;
    axes(ctx, pr, { xLabel: "frequency shift (GHz)" });
    for (const g of [-40, -20, 0, 20, 40]) text(ctx, g, PX(g), pr.y + pr.h + 13, { align: "center", color: C.muted, size: 10 });
    // ponytail: line widths are exaggerated (real Brillouin lines in glass are far narrower) and the heights are illustrative, with the unshifted line tallest.
    const peak = (c, a, fill, stroke, lw) => {
      ctx.beginPath(); ctx.moveTo(pr.x, pr.y + pr.h);
      for (let px = 0; px <= pr.w; px += 2) ctx.lineTo(pr.x + px, PY(a / (1 + ((((px / pr.w) * 2 - 1) * FMAX - c) / HW) ** 2)));
      ctx.lineTo(pr.x + pr.w, pr.y + pr.h); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
    };
    const pulse = 0.6 + 0.2 * Math.sin(5 * t);
    peak(0, 1, "rgba(168,156,138,0.35)", C.muted, 1.5);
    for (const sgn of [-1, 1]) {
      const lit = sgn === -dir;                                                       // sound along +q gives the −Δν (Stokes) peak
      peak(sgn * dnu, 0.6, lit ? `rgba(227,194,127,${pulse})` : "rgba(227,194,127,0.18)", lit ? C.gold : "rgba(227,194,127,0.5)", lit ? 2 : 1.2);
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(PX(sgn * dnu), pr.y + pr.h); ctx.lineTo(PX(sgn * dnu), PY(0.6)); ctx.stroke(); ctx.setLineDash([]);
    }
    text(ctx, "unshifted", PX(0), pr.y + 9, { align: "center", color: C.muted, size: 10 });
    text(ctx, "Stokes, −Δν", pr.x + 5, pr.y + 9, { color: dir > 0 ? C.gold : C.muted, size: 10 });
    text(ctx, "anti-Stokes, +Δν", pr.x + pr.w - 5, pr.y + 9, { align: "right", color: dir < 0 ? C.gold : C.muted, size: 10 });
    const yb = PY(0.82);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(PX(0), yb); ctx.lineTo(PX(dnu), yb); ctx.moveTo(PX(0), yb - 3); ctx.lineTo(PX(0), yb + 3); ctx.moveTo(PX(dnu), yb - 3); ctx.lineTo(PX(dnu), yb + 3); ctx.stroke();
    text(ctx, `Δν = ${dnu.toFixed(1)} GHz`, PX(0) + 9, yb - 4, { color: C.ink, size: 10 });

    info.textContent = `θ = ${deg}° · Δν = ${dnu.toFixed(1)} GHz · sound wavelength ${(LAM / (2 * NG * sh)).toFixed(0)} nm · shown: ${dir > 0 ? "Stokes (down-shifted)" : "anti-Stokes (up-shifted)"}`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
