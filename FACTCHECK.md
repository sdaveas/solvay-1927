# Fact-check log: `data/people.js`

Agent E, 2026-10-25. Scope: the text fields (`from`, `tagline`, `hook`, `story`, `contributions`, `awards`, `legacy`) of all 29 entries. `id`, `box`, `born`, `died` and `nobel` were not touched (dates and Nobel years had already been checked against Wikidata).

## Summary

| | Count |
|---|---|
| Factual claims checked | **348** (dates, numbers, awards and years, quotes, anecdotes, superlatives, relationships) |
| Fixed (clear error or overclaim corrected) | **25** |
| Softened (attributed, hedged or narrowed) | **17** |
| Removed (could not be verified) | **4** |
| Kept, but flagged as doubtful or single-source | **13** (listed per person below) |

Every medal and year in the `awards` arrays was confirmed against the recipient lists (Royal Society Copley, Royal, Hughes, Rumford and Davy medals; DPG Max Planck Medal; KNAW Lorentz Medal; Atoms for Peace Award; UNESCO Kalinga Prize), cross-checked with Wikidata `P166` statements. **All 34 medal and year entries were correct.** So were the knighthoods (Bragg 1941, Richardson 1939, Fowler 1942), de Broglie's Académie française election (1944), Bohr's first Atoms for Peace Award (1957) and de Broglie's first Kalinga Prize (1952).

The superlatives that were checked and hold:
- **Dirac is the youngest person in the photo.** Using the file's own birth dates: Dirac 1902-08-08, Heisenberg 1901-12-05, Pauli 1900-04-25.
- **Bragg and his father are the only father and son to share a Nobel Prize**, and Bragg (25) is still the youngest physics laureate as of October 2026.
- **Curie is the only person to win Nobel Prizes in two different sciences**, and the only woman in the photo.
- **Lorentz chaired every Solvay physics conference from 1911 to 1927.**

The ones that did not hold:
- **Langmuir as "first industrial chemist" to win a Nobel.** Carl Bosch (BASF/IG Farben) won the Chemistry prize in 1931, the year before Langmuir.
- **Henriot's "definitive proof" of potassium's radioactivity.** J. J. Thomson (1905) and Campbell and Wood (1906) reported it first.
- **"Guye taught Einstein."** It only rests on an uncited Wikipedia line.

### Main sources
- Bacciagaluppi & Valentini, *Quantum Theory at the Crossroads* (CUP 2009). It includes the official 1927 participant list, the committee and secretary roles, and Heisenberg's account of the Bohr–Einstein exchanges: https://arxiv.org/abs/quant-ph/0609184
- Straumann, "On the first Solvay Congress in 1911": https://arxiv.org/abs/1109.3785
- "The Solvay Councils, de Broglie's brothers, and the development of wave-particle duality": https://arxiv.org/abs/2411.18524
- nobelprize.org biographies, facts pages and Nobel lectures. MacTutor. AIP. Historisches Lexikon der Schweiz.
- Wikipedia medal lists (with their Royal Society and *Nature* citations) and Wikidata. Wikipedia biographies were used as a starting point, and anything surprising was cross-checked.

### Downstream: text in other agents' files that repeats claims corrected here
`data/tours.js` (owned by Agent D) still contains the old wording. The coordinator should reconcile it in Phase 2.
- The Bohr–Einstein step ("Each morning he arrived…"): attribute it to Heisenberg's recollection, and make "stop telling God" "on one occasion".
- The de Broglie step: "His examiners were unsure… sent a copy to Einstein" → it was his adviser Langevin who sent it, and Einstein replied in December 1924.
- The Dirac step: "Ralph Fowler, who brought quantum theory into Britain… Heisenberg's first quantum paper" → Fowler introduced Dirac to quantum theory and passed him a proof of Heisenberg's first paper on the new quantum mechanics (1925).
- The Henriot step: "He proved that potassium… is naturally radioactive" and "That trick became the basis of the ultracentrifuge" → "helped settle", and Beams later adapted the air-driven tops into ultracentrifuges.
- The Guye step: "Charles-Eugène Guye taught Einstein in Zurich" → he lectured at the Polytechnic while Einstein was a student there.
- The Lorentz step: "died four months after it" → just over three months (conference 24–29 Oct 1927, death 4 Feb 1928).
- The De Donder step: "an early champion of relativity in Belgium" is acceptable, but not "earliest".

---

## Back row

### Auguste Piccard
**Changes**
1. **Fixed.** "They were the first people to enter the stratosphere and come back alive" → "They were the first people to enter the stratosphere". Reason: "and come back alive" implies earlier fatal attempts, and there were none. Source: https://en.wikipedia.org/wiki/Auguste_Piccard (FAI record 10634, 27 May 1931, 15,781 m).
2. **Softened.** "An early pressurised cabin, the principle behind aircraft and spacecraft cabins" → "A sealed, pressurised gondola, one of the first pressurised cabins for human flight". Reason: there is no source for it being "the principle behind" later cabins, and other pressurised cabins were being built at the same time.

