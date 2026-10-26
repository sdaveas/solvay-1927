# Solvay 1927: build plan

An interactive version of the 1927 Solvay Conference photo. Hover over a face for a summary, click for the full narrated story, and explore the connections, the timeline and guided tours.

## Principles

- Static site with no build step: vanilla ES modules, served by `python3 -m http.server`. D3 (loaded from a CDN) is the only dependency, used only by the network view.
- Accuracy first. Every relationship and event has a source a reader can check. Narration states no fact that isn't verified.
- Each agent owns its own files, so the agents can't overwrite each other's work. Only the coordinator edits the shared files.

## Status (2026-10-25)

Phases 0–2 are done. All five agents delivered, and every feature passed a browser test with no console errors.
- Fact-check fixes were carried into `data/tours.js`. Unverified edges were dropped (82 relations remain).
- Still needs a human: Herzen's biography (mostly uncited), the exact wording of Ehrenfest's "ashamed" remark (Heisenberg, *Physics and Beyond*), and Planck's placement as a skeptic in `data/stances.js`.
- Phase 3 (in progress):
  - Done: a self-hosted 2000 px photo (`assets/`), a phone layout (scrolling photo, ~35 px tap targets, no tooltips on touch), a reduced-motion pass, a clean axe audit, meta tags and README deploy notes.
  - Added at the user's request: an animated diagram per person (`DIAGRAMS.md`). All 29 are done. Each passes `tools/diagram-smoke.mjs` at 600 and 320 px, was reviewed in the browser, and has a clean axe audit.
  - Extra diagrams: 20 more for the 15 people with several major contributions (Einstein 4 total, Lorentz/Debye/Langevin 3 each), shown as tabs (`data/diagrams.js`). That's 49 diagrams in all, each passing the smoke test at 600 and 320 px and reviewed in the browser.
  - Network view: label-aware collisions, soft walls, a layout settled before display and faint edges; zero overlaps measured at 433 px and 1280 px. In Connections mode the tooltip docks in a faceless top corner of the photo.
  - Pocket tour: a strip of 17 modern items that light up the people behind them (`data/everyday.js`). Its fact-check is in progress.
  - Remaining: choose a host, settle the photo rights, and do the three human checks above.

## Done (Phase 0, coordinator)

- `data/people.js`: all 29 attendees, with face boxes from the Commons image notes, dates checked against Wikidata, and original narration (story, contributions, awards, legacy).
- Core page: `index.html`, `style.css`, `js/app.js`. Face hotspots, a tooltip that follows the pointer, a detail dialog with prev/next and arrow keys, and per-paragraph narration through the browser's built-in speech.
- Contracts: seed data files with schemas, stub modules, `js/main.js` entry point, and the `tools/check.mjs` validator.

## Core API (`js/app.js`)

| Export | Use |
|---|---|
| `people`, `byId`, `IMG`, `W`, `H` | Data and the photo's pixel size (face boxes are in 3000×2171 pixel units) |
| `ageAt(born, on?)` | Age on a given date (defaults to the conference date) |
| `cropStyle(box)` | CSS that shows just one face, for portraits and graph nodes |
| `faceCenter(id)` | Face centre in % of the photo, for drawing overlays |
| `stage` | Photo container (`position: relative`). Overlays go here with `pointer-events: none` |
| `highlight(ids)` / `pin(ids)` | Dim everyone except `ids`. `pin` keeps that state after hover ends (tours, graph). `pin(null)` clears it |
| `setLens(fn)` | `fn(person) → {color?, label?}` tints faces and adds labels. `setLens(null)` clears |
| `addTool(label, onToggle, group?)` | Toolbar toggle. Tools in the same `group` are exclusive (use `"lens"` for anything that calls `setLens`) |
| `setClickHandler(fn)` | Replaces "click opens detail" while set (quiz). `null` restores it |
| `openDetail(id)` | Opens the dialog. Then fires `person:open` on `document`, and modules can append to `#d-extra` |

Modules add their own containers with `document.querySelector("main").append(...)` and put their styles in their own `css/*.css`.

## Phase 1: five agents, in parallel

| Agent | Model | Owns | Deliverable |
|---|---|---|---|
| **A · Relations research** | Opus | `data/relations.js` | 80–150 sourced edges among the 29 |
| **B · Connections UI** | Sonnet | `js/graph.js`, `css/graph.css` | Arcs drawn on the photo, a network view, and a connections list in the dialog |
| **C · Timeline & lenses** | Sonnet | `js/timeline.js`, `js/lenses.js`, `css/timeline.css`, `data/events.js` | Year slider 1895–1965, plus age, Nobel and quantum-camp lenses |
| **D · Tours & quiz** | Sonnet | `js/tours.js`, `js/quiz.js`, `css/tours.css`, `data/tours.js` | 4 narrated tours and a "Who's who?" game |
| **E · Fact-check** | Opus | `data/people.js` (text fields only), `FACTCHECK.md` | Every claim verified, fixed or softened, and logged |

Why these models: Opus for the work where accuracy and judgement matter (research, fact-checking). Sonnet for UI work with a clear spec.

