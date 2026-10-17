# rafaelgorski.com

Rafael Gorski's personal site, told as one climb: launching and scaling an AI system is a climb.
The home page is his own take, from the summit view down the route: six camps from Purpose to
Govern, the valleys where climbs stall, a gear check, an excerpt of his trail log and the guide.
Behind it sit the reference pages: the route (`/map/`), with original notes and curated sources
pinned to the stage where each matters; the radar, the gear check that places techniques,
platforms, measures and governance practices from Adopt to Hold; and the field guide
(`/library/`). The trail log (`/log/`) keeps his dated notes, and search (`/search/`) is the index
at the back. The site is static HTML served by GitHub Pages. A zero-dependency Node script
generates the home page, the route, the radar, the field guide, the trail log and search from JSON.

## Layout

```
content/                       curated data (owned by curation; do not edit from design work)
  stages.json                  the six stages and their questions
  library.json                 curated sources
  radar.json                   radar edition: quadrants, rings and blips
site-data/                     site copy
  home.json                    home page: thesis, lede, who, positions, work, conversations
  story.json                   the story: menu labels, the home page's section headings, intros and
                               camp remarks, the radar's ring framing, page titles and intros
  takes.json                   lab notes (Testing now, Using more effectively, Watch out for), shown
                               in the trail log and drawn on by the home page
  plate.json                   route title, caption, per-stage tests, short titles
  notes.json                   notes registry: id, stage, title, status
  search.json                  search themes: each a name and the family of words it finds
  art.json                     seeds and settings for the mountain art
scripts/
  build.mjs                    renders site/index.html, site/map/, site/radar/, site/library/, site/log/
                               and site/search/ (page and index.json)
  art.mjs                      draws the mountain art (Contour Lineage) as SVG; build.mjs runs it
  check-links.mjs              fails if any internal link or #fragment does not resolve
art/                           design tools for the mountain art (not published)
  philosophy.md                the algorithmic philosophy and its hidden parameters
  viewer.html                  p5.js seed explorer (open it in a browser)
site/                          published root
  index.html                   the home page (generated)
  map/index.html               the route (generated; menu label "Route")
  radar/index.html             the radar, the gear check (generated)
  library/index.html           the field guide (generated; menu label "Field guide")
  log/index.html               the trail log (generated)
  search/index.html            search, the atlas index (generated, with search/index.json)
  notes/<slug>/index.html      one folder per note (hand-written)
  about/index.html             about this site: method and colophon (hand-written)
  assets/site.css              the whole design system
  assets/radar.js              radar hover and focus linking (progressive enhancement only)
  assets/climb.js              the home page's route where scroll-driven CSS is unsupported (progressive enhancement only)
  assets/search.js             search in the page (progressive enhancement; the theme index works without it)
  assets/art/                  the mountain art, one SVG per area and stage (generated)
  assets/fonts/                self-hosted fonts (OFL): Barlow Condensed Light for titles, Jost for lettering
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

The build also stamps every link to `assets/site.css`, `assets/radar.js`, `assets/climb.js`, the art in
`assets/art/` and the two fonts in `assets/fonts/` with a short content hash
(`site.css?v=1a2b3c4d`), in generated and hand-written pages alike. It writes the fonts' hashes into
the `@font-face` URLs in `site.css` too, so a font's preload and its request stay one fetch.
Browsers holding an old copy fetch the new file as soon as it changes. Run the build after editing
any of them, even when no content changed.

## Titles

Titles are lettered into each page's drawing rather than set as a bold title over a subtitle (see
"Titles: map lettering" in `DESIGN.md`). The map's title is spaced to the exact width of its ridge
from the title face's advance widths (`ADVANCE` in `scripts/build.mjs`); a title of 36 characters or
more is set plain instead. If the title face is ever replaced, regenerate that table from the new
font. The 404 page links the title font from the domain root, like its other assets.

## Mountain art

Górski means "of the mountains", so each part of the site carries its own generative summit:
contour lines seen from above behind the page heads, an apron of slopes around the radar disc, and
one ridge seen from the side that the six stages climb in order, above the route's stage columns
and the field guide's stage index. On the home page the same ridge is one panorama that the route
climbs. `scripts/art.mjs` draws them
as static SVG into `site/assets/art/` (one file per area: `home`, `map`, `radar`, `library`,
`notes`, `about`, `404`, `stage-<id>` for each stage, and `climb-far`, `climb-mid` and
`climb-near` for the home page's panorama). It also computes the route up the panorama and where
its camps stand; the build draws those inline. The build runs it first, so CI always
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
pale, still except the home page's climb, hidden in print) are in `DESIGN.md` under Mountain art. The algorithm's philosophy and
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

## The story

The site is one expedition. The six stages are camps on the route, the valleys are the failure
modes (each "Watch out for" lab note with the Hold blip it links to), the radar is the gear check,
the library is the field guide, the lab notes and long notes are the trail log, and the author is
the guide. The menu reads Route, Radar, Field guide, Trail log, About; the addresses (`map/`,
`radar/`, `library/`, `log/`, `about/`) are stable.

The story's own copy is in `site-data/story.json`: the menu labels, the home page's section
headings and intros, one remark per camp (`home.route.camps.<stage-id>`), the radar's ring framing
(`rings`), and the radar, field guide and trail log titles and intros. `{blips}`, `{sources}`,
`{entries}` and `{notes}` are filled in by the build. The route page's title and caption are in
`site-data/plate.json`.

### The route on the home page

The route's panorama is the ground of the home page's title: the thesis's leader runs to its
summit. As the reader scrolls down from the title, the route draws itself up the ridge, each camp
fills as the route reaches it, the trail blaze climbs to the summit and the nearer ridges settle a
little; it is done by the time the panorama reaches the top of the screen. It is CSS (scroll-driven
animation on one view timeline) where the browser supports it, and `assets/climb.js` elsewhere.

The six camps are points on the panorama. Pointing at one (or moving along the drawing, which snaps
to the nearest), focusing it with the keyboard or tapping it walks the blaze along the route to that
camp, draws the route up to it and opens its callout: the question, the camp's remark from
`site-data/story.json` and links to its stretch of the route and its field-guide sources. Leaving
returns the climb to where the scroll puts it. The camps are a real ordered list (`#camps`) that
`climb.js` moves onto the panorama; without JavaScript, and on phones, it stays a compact list under
the title. With reduced motion the blaze jumps and the route stays drawn. The route's line and camp positions come from `scripts/art.mjs` (`climb` in
`site-data/art.json`).

