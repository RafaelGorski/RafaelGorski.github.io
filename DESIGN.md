---
name: Rafael Gorski — Launching and scaling AI systems
description: An atlas plate of the AI lifecycle, from Purpose to Govern, with every note and curated source pinned to the stage where it matters.
colors:
  paper: "#fcfcfa"
  ink: "#16171b"
  ink-secondary: "#4a4d55"
  rule: "#d8dadf"
  ultramarine: "#2340a0"
  ultramarine-deep: "#1a2f78"
  ultramarine-tint: "#e9edf7"
  ultramarine-pale: "#c9d2ee"
  ultramarine-mid: "#6b82c4"
  vermilion: "#c2361c"
  vermilion-deep: "#a82e17"
typography:
  display:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 1.2rem + 3.4vw, 4.1rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
  stage:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(0.98rem, 0.8rem + 0.5vw, 1.3rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.07em"
  question:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.88rem + 0.35vw, 1.22rem)"
    fontWeight: 500
    lineHeight: 1.22
  unit:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.99rem"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.09em"
  code:
    fontFamily: "ui-monospace, SF Mono, Cascadia Mono, Menlo, Consolas, Liberation Mono, monospace"
    fontSize: "0.84em"
rounded:
  none: "0"
spacing:
  cell: "0.9rem"
  gutter: "clamp(1.25rem, 0.4rem + 2.6vw, 2.75rem)"
  measure: "68ch"
  wide: "100rem"
components:
  stage-band:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.paper}"
    typography: "{typography.stage}"
    rounded: "{rounded.none}"
    padding: "0.9rem 0.9rem 0.85rem"
  stage-band-hover:
    backgroundColor: "{colors.ultramarine-deep}"
  stage-band-govern:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  note-pin:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0.65rem 0.75rem 0.8rem"
  note-pin-hover:
    backgroundColor: "{colors.vermilion-deep}"
  locator-segment:
    backgroundColor: "{colors.ultramarine-tint}"
    textColor: "{colors.ultramarine}"
    typography: "{typography.label}"
  locator-segment-current:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.paper}"
  sample-notice:
    textColor: "{colors.ink}"
    padding: "0.45rem 0.7rem"
---

# Design System: Rafael Gorski — Launching and scaling AI systems

## Overview

**Creative north star: the atlas plate.** The site is a statistical atlas of the AI lifecycle in the
Isotype and Bertin tradition: a plate you read across for the route and down for the evidence.
Executive presence is shown by holding the whole territory at once, not by describing the author.
The home page is the map. Six stages run left to right as an ultramarine band, each headed by the
question it must answer. Every curated source is one counted unit pinned below the stage where it
matters most, and the author's own notes are the only vermilion on the page.

It is light only, because readers open shared links on laptops and phones in daylight offices. There
is no JavaScript, apart from one inline base-path fix on 404. There is no tracking and there are no
third-party requests.

Anti-references: the RFC or specification sheet (the previous iteration), the personal-brand hero,
post-card grids, metro-map "journey" slides, and dark gradient tech aesthetics.

## Colors

Strategy: committed at plate scale, restrained everywhere else. Paper, ink and hairlines carry the
structure. Ultramarine owns the stage band and every source unit. Vermilion is reserved for
original writing.

- **Paper `#fcfcfa`**: the only ground. A near-neutral white, deliberately not cream.
- **Ink `#16171b`**: text, structural rules and the Govern band segment. Govern is the one stage
  drawn in ink, because it holds across all the others.
- **Ink secondary `#4a4d55`**: metadata, key labels and bylines (8.2:1 on paper).
- **Rule `#d8dadf`**: hairlines between plate columns and between rows.
- **Ultramarine `#2340a0`**: stage band, unit glyphs and links (8.8:1 on paper; white on it 9.1:1).
  The deep variant `#1a2f78` is used for hover. The pale variant `#c9d2ee` is for numerals on the
  band (6:1). The tint `#e9edf7` is for targets, callouts, code and the locator band.
- **Ultramarine mid `#6b82c4`**: exhibits only (model-inference bars, 3.6:1 against paper).
- **Vermilion `#c2361c`**: the author's notes (note pins, note chips and the current locator
  segment), with white text at 5.5:1. Inside an exhibit it also marks the error span, always
  paired with a text label.

## Typography

- **Jost** (self-hosted variable font, `site/assets/fonts/jost-var.woff2`, Latin subset, weights
  300–700, OFL) does all the plate lettering: titles, stage names, questions, unit titles, labels,
  numerals and navigation. It is a geometric face in the Futura line, the lettering tradition of
  Isotype charts.
- **System sans** sets everything you read: captions, prose, the why and check lines. It keeps body
  copy native and fast.
