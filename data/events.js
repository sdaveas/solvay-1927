// Owned by the timeline agent. Births, deaths and Nobel years come from people.js; don't repeat them here.
// kind: discovery | world | life.   first: true marks a person's first key breakthrough (drives "lit" in the timeline).
// Every event carries source: { title, url }. ids may be empty for events no one in the photo was part of.
import { PEOPLE } from "./people.js";

const wiki = t => ({ title: `Wikipedia: ${t.replace(/_/g, " ")}`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(t)}` });
const ALL = PEOPLE.map(p => p.id);

export const EVENTS = [
  // ── World events ──
  { year: 1911, kind: "world", ids: ["lorentz", "planck", "einstein", "curie", "langevin", "knudsen", "herzen"], title: "First Solvay Conference, chaired by Lorentz, takes up the quantum in Brussels", source: wiki("Solvay_Conference") },
  { year: 1914, kind: "world", ids: [], title: "The First World War begins", source: wiki("World_War_I") },
  { year: 1918, kind: "world", ids: [], title: "The First World War ends with the Armistice", source: wiki("Armistice_of_11_November_1918") },
  { year: 1927, kind: "world", ids: ALL, title: "Fifth Solvay Conference, Brussels, 24–29 October: this photograph is taken", source: wiki("Solvay_Conference") },
  { year: 1933, kind: "world", ids: ["einstein", "born", "schrodinger"], title: "Scientists begin leaving Nazi Germany", source: wiki("Law_for_the_Restoration_of_the_Professional_Civil_Service") },
  { year: 1939, kind: "world", ids: [], title: "Germany invades Poland: the Second World War begins", source: wiki("Invasion_of_Poland") },
  { year: 1939, kind: "world", ids: ["einstein"], title: "Einstein signs the letter warning Roosevelt that an atomic bomb is possible", source: wiki("Einstein–Szilárd_letter") },
  { year: 1941, kind: "world", ids: ["heisenberg", "bohr"], title: "Heisenberg visits Bohr in occupied Copenhagen; what was said is still disputed", source: wiki("Niels_Bohr") },
  { year: 1942, kind: "world", ids: ["compton"], title: "Chicago Pile-1, at the Metallurgical Laboratory that Compton directs, achieves the first self-sustaining chain reaction", source: wiki("Chicago_Pile-1") },
  { year: 1943, kind: "world", ids: ["bohr"], title: "Bohr, warned of his arrest, escapes occupied Denmark", source: wiki("Niels_Bohr") },
  { year: 1945, kind: "world", ids: [], title: "Atomic bombs fall on Hiroshima and Nagasaki; the Second World War ends", source: wiki("Atomic_bombings_of_Hiroshima_and_Nagasaki") },
  { year: 1955, kind: "world", ids: ["einstein", "born"], title: "Russell–Einstein Manifesto warns of nuclear war; Einstein and Born are among its signatories", source: wiki("Russell–Einstein_Manifesto") },

  // ── Major discoveries ──
  { year: 1895, kind: "discovery", ids: [], title: "Röntgen discovers X-rays", source: wiki("Wilhelm_Röntgen") },
  { year: 1896, kind: "discovery", ids: ["curie"], title: "Becquerel discovers radioactivity in uranium salts", source: wiki("Henri_Becquerel") },
  { year: 1896, kind: "discovery", ids: ["lorentz"], title: "Zeeman sees spectral lines split in a magnetic field; Lorentz explains it with his electron theory", source: wiki("Hendrik_Lorentz") },
  { year: 1912, kind: "discovery", ids: ["compton", "piccard"], title: "Hess finds cosmic rays on balloon flights", source: wiki("Victor_Francis_Hess") },
  { year: 1919, kind: "discovery", ids: ["einstein"], title: "Eddington's eclipse expeditions measure starlight bending, supporting general relativity", source: wiki("Eddington_experiment") },
  { year: 1925, kind: "discovery", ids: ["ehrenfest"], title: "Uhlenbeck and Goudsmit, Ehrenfest's students, propose electron spin", source: wiki("Samuel_Goudsmit") },
  { year: 1926, kind: "discovery", ids: ["born"], title: "Born proposes that the wave function gives probabilities (the Born rule)", source: wiki("Born_rule") },
  { year: 1927, kind: "discovery", ids: ["heisenberg"], title: "Heisenberg states the uncertainty principle", source: wiki("Uncertainty_principle") },
  { year: 1927, kind: "discovery", ids: ["debroglie"], title: "Davisson and Germer see electrons diffract, backing de Broglie's matter waves", source: wiki("Davisson–Germer_experiment") },
  { year: 1928, kind: "discovery", ids: ["dirac"], title: "Dirac writes down his relativistic equation for the electron", source: wiki("Dirac_equation") },
  { year: 1930, kind: "discovery", ids: ["pauli"], title: "Pauli proposes a new neutral particle, later called the neutrino, in an open letter", source: wiki("Neutrino") },
  { year: 1932, kind: "discovery", ids: ["dirac"], title: "Anderson detects the positron, the antimatter Dirac's equation had pointed to", source: wiki("Carl_David_Anderson") },
  { year: 1934, kind: "discovery", ids: ["curie"], title: "Irène and Frédéric Joliot-Curie produce artificial radioactivity", source: wiki("Irène_Joliot-Curie") },
  { year: 1935, kind: "discovery", ids: ["einstein", "schrodinger"], title: "Einstein, Podolsky and Rosen publish their paradox; Schrödinger devises his cat", source: wiki("EPR_paradox") },
  { year: 1938, kind: "discovery", ids: [], title: "Hahn and Strassmann discover nuclear fission", source: wiki("Nuclear_fission") },
  { year: 1939, kind: "discovery", ids: ["bohr"], title: "Bohr and Wheeler publish their theory of the mechanism of nuclear fission", source: wiki("Niels_Bohr") },
  { year: 1947, kind: "discovery", ids: [], title: "Bardeen, Brattain and Shockley's group at Bell Labs invents the transistor", source: wiki("Transistor") },
  { year: 1960, kind: "discovery", ids: ["einstein"], title: "Maiman builds the first laser, which rests on Einstein's stimulated emission", source: wiki("Laser") },
  { year: 1960, kind: "discovery", ids: ["piccard"], title: "The bathyscaphe Trieste, Piccard's design, reaches the Challenger Deep", source: wiki("Bathyscaphe_Trieste") },
  { year: 1964, kind: "discovery", ids: ["einstein", "bohr"], title: "Bell's theorem shows how to test Einstein's local realism against quantum mechanics", source: wiki("Bell's_theorem") },

  // ── First key breakthrough of each of the 29 (drives "lit") ──
  { year: 1917, kind: "discovery", first: true, ids: ["piccard"], title: "Pierre Weiss and Piccard observe the magnetocaloric effect: a magnetic material warms when magnetised", source: wiki("Magnetocaloric_effect") },
  { year: 1931, kind: "discovery", ids: ["piccard"], title: "Piccard and Paul Kipfer make the first crewed flight into the stratosphere", source: wiki("Auguste_Piccard") },
  { year: 1912, kind: "discovery", first: true, ids: ["henriot"], title: "Henriot earns his Sorbonne doctorate under Marie Curie", source: wiki("Émile_Henriot_(chemist)") },
  { year: 1909, kind: "discovery", first: true, ids: ["ehrenfest"], title: "Ehrenfest's paradox of the rotating rigid cylinder in special relativity", source: wiki("Ehrenfest_paradox") },
  { year: 1902, kind: "discovery", first: true, ids: ["herzen"], title: "Herzen publishes his thesis on surface tension", source: wiki("Édouard_Herzen") },
  { year: 1923, kind: "discovery", first: true, ids: ["dedonder"], title: "De Donder links chemical affinity to Gibbs free energy", source: wiki("Théophile_De_Donder") },
  { year: 1926, kind: "discovery", first: true, ids: ["schrodinger"], title: "Schrödinger publishes his wave equation", source: wiki("Schrödinger_equation") },
  { year: 1896, kind: "discovery", first: true, ids: ["verschaffelt"], title: "Verschaffelt's Leiden measurements show critical-point exponents differ from mean-field theory", source: { title: "Critical phenomena: 150 years since Cagniard de la Tour (arXiv)", url: "https://arxiv.org/abs/0905.1886" } },
  { year: 1925, kind: "discovery", first: true, ids: ["pauli"], title: "Pauli proposes the exclusion principle", source: { title: "Nobel Prize in Physics 1945: Wolfgang Pauli", url: "https://www.nobelprize.org/prizes/physics/1945/pauli/facts/" } },
  { year: 1925, kind: "discovery", first: true, ids: ["heisenberg"], title: "Heisenberg's breakthrough paper launches matrix mechanics", source: wiki("Matrix_mechanics") },
  { year: 1926, kind: "discovery", first: true, ids: ["fowler"], title: "Fowler explains white dwarfs with quantum statistics", source: wiki("White_dwarf") },
  { year: 1922, kind: "discovery", first: true, ids: ["brillouin"], title: "Brillouin publishes his theory of how light scatters from sound waves in a medium", source: wiki("Brillouin_scattering") },
  { year: 1912, kind: "discovery", first: true, ids: ["debye"], title: "Debye's model of heat capacity in solids", source: wiki("Debye_model") },
  { year: 1909, kind: "discovery", first: true, ids: ["knudsen"], title: "Knudsen publishes his laws of molecular gas flow through tubes", source: wiki("Knudsen_paradox") },
  { year: 1912, kind: "discovery", first: true, ids: ["bragg"], title: "Lawrence Bragg, aged 22, formulates Bragg's law of X-ray diffraction", source: wiki("Bragg's_law") },
  { year: 1924, kind: "discovery", first: true, ids: ["kramers"], title: "Kramers' theory of optical dispersion, a precursor of matrix mechanics", source: { title: "MacTutor: Hendrik Anthony Kramers", url: "https://mathshistory.st-andrews.ac.uk/Biographies/Kramers/" } },
  { year: 1925, kind: "discovery", first: true, ids: ["dirac"], title: "Dirac takes his first step into the new quantum mechanics", source: wiki("Paul_Dirac") },
  { year: 1923, kind: "discovery", first: true, ids: ["compton"], title: "Compton shows X-rays scatter like particles carrying momentum", source: wiki("Compton_scattering") },
  { year: 1924, kind: "discovery", first: true, ids: ["debroglie"], title: "De Broglie's thesis proposes that matter has wave properties (first notes in 1923)", source: wiki("Louis_de_Broglie") },
  { year: 1909, kind: "discovery", first: true, ids: ["born"], title: "Born introduces rigid motion in special relativity (Born rigidity)", source: wiki("Born_rigidity") },
  { year: 1913, kind: "discovery", first: true, ids: ["bohr"], title: "Bohr's quantum model of the atom", source: wiki("Bohr_model") },
  { year: 1913, kind: "discovery", first: true, ids: ["langmuir"], title: "Langmuir shows that gas-filled lamps are twice as efficient as vacuum bulbs", source: wiki("Incandescent_light_bulb") },
  { year: 1900, kind: "discovery", first: true, ids: ["planck"], title: "Planck introduces the energy quantum to explain blackbody radiation", source: { title: "Nobel Prize in Physics 1918: Max Planck", url: "https://www.nobelprize.org/prizes/physics/1918/planck/facts/" } },
  { year: 1898, kind: "discovery", first: true, ids: ["curie"], title: "Marie and Pierre Curie announce polonium and radium", source: wiki("Marie_Curie") },
  { year: 1892, kind: "discovery", first: true, ids: ["lorentz"], title: "Lorentz proposes that moving bodies contract in their direction of motion", source: wiki("Hendrik_Lorentz") },
  { year: 1905, kind: "discovery", first: true, ids: ["einstein"], title: "Einstein's miracle year: light quanta, Brownian motion and special relativity", source: { title: "Nobel Prize in Physics 1921: Albert Einstein", url: "https://www.nobelprize.org/prizes/physics/1921/einstein/facts/" } },
  { year: 1905, kind: "discovery", first: true, ids: ["langevin"], title: "Langevin's statistical theory of paramagnetism", source: wiki("Brillouin_and_Langevin_functions") },
  { year: 1915, kind: "discovery", first: true, ids: ["guye"], title: "Guye and Lavanchy's cathode-ray experiments confirm the Lorentz–Einstein mass–speed law", source: { title: "Archives des Sciences 58 (2005): replication of the Guye–Lavanchy experiment", url: "https://unige.ch/sphn/Publications/ArchivesSciences/AdS%202004-2015/AdS%202005%20Vol%2058%20Fasc%202/159-170_58_2.pdf" } },
  { year: 1911, kind: "discovery", first: true, ids: ["wilson"], title: "Wilson perfects the cloud chamber", source: wiki("Cloud_chamber") },
  { year: 1901, kind: "discovery", first: true, ids: ["richardson"], title: "Richardson publishes his law of thermionic emission", source: wiki("Thermionic_emission") },
];
