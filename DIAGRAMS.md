# Per-person animated diagrams

Each attendee's detail dialog opens with a small animated, interactive diagram of their most significant contribution. `js/diagrams.js` loads `js/diagrams/<id>.js` when the dialog opens and calls its cleanup when it closes or moves to another person.

**Reference implementation:** `js/diagrams/planck.js`. Copy its structure.

## Contract

```js
import { C, canvas, controls, slider, button, toggle, readout, loop, text, axes, curve, map, clamp, wavelengthColor, kelvinColor } from "./kit.js";
export const title = "Blackbody radiation";   // ≤ 4 words; shown as the section heading
export const caption = "…";                   // 2–4 sentences, ≤ 70 words, original: what you see and why it matters
export function mount(root) {                  // root: empty <div> inside the dialog
  const cv = canvas(root, { aspect: 16 / 9, label: "What the canvas shows, for screen readers" });
  const row = controls(root), info = readout(root);
  slider(row, { label, min, max, step, value, fmt }, v => { …; lp.redraw(); });
  const lp = loop(row, (t, dt) => draw(dt));   // adds the Play/Pause button; starts paused if the user prefers reduced motion
  cv.onResize = () => lp.redraw();
  return () => { lp.stop(); cv.dispose(); };   // must return cleanup
}
```

`kit.js` API: `C` (colors: ink, muted, gold, line, bg, blue, red, green, violet, pink); `canvas`, `controls`, `slider`, `button`, `toggle`, `readout`, `loop`; drawing helpers `text`, `axes` (plot frame with axis labels), `curve` (y = f(x) clipped to a rect); `map`, `clamp`; `wavelengthColor(nm, alpha)`, `kelvinColor(T, alpha)`. Read `kit.js`, it's short.

## Rules

- **Own only your files** (`js/diagrams/<id>.js` for your assigned ids). Don't edit kit.js, diagrams.js, CSS or anything else. Need a kit change? Put it in your report.
- **Physics must be correct.** Use the formulas and constants in your spec. Any visual exaggeration (scaled-up wavelengths, compressed radii, log-scaled rates) must be marked with a `// ponytail:` comment and, if a viewer could be misled, stated in the caption ("not to scale").
- **Facts in captions:** don't add historical claims beyond what's in `data/people.js` for that person.
- **Draw in CSS pixels** from `cv.w`/`cv.h`, every frame. It must stay legible from 320 px to 720 px canvas width: text ≥ 10 px, positions relative to `w`/`h`.
- **Interaction goes through native controls** (slider/button/toggle) so it works by keyboard and touch. Canvas-only gestures may be extras, never the only way.
- **Performance:** ≤ ~1,500 drawn objects, no per-frame allocation of large arrays, nothing running after cleanup.
- **Readout:** one short line of live numbers with units.
- **Look:** dark canvas (it already has a background), gold for the main subject, `C.muted` for axes and labels, other `C` colors for secondary series. Match planck.js.
- **Verify:** `node --check js/diagrams/<id>.js` and `node tools/diagram-smoke.mjs js/diagrams/<id>.js` (runs frames, drives every control, fails on exceptions or NaN/Infinity sent to the canvas). Don't use any browser tools; the coordinator tests visually.

## Specs

### Group 1: quantum foundations (`einstein`, `bohr`, `debroglie`, `schrodinger`, `heisenberg`, `born`, `pauli`)

**einstein · Photoelectric effect.** A lamp fires photons (colored with `wavelengthColor`) at a metal plate. Sliders: wavelength 200–700 nm and intensity (photons per second). Two buttons select the metal: sodium (W = 2.28 eV) or zinc (W = 4.3 eV). Photon energy E = 1240/λ[nm] eV. If E > W, each photon ejects one electron with KE = E − W, and its speed is drawn ∝ √KE. If E < W, nothing is ejected at any intensity. Readout: photon energy, W, max KE or "no electrons". Point: intensity changes how many electrons, frequency changes how fast.

