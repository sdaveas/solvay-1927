// Henriot: from the air-driven spinning top to the ultracentrifuge. Sedimentation velocity v = s·ω²·r, with s ∝ mass.
import { C, canvas, controls, slider, button, loop, readout, text, clamp } from "./kit.js";

export const title = "Spinning top to centrifuge";
export const caption = "In 1925 Henriot and Huguenard found that jets of air could spin a small top astonishingly fast. In the 1930s Jesse Beams turned such air-driven tops into ultracentrifuges. Spun hard enough, a mixture separates by weight: sedimentation speed grows with the square of the spin rate and with particle mass, so heavy particles settle first, blurred by Brownian jitter. Spin and geometry are schematic, not to scale.";

const NP = 55, S = [1, 2, 4], K = 0.15, D = 0.006, RPM_MAX = 60000, R_CM = 0.07, G0 = 9.80665;
// ponytail: time is compressed (real runs take hours, here seconds). S = relative sedimentation coefficients (∝ mass); K = tube lengths per second at full speed
// for S = 1 at mid-tube; D = Brownian diffusion (tube lengths² per second). Drawn only in the tube's frame, so the arm is at rest.
const SPECIES = [{ col: C.blue, rad: 0.8 }, { col: C.gold, rad: 1 }, { col: C.red, rad: 1.25 }]; // rad: relative dot size, bigger for heavier
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

