# art/

The design tools behind the site's mountain art, **Contour Lineage**. Nothing in this folder is
published: the Pages workflow uploads only `site/`.

- `philosophy.md`: the algorithmic philosophy and its conceptual seed.
- `viewer.html`: an interactive p5.js explorer for seeds and parameters, with PNG and SVG download.
- `NOTICE`: attribution for the viewer template (anthropics/skills `algorithmic-art`, Apache-2.0).

## Explore seeds

Open `art/viewer.html` in a browser (double-click it; no server needed). It loads p5.js and two
fonts from public CDNs, which is fine here because the viewer is never part of the site. The site
itself loads no third-party script: it ships static SVG.

- **Site areas** loads the seed and settings an area uses now (Home, Map, Radar, Library, Notes,
  About, 404, and the six-stage Ascent). You can also open a preset directly, for example
  `art/viewer.html#radar`.
- **Seed** steps through seeds with Prev and Next, jumps with the field, or picks one at random.
- **Parameters** change the drawing live. Reset returns to the area's shipped settings.
- **Download PNG** and **Download SVG** save what is on the canvas. The SVG is the same file the
  site would ship for that seed.

## Ship a seed

1. Find a seed you like in the viewer and note it.
2. Put it in `site-data/art.json`: `areas.<area>.seed` for a page, or `ascent.seed` for the map's
   six stages. To change one stage only, add `"stageSeeds": { "scale": 1234 }` under `ascent`.
   Settings changed in the viewer go under the area's `"params"` (for example
   `"params": { "spurs": 10, "rock": 0.4 }`); `summit` is `[across, down]` as shares of the sheet.
3. Run `node scripts/build.mjs`, then `node scripts/check-links.mjs`. The build regenerates the SVGs
   in `site/assets/art/`, stamps their links with a content hash and refreshes the viewer's copy of
   the algorithm.

## Change the algorithm

Edit `scripts/art.mjs` between the `<core>` markers, never the copy inside `viewer.html`. The build
(or `node scripts/art.mjs` on its own) copies the core into the viewer, so both always draw the
same mountain for the same seed.