**bohr · Hydrogen spectrum.** Orbits n = 1–6 with radius ∝ n². Compress the scale if needed and say so. The electron circles more slowly in higher orbits. An "Excite" button jumps it up. It then falls back down by random jumps, and each jump emits a photon with 1/λ = R(1/n₁² − 1/n₂²), R = 1.09678×10⁷ m⁻¹, colored by wavelength (UV/IR shown dim and labelled). A spectrum strip collects the lines; the Balmer lines fall at 656, 486, 434 and 410 nm. Readout: the last transition, e.g. "n=3 → 2: 656 nm, red (Balmer)".

**debroglie · Waves on an orbit.** Slider n from 1 to 7 in steps of 0.05. An orbit of radius ∝ n² (scaled to fit) carries an electron wave r(θ) = rₙ + A cos(nθ) cos(ωt). For integer n it's a clean standing wave. For non-integer n, draw several laps that fail to line up, with a red mismatch at the join. Readout: "n = 3: three wavelengths fit exactly, an allowed orbit" or "n = 3.4: the wave doesn't close on itself, not allowed". Point: λ = h/p and circumference = nλ reproduce Bohr's rule.

**schrodinger · Particle in a box.** ψₙ = √(2/L) sin(nπx/L), Eₙ ∝ n². Draw Re ψ (blue), Im ψ (thin violet) and |ψ|² filled gold, evolving with phase e^(−iEₙt/ħ) (ωₙ = n²ω₁, with ω₁ ≈ 1 rad/s visually). Slider n = 1–4 for stationary states; a toggle for the superposition of n = 1 and 2 (equal weights). In a stationary state |ψ|² stays still while the phase rotates. In the superposition it sloshes from side to side at (E₂−E₁)/ħ. Show an energy-ladder inset.

**heisenberg · Uncertainty principle.** Slider Δx. Top: the position-space packet Re ψ = envelope × cos(k₀x − ωt), with Gaussian envelope σx, translating and wrapping around (shape held fixed; say so in the caption). Bottom: the momentum distribution, a Gaussian with σp = ħ/(2σx). Bracket Δx and Δp. Readout: Δx·Δp = ħ/2, the minimum, constant as the slider moves.

**born · One electron at a time.** Double slit. Electrons land one by one as dots on a screen, at positions sampled from I(y) ∝ cos²(πdy/λL)·sinc²(πay/λL) (with a ≈ d/4), or sinc² alone when one slit is closed. A histogram builds up. Toggle: close one slit. Toggle: show the probability curve. Slider: arrival rate 1–200 per second. Button: clear. Point: no single dot is predictable, but the pattern is (the Born rule).

**pauli · Exclusion principle.** Slider Z = 1–18 (H to Ar). Orbital boxes for 1s, 2s, 2p×3, 3s and 3p×3, each holding ↑ and ↓. Fill in Aufbau order, and use Hund's rule within p (one ↑ per box before pairing). The newest electron drops in from above. Show the symbol, the name and the configuration string ("1s² 2s² 2p⁴", with superscripts). Button "Add a third electron to 1s": it bounces off with "Blocked: two electrons in 1s already use both spin states." Elements: H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar.

### Group 2: particles and new quantum ideas (`dirac`, `compton`, `wilson`, `kramers`, `ehrenfest`, `fowler`, `brillouin`)

**dirac · Antimatter from the sea.** Left: an energy-level diagram. Positive levels sit above +mc², the gap runs from −mc² to +mc² (2mc² = 1.022 MeV), and the negative-energy "sea" below is filled with electrons. Right: a spatial view with a nucleus and a magnetic field. Slider: photon energy 0.5–3 MeV. "Fire photon": above 1.022 MeV, an electron is lifted out of the sea (positive energy, sharing E − 1.022 MeV as kinetic energy), and the hole it leaves is the positron. On the right, the electron (blue) and positron (red) curl in opposite directions. Below threshold: "Not enough energy: pair creation needs 1.022 MeV". Mention that a nearby nucleus is needed to conserve momentum. "Annihilate": the pair meets and emits two back-to-back 511 keV photons ("what a PET scanner detects").