export function mount(root) {
  const cv = canvas(root, { aspect: 2, label: "On the left, a spinning top held up by jets of air. On the right, a sample tube on a rotor arm in which three kinds of particle, light, medium and heavy, settle towards the outer end at different speeds." });
  const row = controls(root), info = readout(root);
  let rpm = 36000, phi = 0;
  const px = new Float32Array(3 * NP), py = new Float32Array(3 * NP);
  const remix = () => { for (let i = 0; i < 3 * NP; i++) { px[i] = Math.random(); py[i] = Math.random(); } };
  remix();
  slider(row, { label: "Spin", min: 0, max: RPM_MAX, step: 1000, value: rpm, fmt: v => `${v.toLocaleString("en-US")} rpm` }, v => { rpm = v; lp.redraw(); });
  button(row, "Remix sample", () => { remix(); lp.redraw(); });
  const lp = loop(row, (t, dt) => { step(dt); draw(t); });

  // ponytail: the picture cannot show 1000 turns a second, so the stripes and the hub turn at a capped rate that saturates near 3 turns/s.
  const spinRate = () => (rpm > 0 ? 0.3 + 2.7 * (1 - Math.exp(-rpm / 15000)) : 0);
  function step(dt) {
    if (!dt) return;
    phi += 2 * Math.PI * spinRate() * dt;
    const u = (rpm / RPM_MAX) ** 2, sg = Math.sqrt(2 * D * dt); // sedimentation speed ∝ ω²
    for (let i = 0; i < 3 * NP; i++) {
      const s = S[(i / NP) | 0];
      px[i] += K * s * u * (0.6 + 0.8 * px[i]) * dt + sg * gauss(); // v = s·ω²·r, and r runs from 0.6 to 1.4 of its mid-tube value py[i] += sg * gauss();
      px[i] = px[i] < 0 ? -px[i] : px[i] > 1 ? 2 - px[i] : px[i]; // reflect at the tube ends and sides
      py[i] = py[i] < 0 ? -py[i] : py[i] > 1 ? 2 - py[i] : py[i];
    }
  }

  function draw(t) {
    const { ctx, w, h } = cv, lw = w * 0.4, cx = lw / 2 + 2, power = rpm / RPM_MAX;
    ctx.clearRect(0, 0, w, h);
    text(ctx, "air-driven top", cx, 16, { color: C.muted, size: 11, align: "center" });
    text(ctx, w < 340 ? "sample tube" : "sample tube on the rotor arm", lw + 8, 16, { color: C.muted, size: 11 });

    // ── The top, held up and spun by two jets of air ────────
    const bw = clamp(w * 0.15, 40, 116), bh = bw * 1.05, ch = bw * 0.5, yb = h * 0.76, yc = yb - ch, yt = yc - bh;
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(cx - bw * 0.85, yb + 6, bw * 1.7, 5);
    ctx.fillStyle = C.muted;
    for (const sd of [-1, 1]) ctx.fillRect(cx + sd * bw * 0.95 - bw * 0.11, yb - 2, bw * 0.22, bw * 0.12); // nozzles
    ctx.lineWidth = 2; ctx.lineCap = "round";
    for (const sd of [-1, 1]) {
      ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 36 * (0.2 + power);
      ctx.strokeStyle = `rgba(160,215,255,${0.75 * power})`;
      ctx.beginPath(); ctx.moveTo(cx + sd * bw * 0.8, yb + 3); ctx.lineTo(cx + sd * bw * 0.12, yb - 3); ctx.stroke(); // moves towards the top's tip
    }
    ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.lineCap = "butt";
    const g = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
    g.addColorStop(0, "#2b2622"); g.addColorStop(0.35, "#7a6e60"); g.addColorStop(0.65, "#5a5046"); g.addColorStop(1, "#241f1b");
    ctx.fillStyle = g; ctx.fillRect(cx - bw / 2, yt, bw, bh);
    ctx.beginPath(); ctx.moveTo(cx - bw / 2, yc); ctx.lineTo(cx + bw / 2, yc); ctx.lineTo(cx, yb); ctx.closePath(); ctx.fill();
    const blur = clamp(rpm / 45000, 0, 1), stripe = 0.9 * (1 - 0.75 * blur);
    for (let k = 0; k < 6; k++) { // stripes on a turning cylinder: seen only on the near side
      const a = phi + (k * Math.PI) / 3, c = Math.cos(a);
      if (c < 0.15) continue;
      const hw = (bw / 2) * 0.2 * c;
      ctx.fillStyle = `rgba(227,194,127,${stripe})`; ctx.fillRect(cx + (bw / 2) * Math.sin(a) - hw, yt, 2 * hw, bh);
    }
    ctx.fillStyle = `rgba(227,194,127,${0.28 * blur})`; ctx.fillRect(cx - bw / 2, yt, bw, bh); // motion blur at speed
    ctx.fillStyle = "#8c8070"; ctx.beginPath(); ctx.ellipse(cx, yt, bw / 2, bw / 8, 0, 0, 2 * Math.PI); ctx.fill();
    text(ctx, "air jets", cx, yb + 26, { color: C.muted, size: 10, align: "center" });

    // ── The tube: the view turns with the rotor, so the arm stands still ──
    const hx = lw + w * 0.06, hy = h * 0.46, hr = clamp(w * 0.035, 10, 26), tw = clamp(h * 0.2, 24, 80);
    const D7 = (w - 12 - hx) / 1.4, tx0 = hx + 0.6 * D7, tx1 = hx + 1.4 * D7, ty0 = hy - tw / 2, len = tx1 - tx0; // the tube spans 0.6 to 1.4 of 7 cm from the axis
    ctx.strokeStyle = C.muted; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx0, hy); ctx.stroke();
    ctx.fillStyle = C.bg; ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(hx, hy, hr * 0.6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + hr * 0.6 * Math.cos(phi), hy + hr * 0.6 * Math.sin(phi)); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -phi * hr * 1.5; ctx.strokeStyle = `rgba(227,194,127,${0.25 + 0.6 * power})`;
    ctx.beginPath(); ctx.arc(hx, hy, hr * 1.5, 0, 2 * Math.PI); ctx.stroke(); // a turning ring: the rotor spins about this axis
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
    text(ctx, "axis", hx, hy - hr * 1.5 - 5, { color: C.muted, size: 10, align: "center" });
    rr(ctx, tx0, ty0, len, tw, tw * 0.3);
    ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
    for (const s of [0, 1, 2]) { // heaviest drawn last, so its thin layer at the outer end stays visible
      const sp = SPECIES[s];
      ctx.fillStyle = sp.col; ctx.globalAlpha = 0.9;
      ctx.beginPath();
      const r = sp.rad * clamp(w * 0.0065, 2.2, 5.2);
      for (let i = s * NP; i < (s + 1) * NP; i++) { const x = tx0 + 4 + px[i] * (len - 8), y = ty0 + 4 + py[i] * (tw - 8); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 2 * Math.PI); }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    text(ctx, w < 420 ? "inner" : "inner end", tx0, ty0 - 6, { color: C.muted, size: 10 });
    text(ctx, w < 420 ? "outer" : "outer end", tx1, ty0 - 6, { color: C.muted, size: 10, align: "right" });
    const yd = hy + tw / 2 + 14, mid = (tx0 + tx1) / 2;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(hx, yd); ctx.lineTo(mid, yd); ctx.moveTo(hx, yd - 4); ctx.lineTo(hx, yd + 4); ctx.moveTo(mid, yd - 4); ctx.lineTo(mid, yd + 4); ctx.stroke();
    text(ctx, "r = 7 cm", (hx + mid) / 2, yd + 14, { color: C.muted, size: 10, align: "center" });
    let lx = lw + 8;
    SPECIES.forEach((sp, s) => {
      ctx.fillStyle = sp.col; ctx.beginPath(); ctx.arc(lx + 4, h - 15, 4, 0, 2 * Math.PI); ctx.fill();
      text(ctx, `${S[s]}×`, lx + 11, h - 11, { size: 10 });
      lx += 38;
    });
    text(ctx, w < 340 ? "mass" : "relative mass", lx - 4, h - 11, { color: C.muted, size: 10 });

    const omega = (rpm * 2 * Math.PI) / 60, rcf = (omega * omega * (R_CM)) / G0, shown = Number(rcf.toPrecision(3));
    info.textContent = `${rpm.toLocaleString("en-US")} rpm · RCF = ω²r/g ≈ ${shown.toLocaleString("en-US")} g at r = 7 cm`;
  }
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
