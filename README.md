# rafaelgorski.com

A map of launching and scaling AI systems, from Purpose to Govern, with original notes and curated
sources pinned to the stage where each matters, and a radar that places techniques, platforms,
measures and governance practices from Adopt to Hold. The site is static HTML served by GitHub
Pages. A zero-dependency Node script generates the map, the radar and the library from JSON.

## Layout

```
content/                       curated data (owned by curation; do not edit from design work)
  stages.json                  the six stages and their questions
  library.json                 curated sources
  radar.json                   radar edition: quadrants, rings and blips
site-data/                     site copy
  plate.json                   map title, caption, per-stage tests, short titles
  notes.json                   notes registry: id, stage, title, status
scripts/
  build.mjs                    renders site/index.html, site/radar/index.html, site/library/index.html
  check-links.mjs              fails if any internal link or #fragment does not resolve
site/                          published root
  index.html                   the map (generated)
  radar/index.html             the radar (generated)
  library/index.html           the library (generated)
  notes/<slug>/index.html      one folder per note (hand-written)
  about/index.html             about page (bio is a placeholder)
  assets/site.css              the whole design system
  assets/radar.js              radar hover and focus linking (progressive enhancement only)
  assets/fonts/                self-hosted Jost (OFL)
  404.html
.github/workflows/pages.yml    builds, checks links and deploys site/ on every push to main
PRODUCT.md / DESIGN.md         product and design records
```

This repository is the GitHub Pages user site, published at <https://rafaelgorski.github.io/>.
Internal links are relative, so the site also works at the root of a custom domain or under a
subpath.

## Build and preview locally

Node 18 or later, with no packages to install:

```
node scripts/build.mjs
node scripts/check-links.mjs
python -m http.server 8000 --directory site
```

Then open <http://localhost:8000>. The generated pages are committed, so the site also previews
without running the build.

## Publish

1. In **Settings → Pages**, set **Source** to **GitHub Actions** (one time).
2. Push to `main`. The workflow runs the build and the link check, then uploads `site/` and
   deploys it.

## Moving the domain

When ready to serve from `rafaelgorski.com`:

1. Add a file `site/CNAME` containing `rafaelgorski.com`.
2. In **Settings → Pages → Custom domain**, enter `rafaelgorski.com` and enable **Enforce HTTPS**.
3. At the DNS provider, point the apex `A` records to GitHub Pages
   (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and `www` as a
   `CNAME` to `rafaelgorski.github.io`.

## Adding a note

1. Copy `site/notes/agentic-observability/` to a new folder.
2. Give the note the next ID (`GN-0002`), and set its stage in the locator band (the
   `aria-current="location"` segment) and in the "Charted at" aside.
3. Add it to `site-data/notes.json` with the same stage, then run `node scripts/build.mjs`. The
   note appears as a vermilion block on the map and in that stage's library section.

## Editing the radar

The radar at `/radar/` is generated from `content/radar.json`. Each edition is one file:

```json
{
  "edition": "2026-10",
  "status": "draft",
  "quadrants": [{ "id": "techniques", "name": "Techniques", "scope": "Methods and practices" }, "…"],
  "rings": [{ "id": "adopt", "name": "Adopt", "meaning": "…" }, "…"],
  "blips": [
    {
      "id": "kebab-id",
      "name": "Short name",
      "quadrant": "techniques",
      "ring": "adopt",
      "stages": ["operate"],
      "summary": "At most 30 words.",
      "evidence": ["library-entry-id"],
      "movement": "new"
    }
  ]
}
```

- Quadrants are `techniques`, `platforms`, `measures` and `governance`, and rings are `adopt`,
  `trial`, `assess` and `hold`, in that order. Names, scopes and ring meanings can change; ids and
  order cannot.
- `stages` holds one or two ids from `content/stages.json`, and `evidence` holds one to four ids
  from `content/library.json`.
- `movement` is `new`, `moved-in` (toward Adopt), `moved-out` (toward Hold) or `unchanged`, and
  is drawn as a mark around the blip. For a new edition, change `edition`, move blips between
  rings and set their movement.
- Blips are numbered in list order: quadrant, then ring, then their order in the file. Their
  positions on the disc are computed by the build and are stable for the same data.

`node scripts/build.mjs` stops with an error if an id is unknown, a reference does not resolve, a
summary runs over 30 words, or a ring of one quadrant is too full to draw without overlap. It
warns, without stopping, when an edition falls outside 24–40 blips, has fewer than five in a
quadrant or fewer than three in Hold. Set `RADAR_FILE=path/to/radar.json` to preview another file
without touching `content/`.

Every library entry cited by a blip shows "On the radar", each library stage section lists the
blips charted at that stage, and each map column ends with their numbered discs. Blips link back
to their evidence in the library and to their stages on the map.