**compton · Compton scattering.** Slider: scattering angle θ, 0–180°. An incoming X-ray (λ₀ = 71.0 pm, molybdenum Kα) hits a resting electron. The scattered photon leaves at θ with λ′ = λ₀ + λC(1 − cos θ), λC = 2.426 pm. The electron recoils at φ, with cot φ = (1 + λC/λ₀)·tan(θ/2), on the opposite side. Draw the waves with an exaggerated visual wavelength that still shows λ′ > λ₀ (comment it). The collision loops. Readout: λ′, Δλ, electron angle.

**wilson · Cloud chamber.** A dark chamber where tracks appear at random. Alphas: short, thick, straight, dense droplets. Betas: thin, longer, wiggly. Muons: long, straight and thin, crossing the whole chamber from the top. Droplets condense along each track, drift down and fade over about 2 s. Toggle "magnetic field": tracks curve with radius ∝ momentum/charge, so alphas barely bend and betas curl strongly; an occasional positron curls the opposite way, labelled. Toggle "radioactive source": a source at the left edge emits extra alphas and betas. Readout: counts by type.

**kramers · Absorption and refraction are linked.** Lorentz oscillator: ε(ω) = 1 + ωp²/(ω₀² − ω² − iγω), with ωp = 0.5ω₀, and n + iκ = √ε (principal root, κ ≥ 0). Plot n (gold) and κ (red) against ω/ω₀ from 0.5 to 1.5. Sliders: light frequency (marker) and damping γ. Top animation: a wave entering a slab, whose wavelength inside becomes λ/n and whose amplitude decays as exp(−2πκx/λ₀). Readout: n and κ at the marker. Point: where a material absorbs, its refractive index swings (the Kramers–Kronig relations).

**ehrenfest · Quantum averages follow Newton.** A harmonic potential (parabola). A coherent-state Gaussian |ψ|² of fixed width oscillates as x₀ cos ωt. On a parallel track, a classical ball oscillates identically, with a short trail. A ⟨x⟩ marker sits on the packet. Slider: amplitude x₀. Readout: ⟨x⟩ and classical x, equal. Caption: exact for this potential, approximate in general.

**fowler · What holds up a white dwarf.** Slider M = 0.2–1.43 M☉. Radius from Nauenberg's fit: R/R☉ = 0.0112·√((M/Mch)^(−2/3) − (M/Mch)^(2/3)), Mch = 1.44 M☉. Draw the star with an Earth disc for scale (R⊕ = 0.00917 R☉). Inside, jiggling electrons move faster as density rises (Fermi momentum ∝ ρ^(1/3)). Inset: an R–M curve with the current point, a Sirius B marker (~1.0 M☉), and the Chandrasekhar limit ≈ 1.4 M☉ where R → 0. Caption: Fowler (1926) showed the exclusion principle supports white dwarfs; Chandrasekhar later added relativity and found the limit.

**brillouin · Bands and gaps.** 1D nearly-free electrons. Plot E against k from −2π/a to 2π/a, with the free parabola dashed. Slider V (lattice potential) opens gaps of 2|V| at k = ±π/a and ±2π/a, from the two-band formula E± = (E₀(k) + E₀(k−G))/2 ± √(((E₀(k) − E₀(k−G))/2)² + V²) near each boundary. Shade the first Brillouin zone. Toggle 1 or 2 electrons per atom to fill states: a half-filled band is a metal; a full band with a gap is an insulator (label it). Toggle "electric field": electrons shift in k. A partial band carries current; a full band has no net change.

### Group 3: matter and materials (`curie`, `bragg`, `debye`, `richardson`, `langmuir`, `knudsen`, `henriot`)

**curie · Radioactive decay.** A grid of 400 nuclei. Toggle the isotope: polonium-210 (half-life 138.4 days) or radium-226 (1,600 years); this only changes the time labels. Per tick each nucleus decays with probability 1 − 2^(−Δt/T½); decays flash with an alpha particle, then dim. Plot the count remaining with the dashed curve N₀·2^(−t/T½). Speed slider, reset button. Readout: elapsed time (half-lives and days/years) and remaining count. Point: each atom is random, the population is predictable.

