# rafaelgorski.com

Rafael Gorski's personal site. The home page is his own take on building agents and AI systems,
with dated lab notes. Behind it sits a field guide: a map of launching and scaling AI systems, from
Purpose to Govern, with original notes and curated sources pinned to the stage where each matters,
and a radar that places techniques, platforms, measures and governance practices from Adopt to
Hold. The site is static HTML served by GitHub Pages. A zero-dependency Node script generates the
home page, the map, the radar and the library from JSON.

## Layout

```
content/                       curated data (owned by curation; do not edit from design work)
  stages.json                  the six stages and their questions
  library.json                 curated sources
  radar.json                   radar edition: quadrants, rings and blips
site-data/                     site copy
  home.json                    home page: thesis, lede, who, positions, work, conversations
  takes.json                   home page lab notes (Testing now, Using more effectively, Watch out for)
  plate.json                   map title, caption, per-stage tests, short titles
  notes.json                   notes registry: id, stage, title, status
  art.json                     seeds and settings for the mountain art
scripts/
  build.mjs                    renders site/index.html, site/map/, site/radar/ and site/library/
  art.mjs                      draws the mountain art (Contour Lineage) as SVG; build.mjs runs it
  check-links.mjs              fails if any internal link or #fragment does not resolve
art/                           design tools for the mountain art (not published)
  philosophy.md                the algorithmic philosophy and its hidden parameters
  viewer.html                  p5.js seed explorer (open it in a browser)
site/                          published root
  index.html                   the home page (generated)
  map/index.html               the map (generated)
  radar/index.html             the radar (generated)
  library/index.html           the library (generated)
  notes/<slug>/index.html      one folder per note (hand-written)
  about/index.html             about this site: method and colophon (hand-written)
  assets/site.css              the whole design system
  assets/radar.js              radar hover and focus linking (progressive enhancement only)
  assets/art/                  the mountain art, one SVG per area and stage (generated)
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

The build also stamps every link to `assets/site.css`, `assets/radar.js` and the art in
`assets/art/` with a short content hash (`site.css?v=1a2b3c4d`), in generated and hand-written
pages alike. Browsers holding an old copy fetch the new file as soon as it changes. Run the build
after editing any of them, even when no content changed.

## Mountain art

Górski means "of the mountains", so each part of the site carries its own generative summit:
contour lines seen from above behind the page heads, an apron of slopes around the radar disc, and
one ridge seen from the side that the six stages climb in order, above the map's stage columns and
the library's stage index. `scripts/art.mjs` draws them
as static SVG into `site/assets/art/` (one file per area: `home`, `map`, `radar`, `library`,
`notes`, `about`, `404`, and `stage-<id>` for each stage). The build runs it first, so CI always
redraws them; it is deterministic, so the same seed gives the same file. Run it alone with
`node scripts/art.mjs` to print each file's size.

To change the art:

1. Open `art/viewer.html` in a browser. **Site areas** loads each area's current seed and settings;
   step through seeds, adjust parameters, and download a PNG or SVG if you want to compare.
2. Put the seed you like in `site-data/art.json`: `areas.<area>.seed` for a page, `ascent.seed`
   for the six stages together, or `ascent.stageSeeds.<stage-id>` for one stage. Parameters you
   changed in the viewer go under the area's `"params"`; `summit` is `[across, down]` as shares of
   the sheet.
3. Run `node scripts/build.mjs` and `node scripts/check-links.mjs`.

Where the art appears and the rules it keeps (never behind data, never darker than ultramarine
pale, still, hidden in print) are in `DESIGN.md` under Mountain art. The algorithm's philosophy and
its hidden parameters are in `art/philosophy.md`. A new note can reuse `assets/art/notes.svg`, or
add its own entry to `site-data/art.json` and point its head image at that file.

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

## Editing the home page

The home page at `/` is generated from two files in `site-data/`. Run `node scripts/build.mjs`
after editing either, then `node scripts/check-links.mjs`.

### Lab notes: `site-data/takes.json`

```json
{
  "groups": [
    { "id": "testing", "name": "Testing now", "caption": "Trying it, not settled on it." },
    { "id": "using", "name": "Using more effectively", "caption": "…" },
    { "id": "watch", "name": "Watch out for", "caption": "…" }
  ],
  "entries": [
    {
      "id": "kebab-id",
      "group": "testing",
      "title": "Short title",
      "body": "At most 50 words, first person.",
      "date": "2026-10-13",
      "links": [
        { "radar": "otel-genai-conventions" },
        { "library": "otel-genai-semconv" },
        { "note": "GN-0001" },
        { "stage": "operate" },
        { "href": "https://github.com/RafaelGorski/Problem-Based-SRS", "label": "Problem-Based SRS on GitHub" }
      ],
      "confirmed": false
    }
  ]
}
```

- To add a note, add an entry. Within a group, entries are shown newest first by `date`
  (`YYYY-MM-DD` or `YYYY-MM`), then in file order.
- `group` is `testing`, `using` or `watch`. The group ids and their order are fixed; names and
  captions can change.
- Each link is exactly one of: `radar` (a blip id from `content/radar.json`), `library` (an entry id
  from `content/library.json`), `note` (an id from `site-data/notes.json`), `stage` (a stage id) or
  `href` (an absolute URL, with a `label`). Internal links get the reference's own mark: a numbered
  disc, a unit glyph, a note square or a stage chip.
- An entry shows "Draft" after its date until `confirmed` is `true`. Set it when you have read the
  entry and stand behind it.
- Bodies may carry `[text](url)` links.

The build stops if an id is unknown or duplicated, a group or date is malformed, a link does not
resolve, or a body runs over 50 words.

### Take, work and contact: `site-data/home.json`

- `thesis` is the page's h1. Each sentence goes on its own line.
- `lede`, `who` (the label and text rows beside the lede) and `own` (the "views are my own" line).
- `take.positions`: each has an `id`, a `title`, a `body` (aim for 80 words or fewer), an optional
  `say` (a short remark in the margin, set in vermilion) and `links` in the same form as lab notes.
- `work.items`: Problem-Based SRS (with its trace `chain`) and the field guide (`"guide": true`
  draws the stage band and the counts).
- `conversations.body`: the one sentence about getting in touch. Keep it to an invitation to talk;
  the site does not list services, prices or availability.

Any text in `home.json` may carry `[text](url)` links. Internal links are relative to the site root
(`map/`, `radar/`, `library/`).

## Adding a note

1. Copy `site/notes/agentic-observability/` to a new folder.
2. Give the note the next ID (`GN-0002`), and set its stage in the locator band (the
   `aria-current="location"` segment) and in the "Charted at" aside.
3. Add it to `site-data/notes.json` with the same stage, then run `node scripts/build.mjs`. The
   note appears as a vermilion block on the map, in that stage's library section and beside the
   field guide on the home page. Lab notes in `site-data/takes.json` can link to it as
   `{ "note": "GN-0002" }`.
4. Link to the map as `../../map/` from a note, never `../../`: the home page is not the map. The
   link check fails on a link whose text names the map but lands on the home page.

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
to their evidence in the library and to their stages on the map (`map/#stage-<id>`).

## The map's address

The map moved from `/` to `/map/` when the home page arrived. Old links to `/#stage-<id>` are
forwarded to `map/#stage-<id>` by one inline line of script on the home page; everything else on
the home page reads without JavaScript.