### A · Relations research
- Edge types: mentor, influence (directed a→b), collab, ally, debate, friend, family. Schema is in `data/relations.js`.
- Priorities: supervisor/student chains (Born→Heisenberg/Pauli, Bohr→Kramers/Heisenberg, Fowler→Dirac…), key influences (Planck→Einstein, Einstein→de Broglie, de Broglie→Schrödinger, Kramers→Heisenberg), documented debates (Bohr–Einstein, Pauli vs de Broglie at this conference, Schrödinger vs Heisenberg/Bohr in 1926), friendships (Einstein–Ehrenfest, Einstein–Lorentz, Curie–Langevin), and collaborations.
- Every edge: a one-sentence summary, years, and a source URL (prefer MacTutor, nobelprize.org, AIP, the Stanford Encyclopedia of Philosophy or published letters; Wikipedia only as a fallback). If unsure, leave it out.

### B · Connections UI
- "Connections" tool: hovering a face draws curved SVG arcs on the photo to every connected face, colored by type, with arrowheads for directed types. Includes a legend and type filter chips.
- Network view below the photo: a D3 force layout (`https://cdn.jsdelivr.net/npm/d3@7/+esm`) with face crops as nodes. Hovering an edge shows its summary and source; clicking a node calls `openDetail`.
- On `person:open`, append a "Connections" section to `#d-extra`: type, the other person (clickable), the summary and the source link.
- Must work with the 3 seed edges and scale to about 150.

### C · Timeline & lenses
- Lenses (group `"lens"`), each with a small legend:
  - **Age in 1927**: sequential color, with the age as the label.
  - **Nobel**: laureates in gold with their prize year(s), everyone else neutral.
  - **Quantum camps**: Copenhagen vs skeptics vs not publicly involved. Only assign people whose stance is clearly documented, and source each assignment.
- Timeline (group `"lens"`): a slider from 1895 to 1965 with a play button.
  - A face stays dim until that person's first key discovery (add one `discovery` event per person, with a source).
  - A Nobel label appears from the year of the prize.
  - After death the face turns gray with a † label.
  - An event ticker shows the selected year and highlights the people involved. Add `world` events too (WWI, the 1933 exodus, WWII, Hiroshima…).

### D · Tours & quiz
- Tours tool with a menu of 4 tours of 5–9 steps, about 60–90 words per step:
  - *The Bohr–Einstein duel*
  - *Quantum mechanics in three years (1925–27)*
  - *The forgotten fifteen*
  - *From this room to your pocket*
- Narration must be original and consistent with `people.js`, adding no unsourced facts.
- Player: a caption panel under the photo, `pin(ids)` for each step, prev/next, narration on/off, and Esc to exit. Exiting restores the page's state.
- Quiz: "Find Werner Heisenberg" style prompts using `setClickHandler`. Show right/wrong feedback (say who was actually clicked), 10 rounds, a score and a restart button. Exiting restores everything.

### E · Fact-check
- Verify every dated or numeric claim, every award and year, every quote and every anecdote in `people.js`. Fix clear errors in place without changing the voice. Mark disputed claims ("reportedly"). Remove anything that can't be verified.
- Known soft spots to check first:
  - medal names and years (Hughes, Copley, Royal, Planck, Lorentz)
  - Verschaffelt's research focus and Herzen's biography
  - Langmuir as "first industrial chemist" to win a Nobel
  - Curie's "around a million soldiers"
  - Ehrenfest's "ashamed" remark and Bohr's "stop telling God" reply
  - Fowler naming the "zeroth law"
- Never change `id`, `box`, `born` or `died`. Log every change, and every doubtful claim kept, in `FACTCHECK.md` with its source.

### Rules for every agent
- Edit only the files you own. Need a change in the core? Report it rather than making it.
- Don't use the browser pane; the coordinator does the visual testing. Verify with `node tools/check.mjs` and `node --check <file>`.
- Finish with a short report: what was built, anything unverified, and any core changes needed.

## Phase 2: integration (coordinator)
- Review each agent's diff and run the validator.
- Test every feature in the browser: hover, click, each tool, tool exclusivity, quiz click capture, tours restoring state.
- Reconcile tour text with fact-check fixes, and apply any core changes the agents asked for.

## Phase 3: polish and ship
- Mobile layout (tap to open, no hover), a keyboard and screen-reader pass, and a reduced-motion check.
- Serve a smaller image (2.6 MB → about 2000 px WebP) from our own host.
- Pick a deploy target.

## Open decisions
1. **Photo rights.** Commons has a deletion request (August 2026) arguing the photo is still under copyright in Belgium and France. It is public domain in the US (published in 1927). That's fine for a private build. Before a public launch, choose between US hosting with a public-domain claim, licensing (Solvay Institutes or the ETH Library archive), or accepting the risk. Hotlinking also breaks if the file is deleted, so keeping a local copy (2.6 MB) is recommended.
2. **Folder and git.** This workspace is deleted along with the session. Move it to a real folder and run `git init` so each agent's work can be reviewed and reverted.
3. **Deploy target** (GitHub Pages, Vibebox, …). Decide in Phase 3.

## Out of scope for now
"Chat with Einstein" persona (it would invent facts), interactive equation demos, translations.