**bragg · X-ray diffraction.** Four horizontal atom planes spaced d = 0.282 nm (rock salt). An X-ray (λ = 0.154 nm, copper Kα) arrives at glancing angle θ (slider 5–60°). Draw rays reflecting from two adjacent planes, highlight the path difference 2d sin θ, and animate wave crests. Detector glow = |Σⱼ e^(i·2π·j·2d sinθ/λ)|² over N = 6 planes, normalized. Plot intensity against θ; peaks fall where 2d sin θ = nλ (first near 15.8°). Readout: path difference in wavelengths.

**debye · Heat capacity of solids.** Plot C/3Nk against T/θ_D from 0 to 1.5. Debye: 3(T/θ)³ ∫₀^(θ/T) x⁴eˣ/(eˣ−1)² dx (numerical integration). Einstein model dashed, with θ_E = 0.8 θ_D (labelled approximate). Dulong–Petit line at 1. Slider T/θ_D with a marker. A small atom lattice vibrates with amplitude growing with T (visual only). When T/θ < 0.1 the readout says "C ∝ T³ (Debye's law)". Also show the copper temperature (θ_D ≈ 343 K).

**richardson · Thermionic emission.** A vacuum tube: the filament glows with `kelvinColor(T)` and electrons fly to the anode. Slider T = 1500–3000 K. J = A T² exp(−W/kT), with A = 1.20×10⁶ A m⁻² K⁻², W = 4.5 eV (tungsten), k = 8.617×10⁻⁵ eV/K. The visual emission rate ∝ log J (comment it, and say so in the caption). Plot J on a log axis against T, with a marker. Readout: J in A/cm², scientific notation.

**langmuir · Adsorption on a surface.** 40 surface sites along the bottom, gas molecules bouncing above. Slider: pressure as KP from 0 to 10. A molecule hitting a free site sticks; adsorbed molecules leave at a constant rate. Equilibrium coverage θ = KP/(1+KP). Plot that curve with the simulated (time-averaged) point. Readout: simulated against predicted θ.

**knudsen · When gases get thin.** A narrow channel with about 150 molecules drifting left to right. A pressure slider sets the mean free path λ ∝ 1/P. Molecules scatter off each other with probability speed·Δt/λ per step and reflect diffusely off the walls. Kn = λ/d, with regime labels: < 0.01 continuum, 0.01–0.1 slip, 0.1–10 transition, > 10 free molecular (Knudsen) flow. Collisions flash gold between molecules and blue at the walls. Readout: Kn, regime and wall-to-molecule collision ratio.

**henriot · From spinning top to ultracentrifuge.** Left: a top spinning on air jets (stripe rotation, visually capped). Right: a sample tube on a rotor arm with three particle masses, mixed at first. Slider: speed 0–60,000 rpm. Sedimentation velocity v = s·ω²·r with s ∝ mass (relative values), plus Brownian jitter, so heavy particles band first. Readout: rpm and RCF = ω²r/g at r = 7 cm (60,000 rpm ≈ 282,000 g). Caption: Henriot and Huguenard's air-driven tops (1925), later turned into ultracentrifuges by Jesse Beams.

### Group 4: relativity, thermodynamics, exploration (`lorentz`, `guye`, `langevin`, `dedonder`, `verschaffelt`, `herzen`, `piccard`)

**lorentz · The Lorentz force.** A charge moving in a magnetic field into the screen (⊗ grid) follows a circle with r = mv/(|q|B). Sliders: B and speed. Toggle: charge sign (reverses the rotation). Toggle "add electric field": E×B drift. Fading trail. Label F = q(E + v × B). Readout: radius in relative units.

**guye · Mass grows with speed.** Plot m/m₀ against v/c from 0 to 0.99. Lorentz–Einstein γ = 1/√(1−β²) in gold. Abraham's transverse mass (3/(4β²))·[((1+β²)/(2β))·ln((1+β)/(1−β)) − 1] in blue dashed. Newton's constant 1 in muted. Slider β with a marker. Animation: an electron beam bending in a magnetic field with radius ∝ γβ, next to a ghost arc for the Newtonian ∝ β. Readout: γ, Abraham's value, Newton's. No invented data points, and no shaded "measured range".