**Verified:** 1931 with Kipfer at ~15.8 km. 1932 with Cosyns at 16,201 m (https://www.thisdayinaviation.com/tag/auguste-antoine-piccard/). The bathyscaphe (FNRS-2). Trieste built by Auguste and Jacques, which reached the Challenger Deep in 1960 with Jacques Piccard and Don Walsh. Hergé confirmed Piccard as the model for Calculus (Sadoul interview). Bertrand's balloon (1999) and Solar Impulse flights.

### Émile Henriot
**Changes**
1. **Softened.** Hook: "Proved that ordinary potassium is naturally radioactive" → "Helped prove…". Story: "Henriot showed definitively that they do" → "J. J. Thomson and others had first reported it; Henriot's careful thesis measurements helped settle that they do." Contribution: "Definitive proof…" → "Confirmation… (doctoral thesis, 1912)". Reason: Thomson (1905) and Campbell and Wood (1906) reported potassium and rubidium activity first. "Definitive" only comes from Wikipedia. Sources: https://en.wikipedia.org/wiki/%C3%89mile_Henriot_(chemist), https://www.gutenberg.org/files/32307/32307-h/32307-h.htm (Soddy-era review of the early reports), thesis "Étude des rayons émis par les métaux alcalins", Paris 1912, adviser Marie Curie: https://mathgenealogy.org/id.php?id=250234
2. **Fixed.** "That trick became the basis of the ultracentrifuge" → "In 1925, with E. Huguenard… In the 1930s the American physicist Jesse Beams turned such air-driven tops into ultracentrifuges". Reason: Svedberg's ultracentrifuge (1924) did not use air tops. Henriot–Huguenard tops were adapted by Beams. Sources: https://en.wikipedia.org/wiki/Ultracentrifuge, https://web.phys.virginia.edu/History/Beams/Papers/Beams%201959d.pdf
3. **Removed.** "Early research on the electron microscope". Reason: it appears only in uncited Wikipedia text. The first Brussels electron microscope was built by L. Marton (1933), and no source links Henriot to it directly.
4. **Removed.** "Studies of birefringence and molecular vibrations". Reason: only in uncited Wikipedia text. It was replaced with the verified "Administrative organiser of the Solvay physics conferences" (he sat on the 1927 administrative commission; Bacciagaluppi & Valentini §1.4).

**Kept, single-source:** "Attended seven Solvay conferences (1924–1954)" (Wikipedia list: 1924, 1927, 1930, 1933, 1948, 1951, 1954).

### Paul Ehrenfest
**No changes.**

**Verified:**
- Boltzmann's student, and Lorentz's successor at Leiden (1912).
- Coined "ultraviolet catastrophe" (1911): https://en.wikipedia.org/wiki/Ultraviolet_catastrophe
- Adiabatic principle, Ehrenfest theorem (1927), Ehrenfest paradox, classification of phase transitions (1933).
- Students Uhlenbeck and Goudsmit (electron spin, 1925).
- Einstein: "not merely the best teacher in our profession whom I have ever known" (1934 memorial): https://en.wikipedia.org/wiki/Paul_Ehrenfest

**Kept, attributed:** the "ashamed" remark to Einstein, already worded "reportedly". It is widely repeated (e.g. Kumar, *Quantum*). The usual source is Heisenberg's memoir *Physics and Beyond* (1971), whose text I could not access to confirm the wording. The 1927 exchanges are known only from the later accounts of Bohr, Heisenberg and Ehrenfest (Bacciagaluppi & Valentini ch. 12).

### Édouard Herzen
**Changes**
1. **Fixed.** "later directed the physical and chemical sciences division of Brussels' Institut des Hautes Études" → "By 1927 he was a professor at Brussels' École des Hautes Études." Reason: the directorship is uncited on Wikipedia. The official 1927 proceedings list him as "professor at the École des Hautes Études de Bruxelles, as representative of the Solvay family" (Bacciagaluppi & Valentini, p. 281).
2. **Removed.** The 1924 popular book on relativity ("La Relativité d'Einstein"), both the story sentence and the contribution. Reason: it is uncited on Wikipedia and not found in the BnF catalogue.
3. **Softened.** Lorentz note "(1924)" → "(early 1920s)". Reason: Wikipedia dates it 1924, French Wikisource 1923 (https://fr.wikisource.org/wiki/Auteur:Hendrik_Antoon_Lorentz), and the Comptes rendus could not be checked (Gallica was blocked).
4. **Fixed.** Replaced the "popular explainer" framing with verified facts. He appears in the 1911 photo as one of Solvay's co-workers (https://arxiv.org/abs/1109.3785), and attended the 1927 conference as the Solvay family's representative.

**Kept, single-source (Wikipedia, uncited):** born in Florence, grandson of Alexander Herzen (consistent with the writer's son A. A. Herzen working in Florence 1865–1881), thesis on surface tension (1902), and six conferences (1911, 1913, 1924, 1927, 1930, 1933). A human should check a Belgian biographical source (e.g. the *Biographie nationale*).

### Théophile De Donder
**Changes**
1. **Softened.** "one of its earliest champions in Belgium" → "an enthusiastic champion of the theory". Reason: the source says "enthusiastic proponent" and gives no priority claim. Source: https://en.wikipedia.org/wiki/Th%C3%A9ophile_de_Donder

**Verified:** 1899 thesis on Poincaré's integral invariants. Relativity work from 1914. De Donder (harmonic) gauge. 1923 affinity linked to Gibbs free energy. Founder of irreversible thermodynamics. Prigogine was his doctoral student (Nobel Prize in Chemistry 1977).

### Erwin Schrödinger
**No changes.**

**Verified:**
- Arosa at Christmas 1925.
- 1926 papers, including the equivalence proof (third paper).
- Cat and "entanglement", both 1935.
- Dublin from 1939; *What Is Life?* (1944).
- Watson and Crick each credited the book in their memoirs.
- Nobel Prize 1933, shared with Dirac.

Source: https://en.wikipedia.org/wiki/Erwin_Schr%C3%B6dinger

### Jules-Émile Verschaffelt
**Changes**
1. **Fixed (made specific).** The vague "the critical point, and the properties of fluids around it" → he measured capillary rise of liquefied CO₂ near the critical point, and his data showed real fluids depart from van der Waals's theory there. Reason: the soft spot flagged in the plan. His work was on capillarity and critical exponents. Sources: Leiden Communication No. 28 (1897), https://www.lorentz.leidenuniv.nl/history/KOL_archive/Communications/25_36/28_Verschaffelt.pdf, and Berche, Henkel & Kenna, https://arxiv.org/abs/0905.1886 ("mean-field-like values of the critical exponents… not adequate… as realised experimentally in 1896 by Jules-Émile Verschaffelt").
2. **Fixed.** Replaced the unsupported "His presence here reflects the deep tie…" with the verified fact that he was secretary of the Solvay physics conferences from the third one (1921), and secretary of this one. Source: Bacciagaluppi & Valentini §1.4 and the 1927 participant list.
3. **Fixed.** Tagline "A craftsman of cold physics" → "The secretary who measured the critical point". Reason: his critical-point work on CO₂ is near room temperature, not "cold physics". The hook and legacy were adjusted to match.

**Verified:** Leiden 1894–1906 and 1914–1923, Brussels 1906–1914, Ghent 1923–1940 (https://en.wikipedia.org/wiki/Jules-%C3%89mile_Verschaffelt).

### Wolfgang Pauli
**Changes**
1. **Softened.** "his harshest verdict on a sloppy paper was that it was 'not even wrong'" → "he is said to have dismissed one muddled paper as 'not even wrong'". Reason: the remark is known only through second-hand accounts (Peierls).

**Verified:** 1921 relativity review praised by Einstein. Exclusion principle (1925). Neutrino letter of 4 Dec 1930 ("Dear radioactive ladies and gentlemen"). Neutrino detected 1956. Pauli matrices 1927. Spin–statistics 1940. Nobel 1945 after Einstein's nomination. Lorentz Medal 1931. Planck Medal 1958. Source: https://en.wikipedia.org/wiki/Wolfgang_Pauli

**Kept, interpretive:** "his criticism helped sink de Broglie's pilot-wave theory". Pauli's objection at the conference is documented (Bacciagaluppi & Valentini), and de Broglie abandoned the theory soon afterwards.

### Werner Heisenberg
**Changes**
1. **Fixed.** "led its wartime nuclear research" → "became a leading scientist in its wartime nuclear programme". Reason: the Uranverein was run by Army Ordnance and the Reich Research Council. Heisenberg was a leading figure, and KWI director from 1942, but not the leader of all of it. Source: https://en.wikipedia.org/wiki/Werner_Heisenberg
2. **Softened.** "At about three in the morning" → "…as he later recalled". Reason: the only source is his own memoir.

**Verified:** Heligoland in June 1925 (hay fever). Uncertainty principle 1927. Ages 23 and 25. Second-youngest in the photo. 1941 Copenhagen visit and Frayn's play. Isospin 1932. Nobel 1932 awarded in 1933. Planck Medal 1933.

### Ralph Fowler
**Changes**
1. **Fixed.** "the man who brought quantum theory into Britain" → "a central figure in Cambridge theoretical physics, the man who introduced the young Paul Dirac to quantum theory". Reason: the original was an overclaim. MacTutor: "It was Fowler who ultimately introduced Paul Dirac to… quantum theory in 1923". Source: https://mathshistory.st-andrews.ac.uk/Biographies/Fowler/
2. **Fixed.** "an early proof of Heisenberg's first quantum paper" → "In 1925 he passed Dirac a proof copy of Heisenberg's first paper on the new quantum mechanics". Reason: Heisenberg had published quantum papers before the 1925 *Umdeutung* paper. Source: https://en.wikipedia.org/wiki/Paul_Dirac (Fowler received the proofs and sent them to Dirac in Bristol, late summer 1925).
3. **Softened.** "including naming the 'zeroth law'" → "credited with naming". Reason: the coinage is credited to Fowler via Sommerfeld's account, and it appears in Fowler & Guggenheim (1939). Source: https://en.wikipedia.org/wiki/Zeroth_law_of_thermodynamics

**Verified:** wounded at Gallipoli, then anti-aircraft work under A. V. Hill. Married Eileen Rutherford (1921). White dwarfs (1926). Fowler–Nordheim (1928). Supervisor of Dirac and Chandrasekhar (Chandrasekhar's Nobel 1983). Royal Medal 1936. Knighted 1942.

### Léon Brillouin
**Changes**
1. **Fixed.** "after emigrating to the United States in 1941" → "after leaving Vichy France for the United States in late 1940". Reason: he resigned about six months after May 1940 and left (Wikipedia), and MacTutor says 1940. Sources: https://en.wikipedia.org/wiki/L%C3%A9on_Brillouin, https://mathshistory.st-andrews.ac.uk/Biographies/Brillouin/

**Verified:** son of Marcel Brillouin. Brillouin scattering (1922). WKB (1926; Kramers is also in the photo). Brillouin zones (1930). Negentropy and Maxwell's demon. *Science and Information Theory* (1956).

## Middle row

### Peter Debye
**Changes**
1. **Softened.** The seminar remark is now attributed: "Afterwards, as the young Felix Bloch remembered it, Debye remarked…". Reason: the only source is Bloch's 1976 reminiscence, *Physics Today* 29(12):23 (https://aip.brightspotcdn.com/PTO.v29.i12.23_1.online.pdf). Also see https://physik.uni-graz.at/en/news/happy-birthday-schroedingergleichung
2. **Fixed.** "directed the KWI… until 1940, when he left for Cornell" → "until he left Germany in early 1940 for Cornell". Reason: he was director 1934/35–1939, then left via Genoa in January 1940. Source: https://en.wikipedia.org/wiki/Peter_Debye

**Verified:** T³ law and dipoles (1912). Debye–Scherrer (1916). Debye–Hückel (1923). Nobel Prize in Chemistry 1936. Planck Medal 1950. The debate over his Nazi-era conduct (Rispens).

### Martin Knudsen
**No changes.**

**Verified:** Knudsen flow, number, gauge and pump (no moving parts). Knudsen cell in MBE. Ingolf expedition hydrographer (1895–96). Hydrographical Tables (1901). Source: https://en.wikipedia.org/wiki/Martin_Knudsen

**Kept, single-source:** the thermometer precision of 1/100 °C.

### William Lawrence Bragg
**Changes**
1. **Fixed.** "On his watch… Perutz and Kendrew solved the first protein structures" → "…began the work that would solve the first protein structures a few years later". Reason: Bragg left the Cavendish for the Royal Institution in 1953. Myoglobin (1957–58) and haemoglobin (1959) came after that. Source: https://en.wikipedia.org/wiki/Lawrence_Bragg

**Verified:** Bragg's law (1912). Nobel 1915 at 25: the only father–son shared prize and still the youngest physics laureate. Sound ranging in France 1915–19 (https://www.nobelprize.org/prizes/physics/1915/wl-bragg/biographical/). Director of the Cavendish when DNA was solved (Feb 1953). NaCl structure. Knighted 1941. Copley 1966.

**Kept:** "heard the news while serving as an army officer in France". The Nobel biography places him at GHQ France from 1915, but I found no source for the exact moment he heard.

### Hendrik Kramers
**No changes.**

**Verified:**
- "Turned up" in Copenhagen in 1916. MacTutor: "He arrived unannounced and introduced himself to Bohr" (https://mathshistory.st-andrews.ac.uk/Biographies/Kramers/).
- First assistant.
- Dispersion formula (1924) and the Kramers–Heisenberg paper (1925).
- WKB. Kramers–Kronig. Degeneracy theorem. BKS (1924). Mass renormalisation.
- Lorentz Medal 1947. Hughes Medal 1951.

### Paul Dirac
**No changes.**

**Verified:** age 25 and youngest in the photo (see Summary). The "dirac" unit joke. Dirac equation (early 1928). Antimatter prediction (1931). Anderson's positron (1932). Nobel 1933 at 31. Lucasian chair 1932–69. Copley 1952. Westminster Abbey memorial (1995). Source: https://en.wikipedia.org/wiki/Paul_Dirac

### Arthur Compton
**Changes**
1. **Fixed.** "Then in 1923 Arthur Compton, at Washington University…" → "in 1922". Reason: the experiment was done at Washington University in 1922 and published in 1923, the year he moved to Chicago. Source: https://www.nobelprize.org/prizes/physics/1927/compton/biographical/ and https://en.wikipedia.org/wiki/Arthur_Compton. The contribution "(1923)" still matches the publication date.

**Verified:**
- **Nobel announcement "weeks after" the conference.** *TIME*'s 21 Nov 1927 issue reports the Academy's decision as made "last week", against a conference that ran 24–29 Oct 1927 (https://time.com/archive/6777111/science-nobel-prizes/).
- **Wartime and later career.** He led the Metallurgical Laboratory, and Chicago Pile-1 went critical on 2 Dec 1942. The "Italian navigator" code. Chancellor of Washington University 1945–1953.
- **Cosmic rays** are charged particles (1932).
- **The Compton Gamma Ray Observatory** is named after him.

### Louis de Broglie
**Changes**
1. **Fixed.** "His examiners were unsure what to make of it and sent a copy to Einstein, who was impressed, writing…" → "His adviser, Paul Langevin, sent a copy to Einstein, who wrote back in December 1924 that de Broglie had 'lifted a corner of the great veil'". Reason: Langevin sent it, and the reply was Einstein's letter to Langevin of 16 Dec 1924 (*Collected Papers* vol. 14, doc. 398). Source: https://arxiv.org/abs/1803.10662 (Introduction to vol. 15).

**Verified:** studied history first. Maurice was one of the secretaries of the 1911 conference, and Louis read its proceedings (https://arxiv.org/abs/2411.18524). 1927 confirmations by Davisson–Germer and G. P. Thomson (Aberdeen). Pilot wave and Pauli's criticism. Bohm (1952). Académie française 1944. First Kalinga Prize 1952.

**Kept:** the quote wording. Translations differ ("one corner" in the Princeton edition, "a corner" elsewhere).

### Max Born
**Changes**
1. **Fixed.** "forced out of Germany and settled in Edinburgh" → "…after three years in Cambridge he settled in Edinburgh". Reason: he was at St John's College, Cambridge from 1933 and became Tait Professor in Edinburgh in October 1936. Source: https://en.wikipedia.org/wiki/Max_Born

**Verified:** matrices with Heisenberg and Jordan. Born rule (1926). Nobel 1954 with Bothe. Einstein's dice letter (4 Dec 1926). Russell–Einstein Manifesto. Oppenheimer was his doctoral student. Planck Medal 1948. Hughes 1950.

### Niels Bohr
**Changes**
1. **Fixed.** "Just a month before this conference" → "About six weeks before this conference, at a meeting in Como". Reason: the Como lecture was on 16 Sept 1927, and the conference opened on 24 Oct. Source: https://en.wikipedia.org/wiki/Niels_Bohr
2. **Softened.** "Each morning Einstein arrived… by evening, Bohr usually had the answer" → "As Heisenberg remembered it, Einstein came to breakfast each morning… by supper…". Reason: this is Heisenberg's recollection, written some 40 years later (quoted in Bacciagaluppi & Valentini ch. 12).
3. **Softened.** "When Einstein declared that God does not play dice, Bohr is said to have replied…" → "Einstein liked to say that God does not play dice; on one occasion, Bohr is said to have replied…". Reason: AIP gives the retort without a date or setting, and there is no evidence it was said at this conference. Source: https://history.aip.org/exhibits/einstein/ae63.htm

**Verified:** institute opened in March 1921. Fission with Wheeler (1939). Escape in 1943. Copley 1938. First Atoms for Peace Award (1957). Bohrium. Aage Bohr's Nobel (1975).

**Kept, attributed:** "stop telling God what to do". There is no primary source.

## Front row

### Irving Langmuir
**Changes**
1. **Fixed.** "In 1932 he became the first industrial chemist to win a Nobel Prize" → "In 1932 this work won him the Nobel Prize in Chemistry, awarded while he was still at General Electric." Reason: false. Carl Bosch (BASF/IG Farben) shared the 1931 Chemistry prize (https://www.nobelprize.org/prizes/chemistry/1931/summary/), and Gustaf Dalén (AGA) won Physics in 1912. Britannica and AIP repeat the "first" claim, but it does not hold. His affiliation at the time of the award was GE (https://www.nobelprize.org/prizes/chemistry/1932/langmuir/facts/).

**Verified:** gas-filled lamp, adsorption isotherm, Langmuir–Blodgett, plasma (1928), Langmuir probe, cloud seeding, "pathological science" (1953). Source: https://en.wikipedia.org/wiki/Irving_Langmuir

### Max Planck
**Changes**
1. **Fixed.** Hook and story: "calling it 'an act of desperation'" → "later calling it…". Reason: he said it in 1931 (letter to R. W. Wood), not in 1900.
2. **Fixed.** "hoped it would turn out to be a mathematical trick" → "at first he treated it as a purely formal assumption". Reason: that matches his own words ("a purely formal assumption"). Source: https://en.wikipedia.org/wiki/Max_Planck

**Verified:** early champion of relativity, and brought Einstein to Berlin in 1914. Karl killed at Verdun (1916). Erwin executed in January 1945. Aged 69. Nobel 1918 awarded in 1919. Copley 1929. The 2019 kilogram redefinition.

### Marie Curie
**Changes**
1. **Fixed.** "polonium, named for her occupied homeland" → "partitioned homeland". Reason: Poland was partitioned among three empires. Source: https://en.wikipedia.org/wiki/Marie_Curie
2. **Softened.** "around a million soldiers were examined with them" → "By one estimate, more than a million wounded soldiers received X-ray examinations during the war." Reason: the figure is an estimate for all wartime X-ray exams, not a count for her units. Source: https://www.smithsonianmag.com/history/how-marie-curie-brought-x-ray-machines-to-battlefield-180965240/
3. **Softened.** "drove them to the front herself" → "learning to drive so she could take them to the front herself". Reason: the same article says she learned to drive, but also mentions a driver.

**Verified:** Flying University and work as a governess. Paris in 1891. Coined "radioactivity". Polonium and radium (1898). Nobels 1903 and 1911. Attended the 1911 Solvay conference. Radium isolated (1910). Radium Institutes in Paris and Warsaw. Davy Medal 1903. Curium. Five family Nobels.

**Kept, flagged:** "First woman professor at the Sorbonne (1906)". She took Pierre's chair in 1906 (Wikipedia says 1906), and some sources date the full title to 1908.

### Hendrik Lorentz
**Changes**
1. **Fixed.** "He died four months after this photograph was taken" → "just over three months". Reason: the conference was 24–29 Oct 1927, and he died on 4 Feb 1928.

**Verified:**
- Chaired every Solvay physics conference from 1911 to 1927.
- Zeeman effect and the 1902 Nobel.
- Einstein, 1953: "For me personally he meant more than all the others I have met on my life's journey."
- Chaired the Zuiderzee state committee.
- Funeral: the "State telegraph and telephone services of Holland were suspended for three minutes" (Richardson's account): https://mathshistory.st-andrews.ac.uk/Biographies/Lorentz/
- Acted as interpreter at Solvay meetings (Ehrenfest's letter, in Bacciagaluppi & Valentini).
- Rumford 1908. Copley 1918.

### Albert Einstein
**Changes**
1. **Fixed.** "his work with Satyendra Nath Bose on quantum statistics" → "his extension of Satyendra Nath Bose's quantum statistics". Reason: Einstein translated and extended Bose's paper. They did not collaborate.
2. **Softened.** "In Brussels he tried to show…" → "In Brussels, in informal discussions over breakfast and dinner, he tried to show…". Reason: the exchanges were semi-private, and all accounts come from Bohr, Heisenberg and Ehrenfest (Bacciagaluppi & Valentini ch. 12).

**Verified:** 1905 papers. 1919 eclipse. Stimulated emission (1917). EPR (1935). Nobel 1921 awarded in 1922. Copley 1925. Planck Medal 1929.

**Kept, flagged:** "thought experiments to beat the uncertainty principle". This is the standard Bohr and Heisenberg account. Bacciagaluppi & Valentini argue Einstein's real target was completeness and locality.

### Paul Langevin
**Changes**
1. **Softened.** Tagline "Magnetism, randomness, and the first sonar" → "…and early sonar". Reason: echo ranging (Fessenden, 1914) came before his work, and the war ended before his system was operational.

**Verified:** Pierre Curie's student. Para- and diamagnetism (1905). Langevin equation (1908). Twin paradox (1911). Quartz ultrasound (1916–18 patents). The 1911 scandal. Arrested by the Germans on 30 Oct 1940. Ashes moved to the Panthéon in 1948 (https://www.refletsdelaphysique.fr/articles/refdp/pdf/2006/01/refdp20061p14.pdf). Hughes 1915. Copley 1940.

### Charles-Eugène Guye
**Changes**
1. **Softened.** Hook "Einstein had once been his student", story "one of his students was a young Albert Einstein", and contribution "Taught Einstein at the Zurich Polytechnic" → he lectured (as Privatdozent) at the Polytechnic while Einstein was a student there. Reason: only the overlap is verifiable (Guye was Privatdozent at the ETH 1893/94–1900, and Einstein studied there 1896–1900). Wikipedia's "one of his students" is uncited, and Einstein's known coursework (Weber, Pernet, Hurwitz…) does not list Guye. Sources: https://hls-dhs-dss.ch/fr/articles/046860, https://arxiv.org/abs/1205.4335
2. **Fixed.** "who now stands just two places away from him in the front row" → "sits". Reason: the front row is seated.

**Verified:** Geneva chair from 1900. Electron-mass experiments with Ratnowsky and Lavanchy (from 1907), against Abraham's theory.

**Kept, single-source:** President of the Swiss Physical Society 1914–1916 (Wikipedia).

### C. T. R. Wilson
**Changes**
1. **Fixed.** "Arthur Compton, who stands in the row behind him" → "who is in the row behind him". Reason: I could not confirm the middle row's posture.
2. **Softened.** "an idea confirmed when satellites detected gamma-ray flashes" → "supported decades later when satellites detected gamma-ray flashes from thunderstorms". Reason: terrestrial gamma-ray flashes (found 1994) fit runaway-electron models, but "confirmed" overstates it.

**Verified:** September 1894, "a few weeks" on Ben Nevis, coronas and glories, all in his own Nobel lecture (https://www.nobelprize.org/uploads/2018/06/wilson-lecture.pdf). Tracks by 1911. Positron and muon found in cloud chambers. Hughes 1911. Copley 1935.

### Owen Richardson
**Changes**
1. **Removed.** "coined the word 'thermionic'" (story) and the contribution "Coined the term 'thermionic'". Reason: there is no reliable source, and his Nobel lecture and Nobel biography don't claim it. It was replaced with "The Emission of Electricity from Hot Bodies (1916), a standard text on thermionics" (https://www.nobelprize.org/prizes/physics/1928/richardson/biographical/).
2. **Softened.** Tagline "The father of the vacuum tube" → "The law behind the vacuum tube". Hook "His law made radio, television and the first computers possible" → "His law became a design rule for the vacuum tubes behind…". Reason: Fleming and de Forest invented the tubes, and Richardson supplied the physics.

**Verified:** Princeton 1906–1913. Davisson was his PhD student and married his sister Charlotte (https://en.wikipedia.org/wiki/Owen_Willans_Richardson). 1908 gyromagnetic prediction. Nobel 1928 awarded in 1929. Hughes 1920. Royal 1930. Knighted 1939.

---

## Still worth a human look
1. **Herzen**: there is almost no independent biography online. Check the Belgian *Biographie nationale* or *Bulletin des sociétés chimiques belges* vol. 45 for the thesis (1902), his parentage, and the exact date and venue of the Lorentz note.
2. **Ehrenfest's "ashamed" remark**: confirm the wording and page in Heisenberg's *Physics and Beyond* (it is usually cited around p. 80).
3. **Henriot**: the Nature obituary by L. Marton (190, 861, 1961) is paywalled. It would settle the potassium priority and the electron-microscope question.
4. **The middle row**: whether they were standing or seated, if any narration needs it.

---

## data/everyday.js

Fact-check agent, 2026-10-26. Scope: all 17 item `blurb`s and every link's `how` claim, checked for (a) truth, (b) fair attribution (the attendee's work actually underlies the technology, not a loose association) and (c) wording without overclaiming. Item ids, icons and names are unchanged. Every surviving link now has `source: { title, url }`. All 44 distinct source URLs returned HTTP 200 on 2026-10-26, and each was read to confirm it supports the specific claim.

**Summary: 51 links checked · 11 fixed · 13 softened · 6 reworded for precision (no factual change) · 3 removed · 18 unchanged · 48 sources added. Blurbs: 17 checked, 2 fixed (MRI, PET), 1 softened (Medicines).**

| | Count |
|---|---|
| Links checked | **51** |
| Fixed (clear error or misleading framing corrected) | **11** |
| Softened (narrowed or hedged) | **13** |
| Reworded for precision or clarity (no factual change) | **6** |
| Removed (attribution not defensible) | **3** |
| Unchanged text, source added | **18** |
| Sources added | **48** (44 distinct URLs) |
| Kept, but flagged as doubtful | **7** (listed per item below) |

The headline corrections:
- **Debye–Hückel theory does not describe battery electrolytes.** It is a dilute-solution limiting law, and lithium-ion electrolytes are about 1 mol/L of salt in organic carbonates. The link was removed.
- **Compton scattering does not "shape" X-ray image contrast.** Contrast between bone and soft tissue comes mainly from photoelectric absorption. Compton scatter, the dominant interaction in soft tissue above about 30 keV, *fogs* the image, which is why anti-scatter grids exist.
- **"Radium was among the first cancer treatments"** was wrong (surgery is far older). Radium was one of the first *radiation* treatments.
- **GPS: "The time-dilation correction uses the Lorentz transformations"** implied the whole correction does. The larger part (about +45 µs/day) is the gravitational effect of general relativity. Only the speed part (about −7 µs/day) follows from the Lorentz transformations.
- **Two Brillouin links (LED, solar) only said "band theory"**, not anything of Brillouin's. They now name the direct/indirect band gap, which is defined by where the band edges sit in the Brillouin zone.
- **Henriot: ultracentrifuges did not "grow out of" his tops.** Svedberg's ultracentrifuge (1924) came first. Beams adapted the Henriot–Huguenard air-driven tops in the 1930s. This matches the people.js correction.

### Smartphone
**Changes**
1. **Softened.** Schrödinger: "Chip designers solve his equation to model how electrons move through transistors" → "Engineers solve his equation to model how electrons behave inside today's nanometre-scale transistors." Reason: everyday chip design uses classical drift-diffusion models. Schrödinger-equation solvers (Schrödinger–Poisson, NEGF) are used by device engineers for ultrascaled transistors. Source: https://eprints.gla.ac.uk/234779/
2. **Softened.** Brillouin: "Brillouin zones are the map engineers use to work out a semiconductor's bands" → "…the map on which a semiconductor's energy bands are calculated and plotted." Reason: the zones are the standard frame for band-structure calculations, but "the map engineers use" overstated who uses them. Source: https://arxiv.org/abs/1004.2974 (band structures computed along high-symmetry paths in the Brillouin zone).

**Verified, unchanged:**
- Heisenberg: 1925 matrix mechanics, Nobel "for the creation of quantum mechanics". https://www.nobelprize.org/prizes/physics/1932/heisenberg/facts/
- Pauli: the exclusion principle makes electrons stack into the lowest available states, which with band theory sets the Fermi level in semiconductors. http://hyperphysics.phy-astr.gsu.edu/hbase/Solids/Fermi.html
- Fowler: in floating-gate flash, electrons are injected and ejected through the tunnel oxide by Fowler–Nordheim tunnelling (Cai et al., *Proc. IEEE* 105, 2017, §3.4). https://arxiv.org/abs/1706.08642
- Einstein: the 2009 Nobel press release says the CCD "makes use of the photoelectric effect, as theorized by Albert Einstein". https://www.nobelprize.org/prizes/physics/2009/press-release/
- Langmuir: plasma etching has been used in chip-making since the 1960s–70s, and the review credits Langmuir with coining "plasma" (first in print in 1928). https://doi.org/10.1116/1.4819316

### GPS satellite
**Changes**
1. **Fixed.** Lorentz: "The time-dilation correction uses the Lorentz transformations" → "Part of the correction undoes the time dilation caused by the satellites' speed, which follows from the Lorentz transformations." Reason: the net +38 µs/day is about +45 µs (gravitational, general relativity) and −7 µs (speed, special relativity). Only the second part comes from the Lorentz transformations. Source: https://physicstoday.aip.org/features/relativity-and-the-global-positioning-system (also https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps.html for the 45/7 split).
2. **Reworded.** Bohr: added "1913". Source: https://www.britannica.com/science/Bohr-model ("Atoms absorb or emit radiation only when the electrons abruptly jump between allowed, or stationary, states").

**Verified, unchanged:** Einstein: "about 38 microseconds a day" (Pogge: 45 − 7 = 38 µs/day. Ashby: net fractional offset 4.4645 × 10⁻¹⁰, which is 38.6 µs/day). The satellite clocks are set to 10.22999999543 MHz before launch to cancel it.

**Kept, doubtful:** "uncorrected, positions would drift by kilometres daily". Both sources say this: Ashby in *Physics Today* writes "navigational errors of more than 11 km" in one day, and Pogge writes "about 10 kilometers each day". But it is a textbook illustration. A rate offset common to all satellites would largely be absorbed into each receiver's own clock solution, and the control segment's broadcast clock corrections could also absorb it. Kept because the authoritative sources state it.

### Fibre-optic internet
**Changes**
1. **Softened.** Kramers: "The Kramers–Kronig relations link how glass absorbs light to how it slows it, a tool of fibre design" → "…let you work out how strongly glass slows each colour of light, and so how pulses spread, from how it absorbs light." Reason: "a tool of fibre design" was vague. The documented use is calculating refractive index and chromatic dispersion from absorption spectra, including for optical glass and fibre amplifiers. Source: https://www.rp-photonics.com/kramers_kronig_relations.html
2. **Softened.** Brillouin: "Brillouin scattering limits how much power a fibre can carry, and is used to sense strain along cables" → "Brillouin scattering, which he predicted in 1922, limits the power some fibre signals can carry, and is used to sense strain and temperature along cables." Reason: stimulated Brillouin scattering sets a critical power limit mainly for *narrow-linewidth* signals. Ordinary modulated telecom signals have higher thresholds, and transmitters dither to suppress it. Distributed Brillouin sensors measure temperature as well as strain. Source: https://www.rp-photonics.com/brillouin_scattering.html (cites Brillouin, *Ann. Phys.* 17, 88, 1922).

**Verified, unchanged:** Einstein: stimulated emission 1917, the root of the laser. https://www.aps.org/apsnews/2005/08/einstein-predicts-stimulated-emission

**Kept, doubtful:** Kramers–Kronig is a general optics tool rather than something specific to fibres. The link is fair, but it is the weakest in this item.

### LED lights & screens
**Changes**
1. **Fixed.** Planck: "A photon's energy is h times its frequency, so the size of the band gap sets the colour" → "The colour follows from his constant: a photon's energy is h times its frequency, so a wider band gap gives bluer light." Reason: the photon (light quanta) was Einstein's 1905 idea. Planck quantised only the energy of the emitting oscillators (APS: "Einstein extended Planck's quanta to light itself"). The defensible Planck link is his constant h. Sources: https://www.britannica.com/science/Plancks-constant and https://www.aps.org/apsnews/2005/01/einstein-photoelectric-effect
2. **Fixed.** Brillouin: "Band theory, built on Brillouin zones, explains and engineers that gap" → "Efficient LEDs use 'direct-gap' crystals, whose band edges line up at the same point in the Brillouin zone, so electrons readily release their energy as light." Reason: band theory was built by Bloch, Peierls, Wilson and others (1928–31). Brillouin zones (1930) are its coordinate frame, not its foundation. The new claim names the concrete Brillouin-zone fact that decides whether a crystal can make an efficient LED. Source (Wikipedia fallback, no better open source found that names the Brillouin zone): https://en.wikipedia.org/wiki/Direct_and_indirect_band_gaps
3. **Softened.** Bohr: "Light from electrons dropping between energy levels is his 1913 idea, at work in a crystal" → "His 1913 rule, that an electron dropping between energy levels emits light carrying the energy difference, applies across a band gap too." Reason: in a crystal the electron drops between bands, not discrete atomic levels. What carries over is Bohr's frequency rule. Source: https://www.britannica.com/science/Bohr-model

**Blurb:** verified. The 2014 Nobel popular information says electrons and holes recombine and light is created, with the wavelength set by the semiconductor. https://www.nobelprize.org/prizes/physics/2014/popular-information/

### Solar panel
**Changes**
1. **Reworded.** Einstein: "Light delivering its energy in packets is the idea behind his Nobel-winning photoelectric law" → "Light arrives in energy packets, and only a big enough packet frees an electron: the idea behind his Nobel-winning photoelectric law." Reason: the old text never said how the idea applies to a solar cell. The threshold is the link (photon energy versus band gap). Source: https://www.aps.org/apsnews/2005/01/einstein-photoelectric-effect
2. **Fixed.** Brillouin: "A cell's efficiency hinges on silicon's band gap, described by band theory" → "Silicon's band edges sit at different points of the Brillouin zone, an 'indirect' gap, so it absorbs light weakly and cells must be fairly thick." Reason: the old claim named nothing of Brillouin's (a loose association). The indirect gap is a Brillouin-zone property, and it is why crystalline-silicon wafers are hundreds of micrometres thick. Source: https://en.wikipedia.org/wiki/Direct_and_indirect_band_gaps
3. **Softened.** Planck: "His law describes the Sun's spectrum, which sets how much a solar cell can harvest" → "The classic limit on solar-cell efficiency was calculated by treating the Sun as a glowing 'black body' obeying his radiation law." Reason: the Sun is only approximately a blackbody (it has absorption lines, and the atmosphere filters it). The documented use is the Shockley–Queisser limit, which assumed "the sun and cell being… blackbodies with temperatures of 6000°K and 300°K". Source: https://doi.org/10.1063/1.1736034

### Microwave oven
**Changes**
1. **Softened.** Debye: "Food heats because polar water molecules lag behind the oscillating field, described by his theory of dipoles" → "Food heats mainly because water's electric dipoles lag behind the flipping field and lose energy as heat, a process described by his theory of polar molecules." Reason: ionic conduction also heats salty food. Water's dielectric relaxation is "adequately described by the Debye relation (Debye, 1929)" up to about 60 GHz, and 2.45 GHz is on the low-frequency side of that peak. Source: https://www.intechopen.com/chapters/17013 (§2, citing Kaatze 1989).
2. **Fixed.** Lorentz: "A magnetic field curls those electrons round via the Lorentz force, and that motion generates the microwaves" → "Crossed electric and magnetic fields whirl those electrons round via the Lorentz force, and as they sweep past the magnetron's cavities they set them ringing with microwaves." Reason: a magnetron works with crossed radial electric and axial magnetic fields (both terms of the Lorentz force). The microwaves come from energy the electrons hand to the resonant cavities, not from the curling motion itself. Source: https://www.britannica.com/technology/electron-tube/Common-tubes-and-their-applications

**Verified, unchanged:** Richardson: oven magnetrons emit electrons from a heated cathode (thermionic emission). https://edisontechcenter.org/microwaves/

**Kept, doubtful:** Debye. The Debye *form* fits water's spectrum well, but the molecular picture is debated. Hansen et al. (*PRL* 116, 237601, 2016) link the main dielectric peak to supramolecular hydrogen-bond structure rather than single-molecule rotation (https://arxiv.org/abs/1603.00725). The wording "described by" stays true either way.

### MRI scanner
**Changes**
1. **Fixed (blurb).** "A strong magnet makes hydrogen nuclei in your body broadcast faint radio signals" → "A strong magnet and pulses of radio waves make hydrogen nuclei…". Reason: the magnet alone only polarises the nuclei. An RF pulse is needed to make them emit.
2. **Softened.** Lorentz: "A magnetic field splitting a spin's energy levels is the same physics as the Zeeman effect he explained" → "MRI tunes in to nuclear energy levels split apart by a magnetic field, a nuclear version of the Zeeman effect he explained." Reason: Lorentz's 1896 explanation was classical and concerned electrons in atoms. NMR is the nuclear analogue (Bloch describes it as transitions "from one Zeeman level to another"), not "the same physics". Source: https://www.nobelprize.org/uploads/2018/06/bloch-lecture-1.pdf
3. **Softened.** Langevin: "Contrast agents brighten images through paramagnetism, which his 1905 theory explained" → "Most contrast agents use gadolinium, which is strongly paramagnetic, the kind of magnetism his 1905 theory explained; it makes nearby tissue show up brighter." Reason: this ties the claim to the documented fact that Gd(III) agents dominate clinical use and increase signal. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC6516866/ (§3.2.1).

**Verified, unchanged:** Pauli: Bloch's Nobel lecture says "The correct interpretation of hyperfine structures was first given in 1924 by Pauli, who proposed that atomic nuclei may possess an intrinsic angular momentum (spin)…" (*Naturwiss.* 12, 741, 1924).

**Kept, doubtful:** Langevin. His classical theory explained paramagnetism and its 1/T law. *How* gadolinium brightens images (relaxation enhancement) is described by later theory (Solomon–Bloembergen–Morgan). The link is to the property, not the mechanism.

### PET scanner
**Changes**
1. **Fixed (blurb).** "A small dose of antimatter maps activity inside the body" → "A tracer that gives off positrons, a form of antimatter, maps activity inside the body." Reason: the patient receives a radioactive tracer. The positrons are produced inside the body as it decays.
2. **Reworded.** Curie: "The tracers are radioactive isotopes, from the science of radioactivity she pioneered" → "PET tracers are radioactive; she coined the word 'radioactivity' and showed it is a property of atoms themselves." Reason: this names her concrete contribution. Source: https://history.aip.org/exhibits/curie/resbr1.htm ("she invented the word 'radioactivity'", "an atomic property").

**Verified, unchanged:** Dirac: he postulated the anti-electron in 1931, positrons annihilate with electrons into gamma rays, and positrons from man-made sources are used in PET (https://www.britannica.com/science/positron). "Two back-to-back gamma rays" (two 511 keV photons at about 180°) is standard PET physics. It is not stated on the Britannica page.

### X-ray & CT scan
**Changes**
1. **Fixed.** Compton: "Compton scattering is a main way X-rays interact with soft tissue, shaping both image contrast and dose" → "Compton scattering is the main way medical X-rays interact with soft tissue; the scattered rays fog the picture, which is why grids are used to block them." Reason: in water, Compton scattering dominates above about 30 keV "for the rest of the diagnostic energy range". But bone and soft-tissue contrast comes mainly from photoelectric absorption, and Compton scatter *degrades* contrast (hence anti-scatter grids). Source: https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1564webNew-74666420.pdf (ch. 2, interactions. ch. 6, §6.3, scatter and antiscatter grids).

**Verified, unchanged:** Richardson: an X-ray tube's cathode "is usually a heated filament" (Coolidge tube, 1913). https://www.britannica.com/technology/X-ray-tube

### Ultrasound scan
**Changes**
1. **Fixed.** Langevin: "His vibrating-quartz submarine detectors (1915–18) are ancestors of today's ultrasound probes" → "His quartz submarine detectors (1917–18) were the first piezoelectric ultrasound transducers, ancestors of today's scanning probes." Reason: the work began in 1915 with other transducers. The quartz (piezoelectric) design dates from 1917, and it passed submarine tests in February 1918. Source: https://www.ipem.ac.uk/news/150th-anniversary-of-the-father-of-modern-ultrasound ("in 1917… designed the first piezoelectric ultrasonic transducers using X-cut quartz"). Modern probes use piezoceramics (from about 1950), so "ancestors" is the right word.

### Cancer radiotherapy
**Changes**
1. **Fixed.** Curie: "Radium was among the first cancer treatments, and her Radium Institute in Paris pioneered radiotherapy research" → "Radium was one of the first radiation treatments for cancer, and the Curie Foundation she co-founded in 1920 became a major international force in treating it." Reason: surgery long predates radium, so "first cancer treatments" was wrong. The Radium Institute's medical wing was led by Claudius Regaud, not Curie. AIP documents that Curie and colleagues founded the Curie Foundation in 1920 to fund both wings, and that it "became a major international force in the treatment of cancer". Source: https://history.aip.org/exhibits/curie/radinst1.htm. Radium's main former use was treating cancer (https://www.britannica.com/science/radium).
2. **Fixed.** Compton: "High-energy treatment beams deposit their dose…" → "High-energy X-ray treatment beams…". Reason: electron and proton beams do not deposit dose by Compton scattering. For megavoltage photons, "the Compton interaction dominates" (10 MeV photons in tissue: Compton). Source: https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1196_web.pdf (§1.4.10 and ch. 7).

### Medicines
**Changes**
1. **Softened (blurb).** "Modern drugs are designed…" → "Many modern drugs are designed…". Reason: many drugs are still found by screening.
2. **Softened.** Bragg: "Target proteins are mapped…" → "Many drug targets are mapped atom by atom with X-ray crystallography, which he co-founded." Reason: cryo-EM and NMR also map targets. Source: https://www.wehi.edu.au/news/inaugural-bragg-medal-awarded-professor-peter-colman/ (crystallography of influenza neuraminidase led to Relenza, "one of the first times a medication had been designed directly from a protein structure". The Bragg Medal was presented at the Bragg centenary).
3. **Reworded.** Debye: "X-ray powder diffraction, the Debye–Scherrer method, checks a drug's crystal form" → "…which he pioneered with Paul Scherrer in 1916, fingerprints a drug's crystal form." Source: https://www.britannica.com/biography/Peter-Debye ("In 1916 he showed that solid substances could be used in powdered form for X-ray study"). Polymorph fingerprinting by XRPD is standard (Rigaku technique note: https://rigaku.com/resources/techniques/polymorphs). A. W. Hull developed the method independently in 1917.
4. **Fixed.** Henriot: "Ultracentrifuges, which grew out of his air-driven tops, purify proteins and vaccines" → "Air-driven spinning tops he devised with Huguenard were adapted by Jesse Beams into ultracentrifuges, machines that now purify proteins and viruses." Reason: Svedberg's ultracentrifuge (1924) did not use air tops. Beams adapted the Henriot–Huguenard (1925) tops, and Pickels later commercialised the vacuum-type machine. "Vaccines" became "viruses" to match the source. Source: https://web.phys.virginia.edu/History/Beams/Papers/Beams%201959d.pdf (Beams, *Physics Today* 12, 20, 1959, which cites Henriot & Huguenard, *C. R.* 180, 1389, 1925, and describes purifying viruses).
5. **Softened.** Schrödinger: "Quantum chemistry, solving his equation for molecules, helps predict how drugs bind" → "Quantum chemistry, which solves his equation for molecules, helps chemists model and fine-tune drugs." Reason: binding predictions are mostly made with classical force fields and docking, and quantum methods are used alongside them. Source: https://www.nobelprize.org/prizes/chemistry/2013/popular-information/ (quantum and classical models used to "optimize… drugs").
6. **Reworded.** Born: "Molecular simulations rest on the Born–Oppenheimer approximation" → "Simulations of drug molecules rest on the Born–Oppenheimer approximation, which lets chemists treat heavy nuclei and light electrons separately." Source: https://www.britannica.com/science/Born-Oppenheimer-approximation

### Rechargeable battery
**Changes**
1. **Softened.** De Donder: "A battery's voltage is a direct measure of its reaction's affinity, his central concept" → "A battery's resting voltage is its reaction's affinity, the chemical 'drive' he defined precisely, divided by the electric charge the reaction moves." Reason: E = A/nF holds only at open circuit, since overpotentials change the voltage under load. Source (Wikipedia fallback, for De Donder's A = −ΔrG): https://en.wikipedia.org/wiki/Chemical_affinity. The relation ΔrG = −nFE is standard electrochemistry.
2. **Removed.** Debye: "Debye–Hückel theory describes the ions in electrolytes like those inside batteries." Reason: Debye–Hückel is a limiting law for dilute solutions (roughly 0.01 mol/L and below). Lithium-ion electrolytes are about 1 mol/L of salt in organic carbonates (e.g. "1.0 M LiPF6 in EC/DMC", Sigma-Aldrich catalogue 746711, seen via search because the site blocks scripted access). Beyond the dilute regime, screening behaves *opposite* to the Debye prediction. Source: Smith, Lee & Perkin, *J. Phys. Chem. Lett.* 7, 2157 (2016), https://doi.org/10.1021/acs.jpclett.6b00867 ("beyond the dilute (Debye–Hückel) regime the screening length increases with increasing concentration", including propylene-carbonate solutions).
3. **Removed.** Langmuir: "The reactions happen at electrode surfaces, the science he pioneered." Reason: true but only a field-level association. Battery electrode kinetics and interphase chemistry come from electrochemistry (Tafel, Butler–Volmer, Frumkin, SEI research), not from Langmuir's discoveries, and no source ties his work to batteries. His Nobel was for surface chemistry in general: https://www.nobelprize.org/prizes/chemistry/1932/langmuir/facts/

**Kept, doubtful:** De Donder. The voltage–free-energy relation predates him (Gibbs, Helmholtz). Van 't Hoff and Nernst already used cell voltage as a measure of "affinity". The link credits only his precise definition (A = −∂G/∂ξ), which modern irreversible thermodynamics uses. It is the only remaining link for this item. A stronger replacement would be Schrödinger: DFT computes cathode voltages before synthesis. It was not added because it was outside the brief.

### Air conditioning & heat pumps
**Changes**
1. **Fixed.** Verschaffelt: "Modern CO₂ heat pumps run their cycle above carbon dioxide's critical point (31 °C), the regime he studied" → "CO₂ heat pumps shed their heat above carbon dioxide's critical point (31 °C), where liquid and gas become one, the regime he measured in CO₂ in the 1890s." Reason: the cycle is *transcritical*. Heat is rejected above the critical point (in a "gas cooler"), but evaporation is subcritical. Brunel PhD thesis (Santosa 2015): "rejection of heat above the critical point… critical point of CO2… at 31oC", https://bura.brunel.ac.uk/bitstream/2438/12161/1/FulltextThesis.pdf. Verschaffelt's 1895 Leiden paper measured the capillary rise of liquid CO₂ up to the critical point, which he located at 31.1 °C. Source: https://www2.lorentz.leidenuniv.nl/history/KOL_archive/Communications/13_24/18_Verschaffelt.pdf
2. **Removed.** De Donder: "Engineers find wasted energy by tracking entropy production, the heart of his irreversible thermodynamics." Reason: engineering second-law analysis of heat pumps (exergy and entropy-generation minimisation) comes from Clausius, the Gouy–Stodola lost-work theorem and engineering heat transfer. It does not come from De Donder's chemical-affinity formalism, so the link was a loose association. Source: Bejan, "Entropy generation minimization", *J. Appl. Phys.* 79, 1191 (1996), https://doi.org/10.1063/1.362674. The abstract traces the method through thermal engineering, including refrigerators.

**Kept, doubtful:** Verschaffelt. The link is to the physical regime. His measurements are not used in modern heat-pump design (that relies on modern equations of state). The wording claims only that he measured CO₂ in that regime.

### Airliners & spacecraft
**Changes**
1. **Softened.** Knudsen: "Re-entry through the thin upper atmosphere is modelled with his physics of rarefied gases" → "The high, thin-air stretch of a capsule's re-entry is rarefied-gas flow, classed by the 'Knudsen number' named for his pioneering work." Reason: only the high-altitude part of re-entry is rarefied. Lower down it is continuum flow. Modern modelling uses DSMC, with regimes set by Knudsen number. Source: https://ntrs.nasa.gov/citations/20060020180 (NASA: Apollo capsule in the "hypersonic low density transitional flow regime", parametrised by free-stream Knudsen number).

**Verified, unchanged:** Piccard: a "spherical pressurized aluminum gondola", 27 May 1931. https://www.lindahall.org/about/news/scientist-of-the-day/auguste-piccard/

**Kept, doubtful:** Piccard. As the people.js check found, his gondola was a precedent, not a documented ancestor of airliner cabins, and other pressurised-cabin experiments ran at the same time. The wording ("one of the first") claims no lineage.

### Nuclear power
**Changes**
1. **Reworded.** Einstein: "The energy released follows E = mc²" → "The energy released matches the tiny mass lost as a uranium nucleus splits, by E = mc²." Source: https://www.aps.org/apsnews/2007/12/december-1938-discovery-nuclear-fission (Meitner: fragments lighter by about 1/5 of a proton mass, which by E = mc² gives about 200 MeV).

**Verified, unchanged:**
- Curie named radioactivity: https://history.aip.org/exhibits/curie/resbr1.htm
- Bohr & Wheeler, "The Mechanism of Nuclear Fission", *Phys. Rev.* 56, 426 (1939), using the liquid-drop model: https://journals.aps.org/pr/abstract/10.1103/PhysRev.56.426
- Compton directed the Metallurgical Laboratory (1942–45), "which developed the first self-sustaining atomic chain reaction": https://www.britannica.com/biography/Arthur-Holly-Compton

The Compton link is organisational (Fermi led the CP-1 build), and the wording reflects that.

### Electron microscope
**No changes.**

**Verified:**
- De Broglie: Ruska's Nobel lecture recounts using "the de Broglie equation" to see that electron wavelengths are about five orders of magnitude below light's. https://www.nobelprize.org/uploads/2018/06/ruska-lecture.pdf
- Richardson: thermionic tungsten and LaB₆ guns are common, and field-emission guns are used for the highest resolution. https://www.doitpoms.ac.uk/tlplib/tem/illumination.php
- Lorentz: "an electron entering the lens experiences a Lorentz force". https://www.doitpoms.ac.uk/tlplib/tem/HTML5/EMlenses.html

### Links considered for Guye, Herzen, Ehrenfest and Wilson
None added. The best candidate was Guye's electron-mass measurements and the relativistic electrons in medical linacs. But those measurements *confirmed* relativity rather than underlying the technology, so the attribution would not be fair. Nothing documented ties Herzen, Ehrenfest or Wilson to a current everyday technology.

### Still worth a human look (everyday.js)
1. **GPS "kilometres daily"**: decide whether to keep the popular framing or switch to the stricter "38 µs is as long as light takes to travel about 11 km".
2. **Battery**: De Donder is now the only link and it is flagged as weak. Consider whether the item belongs in the strip, or whether a stronger link (e.g. Schrödinger via DFT battery-materials screening) should be added after its own check.
3. **Wikipedia fallbacks** (3 links: LED/Brillouin, solar/Brillouin, battery/De Donder): replace them if a textbook or review page that names the Brillouin zone, or De Donder's affinity in an electrochemical context, turns up.