- **Monospace** appears only for code, attribute names and span names in exhibits.
- **Stage names** are uppercase with tracking of 0.07em.
- **Small labels** (`Move on when`, `Why it matters`, `Shape`) are uppercase at 0.7rem with
  tracking of 0.09em. They always label content directly below them, and never sit above a
  heading as an eyebrow.
- **Display:** h1 is set at weight 500 and line-height 1, with tracking of -0.025em and balanced
  wrapping.

## Layout

- **Plate:** six equal columns inside a `100rem` max width with fluid gutters. Each stage is a
  `subgrid` of four rows (band, question, pins, test), so questions and tests align across the
  route.
  - Band segments are separated by 3px of paper. Below the band, columns are divided by 1px
    hairlines.
  - The test row sits on a 2px ink rule that runs the full width of the plate.
- **Annotations:** a bracket above the band marks that Govern holds across every stage. A return
  bracket under Purpose–Operate carries "What production teaches goes back to Purpose."
- **Responsive:**
  - At 64rem and below, the plate becomes three columns by two rows, and the brackets turn into
    plain text lines.
  - At 40rem and below, it becomes one column read top to bottom, with each stage led by its own
    band.
- **Library:** sticky stage-index band (anchor filter), then one section per stage. A sticky stage
  head on the left; entries on the right as glyph, identity, then why and check in two columns.
- **Note:** a full-width locator band, then a two-column head (title and lede left, abstract
  right). Below that, a sticky contents rail and the prose, held at `68ch`. Exhibits, the signals
  table and the ninety-day phases break out to `62rem`.

## Elevation & Depth

Flat. There are no shadows. Depth comes from flat fields (band, note pins, tint) and rules. The
only box-shadow is a spread of the tint colour that extends the `:target` highlight beyond the row
edges.

## Shapes

Square corners everywhere. The only shapes are the unit glyphs, drawn as inline SVG symbols from a
sprite in each page:

- **Kind → shape:** square = rule (standard, specification, regulation); circle = practice
  (framework, guide, book); triangle = evidence (paper, postmortem).
- **Maturity → fill:** solid = stable; 45° hatch = evolving; open outline = draft.
- **Ghost units:** a source charted at another stage, shown at 50% opacity in an "Also read here"
  list. At most three are shown, followed by "N more in the library".

## Components

- **Margin line:** name at left, nav at right (Map, Library, About). The current page carries a
  3px ultramarine underline. A 1px ink rule spans the gutters.
- **Key:** a `dl` of Shape, Fill and Red, using the same glyphs as the plate. It appears on the
  map, the library and About.
- **Stage band:** an `h3` link to the library section, with a pale numeral and an uppercase name.
- **Unit:** glyph, short title in Jost, then the byline (first credit · year, or "living" when
  `year` is null). The accessible text adds the kind and maturity. Short titles come from
  `site-data/plate.json → short`, or from a heuristic in `scripts/build.mjs`.
- **Note pin:** a vermilion block showing the note ID and status, then its short title.
- **Test:** a label ("Move on when" for Purpose to Scale, "In control when" for Operate and Govern)
  and one sentence. The copy lives in `site-data/plate.json`.
- **Library entry:** glyph, title linked to the source, the full publisher with year (or "living
  document"), kind, maturity and secondary stage. It is followed by "Why it matters" and "What to
  check".
- **Locator:** six tint segments on note pages, with the note's stage in vermilion and
  `aria-current="location"`.
- **Exhibit (trace):**
  - Grid rows of name, lane and duration, with quarter gridlines in the lane.
  - Bar colours: workflow ink, agent and plan ultramarine, model ultramarine mid, tool ink
    secondary, error vermilion.
  - Bars scale in with `animation-timeline: view()` behind `@supports` and reduced motion.
- **Requirements:** the RID in Jost ultramarine, the text, then a trace line of § and references.
  RFC 2119 keywords are bold, with slight tracking.
- **Placeholder:** a dashed border with an ink tag. It marks copy the owner must replace.

## Do's and Don'ts

Do:

- Keep the map's six stage ids and order fixed. Content comes from `content/*.json` (owned by
  curation) and `site-data/*.json` (site copy and notes registry). Regenerate with
  `node scripts/build.mjs`.
- Pin every new note to exactly one stage in `site-data/notes.json`. It appears as a vermilion
  block on the map and in the library section for that stage.
- Show maturity honestly through fill. If a source is in revision, it is hatched.
- Keep all internal links relative, and run `node scripts/check-links.mjs` before publishing.
- Respect `prefers-reduced-motion`. The only authored motions are units stamping in column by
  column on the map, and trace bars drawing on note pages.

Don't:

- Use vermilion for anything other than the author's notes (or error spans in exhibits).
- Add cards, shadows, rounded corners, gradients, icons or eyebrow labels.
- Add self-descriptors such as expert or leader, or a portrait, logos or testimonials.
- Use monospace as a "technical" costume. It is for code and data only.
- Edit `site/index.html` or `site/library/index.html` by hand. They are generated.