**langevin · Brownian motion.** One big grain buffeted by about 100 small fast molecules (visual), plus an invisible ensemble of 200 grains for statistics. Langevin equation per axis: dv = −(γ/m)v dt + (√(2γkT)/m) dW (model units). Sliders: temperature and friction γ. Draw the tracked grain's trail. Plot the ensemble's mean squared displacement against t, with the long-time line 4Dt, D = kT/γ. Reset button.

**dedonder · Affinity drives a reaction.** A ⇌ B with about 200 molecules (A blue, B gold). Per step A→B with probability k_f Δt and B→A with k_b Δt; K = k_f/k_b from a slider (0.25–4). Panel: fraction converted over time. Affinity 𝒜 = RT ln(K[A]/[B]) as a bar that shrinks to zero at equilibrium. Entropy production 𝒜·(dξ/dt)/T ≥ 0 as a bar. Button: reset to all A. Point: affinity measures the distance from equilibrium; the reaction runs until it vanishes, and the entropy produced on the way is never negative.

**verschaffelt · The critical point.** A sealed tube of CO₂, liquid below and vapour above. Slider 15–35 °C. Tc = 31.0 °C, ρc = 0.468 g/cm³. Below Tc: ρ_l,v = ρc(1 ± B·t^β), t = (Tc−T)/Tc, β = 0.325, with B chosen so that at 15 °C ρ_l ≈ 0.82 and ρ_v ≈ 0.16 g/cm³ (state any mismatch). The meniscus flattens and vanishes at Tc. Within ~0.5 K, show critical opalescence (a milky flicker). Molecule density ∝ ρ. Inset: the coexistence curve with a marker. Readout: both densities. Caption: Verschaffelt measured how the liquid–vapour difference vanishes, an early study of critical exponents.

**herzen · Surface tension.** Glass tubes of radius 0.25, 0.5 and 1 mm dipped in a liquid. Buttons: water (γ = 0.0728 N/m, θ = 0°, ρ = 1000 kg/m³), ethanol (0.0223, 0°, 789), mercury (0.485, 140°, 13,534; it sinks). Jurin's law h = 2γ cos θ/(ρ g r). Columns move to equilibrium with damping; the meniscus is concave for water and convex for mercury. Readout: heights in mm. Caption: Herzen's 1902 doctoral thesis was on surface tension.

**piccard · Into the stratosphere.** Altitude slider 0–17 km; Play runs the ascent. The sky darkens with height. The balloon starts as a partly filled teardrop and rounds out as volume ∝ T/P grows. Standard atmosphere: 0–11 km, T = 288.15 − 6.5h K and P = 101,325·(T/288.15)^5.2559 Pa; 11–20 km, T = 216.65 K and P = 22,632·exp(−0.0001577·(h − 11,000 m)) Pa. Readout: altitude, pressure (hPa and % of sea level), temperature (°C). Markers: Everest 8.85 km, airliner cruise ~11 km, 1931 flight 15.78 km, 1932 flight 16.2 km. A cosmic-ray counter ticks faster with altitude (qualitative; label it).

## Extra diagrams (tabs)

People with more than one major contribution get extra diagrams, shown as tabs after their main one. `data/diagrams.js` (coordinator-owned) lists them. Each extra is its own file, `js/diagrams/<id>-<slug>.js`, with exactly the same contract, rules and verification as above. The tab label is the module's `title`, so keep it short: ≤ 3 words, and distinct from that person's other titles.

### Group 5: relativity and light (`einstein-relativity`, `einstein-gravity`, `einstein-laser`, `lorentz-zeeman`, `lorentz-contraction`)

**einstein-relativity · Special relativity.** Two light clocks side by side, photons bouncing between mirrors: one at rest, one moving at β (slider 0–0.99). In the moving one the photon traces a diagonal, so each tick takes γ times longer, γ = 1/√(1−β²). Tick counters show the moving clock falling behind. Readout: β, γ, ticks.

**einstein-gravity · Bending starlight.** Starlight grazes the Sun over a warped spacetime grid (visual). Deflection θ = 1.75″ × (R☉/b). Slider: impact parameter b = 1–10 R☉. Show true against apparent star position, with the angle exaggerated (say so). Readout: deflection in arcseconds. The caption may mention the 1919 eclipse confirmation, which is in people.js.

