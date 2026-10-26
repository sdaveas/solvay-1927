# Solvay 1927

Live: https://sdaveas.github.io/solvay-1927/ · Repo: https://github.com/sdaveas/solvay-1927

An interactive site about the photograph of the Fifth Solvay Conference (Brussels, October 1927). It includes:
- the 29 attendees, each with a narrated story and an animated diagram of their key work
- the connections between them
- a timeline and color views (age, Nobel, quantum camps)
- guided tours and a "Who's who?" quiz

It is a static site with no build step and vanilla ES modules. D3 is the only dependency, loaded from a CDN only for the network view.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765. A local server is required because the browser won't load ES modules from `file://`.

## Checks

```bash
node tools/check.mjs            # data: people, relations, events, tours
node tools/timeline-check.mjs   # timeline state logic
node tools/diagram-smoke.mjs    # every diagram mounts, animates and survives its controls
```

## Layout

| Path | What |
|---|---|
| `index.html`, `style.css`, `js/app.js` | Core: photo, hotspots, tooltip, detail dialog, narration, and the API modules use |
| `js/graph.js`, `js/timeline.js`, `js/lenses.js`, `js/tours.js`, `js/quiz.js` | Feature modules (see the Core API section of `PLAN.md`) |
| `js/diagrams.js`, `js/diagrams/*.js` | One animated diagram per person (contract in `DIAGRAMS.md`) |
| `data/*.js` | People, relations, events, stances, tours. Every relation and event has a source |
| `FACTCHECK.md` | Log of the fact-check of the narration |

## Deploy

Deployed to GitHub Pages: https://sdaveas.github.io/solvay-1927/ (from `main`, branch root, no build step). Pushing to `main` redeploys.

Or upload the folder to any static host:
- **GitHub Pages:** push to a repo, then Settings → Pages → deploy from the branch root.
- **Netlify / Cloudflare Pages:** drag and drop the folder, or connect the repo. No build command; the output directory is the root.

Before going live:
1. ~~Make `og:image` in `index.html` an absolute URL.~~ Done.
2. Optionally leave out the dev-only files: `tools/`, `PLAN.md`, `DIAGRAMS.md`, `FACTCHECK.md`, `.claude/`.
3. Settle the photo rights (below).

## Photo rights

The photograph is by Benjamin Couprie (1927). It is public domain in the US, since it was published before 1931. However, since August 2026 a Wikimedia Commons deletion request has argued it is still under copyright in Belgium and France, where protection lasts 70 years after the photographer's death. `assets/solvay-1927.jpg` is a 2000 px copy of the Commons file. Before a public launch, either:
- host in the US and rely on its US public-domain status,
- get a licence from the International Solvay Institutes or the ETH Library archive, or
- accept the risk knowingly.
