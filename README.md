# rafaelgorski.com

A map of launching and scaling AI systems, from Frame to Govern, with original notes and curated
sources pinned to the stage where each matters. The site is static HTML served by GitHub Pages.
A zero-dependency Node script generates the map and the library from JSON.

## Layout

```
content/                       curated data (owned by curation; do not edit from design work)
  stages.json                  the six stages and their questions
  library.json                 curated sources
site-data/                     site copy
  plate.json                   map title, caption, per-stage tests, short titles
  notes.json                   notes registry: id, stage, title, status
scripts/
  build.mjs                    renders site/index.html and site/library/index.html
  check-links.mjs              fails if any internal link or #fragment does not resolve
site/                          published root
  index.html                   the map (generated)
  library/index.html           the library (generated)
  notes/<slug>/index.html      one folder per note (hand-written)
  about/index.html             about page (bio is a placeholder)
  assets/site.css              the whole design system
  assets/fonts/                self-hosted Jost (OFL)
  404.html
.github/workflows/pages.yml    builds, checks links and deploys site/ on every push to main
PRODUCT.md / DESIGN.md         product and design records
```

All internal links are relative, so the site works both at
`https://rafaelgorski.github.io/rafaelgorski.com/` and at the root of a custom domain.

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