**einstein-laser · Stimulated emission.** Two-level atoms in a cavity between mirrors, one partly reflective. A pump slider excites atoms. Spontaneous emission goes in random directions. Stimulated emission clones an incoming photon (same direction and phase), so with population inversion an avalanche builds along the axis and a beam leaks out of the output mirror. Readout: excited fraction, "inversion: yes/no", photons in the beam. Qualitative; 1917 is in people.js.

**lorentz-zeeman · Zeeman effect.** A spectral line (cadmium 643.8 nm, normal Zeeman effect) splits into three as a magnetic field slider goes from 0 to 2 T. Δλ = λ²eB/(4πm_e c) ≈ 0.0194 nm per tesla. Draw a zoomed spectrum (exaggerated scale, say so), plus Lorentz's classical picture of an electron orbit speeding up or slowing down in the field. Readout: Δλ in pm.

**lorentz-contraction · Length contraction.** A rod with ruler ticks moves past at β (slider). The observed length is L₀/γ, next to a ghost at rest length. Inset: a γ curve with a marker. Readout: β, γ, and observed against rest length.

### Group 6: quantum ideas (`schrodinger-cat`, `dirac-fermi`, `pauli-neutrino`, `debroglie-pilot`, `born-oppenheimer`)

**schrodinger-cat · Schrödinger's cat.** A box holding an atom (half-life 1 hour), a Geiger counter, a vial and a cat. A clock runs (speed slider). P(decayed) = 1 − 2^(−t/T½). Before opening, show the two outcomes overlaid, faded by their weights. Button "Open the box" picks an outcome with that probability; "Reset". Keep it gentle: a simple cartoon, nothing graphic. The caption frames it as his 1935 critique.

**dirac-fermi · Fermi–Dirac statistics.** An energy ladder where each level holds two electrons (↑↓), filled up to the Fermi level at T = 0. A temperature slider smears the occupancy f(E) = 1/(e^((E−μ)/kT) + 1), with the curve plotted alongside. Electrons near E_F hop up and down. Readout: kT/E_F. The caption may note Fermi shares the name but isn't in the photo.

**pauli-neutrino · The missing energy.** Beta decay with Q = 18.6 keV (tritium). Electrons form a continuous spectrum, a histogram sampled from N(T) ∝ √(T² + 2Tmc²)·(T + mc²)·(Q − T)² (Fermi function ignored; say approximate). A dashed line shows where every electron would land at Q if nothing else were emitted. Toggle "show the neutrino": a ghost particle carries Q − T. Readout: mean electron energy against Q.

**debroglie-pilot · Pilot-wave paths.** Double slit in the de Broglie–Bohm picture. Two Gaussian packets evolve freely (units ħ = m = 1): ψⱼ ∝ (1/√s(t))·exp(−(y−yⱼ)²/(4σ₀s(t))), with s(t) = σ₀(1 + it/(2σ₀²)). Guidance velocity v_y = Im(∂_yψ/ψ). Integrate about 40 trajectories, starting points sampled from |ψ(y,0)|², with forward distance ∝ t. They never cross the midline and bunch into fringes. Toggle: show |ψ|². Caption: the theory he presented in 1927, revived by Bohm.

**born-oppenheimer · Fast electrons, slow nuclei.** H₂: two protons vibrate on a Morse curve with D_e = 4.75 eV, r_e = 0.741 Å, a = 1.94 Å⁻¹. A fuzzy electron cloud reshapes instantly around the nuclei as they move. Inset: the potential curve with a marker at the current separation. Slider: vibration energy. Readout: separation (Å) and energy (eV). Caption: electrons are about 1,836× lighter, so you solve for them with the nuclei frozen.

### Group 7: nuclei, radiation, extremes (`bohr-fission`, `curie-electrometer`, `piccard-bathyscaphe`, `langevin-twins`, `ehrenfest-adiabatic`)

