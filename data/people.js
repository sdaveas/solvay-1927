// The 29 attendees, in photo order: back row, middle row, front row, each left to right.
// box = face rectangle [x, y, w, h] in the 3000x2171 original (from Wikimedia Commons image notes).
// Dates checked against Wikidata. Narration is original; verify before publishing.
export const PEOPLE = [
  // ── Back row ──────────────────────────────────────────────
  {
    id: "piccard", name: "Auguste Piccard", born: "1884-01-28", died: "1962-03-24", from: "Swiss",
    box: [420, 697, 165, 232],
    tagline: "The man who went up, and then down",
    hook: "A physicist who took his instruments where no one had been: the stratosphere in 1931, and later the deep ocean.",
    story: [
      "Look for the tall figure at the top left. Auguste Piccard was a Swiss physicist teaching in Brussels, and his questions kept outgrowing the laboratory. Cosmic rays, the mysterious radiation raining down from space, were best studied far above the atmosphere's shielding. So in 1931 he built a sealed aluminium gondola, hung it beneath a hydrogen balloon, and rose with his assistant Paul Kipfer to nearly sixteen kilometres. They were the first people to enter the stratosphere. A year later he went higher still.",
      "Then he turned the idea upside down. A pressurised cabin that protects you from thin air can also protect you from crushing water. Piccard designed the bathyscaphe, a free-diving deep-sea vessel. His Trieste, piloted by his son Jacques and Don Walsh, reached the bottom of the Mariana Trench in 1960, almost eleven kilometres down.",
      "If he looks familiar, thank Hergé. Piccard was the model for Professor Calculus in The Adventures of Tintin."
    ],
    contributions: [
      "First crewed flight into the stratosphere (1931), to measure cosmic rays",
      "A sealed, pressurised gondola, one of the first pressurised cabins for human flight",
      "Invented the bathyscaphe for deep-ocean exploration",
      "The design behind Trieste's 1960 dive to the Challenger Deep"
    ],
    awards: ["World altitude records in 1931 and 1932"],
    legacy: "Piccard proved that the frontier of physics could be a place, not just an equation. Three generations of Piccards have pushed the limits of altitude, depth and endurance; his grandson Bertrand flew around the world by balloon, and later in a solar-powered plane."
  },
  {
    id: "henriot", name: "Émile Henriot", born: "1885-07-02", died: "1961-02-01", from: "French",
    box: [660, 787, 135, 199],
    tagline: "The chemist who made matter spin",
    hook: "Helped prove that ordinary potassium is naturally radioactive, and found a way to spin things so fast that it was later used to sort molecules by weight.",
    story: [
      "Émile Henriot earned his doctorate in Paris under Marie Curie, who sits in the front row of this same photograph. His early work tackled a strange claim: that potassium and rubidium, common elements found in rocks, soil and living things, give off faint radiation of their own. J. J. Thomson and others had first reported it; Henriot's careful thesis measurements helped settle that they do. Every banana, and every human being, is very slightly radioactive, and part of the reason we know is this man.",
      "Later, as a professor in Brussels, he became fascinated by speed. In 1925, with E. Huguenard, he found that carefully aimed jets of air could spin a small top at astonishing rates. In the 1930s the American physicist Jesse Beams turned such air-driven tops into ultracentrifuges, machines that spin samples so hard that molecules separate by weight, a workhorse of biology and chemistry ever since.",
      "Henriot was also one of the quiet organisers of the Solvay conferences, helping prepare the venue and logistics for meetings across three decades."
    ],
    contributions: [
      "Confirmation that potassium and rubidium are naturally radioactive (doctoral thesis, 1912)",
      "Air-driven spinning tops (with E. Huguenard, 1925), later adapted into ultracentrifuges",
      "Administrative organiser of the Solvay physics conferences"
    ],
    awards: ["Doctorate under Marie Curie (Sorbonne, 1912)", "Attended seven Solvay conferences (1924–1954)"],
    legacy: "The natural radioactivity of potassium is now used to date rocks across billions of years, and ultracentrifuges separate everything from viruses to proteins. Henriot is a reminder that the people standing at the back often built the tools everyone else relied on."
  },
  {
    id: "ehrenfest", name: "Paul Ehrenfest", born: "1880-01-18", died: "1933-09-25", from: "Austrian-Dutch",
    box: [810, 840, 146, 229],
    tagline: "Physics' great questioner",
    hook: "Lorentz's successor at Leiden, Einstein's close friend, and the teacher who asked the questions everyone else avoided.",
    story: [
      "Paul Ehrenfest was the conscience of physics in the 1920s. A student of Ludwig Boltzmann in Vienna, he succeeded Lorentz as professor at Leiden in 1912 and turned his seminar into one of the most demanding in Europe. Visitors were cross-examined until every vague idea had been made precise. He coined the phrase ‘ultraviolet catastrophe’ for the failure of classical physics that Planck's quantum had fixed.",
      "His own work stitched classical and quantum physics together. His adiabatic principle explained which quantities stay fixed when a system changes slowly, a key rule of the early quantum theory. In 1927, the year of this photo, he proved what is now called Ehrenfest's theorem: on average, quantum particles obey Newton's laws. It is the bridge between the strange microscopic world and the familiar one.",
      "At this conference he was caught between his two dearest friends, Einstein and Bohr. Watching Einstein attack the new quantum mechanics, Ehrenfest reportedly told him he was ashamed: Einstein was now arguing against quantum theory the way his own critics had once argued against relativity.",
      "Ehrenfest suffered from deep depression and died in tragic circumstances in 1933. Einstein called him the best teacher in their profession he had ever known."
    ],
    contributions: [
      "Adiabatic principle of the old quantum theory",
      "Ehrenfest's theorem (1927): quantum averages follow classical laws",
      "The Ehrenfest paradox of the spinning disk in relativity",
      "Coined the term ‘ultraviolet catastrophe’",
      "Classification of phase transitions by order (1933)"
    ],
    awards: ["Supervised Uhlenbeck and Goudsmit, who discovered electron spin (1925)"],
    legacy: "Ehrenfest's greatest work walked out of his classroom: electron spin, found by his students, and a generation of physicists trained to accept nothing fuzzy. He also kept Bohr and Einstein talking when they could barely agree on anything."
  },
  {
    id: "herzen", name: "Édouard Herzen", born: "1877", died: "1936-02-17", from: "Belgian",
    box: [1054, 829, 146, 187],
    tagline: "The man behind the meeting",
    hook: "A Belgian chemist and close collaborator of Ernest Solvay, the industrialist who paid for all of this.",
    story: [
      "If you have never heard of Édouard Herzen, you are in good company, and that is part of his story. Not everyone in this photograph changed physics directly. Some made it possible for others to.",
      "Herzen was born in Florence, a grandson of the Russian writer Alexander Herzen, and became a chemist in Belgium, writing his thesis on surface tension. He worked closely with Ernest Solvay, the wealthy soda-ash industrialist who founded these conferences in 1911, and he appears in the photograph of that first meeting as one of Solvay's scientific co-workers. By 1927 he was a professor at Brussels' École des Hautes Études.",
      "At this meeting he was the official representative of the Solvay family. He also co-signed a note with Lorentz on Solvay's own ideas about energy and mass. Herzen attended six Solvay conferences between 1911 and 1933, a thread of continuity linking the classical physicists of the first meeting to the quantum revolutionaries of this one."
    ],
    contributions: [
      "Scientific collaborator of Ernest Solvay",
      "Thesis on surface tension (1902)",
      "Professor at the École des Hautes Études de Bruxelles",
      "Note with Hendrik Lorentz on Solvay's ideas about energy and mass (early 1920s)",
      "Representative of the Solvay family at the 1927 conference"
    ],
    awards: ["Participant in six Solvay conferences (1911–1933)"],
    legacy: "Great science needs patrons, organisers and explainers as much as geniuses. Herzen helped turn one industrialist's fortune into the most famous scientific gathering of the century."
  },
  {
    id: "dedonder", name: "Théophile De Donder", born: "1872-08-19", died: "1957-05-11", from: "Belgian",
    box: [1335, 862, 139, 180],
    tagline: "Father of irreversible thermodynamics",
    hook: "Gave chemistry a precise way to measure a reaction's ‘drive’, and founded the Brussels school that produced Ilya Prigogine.",
    story: [
      "Théophile De Donder began as a mathematician, continuing the abstract work of Henri Poincaré, before Einstein's relativity captured him around 1914. He became an enthusiastic champion of the theory and wrote on the mathematics of gravitation. A choice of coordinates in general relativity, the De Donder gauge, still bears his name.",
      "His lasting contribution came in 1923, when he gave a sharp meaning to an old, vague idea: chemical affinity, the ‘eagerness’ of substances to react. De Donder defined it precisely and tied it to Gibbs free energy, then used it to describe systems that are changing, not just those sitting quietly at equilibrium. That made him the founder of the thermodynamics of irreversible processes.",
      "Real life is irreversible: cells metabolise, weather churns, stars burn. De Donder gave physics the language for it, and his student Ilya Prigogine carried that language all the way to a Nobel Prize."
    ],
    contributions: [
      "Precise definition of chemical affinity, linked to Gibbs free energy (1923)",
      "Founder of the thermodynamics of irreversible processes",
      "Mathematics of general relativity (the De Donder gauge)",
      "Mentor of Ilya Prigogine"
    ],
    awards: ["His student Ilya Prigogine won the 1977 Nobel Prize in Chemistry building on his work"],
    legacy: "Every theory of systems far from equilibrium, from living cells to chemical clocks, traces back to the Brussels school De Donder founded."
  },
  {
    id: "schrodinger", name: "Erwin Schrödinger", born: "1887-08-12", died: "1961-01-04", from: "Austrian",
    box: [1568, 784, 131, 202], nobel: ["Physics 1933"],
    tagline: "He gave the quantum world a wave equation",
    hook: "Wrote the equation that describes how quantum systems evolve, then spent years doubting what it meant. Yes, the cat is his.",
    story: [
      "Over the Christmas holiday of 1925, in the Swiss mountain resort of Arosa, Erwin Schrödinger wrote down an equation. Building on de Broglie's idea that particles behave like waves, he asked what equation such a wave would obey. The answer, published in 1926, reproduced the energy levels of the hydrogen atom with stunning elegance. Physicists who found Heisenberg's matrices impenetrable were relieved: here was something they could picture and calculate with.",
      "Within months Schrödinger showed that his wave mechanics and Heisenberg's matrix mechanics were mathematically equivalent, two languages for the same truth. But he never accepted the interpretation taking hold here in Brussels, that the wave describes only probabilities and particles jump unpredictably. In 1935 he invented his famous cat, both alive and dead, to show how absurd that view looked when scaled up. The same year he coined the word ‘entanglement’.",
      "Later, in exile in Dublin, he wrote What Is Life?, a small book asking how heredity could be stored in molecules. Watson and Crick both credited it with drawing them toward biology."
    ],
    contributions: [
      "The Schrödinger equation (1926), the core of quantum mechanics",
      "Proof that wave and matrix mechanics are equivalent",
      "Schrödinger's cat (1935), a critique of quantum measurement",
      "Coined ‘entanglement’",
      "What Is Life? (1944), which inspired the founders of molecular biology"
    ],
    awards: ["Nobel Prize in Physics 1933, shared with Paul Dirac"],
    legacy: "Nearly every calculation in chemistry, materials science and electronics starts with Schrödinger's equation. The questions he raised about measurement and entanglement now sit at the heart of quantum computing."
  },
  {
    id: "verschaffelt", name: "Jules-Émile Verschaffelt", born: "1870-01-27", died: "1955-12-22", from: "Belgian",
    box: [1815, 814, 135, 187],
    tagline: "The secretary who measured the critical point",
    hook: "A Belgian physicist trained in the world's coldest laboratory, who measured how fluids behave where liquid and gas become one. Here he was the meeting's secretary.",
    story: [
      "Jules-Émile Verschaffelt spent the formative years of his career in Leiden, in the laboratory of Heike Kamerlingh Onnes, the place that first liquefied helium and discovered superconductivity. Leiden was the coldest spot on Earth, and its scientists made precision measurements of how matter behaves as it is chilled toward absolute zero.",
      "Verschaffelt's speciality was the delicate borderland where liquid and gas become indistinguishable, the critical point. He measured how liquefied carbon dioxide rises in thin tubes as it nears that point, and his careful data showed that real fluids there do not quite follow van der Waals's simple theory. It is painstaking work, the kind that tests whether grand theories actually match nature.",
      "He moved between Leiden and Brussels before settling as a professor at Ghent University from 1923 to 1940. From 1921 he served as secretary of the Solvay physics conferences, and at this one it was his job to keep the record of the debates."
    ],
    contributions: [
      "Precision studies of capillarity and fluids near the critical point",
      "Early evidence that real fluids depart from van der Waals's theory near the critical point (c. 1896–1900)",
      "Research in Kamerlingh Onnes's Leiden laboratory (1894–1906, 1914–1923)",
      "Professor at Ghent University (1923–1940)",
      "Secretary of the Solvay physics conferences from 1921"
    ],
    awards: [],
    legacy: "Behind every revolutionary theory stands a body of exact measurement. Verschaffelt belonged to the Leiden tradition of precision, and his data on fluids near the critical point were among the first signs that the simple theory of that point was incomplete."
  },
  {
    id: "pauli", name: "Wolfgang Pauli", born: "1900-04-25", died: "1958-12-15", from: "Austrian",
    box: [2059, 787, 150, 244], nobel: ["Physics 1945"],
    tagline: "The conscience of quantum physics",
    hook: "Found the exclusion principle that structures every atom, predicted the neutrino, and was the most feared critic in physics.",
    story: [
      "At twenty-one, Wolfgang Pauli wrote a review of relativity so masterful that Einstein himself praised it. By twenty-five he had found the rule that explains the periodic table: no two electrons in an atom can share exactly the same quantum state. The exclusion principle is why atoms have shells, why chemistry has structure, and why matter is solid enough that you don't sink through the floor.",
      "In 1930, faced with energy apparently vanishing in radioactive decay, he proposed a desperate remedy: a tiny, neutral, almost undetectable particle. He announced it in a letter addressed to ‘Dear Radioactive Ladies and Gentlemen’. The neutrino was finally detected in 1956, two years before his death.",
      "Pauli's tongue was legendary. Colleagues sent him their ideas precisely because he would demolish anything weak; he is said to have dismissed one muddled paper as ‘not even wrong’. Experimenters joked about the ‘Pauli effect’, in which equipment supposedly broke whenever he walked in. Here in 1927 he stood firmly with Bohr, and his criticism helped sink de Broglie's pilot-wave theory."
    ],
    contributions: [
      "The Pauli exclusion principle (1925)",
      "Pauli matrices for electron spin (1927)",
      "Prediction of the neutrino (1930)",
      "The spin–statistics theorem (1940)"
    ],
    awards: ["Nobel Prize in Physics 1945, nominated by Einstein", "Lorentz Medal (1931)", "Max Planck Medal (1958)"],
    legacy: "The exclusion principle explains the stability of matter, the structure of the periodic table, and why dead stars such as white dwarfs and neutron stars don't collapse."
  },
  {
    id: "heisenberg", name: "Werner Heisenberg", born: "1901-12-05", died: "1976-02-01", from: "German",
    box: [2261, 784, 154, 214], nobel: ["Physics 1932"],
    tagline: "The uncertain prodigy",
    hook: "Invented quantum mechanics at 23 and the uncertainty principle at 25. One of the youngest people in this photograph.",
    story: [
      "In June 1925, Werner Heisenberg escaped a brutal attack of hay fever on the treeless North Sea island of Heligoland. There he worked through a radical idea: stop trying to picture electrons orbiting atoms, and build a theory only from what can actually be measured, the colours of light that atoms emit. At about three in the morning, as he later recalled, his calculations came together. Back in Göttingen, Max Born recognised Heisenberg's strange tables as matrices, and matrix mechanics was born.",
      "Earlier in 1927 he had published the idea he is best known for, the uncertainty principle. The more precisely you pin down a particle's position, the less precisely its momentum can be known, not because instruments are clumsy but because nature itself is built that way. With Bohr he forged the Copenhagen interpretation that Einstein challenged in this very room.",
      "His later life is shadowed. Heisenberg stayed in Nazi Germany and became a leading scientist in its wartime nuclear programme. His 1941 visit to Bohr in occupied Copenhagen, and what he meant by it, remains one of history's great unresolved conversations, the subject of Michael Frayn's play Copenhagen."
    ],
    contributions: [
      "Matrix mechanics (1925), the first complete quantum mechanics",
      "The uncertainty principle (1927)",
      "Co-author of the Copenhagen interpretation",
      "Isospin and early nuclear theory (1932)"
    ],
    awards: ["Nobel Prize in Physics 1932 (awarded in 1933)", "Max Planck Medal (1933)"],
    legacy: "The uncertainty principle became cultural shorthand for the limits of knowledge. More concretely, it sets hard limits on everything from electron microscopes to quantum sensors."
  },
  {
    id: "fowler", name: "Ralph Fowler", born: "1889-01-17", died: "1944-07-28", from: "British",
    box: [2419, 701, 154, 214],
    tagline: "The quiet mentor of Cambridge",
    hook: "Explained why dead stars don't collapse, and supervised the doctorates of Paul Dirac and Subrahmanyan Chandrasekhar.",
    story: [
      "Ralph Fowler was a mathematician wounded at Gallipoli in the First World War, who then worked on anti-aircraft gunnery before turning to the new physics. At Cambridge, married to Ernest Rutherford's daughter, he became a central figure in Cambridge theoretical physics, the man who introduced the young Paul Dirac to quantum theory, and the supervisor every ambitious young theorist wanted.",
      "In 1926 he made a remarkable leap. White dwarf stars were absurdly dense; a teaspoon of one would weigh tonnes. Using the brand-new quantum statistics of electrons, Fowler showed that the exclusion principle creates a pressure that holds these dead stars up against gravity. It was one of the first times quantum mechanics explained something in the cosmos.",
      "His students did the rest. In 1925 he passed Dirac a proof copy of Heisenberg's first paper on the new quantum mechanics, setting Dirac on his path. Later, Chandrasekhar extended Fowler's white-dwarf work and found the mass limit above which a star must collapse, work that won a Nobel Prize in 1983."
    ],
    contributions: [
      "Explained white dwarfs through electron degeneracy pressure (1926)",
      "Fowler–Nordheim theory of electron field emission (1928)",
      "Statistical mechanics; credited with naming the ‘zeroth law’ of thermodynamics",
      "Supervisor of Dirac, Chandrasekhar and many others"
    ],
    awards: ["Royal Medal (1936)", "Knighted (1942)"],
    legacy: "Fowler's white-dwarf insight opened the road to understanding neutron stars and black holes. Through his students, he shaped British theoretical physics for half a century."
  },
  {
    id: "brillouin", name: "Léon Brillouin", born: "1889-08-07", died: "1969-10-04", from: "French",
    box: [2580, 787, 146, 221],
    tagline: "Waves in crystals, and the physics of information",
    hook: "His ‘Brillouin zones’ map how electrons move through solids, the foundation of semiconductor physics.",
    story: [
      "Léon Brillouin, son of the physicist Marcel Brillouin, spent his career on waves of every kind. In 1922 he predicted that light passing through a material can scatter off sound waves inside it, shifting slightly in colour. Brillouin scattering is now used to probe materials and in fibre-optic sensing.",
      "In 1926 he helped develop the WKB approximation, named for Wentzel, Kramers and Brillouin, two of whom stand in this photo: a practical way to solve Schrödinger's equation when exact answers are out of reach. In 1930 he introduced Brillouin zones, a geometric way to map the allowed energies of electrons moving through a crystal. Why some materials conduct, some insulate, and some, the semiconductors, can be switched between the two, is read off those maps.",
      "Late in life, after leaving Vichy France for the United States in late 1940, he turned to information theory, arguing that information has a physical cost and using that idea to tame Maxwell's famous demon."
    ],
    contributions: [
      "Brillouin scattering of light by sound waves (1922)",
      "The WKB approximation (1926)",
      "Brillouin zones in solid-state physics (1930)",
      "Science and Information Theory (1956)"
    ],
    awards: [],
    legacy: "Every transistor and chip is designed using band theory, and Brillouin zones are its basic coordinate system."
  },

  // ── Middle row ────────────────────────────────────────────
  {
    id: "debye", name: "Peter Debye", born: "1884-03-24", died: "1966-11-02", from: "Dutch-American",
    box: [116, 997, 124, 195], nobel: ["Chemistry 1936"],
    tagline: "Molecules, measured",
    hook: "Explained how solids hold heat, how salts behave in water, and how molecules carry electric charge. Molecular polarity is measured in ‘debyes’.",
    story: [
      "Peter Debye moved effortlessly between physics and chemistry. In 1912 he refined Einstein's theory of how solids store heat, deriving the famous ‘T-cubed’ law that holds near absolute zero. The same year he explained that many molecules carry a built-in separation of electric charge, a dipole, and showed how to measure it. Chemists still quote molecular polarity in units of debye.",
      "With Paul Scherrer he invented a way to identify crystals by shining X-rays through powder, still a standard technique in labs worldwide. With Erich Hückel he explained why salts dissolved in water behave the way they do.",
      "He also nudged history. In Zurich in late 1925, Debye asked his colleague Schrödinger to present de Broglie's matter-wave idea at a seminar. Afterwards, as the young Felix Bloch remembered it, Debye remarked that a proper wave ought to have a wave equation. Weeks later, Schrödinger found one.",
      "Debye directed the Kaiser Wilhelm Institute for Physics in Berlin until he left Germany in early 1940 for Cornell University. His conduct under the Nazi regime has been debated by historians."
    ],
    contributions: [
      "Debye model of heat capacity in solids (1912)",
      "Theory of molecular dipole moments",
      "Debye–Scherrer X-ray powder diffraction (1916)",
      "Debye–Hückel theory of electrolytes (1923)"
    ],
    awards: ["Nobel Prize in Chemistry 1936", "Max Planck Medal (1950)"],
    legacy: "Debye's tools are everywhere: in materials labs identifying crystals, in chemistry describing polar molecules, and in biology analysing proteins in solution."
  },
  {
    id: "knudsen", name: "Martin Knudsen", born: "1871-02-15", died: "1949-05-27", from: "Danish",
    box: [364, 1020, 165, 251],
    tagline: "When gases get thin",
    hook: "Worked out how gases behave when their molecules rarely meet: the physics of vacuums, high altitudes and chip fabrication.",
    story: [
      "Most of the time, gas molecules collide with each other constantly. But in a near-vacuum, or a very narrow tube, they mostly bounce off the walls instead, and the ordinary rules of gas flow break down. Martin Knudsen, a Danish physicist in Copenhagen, mapped this strange regime in exquisite detail. The number that tells you which regime you are in is called the Knudsen number.",
      "He invented instruments to match: gauges for measuring extremely low pressures, a pump with no moving parts, and the Knudsen cell, a small oven that releases a gentle beam of atoms. Knudsen cells are used today in molecular beam epitaxy, which builds semiconductor devices one atomic layer at a time.",
      "Knudsen had a second career at sea. As hydrographer on the Ingolf expedition to the North Atlantic in 1895–96, he built thermometers precise to a hundredth of a degree, and his Hydrographical Tables became a standard reference for the properties of seawater."
    ],
    contributions: [
      "Kinetic theory of rarefied gases: Knudsen flow, diffusion and number",
      "The Knudsen cell, used in molecular beam epitaxy",
      "The Knudsen gauge and Knudsen pump",
      "Hydrographical Tables for seawater (1901)"
    ],
    awards: [],
    legacy: "Spacecraft re-entry, vacuum technology and the fabrication of semiconductor lasers all rely on the physics of thin gases that Knudsen charted."
  },
  {
    id: "bragg", name: "William Lawrence Bragg", born: "1890-03-31", died: "1971-07-01", from: "Australian-British",
    box: [683, 990, 131, 217], nobel: ["Physics 1915"],
    tagline: "The youngest physics laureate ever",
    hook: "At 22 he worked out how to read the arrangement of atoms from X-ray patterns. At 25 he had a Nobel Prize, still the youngest in physics.",
    story: [
      "In 1912, a young Cambridge student named Lawrence Bragg puzzled over a new experiment from Germany: X-rays shone through a crystal produced a pattern of spots. Bragg saw that the crystal's layers of atoms were acting like stacked mirrors, reflecting X-rays only at angles where the reflections reinforce one another. The relationship he wrote down, Bragg's law, turned those spots into a map of where the atoms sit.",
      "With his father, William Henry Bragg, he founded X-ray crystallography, and in 1915 the two shared the Nobel Prize in Physics, the only father and son ever to share one. Lawrence heard the news while serving as an army officer in France, developing ways to locate enemy guns by sound.",
      "Decades later, as director of Cambridge's Cavendish Laboratory, he backed the young researchers turning his technique on the molecules of life. On his watch, Watson and Crick worked out the structure of DNA, and Perutz and Kendrew began the work that would solve the first protein structures a few years later."
    ],
    contributions: [
      "Bragg's law of X-ray diffraction (1912)",
      "Co-founded X-ray crystallography with his father",
      "Solved the first crystal structures, beginning with common salt",
      "Sound ranging to locate artillery in the First World War"
    ],
    awards: ["Nobel Prize in Physics 1915, shared with his father, at age 25", "Knighted (1941)", "Copley Medal (1966)"],
    legacy: "X-ray crystallography revealed the structures of DNA, proteins, viruses and countless medicines. Dozens of later Nobel Prizes rest on the technique Bragg co-founded."
  },
  {
    id: "kramers", name: "Hendrik Kramers", born: "1894-12-17", died: "1952-04-24", from: "Dutch",
    box: [1013, 1009, 150, 199],
    tagline: "Bohr's right-hand man",
    hook: "Bohr's first assistant in Copenhagen, whose work on how atoms scatter light paved the road to Heisenberg's quantum mechanics.",
    story: [
      "In 1916, a twenty-one-year-old Dutch student named Hendrik ‘Hans’ Kramers turned up at Niels Bohr's door in Copenhagen and asked to work with him. He became Bohr's first assistant and, for a decade, his closest collaborator, turning Bohr's intuitions into mathematics.",
      "In 1924 Kramers derived a formula for how atoms scatter light, written purely in terms of the jumps between energy levels. That was the decisive hint: Heisenberg, working with Kramers, took the next step and built matrix mechanics from the same idea. Kramers also helped develop the WKB approximation, and with Ralph Kronig he found the Kramers–Kronig relations, which link how materials absorb light to how they bend it. Engineers and physicists use them daily.",
      "Not every idea survived. In 1924 Bohr, Kramers and Slater proposed that energy might be conserved only on average, a bold attempt to avoid particles of light. Experiments soon ruled it out. Later, his ideas on removing infinities from quantum electrodynamics helped inspire the theory of renormalisation."
    ],
    contributions: [
      "Kramers dispersion formula (1924), a stepping stone to matrix mechanics",
      "The Kramers–Kronig relations",
      "The WKB approximation",
      "Kramers degeneracy theorem (1930)",
      "Early ideas on mass renormalisation"
    ],
    awards: ["Lorentz Medal (1947)", "Hughes Medal (1951)"],
    legacy: "Kramers is the great example of a physicist whose ideas were absorbed into everyone else's breakthroughs. His relations are used in optics, electronics and signal processing every day."
  },
  {
    id: "dirac", name: "Paul Dirac", born: "1902-08-08", died: "1984-10-20", from: "British",
    box: [1376, 982, 143, 214], nobel: ["Physics 1933"],
    tagline: "He predicted antimatter with an equation",
    hook: "The youngest person in the photo. Within months he would write the equation uniting quantum mechanics with relativity, and it would predict antimatter.",
    story: [
      "Paul Dirac was twenty-five here, the youngest person in the picture and already one of the sharpest minds in it. He was famously silent; Cambridge colleagues joked that a ‘dirac’ was a unit of speech, one word per hour. What he lacked in conversation he made up for in mathematical beauty, which he treated as a guide to truth.",
      "In 1926 and 1927 he gave quantum mechanics its general mathematical form and founded quantum electrodynamics, the theory of how light and electrons interact. Then, in early 1928, came the Dirac equation, a description of the electron consistent with Einstein's relativity. It explained the electron's spin automatically. But it also had solutions that seemed to make no sense: electrons with negative energy.",
      "Dirac took his equation seriously. By 1931 he had concluded it predicted a new particle with the electron's mass but the opposite charge. In 1932 Carl Anderson found it in cosmic rays: the positron. Antimatter had been discovered on paper first."
    ],
    contributions: [
      "The Dirac equation (1928), the relativistic theory of the electron",
      "Prediction of antimatter (1931)",
      "Founding quantum electrodynamics (1927)",
      "Fermi–Dirac statistics (1926)",
      "Bra–ket notation, still used in every quantum course"
    ],
    awards: ["Nobel Prize in Physics 1933, shared with Schrödinger, at age 31", "Lucasian Professor at Cambridge (1932–1969), Newton's old chair", "Copley Medal (1952)"],
    legacy: "Every PET scan uses positrons, the antimatter Dirac predicted. He is commemorated in Westminster Abbey, near Newton."
  },
  {
    id: "compton", name: "Arthur Compton", born: "1892-09-10", died: "1962-03-15", from: "American",
    box: [1643, 982, 135, 191], nobel: ["Physics 1927"],
    tagline: "He proved light comes in particles",
    hook: "Showed that X-rays bounce off electrons like billiard balls, convincing physicists that light really comes in particles. His Nobel was announced weeks after this photo.",
    story: [
      "Einstein proposed in 1905 that light comes in packets, or quanta, but for nearly two decades most physicists, Bohr included, resisted. Light was a wave; interference proved it. Then in 1922 Arthur Compton, at Washington University in St. Louis, fired X-rays at electrons and measured what bounced off. The scattered X-rays had longer wavelengths, shifted by exactly the amount you would expect if a particle of light had collided with an electron and handed over some of its momentum.",
      "The Compton effect settled the question: light carries momentum like a particle. Today we call those particles photons. Compton shared the 1927 Nobel Prize with Charles Wilson, who sits in the front row of this photograph; it was announced only weeks after the conference ended.",
      "During the Second World War, Compton led the Manhattan Project's Metallurgical Laboratory in Chicago. There, in December 1942, Enrico Fermi's team achieved the first self-sustaining nuclear chain reaction. Compton reported the news by phone in an improvised code: ‘The Italian navigator has landed in the New World.’"
    ],
    contributions: [
      "The Compton effect (1923): light carries momentum",
      "Cosmic-ray surveys showing they include charged particles",
      "Led the Manhattan Project's Metallurgical Laboratory",
      "Chancellor of Washington University in St. Louis (1945–1953)"
    ],
    awards: ["Nobel Prize in Physics 1927, shared with C. T. R. Wilson"],
    legacy: "The photon is central to everything from solar panels to lasers. Compton scattering is used in medical imaging and astronomy, and NASA's Compton Gamma Ray Observatory carried his name into orbit."
  },
  {
    id: "debroglie", name: "Louis de Broglie", born: "1892-08-15", died: "1987-03-19", from: "French",
    box: [1920, 997, 146, 195], nobel: ["Physics 1929"],
    tagline: "The prince who made matter a wave",
    hook: "A French aristocrat who proposed in his doctoral thesis that electrons are waves. Experiments confirmed it in 1927, the year of this photo.",
    story: [
      "Louis de Broglie came from one of France's grandest aristocratic families and first studied history. Physics won him over through his older brother Maurice, an X-ray experimenter, and through the proceedings of the very first Solvay conference in 1911, where Maurice had served as a secretary.",
      "In his 1924 doctoral thesis he proposed a breathtaking symmetry. If light waves can behave like particles, then perhaps particles such as electrons behave like waves, with a wavelength set by their momentum. His adviser, Paul Langevin, sent a copy to Einstein, who wrote back in December 1924 that de Broglie had ‘lifted a corner of the great veil’. In 1927, experiments by Davisson and Germer in the United States and by George Paget Thomson in Scotland saw electrons diffract exactly like waves.",
      "At this conference de Broglie presented a ‘pilot wave’ theory, in which real particles are guided by real waves. It was heavily criticised, most sharply by Pauli, and he set it aside. Twenty-five years later David Bohm revived it, and the de Broglie–Bohm theory remains a serious alternative interpretation of quantum mechanics."
    ],
    contributions: [
      "Wave–particle duality for matter (1924)",
      "The de Broglie wavelength, λ = h/p",
      "Pilot-wave theory, later the de Broglie–Bohm interpretation"
    ],
    awards: ["Nobel Prize in Physics 1929", "Elected to the Académie française (1944)", "First UNESCO Kalinga Prize for popularising science (1952)"],
    legacy: "Electron microscopes, which can image viruses and individual atoms, work because electrons are waves. De Broglie's idea was also the starting point for Schrödinger's equation."
  },
  {
    id: "born", name: "Max Born", born: "1882-12-11", died: "1970-01-05", from: "German-British",
    box: [2239, 1001, 161, 217], nobel: ["Physics 1954"],
    tagline: "He made quantum mechanics about probability",
    hook: "Recognised that Heisenberg's tables were matrices, and proposed that the quantum wave only tells us the probability of finding a particle.",
    story: [
      "When Heisenberg returned to Göttingen in 1925 with his strange arrays of numbers, it was his professor Max Born who recognised them as matrices, a branch of mathematics few physicists then knew. With Heisenberg and his student Pascual Jordan, Born turned the idea into a complete theory within months.",
      "In 1926 Born made the leap that most unsettled Einstein. Schrödinger's wave, he proposed, is not a physical wave of matter: its intensity gives the probability of finding the particle at a given place. Nature, at its most basic level, deals in odds. This Born rule is now part of the foundations of quantum theory, though it only earned him a Nobel Prize in 1954.",
      "Born and Einstein were close friends who corresponded for decades. It was to Born, in December 1926, that Einstein wrote his famous objection: he was convinced that God ‘does not throw dice’. In 1933, being Jewish, Born was forced out of Germany; after three years in Cambridge he settled in Edinburgh. He later signed the 1955 Russell–Einstein Manifesto against nuclear weapons."
    ],
    contributions: [
      "Matrix mechanics with Heisenberg and Jordan (1925)",
      "The Born rule, the probability interpretation of the wavefunction (1926)",
      "The Born–Oppenheimer approximation (1927), basis of quantum chemistry",
      "Lattice dynamics of crystals"
    ],
    awards: ["Nobel Prize in Physics 1954, shared with Walther Bothe", "Max Planck Medal (1948)", "Hughes Medal (1950)"],
    legacy: "Every prediction quantum mechanics makes, from chemistry to quantum computers, is a probability calculated with the Born rule. He also trained a generation of physicists, J. Robert Oppenheimer among them."
  },
  {
    id: "bohr", name: "Niels Bohr", born: "1885-10-07", died: "1962-11-18", from: "Danish",
    box: [2561, 1016, 120, 206], nobel: ["Physics 1922"],
    tagline: "The father of the quantum atom",
    hook: "Built the first quantum model of the atom, founded the Copenhagen institute where quantum mechanics was forged, and led the defence against Einstein.",
    story: [
      "In 1913, Niels Bohr made a daring compromise. Electrons in atoms, he said, can only occupy certain allowed orbits, and they emit light only when they jump between them. It broke the rules of classical physics, but it explained the precise colours of light that hydrogen gives off. Quantum theory had entered the atom.",
      "In 1921 he opened his Institute for Theoretical Physics in Copenhagen, and it became the capital of the quantum revolution. Heisenberg, Pauli, Kramers, Dirac and dozens more passed through, arguing late into the night. About six weeks before this conference, at a meeting in Como, Bohr had presented his principle of complementarity: wave and particle are mutually exclusive, yet equally necessary, descriptions of nature.",
      "Here in Brussels began his long debate with Einstein. As Heisenberg remembered it, Einstein came to breakfast each morning with a clever thought experiment designed to defeat the uncertainty principle; by supper, Bohr usually had the answer. Einstein liked to say that God does not play dice; on one occasion, Bohr is said to have replied that Einstein should stop telling God what to do.",
      "Later Bohr explained nuclear fission with John Wheeler, escaped occupied Denmark in 1943, and spent his final years arguing for openness between nations to prevent a nuclear arms race."
    ],
    contributions: [
      "The Bohr model of the atom (1913)",
      "The correspondence principle",
      "Complementarity (1927)",
      "Liquid-drop theory of nuclear fission, with Wheeler (1939)",
      "Founded the Copenhagen institute (1921)"
    ],
    awards: ["Nobel Prize in Physics 1922", "Copley Medal (1938)", "First Atoms for Peace Award (1957)", "Element 107, bohrium, is named after him"],
    legacy: "Bohr shaped not just quantum theory but how physics is done: collaborative, international and argumentative. His son Aage won a Nobel Prize too, in 1975."
  },

  // ── Front row ─────────────────────────────────────────────
  {
    id: "langmuir", name: "Irving Langmuir", born: "1881-01-31", died: "1957-08-16", from: "American",
    box: [206, 1087, 139, 247], nobel: ["Chemistry 1932"],
    tagline: "The industrial scientist who named plasma",
    hook: "A General Electric researcher who built a better light bulb, explained how molecules cling to surfaces, and gave ‘plasma’ its name.",
    story: [
      "Irving Langmuir spent most of his career not at a university but at the General Electric research laboratory in Schenectady, New York, proof that industrial research could be world-class science. Asked to improve the light bulb, he found that filling bulbs with an inert gas made filaments last far longer. Gas-filled bulbs lit the world for most of the twentieth century.",
      "His deeper work was on surfaces. Langmuir showed that molecules often attach to a surface in a layer just one molecule thick, and described how much a surface can hold: the Langmuir adsorption isotherm, still taught in every physical chemistry course. With Katharine Blodgett he learned to build films layer by layer. In 1932 this work won him the Nobel Prize in Chemistry, awarded while he was still at General Electric.",
      "Studying glowing ionised gases in vacuum tubes, he named them ‘plasma’ in 1928, the word now used for the matter of stars, lightning and fusion reactors. He later experimented with cloud seeding, and in a famous 1953 talk warned scientists against ‘pathological science’: self-deception dressed up as discovery."
    ],
    contributions: [
      "The gas-filled incandescent lamp",
      "The Langmuir adsorption isotherm and monolayer chemistry",
      "Langmuir–Blodgett films, with Katharine Blodgett",
      "Named and studied plasma; the Langmuir probe",
      "Cloud-seeding experiments (1940s)"
    ],
    awards: ["Nobel Prize in Chemistry 1932"],
    legacy: "Surface chemistry underlies catalysts, batteries, sensors and semiconductor manufacturing. Plasma physics, which Langmuir named, is the science of fusion energy."
  },
  {
    id: "planck", name: "Max Planck", born: "1858-04-23", died: "1947-10-04", from: "German",
    box: [529, 1102, 143, 300], nobel: ["Physics 1918"],
    tagline: "The reluctant revolutionary",
    hook: "In 1900 he introduced the quantum to explain the glow of hot objects, later calling it ‘an act of desperation’. It started everything in this photograph.",
    story: [
      "Max Planck was a conservative man who started a revolution almost by accident. In 1900 he was trying to explain the colours of light given off by hot objects, a problem classical physics got badly wrong. The only formula that matched experiment required a strange assumption: energy is emitted in discrete packets, each proportional to the light's frequency, E equals h times nu. Planck later called it ‘an act of desperation’, and at first he treated it as a purely formal assumption. It wasn't. The constant h became the signature of the quantum world.",
      "He was also among the first to recognise the genius of an unknown patent clerk. When Einstein published special relativity in 1905, Planck championed it and built on it immediately, and he later helped bring Einstein to Berlin in 1914.",
      "His later life was marked by grief. His son Karl was killed at Verdun in 1916; his son Erwin was executed in 1945 for his links to the plot to assassinate Hitler. Here, at sixty-nine, Planck was the grand old man of a conference that his own idea had made necessary."
    ],
    contributions: [
      "The quantum hypothesis, E = hν (1900)",
      "Planck's constant and the law of blackbody radiation",
      "Early champion and developer of special relativity",
      "Planck units of length, time and mass"
    ],
    awards: ["Nobel Prize in Physics 1918 (awarded in 1919)", "Copley Medal (1929)", "The Max Planck Society and the Planck space telescope bear his name"],
    legacy: "Since 2019, Planck's constant has defined the kilogram itself. Quantum theory, grown from his ‘desperate’ formula, underpins lasers, microchips and much of modern technology."
  },
  {
    id: "curie", name: "Marie Curie", born: "1867-11-07", died: "1934-07-04", from: "Polish-French",
    box: [814, 1076, 173, 247], nobel: ["Physics 1903", "Chemistry 1911"],
    tagline: "Two Nobels, two sciences",
    hook: "The only woman in the photograph, and the only person ever to win Nobel Prizes in two different sciences.",
    story: [
      "Born Maria Skłodowska in Russian-ruled Warsaw, where women could not attend university, she studied at a clandestine ‘Flying University’ and worked for years as a governess to save money. In 1891 she reached Paris, studied physics and mathematics at the Sorbonne, and met Pierre Curie.",
      "Investigating the mysterious rays Henri Becquerel had found coming from uranium, she realised the radiation came from the atoms themselves, a property she named radioactivity. Processing tonnes of pitchblende ore in a leaky shed, Marie and Pierre discovered two new elements in 1898: polonium, named for her partitioned homeland, and radium. In 1903 she became the first woman to win a Nobel Prize. After Pierre was killed in a street accident, she carried on alone, and in 1911 won a second Nobel, in chemistry.",
      "In the First World War she built mobile X-ray units, the ‘petites Curies’, learning to drive so she could take them to the front herself. By one estimate, more than a million wounded soldiers received X-ray examinations during the war. She was a veteran of these meetings, having attended the very first Solvay conference in 1911. Years of radiation exposure took their toll, and she died in 1934 of aplastic anaemia. Her notebooks are still radioactive today."
    ],
    contributions: [
      "Coined ‘radioactivity’ and showed it is a property of atoms",
      "Discovered polonium and radium (1898, with Pierre Curie)",
      "Isolated pure radium metal (1910)",
      "Mobile X-ray units in the First World War",
      "Founded the Radium Institutes in Paris and Warsaw"
    ],
    awards: ["Nobel Prize in Physics 1903, with Pierre Curie and Henri Becquerel", "Nobel Prize in Chemistry 1911", "Davy Medal (1903, with Pierre)", "First woman professor at the Sorbonne (1906)", "Element 96, curium, is named after the Curies"],
    legacy: "Radioactivity opened the door to nuclear physics, cancer radiotherapy and radiometric dating. Her daughter Irène won a Nobel Prize too, making the Curies the family with the most Nobel Prizes in history."
  },
  {
    id: "lorentz", name: "Hendrik Lorentz", born: "1853-07-18", died: "1928-02-04", from: "Dutch",
    box: [1166, 1110, 150, 225], nobel: ["Physics 1902"],
    tagline: "The chairman of physics",
    hook: "His equations became the backbone of Einstein's relativity. He chaired every Solvay physics conference from 1911 to this one, his last.",
    story: [
      "Hendrik Lorentz sits at the centre of the front row, and that was his place in physics too. For a generation he was its most respected figure: fluent in several languages, endlessly fair, and the natural choice to chair the Solvay conferences, which he did from the first in 1911 to this one in 1927.",
      "His theory of the electron explained how light interacts with matter, and the force a magnetic field exerts on a moving charge still bears his name. When Pieter Zeeman found that magnetic fields split spectral lines, Lorentz explained why, and the two shared the 1902 Nobel Prize. Trying to understand why no experiment could detect Earth moving through the ‘ether’, he worked out the transformations of space and time that Einstein would later place at the heart of special relativity. They are still called Lorentz transformations.",
      "Einstein revered him, saying Lorentz meant more to him personally than anyone else he had met. Lorentz also led the Dutch state committee that calculated how the great Zuiderzee enclosure dam would change the tides. He died just over three months after this photograph was taken. At his funeral, telephone and telegraph services across the Netherlands fell silent for three minutes."
    ],
    contributions: [
      "Electron theory of matter and light",
      "The Lorentz force law",
      "Explanation of the Zeeman effect",
      "Lorentz transformations, the mathematics of special relativity",
      "Tidal calculations for the Zuiderzee Works"
    ],
    awards: ["Nobel Prize in Physics 1902, shared with Pieter Zeeman", "Rumford Medal (1908)", "Copley Medal (1918)"],
    legacy: "Particle accelerators, GPS relativity corrections and electric motors all rely on equations bearing Lorentz's name. He was the bridge between classical physics and the twentieth century."
  },
  {
    id: "einstein", name: "Albert Einstein", born: "1879-03-14", died: "1955-04-18", from: "German-born",
    box: [1549, 1061, 161, 289], nobel: ["Physics 1921"],
    tagline: "The revolutionary who rejected the revolution",
    hook: "Helped launch quantum theory, then became its most formidable critic. Here he took on Bohr in the most famous debate in physics.",
    story: [
      "In 1905, while working as a patent examiner in Bern, Albert Einstein published a series of papers that changed physics. One proposed that light is made of quanta, particles of energy, to explain the photoelectric effect. Another showed that tiny grains jiggle in water because molecules strike them, giving a way to prove atoms exist. Others created special relativity and the equation E equals m c squared. A decade later he completed general relativity, which describes gravity as the curvature of space and time; its confirmation during the 1919 solar eclipse made him world-famous overnight.",
      "Einstein was a founder of quantum theory. His light quanta, his 1917 work on stimulated emission, the principle behind lasers, and his extension of Satyendra Nath Bose's quantum statistics were all crucial. Yet by 1927 he was deeply uneasy. The new quantum mechanics said nature was ruled by chance and that particles have no definite properties until measured. God, he insisted, does not play dice.",
      "In Brussels, in informal discussions over breakfast and dinner, he tried to show that quantum mechanics was inconsistent, inventing thought experiments to beat the uncertainty principle. Bohr answered each one. The debate went on for decades, and Einstein's 1935 paper with Podolsky and Rosen exposed the strange quantum link now called entanglement. Experiments have since sided with Bohr, but Einstein's objections opened entire fields of research."
    ],
    contributions: [
      "Light quanta and the photoelectric effect (1905)",
      "Special relativity and E = mc² (1905)",
      "Theory of Brownian motion (1905)",
      "General relativity (1915)",
      "Stimulated emission (1917), the basis of lasers",
      "Bose–Einstein statistics (1924–25)",
      "The EPR paradox and entanglement (1935)"
    ],
    awards: ["Nobel Prize in Physics 1921 (awarded in 1922), for the photoelectric effect", "Copley Medal (1925)", "Max Planck Medal (1929)", "Element 99, einsteinium, is named after him"],
    legacy: "GPS satellites correct for both of his relativity theories every day. Lasers, solar cells and gravitational-wave astronomy trace back to him. And the entanglement he found so troubling is now the resource behind quantum computing."
  },
  {
    id: "langevin", name: "Paul Langevin", born: "1872-01-23", died: "1946-12-19", from: "French",
    box: [1819, 1072, 180, 229],
    tagline: "Magnetism, randomness, and early sonar",
    hook: "Explained magnetism in materials, wrote the equation for random motion, pioneered ultrasonic submarine detection, and gave us the twin paradox.",
    story: [
      "Paul Langevin was a student of Pierre Curie and one of the brightest physicists in France. In 1905 he explained how materials respond to magnets, why some are weakly attracted and others weakly repelled, using the statistical behaviour of tiny atomic magnets.",
      "In 1908 he wrote the Langevin equation, describing a particle buffeted by random molecular impacts. It was one of the first stochastic differential equations, and its descendants now model everything from protein folding to financial markets. In 1911 he gave special relativity its most famous puzzle: a traveller who journeys near the speed of light returns younger than those who stayed home. We know it as the twin paradox.",
      "During the First World War he used vibrating quartz crystals to send and detect ultrasound underwater, a method for finding submarines by echo and a forerunner of sonar and medical ultrasound. In 1911 his relationship with the widowed Marie Curie, a few places along this same front row, became a tabloid scandal. A committed anti-fascist, he was arrested by the occupying Germans in 1940. His ashes lie in the Panthéon in Paris."
    ],
    contributions: [
      "Theory of paramagnetism and diamagnetism (1905)",
      "The Langevin equation for Brownian motion (1908)",
      "The twin paradox (1911)",
      "Ultrasonic submarine detection with quartz (1915–18)",
      "Championed relativity in France"
    ],
    awards: ["Hughes Medal (1915)", "Copley Medal (1940)", "Reburied in the Panthéon (1948)"],
    legacy: "Sonar, medical ultrasound and the mathematics of random processes all carry Langevin's fingerprints. He made relativity part of French science and stood up for scientific freedom under occupation."
  },
  {
    id: "guye", name: "Charles-Eugène Guye", born: "1866-10-15", died: "1942-07-15", from: "Swiss",
    box: [2089, 1084, 135, 217],
    tagline: "He weighed speeding electrons",
    hook: "A Swiss experimenter whose measurements showed electrons get heavier as they speed up, early support for relativity. He had lectured at the Zurich Polytechnic while Einstein was a student there.",
    story: [
      "In the 1890s Charles-Eugène Guye lectured at the Zurich Polytechnic while a young Albert Einstein was studying there. Einstein now sits just two places away from him in the front row.",
      "In 1900 Guye became professor of experimental physics at the University of Geneva. From 1907, and for more than a decade, he and his students Simon Ratnowsky and Charles Lavanchy measured how fast-moving electrons in cathode rays are deflected. Their results showed that an electron's mass appears to grow with its speed exactly as Lorentz and Einstein predicted, and not as a rival theory by Max Abraham did. It was among the most careful early confirmations of special relativity.",
      "He also wrote on the philosophy of science, asking how life and evolution fit with the laws of physics and chemistry."
    ],
    contributions: [
      "Precision tests of how electron mass depends on speed (from 1907)",
      "Research on electrical discharges in gases and on magnetism",
      "Privatdozent at the Zurich Polytechnic during Einstein's student years"
    ],
    awards: ["President of the Swiss Physical Society (1914–1916)"],
    legacy: "Before relativity was famous, it had to survive experiment. Guye's measurements helped show that Einstein's theory, not its rivals, described real electrons: the same physics that governs every particle accelerator today."
  },
  {
    id: "wilson", name: "C. T. R. Wilson", born: "1869-02-14", died: "1959-11-15", from: "Scottish",
    box: [2415, 1106, 150, 236], nobel: ["Physics 1927"],
    tagline: "He made the invisible visible",
    hook: "Invented the cloud chamber, which revealed the tracks of individual subatomic particles. The idea came from clouds on a Scottish mountaintop.",
    story: [
      "In September 1894, Charles Thomson Rees Wilson spent a few weeks at the weather observatory on the summit of Ben Nevis, Britain's highest mountain. He was entranced by the glories and coronas, rings of coloured light, that sunlight made in the clouds around the peak, and went back to Cambridge determined to recreate clouds in the laboratory.",
      "Making artificial clouds led him to a discovery. In very clean, supersaturated air, droplets form on electrically charged particles. A fast particle flying through leaves a trail of charged atoms, and so a trail of droplets: a visible track. By 1911 Wilson had built a cloud chamber that photographed the paths of individual alpha and beta particles. For the first time, physicists could actually see the subatomic world.",
      "His chamber became the great discovery machine of early particle physics; the positron and the muon were both found in cloud chambers. Wilson shared the 1927 Nobel Prize with Arthur Compton, who is in the row behind him. He also spent decades studying thunderstorms, and suggested their electric fields could accelerate electrons to enormous energies, an idea supported decades later when satellites detected gamma-ray flashes from thunderstorms."
    ],
    contributions: [
      "The cloud chamber (1911)",
      "Physics of cloud formation and condensation on ions",
      "Atmospheric electricity and thunderstorm research",
      "Prediction of high-energy runaway electrons in storms"
    ],
    awards: ["Nobel Prize in Physics 1927, shared with Arthur Compton", "Hughes Medal (1911)", "Copley Medal (1935)"],
    legacy: "The cloud chamber's descendants, from bubble chambers to modern particle detectors, turned particle physics into a science of seeing. Every image of a particle track begins with Wilson's clouds."
  },
  {
    id: "richardson", name: "Owen Richardson", born: "1879-04-26", died: "1959-02-15", from: "English",
    box: [2681, 1136, 139, 229], nobel: ["Physics 1928"],
    tagline: "The law behind the vacuum tube",
    hook: "Explained how hot metals boil off electrons. His law became a design rule for the vacuum tubes behind radio, television and the first computers.",
    story: [
      "Heat a metal enough and it begins to give off electrons, like steam rising from water. Owen Richardson, working in Cambridge and then at Princeton, studied this effect in the early 1900s and found the law that tells you how the current grows with temperature.",
      "That law became the design rule for the vacuum tube, the device that amplified and switched electrical signals before the transistor. Radio broadcasting, long-distance telephone lines, radar, television and the first electronic computers all ran on hot cathodes emitting electrons according to Richardson's law.",
      "In 1908 he also predicted that magnetising an object should make it rotate slightly, because electrons carry angular momentum, an effect Einstein and de Haas later measured. At Princeton his students included Clinton Davisson, who married Richardson's sister, and whose 1927 experiment confirmed de Broglie's matter waves."
    ],
    contributions: [
      "Richardson's law of thermionic emission",
      "The Emission of Electricity from Hot Bodies (1916), a standard text on thermionics",
      "Predicted the gyromagnetic (Einstein–de Haas) effect (1908)",
      "Research on the photoelectric effect and spectroscopy"
    ],
    awards: ["Nobel Prize in Physics 1928 (awarded in 1929)", "Hughes Medal (1920)", "Royal Medal (1930)", "Knighted (1939)"],
    legacy: "For half a century, electronics meant vacuum tubes, and vacuum tubes meant Richardson's law. Thermionic emission still powers X-ray tubes, electron microscopes and the magnetrons in microwave ovens."
  }
];