## Editing the home page and the trail log

The home page at `/` is generated from `site-data/home.json`, `site-data/story.json` and
`site-data/takes.json`; the trail log at `/log/` from `site-data/takes.json` and
`site-data/notes.json`. Run `node scripts/build.mjs` after editing any of them, then
`node scripts/check-links.mjs`.

Search at `/search/` is rebuilt from everything above. Its themes live in `site-data/search.json`:
each has an `id`, a `name`, `also` (other words that name it) and `terms` (lowercase; four letters
or more match word starts, shorter ones whole words). The build warns if a theme files nothing.
A new hand-written page needs `<li class="aux"><a href="…/search/">Search</a></li>` last in its nav.

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

- To add a note, add an entry. It appears in the trail log; the newest Testing now and Using more
  effectively entries also appear on the home page, and every Watch out for entry that links to a
  Hold blip becomes one of the home page's valleys. Within a group, entries are shown newest first by `date`
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
- `lede` (the guide framing under the thesis), `who` (the label and text rows in The guide) and
  `own` (the "views are my own" line).
- `take.positions`: each has an `id`, a `title`, a `body` (aim for 80 words or fewer), an optional
  `say` (a short remark in the margin, set in vermilion) and `links` in the same form as lab notes.
- `take.heading` is "How I lead a climb"; `take.positions` are his principles, in The guide.
- `work.items`: Problem-Based SRS (with its trace `chain`).
- `lab.heading` and `lab.intro` head the trail log.
- `conversations.body`: the one sentence about getting in touch. Keep it to an invitation to talk;
  the site does not list services, prices or availability.

Any text in `home.json` may carry `[text](url)` links. Internal links are relative to the site root
(`map/`, `radar/`, `library/`).

## Adding a note

1. Copy `site/notes/agentic-observability/` to a new folder.
2. Give the note the next ID (`GN-0002`), and set its stage in the locator band (the
   `aria-current="location"` segment) and in the "Charted at" aside.
3. Add it to `site-data/notes.json` with the same stage, then run `node scripts/build.mjs`. The
   note appears in the trail log, as a vermilion block on the route, in that stage's field-guide
   section and at its camp on the home page. Lab notes in `site-data/takes.json` can link to it as
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

## Addresses that moved

The map (now the route) moved from `/` to `/map/` when the home page arrived, and the lab notes
moved from the home page to the trail log in v3. One inline line of script on the home page forwards
the old links: `/#stage-<id>` to `map/#stage-<id>`, and `/#lab`, `/#testing`, `/#using`,
`/#watch` and `/#take-<id>` to the same anchor in `log/`. Everything else on the home page reads
without JavaScript.