**bohr-fission · Splitting the nucleus.** Liquid-drop picture: a neutron hits a U-235 drop, which wobbles, necks and splits into two fragments plus 2–3 neutrons, about 200 MeV per fission. Button "Fire a neutron". Toggle "chain reaction": a lattice of nuclei whose released neutrons trigger others, with a slider for the neutrons per fission that go on to cause another (k = 0.8–1.2), showing a reaction that dies out, holds steady or grows. Readout: generations, fissions, energy. Bohr & Wheeler 1939 is in people.js.

**curie-electrometer · Measuring radioactivity.** A sample on an ionisation-chamber plate; rays ionise the air and a meter needle shows the current. Buttons: uranium metal or uranium oxide (equal activity per gram of uranium, so activity is atomic, not chemical), thorium (also active), and pitchblende (more active than its uranium accounts for, which pointed to new elements). Keep the ratios qualitative and labelled "illustrative". Readout: relative current.

**piccard-bathyscaphe · Down to the deep.** Depth slider 0–10,900 m (Play descends). P = 1 atm + ρgh, with ρ = 1,025 kg/m³ and g = 9.81, so about 1,080 atm at the bottom. The sea darkens with depth. Show the bathyscaphe's gasoline float (lighter than water) and iron-shot ballast; releasing ballast lets it rise. Markers: sunlight fades ~200 m, Titanic wreck ~3,800 m, Challenger Deep ~10,900 m. Readout: depth, atm, kg-force per cm².

**langevin-twins · The twin paradox.** A spacetime diagram. The Earth twin's worldline is vertical; the traveller goes out at β (slider 0.1–0.99) to a star D = 4 light-years away and back. Proper time τ = (2D/β)·√(1−β²) years, against Earth time 2D/β. Animate both clocks along their worldlines. Readout: both ages at the reunion. Langevin 1911 is in people.js.

**ehrenfest-adiabatic · Adiabatic invariants.** A ball bounces between two walls; the right wall moves inward at speed u. A toggle switches between slow (u ≪ v) and sudden. Plot v·L over time: nearly constant when slow, jumping when sudden. Readout: E, frequency ν = v/2L and E/ν. Caption: slowly changed systems keep their quantum numbers (his adiabatic principle).

### Group 8: matter in fields (`debye-huckel`, `debye-dipoles`, `langevin-paramagnetism`, `fowler-tunnelling`, `brillouin-scattering`)

**debye-huckel · Ionic atmospheres.** Salt ions (+ and −) jiggle in water. One central ion is highlighted with its atmosphere of net opposite charge, radius = the Debye length λ_D = 0.304/√I nm (1:1 salt, water, 25 °C). Slider: concentration 0.001–1 M. Inset: screened potential e^(−r/λ_D)/r against bare 1/r. Readout: λ_D in nm.

**debye-dipoles · Polar molecules in a field.** Water-like dipoles (arrows) turn randomly with heat. Sliders: field strength and temperature. Average alignment ⟨cos θ⟩ = L(x) = coth x − 1/x, with x = pE/kT, plotted with a marker. Readout: alignment, plus "water: 1.85 debye".

**langevin-paramagnetism · Atomic magnets.** Atomic magnetic moments jostled by heat. Sliders: B and T. M/M_sat = L(μB/kT), plotted together with Curie's-law limit M ∝ B/T (dashed, small x). Readout: x and M/M_sat. Caption: his 1905 theory; Debye later adapted it to electric dipoles.

**fowler-tunnelling · Escaping through the barrier.** Potential energy at a metal surface: electrons filled to the Fermi level, a work-function barrier W = 4.5 eV, and a field slider F = 1–10 V/nm that tilts it into a triangle of width d = W/F (nm, with F in V/nm). Fowler–Nordheim: J ∝ F²·exp(−6.83·W^(3/2)/F). Electrons hit the barrier and a few leak through, with a visual rate on a log scale (say so). Inset: log J against F. Readout: barrier width and relative current.

**brillouin-scattering · Light off sound.** Laser light (532 nm) enters glass (n = 1.45, v_s = 5,960 m/s) carrying a travelling sound wave (a moving density grating). The scattered light is shifted by Δν = 2n·v_s·sin(θ/2)/λ, about 32.5 GHz in backscatter. Slider: scattering angle. A spectrum shows the central line and two side peaks at ±Δν. Readout: Δν in GHz.
