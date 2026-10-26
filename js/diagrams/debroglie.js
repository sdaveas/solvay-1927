// de Broglie: an electron wave on a Bohr orbit must close on itself, 2πr = nλ with λ = h/p, which reproduces Bohr's rule.
import { C, canvas, controls, slider, loop, readout, text, clamp } from "./kit.js";

export const title = "Waves on an orbit";
export const caption = "De Broglie pictured the electron as a wave running round the orbit. Like a plucked string, it survives only if it meets itself after one lap, so the circumference must hold a whole number of wavelengths: 2πr = nλ, with λ = h/p. That reproduces Bohr's rule. Drag n to 3.4 and the laps drift out of step. Orbit sizes are compressed, not to scale.";

const WORDS = ["", "one", "two", "three", "four", "five", "six", "seven"];
const LAPS = 5, PTS = 240, WAVE_W = Math.PI; // laps drawn, points per lap, rad/s of the standing wave

export function mount(root) {
  const cv = canvas(root, { aspect: 16 / 10, label: "An electron wave drawn around a circular orbit. For a whole number n of wavelengths every lap lies on top of the last and the wave closes cleanly. For a fractional n the laps drift apart and a red mismatch appears where the wave fails to join." });
  const row = controls(root), info = readout(root);
  let n = 3, phi = 0;
  slider(row, { label: "Orbit n", min: 1, max: 7, step: 0.05, value: n, fmt: v => v.toFixed(2) }, v => { n = v; lp.redraw(); });

  function draw(t, dt) {
    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]);
    const u = Math.min(w * 0.31, h * 0.43), cx = w * 0.34, cy = h * 0.5, A = 0.13 * u;
    // ponytail: true radius ∝ n² (n = 7 would be 49× n = 1); n² is mapped onto 0.24u–0.86u so the small orbits stay visible.
    const r = u * (0.24 + (0.62 * (n * n - 1)) / 48), c = Math.cos(WAVE_W * t);
    const whole = Math.abs(n - Math.round(n)) < 0.01;
    phi += (dt * 1.6) / n;

    // The orbit, dashed, with the nucleus at the centre.
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.6; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI); ctx.fill();

    // Wave r(θ) = rₙ + A cos(nθ) cos(ωt), drawn for several laps: later laps first, so the first lap sits on top.
    const lap = k => {
      ctx.beginPath();
      for (let j = 0; j <= PTS; j++) {
        const a = (2 * Math.PI * j) / PTS, rr = r + A * c * Math.cos(n * (a + 2 * Math.PI * k));
        const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    };
    ctx.strokeStyle = C.violet; ctx.lineWidth = 1.3; ctx.globalAlpha = 0.55;
    for (let k = LAPS - 1; k >= 1; k--) lap(k);
    ctx.globalAlpha = 1; ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; lap(0);

    // Where the first lap ends (θ = 2π) it should meet where it began (θ = 0).
    if (!whole) {
      const ra = r + A * c, rb = r + A * c * Math.cos(2 * Math.PI * n);
      ctx.strokeStyle = C.red; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx + ra, cy); ctx.lineTo(cx + rb, cy); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx + (ra + rb) / 2, cy, 7, 0, 2 * Math.PI); ctx.stroke();
    }

    // The electron itself, circling at the orbit radius.
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(cx + r * Math.cos(phi), cy + r * Math.sin(phi), 4, 0, 2 * Math.PI); ctx.fill();

    // Labels and legend.
    const x0 = w * 0.66, s = clamp(w * 0.03, 11, 16), big = clamp(w * 0.045, 14, 24);
    text(ctx, `n = ${+n.toFixed(2)}`, x0, h * 0.2, { color: C.gold, size: big, weight: 700 });
    text(ctx, "λ = h / p", x0, h * 0.34, { size: s });
    text(ctx, "2πr = nλ", x0, h * 0.34 + s * 1.6, { size: s });
    const leg = (k, color, label) => {
      const y = h * 0.62 + k * s * 1.6;
      ctx.fillStyle = color; ctx.fillRect(x0, y - s * 0.8, 14, 3);
      text(ctx, label, x0 + 20, y, { color: C.muted, size: s - 1 });
    };
    leg(0, C.gold, "first lap");
    leg(1, C.violet, "later laps");
    if (!whole) leg(2, C.red, "mismatch");

    const k = Math.round(n);
    info.textContent = whole
      ? `n = ${k}: ${WORDS[k]} wavelength${k === 1 ? "" : "s"} fit${k === 1 ? "s" : ""} exactly, an allowed orbit`
      : `n = ${+n.toFixed(2)}: the wave doesn't close on itself, not allowed`;
  }

  const lp = loop(row, draw);
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };
}
