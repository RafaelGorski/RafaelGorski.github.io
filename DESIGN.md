---
name: Rafael Gorski — Launching and scaling AI systems
description: An atlas plate of the AI lifecycle, from Purpose to Govern, told as one climb. The route's six camps, the valleys where climbs stall, the radar as the gear check, the field guide and the author's trail log, with every note and curated source pinned to the stretch where it matters, and the author's own voice in vermilion.
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
  vermilion-pale: "#fde8e3"
  ring-adopt: "#c9d2ee"
  ring-trial: "#d8def2"
  ring-assess: "#e5e9f6"
  ring-hold: "#f0f2f9"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.7rem + 3.4vw, 4.75rem)"
    fontWeight: 300
    lineHeight: 0.98
    letterSpacing: "0"
  thesis:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7.4cqi, 6rem)"
    fontWeight: 300
    lineHeight: 0.95
    letterSpacing: "-0.005em"
  range:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2cqi, 3.6rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "computed to span the ridge"
  range-short:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 4.2cqi, 3.6rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0.32em"
  note-title:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 1.6rem + 2.8vw, 4.4rem)"
    fontWeight: 300
    lineHeight: 1.02
  section-title:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 1.6rem + 1.9vw, 3.2rem)"
    fontWeight: 300
    lineHeight: 1
  stage-head:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.5rem + 1.4vw, 2.75rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0.16em"
  prose-title:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, Helvetica Neue, system-ui, sans-serif"
    fontSize: "clamp(1.85rem, 1.45rem + 1.1vw, 2.4rem)"
    fontWeight: 300
    lineHeight: 1.08
  position:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 1.1rem + 0.8vw, 1.85rem)"
    fontWeight: 500
    lineHeight: 1.15
  essay:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.58
  lab-note-title:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.14rem"
    fontWeight: 500
    lineHeight: 1.22
  margin-note:
    fontFamily: "Jost, Futura, Century Gothic, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 500
    lineHeight: 1.3
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
  quadrant-band:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.paper}"
    typography: "{typography.stage}"
    rounded: "{rounded.none}"
    padding: "0.9rem 0.9rem 0.85rem"
  quadrant-band-governance:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  radar-blip:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.paper}"
    size: "1.85rem"
  stage-chip:
    backgroundColor: "{colors.ultramarine-tint}"
    textColor: "{colors.ultramarine}"
    typography: "{typography.label}"
  lab-band:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.paper}"
    typography: "{typography.stage}"
    rounded: "{rounded.none}"
    padding: "0.9rem 0.9rem 0.85rem"
  lab-band-hover:
    backgroundColor: "{colors.vermilion-deep}"
  margin-remark:
    textColor: "{colors.vermilion}"
    typography: "{typography.margin-note}"
  trace-chain-id:
    textColor: "{colors.vermilion}"
    typography: "{typography.unit}"
  camp-band:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.paper}"
    typography: "{typography.stage}"
    rounded: "{rounded.none}"
    padding: "0.9rem 0.9rem 0.85rem"
  camp-band-govern:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  camp-mark:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.paper}"
    size: "20 SVG units"
  guide-blaze:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.paper}"
    size: "24 × 14 SVG units on a 30-unit ink staff"
  valley-locator:
    backgroundColor: "{colors.ultramarine-tint}"
    textColor: "{colors.vermilion}"
    size: "six 0.8rem × 0.5rem segments, 2px apart"
---

# Design System: Rafael Gorski — Launching and scaling AI systems

## Overview

**Creative north star: the atlas plate.** The site is a statistical atlas of the AI lifecycle in the
Isotype and Bertin tradition: a plate you read across for the route and down for the evidence.
Executive presence is shown by holding the whole territory at once, not by describing the author.
The map, at `/map/`, is the plate. Six stages run left to right as an ultramarine band, each headed
by the question it must answer. Every curated source is one counted unit pinned below the stage
where it matters most, and the author's own notes are the only vermilion on the page.

**The story (v3: the climb).** The site tells one expedition: launching and scaling an AI system is
a climb. The six stages are camps on the route, the valleys are the failure modes (the radar's
Hold items, told as his "Watch out for" notes), the radar is the gear check, the library is the
field guide, his notes are the trail log, and he is the guide who walks the route with the team.
The menu follows the story: Route (`/map/`), Radar, Field guide (`/library/`), Trail log
(`/log/`) and About; the URLs did not change. The metaphor is a frame, never a claim: one clear
image per section, and every camp, valley and piece of gear names a real decision, failure mode or
practice with a link to its evidence. Narrative copy lives in `site-data/story.json`.

The home page is the one place the author speaks for himself, and it tells the climb from top to
bottom: the summit view (the thesis), the route drawn up the ridge camp by camp, the valleys, the
gear check, an excerpt of the trail log and, last, the guide. It is the same atlas with its colour
logic inverted. Vermilion, his voice, owns his remarks, the valleys and the trail-log bands, and the
guide's trail blaze is the one vermilion mark on the route; ultramarine appears only where his voice
points into the reference. See Home and Trail log below.

The radar is the plate's second reading. The map says when something matters in the lifecycle; the
radar says how far to rely on it: adopt, trial, assess or hold. It is drawn as a polar plate in the
same world (paper, ultramarine value steps, Jost lettering), not as a dashboard, and it borrows the
Thoughtworks form (quadrants, four rings, numbered blips, a list per quadrant) without its artwork
or palette.

It is light only, because readers open shared links on laptops and phones in daylight offices. The
pages read in full without JavaScript. There are two small first-party scripts, both progressive
enhancement: `site/assets/radar.js` adds hover and focus linking to the radar, and
`site/assets/climb.js` drives the home page's route where the browser has no scroll-driven
animation. The home page carries one inline line of script that forwards old links: the map's
former home (`/#stage-…`) to `map/#stage-…`, and the lab notes that moved to the trail log
(`/#lab`, `/#testing`, `/#using`, `/#watch`, `/#take-…`) to `log/#…`. The 404 page uses root-relative links because the site is served from a domain
root. There is no tracking and there are no third-party requests.

Anti-references: the RFC or specification sheet (the previous iteration), the personal-brand hero
("Hi, I'm…", headshot, skills grid, logo wall, testimonials), post-card grids, metro-map "journey"
slides, and dark gradient tech aesthetics.

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
- **Vermilion `#c2361c`**: the author's own voice. On the map and in the library it marks his
  notes (note pins, note chips and the current locator segment), with white text at 5.5:1. On the
  home page it owns the lab-note bands, the margin remarks (5.3:1 on paper), the note squares in
  cross-references and the ids of the trace chain. The pale variant `#fde8e3` is for counts on a
  vermilion band (4.6:1). Inside an exhibit it also marks the error span, always paired with a text
  label. The radar uses none: its placements are editorial judgement, not original writing.
- **Ring fills** `#c9d2ee` → `#d8def2` → `#e5e9f6` → `#f0f2f9`: radar only. Four ultramarine value
  steps, darkest at Adopt, lightest at Hold (a Bertin value scale for an ordered variable). Ring
  names in ink secondary hold 5:1 on the darkest step. The ring is always also written in text.
- **Mountain art** uses no colour of its own. Contours are ultramarine pale (index lines) and a
  62% screen of it over paper (the rest); on the home page they are rule grey instead, and the
  summit carries the one vermilion mark. The ascent above the stages is ultramarine pale laid down
  in four screens (50, 66, 83 and 100%) with paper hairlines between ridges. Nothing in the art is
  darker than ultramarine pale (luminance 0.65), so every text colour on the site keeps at least
  4.5:1 where it crosses a line, except vermilion text, which the art never sits behind. See
  Mountain art below.

## Typography

- **Barlow Condensed Light** (self-hosted, `site/assets/fonts/barlow-condensed-light.woff2`, one
  static weight, 300, Latin subset, about 19 KB, OFL in `OFL-barlow-condensed.txt`) letters the
  titles and nothing else: the h1 on every page, the home section titles, the library stage heads
  and the section heads of notes and About. It is a slightly rounded condensed grotesk with a true
  light weight, chosen beside Jost and the contour art over Big Shoulders Display, Saira Condensed
  and Extra Condensed and Antonio. Titles keep weight 300 at every size: hierarchy comes from size,
  space and placement, never from weight. It is not Alumni Sans.
- **Jost** (self-hosted variable font, `site/assets/fonts/jost-var.woff2`, Latin subset, weights
  300–700, OFL) does all the plate lettering: stage names, questions, unit titles, labels,
  numerals, bands and navigation, and every data mark on the stage, radar and library. It is a
  geometric face in the Futura line, the lettering tradition of Isotype charts. A stage numeral
  inside a lettered stage head stays in Jost, because it is data.
- **System sans** sets everything you read: captions, prose, the why and check lines. It keeps body
  copy native and fast.
- **Monospace** appears only for code, attribute names and span names in exhibits.
- **Stage names** are uppercase with tracking of 0.07em.
- **Small labels** (`Move on when`, `Why it matters`, `Shape`) are uppercase at 0.7rem with
  tracking of 0.09em. They always label content directly below them, and never sit above a
  heading as an eyebrow.
- **Display:** the plain h1 is Barlow Condensed 300 at up to 4.75rem, line-height 0.98, no
  tracking, balanced wrapping. The home page's thesis is the one larger h1 (up to 6rem,
  line-height 0.95), one sentence per line. Positions on the home page are Jost 500, and the essay
  paragraphs beside them step up to 1.125rem from 64rem.
- **Panorama lettering** on the home page's route is set in SVG user units, like the disc's: camp
  numerals 12.5 and camp names 13.5 (uppercase, 0.08em, with a paper halo). A scale factor (`--k`,
  1.5 from 64rem, 2 from 40rem, 2.8 below) restores the marks where the panorama is drawn small;
  below 40rem the names are dropped and the camps keep their numerals.
- **Disc lettering** is set in SVG user units, so it scales with the disc: quadrant names 15
  (uppercase, 0.07em), blip numerals 13.5, counts 12.5, the ring scale 11.5 (uppercase, 0.08em).
  At the smallest desktop disc a numeral renders near 10px.

### Titles: map lettering

No page head reads "bold title over a grey subtitle". Each title is lettered into the page's
drawing, as names are lettered into a map, and stays a real `<h1>`, first in reading order:
h1, then the legend or margin text, then the content.

- **Home (summit label):** the thesis names the summit of the route drawn behind it: its last line
  runs on a 1px ink leader, straight, at its x-height, to the summit camp, where the guide's trail
  blaze stands once the route is climbed. The panorama is placed from the thesis (CSS sets its top
  so the summit lands on the leader's line, at any width), so the two never drift apart. The lede
  is a margin note in ink at body size, on a 2px rule, on the paper beside the panorama.
- **Route (range name):** "The route from Purpose to Govern" (`site-data/plate.json`) is lettered in light spaced capitals across the six-stage ridge,
  in the ridge's own grid row. The build measures the title in the title face
  (`ADVANCE` in `scripts/build.mjs`) and CSS spaces it to the sheet's exact width, so it spans the
  climb on one line; on very wide screens it stops at the `100rem` sheet. Titles of 36 characters or
  more fall back to the plain title. The caption joins the key as legend text, beside a contour
  corner.
- **Radar (summit label):** "Gear check for the climb" sits in the margin; a 1px ink elbow leader runs up the disc's
  vertical paper axis from the centre (the summit), clear of every blip, and across above the disc
  to the title. It belongs to the title, so as the page scrolls it slides up the axis.
  The intro sentence joins the ring legend, which precedes the disc in reading order: the legend
  stands under its own 2px neatline, and the intro is its opening line, set in the key's text
  column at legend size.
- **Field guide:** "Field guide" is lettered on the ascent above the stage index, at the range
  name's size and with 0.32em spacing, but not across the full width.
- **Trail log:** a readable light display title, as on a note, beside the notes sheet corner, with
  the intro as a standfirst in ink and the counts as an edition line.
- **Note:** a readable light display title (no range lettering), the meta in the margin rail
  above the contents, then the lede and abstract as a standfirst in ink under a 2px rule.
- **About and 404:** About's title ends at the summit of its own sheet (62% across, 16% down), with
  the caption and prose beside the sheet. The 404 sheet's summit lies beyond its top-right corner,
  so the title is lettered there, against that edge, with the text beside it.
- **Section titles** (the home page's The route, The valleys, Gear check, Trail log and The guide;
  the trail log's Notes; the library stage heads; note and About sections) are the light face at a
  smaller size, and the guide's sub-sections (How I lead a climb, What I build, Conversations) one
  step smaller again. Bands and their numerals stay
  Jost: they are data.
- **States:** below 64rem the map's ridge splits into two rows, so its title is set plain; below
  40rem every leader is dropped, range lettering becomes the plain title and margin notes return
  under the title as a standfirst in ink. Print sets every title plain and hides leaders and art;
  forced colours hide the leaders and set titles in the system text colour. No title moves and no
  title needs JavaScript.
- **Never:** eyebrow or kicker labels, italic serif accent words, gradient text, a single bold word
  in a light title, a centred hero, buttons or title cards, or a decorative arrow for a leader.
  Leaders are 1px hairlines in ink or ultramarine pale.

## Layout

- **Plate:** six equal columns inside a `100rem` max width with fluid gutters. One grid holds the
  head and the route: rows for the title, the legend, the Govern bracket, the ridge, then the
  stage's four rows (band, question, pins, test) and the loop. The route and each stage are
  `subgrid`s of it, so questions and tests align across the route and the title can share the
  ridge's row.
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
- **Radar:** at 72rem and wider, two columns. The disc sits at left (at least `34rem`) and stays
  still (sticky) at up to the viewport height, dropped just below the leader's line; the right
  column holds the title, the legend (intro, key and edition), the quadrant index, then the
  ledger. Below 72rem it is one column: title, disc (up to `44rem`, centred), legend, index,
  ledger (the legend comes before the disc in reading order and after it on screen), and each
  quadrant opens with its own quarter of the disc (up to `26rem`) so the drawing stays beside the
  reading. At 40rem and below the whole disc becomes a dots-only overview under the title
  (numerals and lettering hidden), and the quarter crops carry the numerals at full size.
- **Note:** a full-width locator band, then the head: the title, with the meta in a `13.5rem`
  margin rail at left (from 75rem), and the lede and abstract as a standfirst under a 2px rule.
  Below that, a sticky contents rail and the prose, held at `68ch`. Exhibits, the signals table and
  the ninety-day phases break out to `62rem`.

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
- **Radar blips** are circles, always: on the radar, shape is not spent on kind. A numbered
  ultramarine disc with a paper edge; movement is a mark around it, never a colour (see Radar
  below).

## Components

- **Margin line:** name at left, nav at right (Route, Radar, Field guide, Trail log, About, then
  Search; labels in `site-data/story.json`). On phones the items wrap whole, never mid-label. The
  name is the link home and carries `aria-current="page"` there. The current page carries a 3px
  ultramarine underline. A 1px ink rule spans the gutters. Search is auxiliary (`li.aux`): last,
  Jost 400 in ink-2 after a 1px rule hairline, which is dropped on phones where it may wrap alone.
  Hand-written pages (About, the notes) carry the item by hand.
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
- **Exhibit (value stream):** the trace grid reused for one change from request to release, as in
  GN-0002, or for one turn of a feedback loop, as in GN-0003 (`.exhibit.vsm`). Step names are set
  in the reading face, not the code face. Work
  (`k-work`) is an ultramarine bar; waiting (`k-wait`) is a paper bar with a 1px ink-secondary
  outline, matched by an outlined legend swatch (`is-wait`); the defect and its rework are
  vermilion (`is-error`). Step names say which steps are waits, so colour is never the only cue.
- **Exhibit (code):** used when the code itself is the evidence, as in GN-0002. Each block has an
  uppercase Jost label over a 2px ink rule, then a `pre` on ultramarine tint in the code face,
  scrolling sideways rather than wrapping. A scrolling block is a focusable, labelled region
  (`tabindex="0"`, `role="region"`, `aria-labelledby` the label).
- **Exhibit (gate):** a release decision per module, as in GN-0003. It reuses the two-column
  signals table inside `figure.exhibit`: the row header names the module and its eval, the cell
  gives the baseline, the candidate and the allowed drop, then the decision as a bold word (Pass,
  Hold, Roll back) and its reason. The decision is never shown by colour alone. No new CSS.
- **Callout:** a tint block for a caveat or, as a `blockquote`, a quotation from a source.
- **Requirements:** the RID in Jost ultramarine, the text, then a trace line of § and references.
  RFC 2119 keywords are bold, with slight tracking.
- **Placeholder:** a dashed border with an ink tag. It marks copy the owner must replace. No page
  uses it at present.

### Home

Rendered by `scripts/build.mjs` from `site-data/home.json` (thesis, lede, who, positions, work,
conversations), `site-data/story.json` (the story's headings, intros, camp remarks and ring
framing), `site-data/takes.json` (lab notes) and the route geometry from `scripts/art.mjs` into
`site/index.html`. The sections run top to bottom as the climb: the summit view, The route, The
valleys, Gear check, Trail log, The guide.

- **Grid:** content is held to `76rem`, left-aligned with the margin line. From 64rem up, each
  passage is two columns: the reading column (`1fr`, prose at `66ch`) and the margin
  (`16rem`–`23rem`). Below 64rem the margin follows its paragraph after a dashed hairline.
- **Head:** the thesis as the h1, one sentence per line (the build splits it at sentence ends),
  lettered as the summit's label with a leader to the trail blaze (see Titles: map lettering).
  The thesis's leader runs to the summit of the route's panorama (see below), which is the title's
  ground: from 64rem it stands at the right of the sheet (70% of its width) with its summit on the
  leader's line, the lede (the guide framing) is a margin note in ink on a 2px rule on the paper
  beside it, and the **itinerary** (the page's five sections as a route card on a 2px ink rule,
  each a Jost name and a count the build computes) is its legend, under it in the margin column.
  No text stands on the art; only the leader crosses it. From 40rem to 64rem the panorama spans the
  sheet under the thesis and the lede and itinerary follow it. Below 40rem it is a small strip under
  the thesis, drawn in full, and the leader is dropped.
- **The route's panorama (`.climb-scene`), behind the title:** the ascent (the map's own ridge, as
  one image in three depth bands), and over it, drawn inline: the planned route as a dotted
  ink-secondary line, the walked route as a 2.6-unit ink line, the camps as 20-unit squares
  (ultramarine, Govern in ink) with white Jost numerals and the stage name beneath, and the guide's
  trail blaze on a short staff, drawn under the squares. The build writes its aspect and summit
  (`--ar`, `--sx`, `--sy`) on the head, and CSS places it from the thesis.
- **Motion (one authored moment):** one registered number, `--p`, 0 at the first camp and 1 on the
  summit, says how far up the reader is. It runs from the top of the page to the moment the
  panorama reaches the top of the screen (the exit-crossing of `.climb-track`, an empty box from
  the top of the page to the top of the panorama), so the climb is done while the summit is still
  in view and the title and the route end as one picture. From `--p` CSS draws the route
  (`stroke-dashoffset`), shows each camp as the route reaches it (opacity, and a 7-unit settle),
  stands the blaze on the route (`offset-path`/`offset-distance`, in the SVG's own units) and
  settles the two nearer ridge bands (transform only, 2.2% and 4.4%). Where `animation-timeline` is
  unsupported, `climb.js` (about 1.5 KB, no library) sets the same `--p` from the same box on
  scroll, with rAF. `--p` rests at 1: on phones, with reduced motion, without JavaScript, or
  without either engine, the route is drawn in full, every camp shows and the blaze stands on the
  summit at the end of the leader. Nothing loops or autoplays; the scroll is never taken over and
  no reading space is spent on it. Print and forced colours drop the panorama.
- **The camps, on the panorama:** from 40rem, with JavaScript, the six camps are points on the
  title's panorama, not a section of their own. `climb.js` moves the camps' ordered list
  (`#camps`) onto `.climb-points`, a layer laid exactly over the drawing. Each camp's link (to its
  stage on the route) is a 2.75rem target over its square. The rest of the camp is its **callout**:
  a paper label on a 2px ink rule with a hairline leader up to the camp. It holds the number and
  name, the question in Jost, his camp line in vermilion, and "This stretch on the route" and its
  field-guide sources. Callouts stay in the accessibility tree (opacity only), so every camp reads
  in order without pointing.
- **The animation follows the pointer.** Pointing at a camp, or moving along the drawing (which
  snaps to the nearest camp), takes that camp in hand. The blaze walks the route to it, the route is
  drawn solid up to it (a 260–800ms decelerating ease with no overshoot, on `--p`), its square is
  ringed in ink and its callout opens. Leaving the drawing glides back to where the scroll puts the
  climb. Camps ahead of the climber are open squares; they fill as the route reaches them.
  Keyboard focus does the same: Tab reaches each camp's link, then its callout's two links; Enter
  follows the focused link; Escape lets go. On touch the first tap opens a camp, the links in its
  callout go on, a second tap on the camp follows its link, and a tap elsewhere lets go. With
  reduced motion the blaze jumps to the camp (`--b`, the blaze's own place) and the route stays
  drawn in full.
- **Fallback list:** without JavaScript, and on phones, the camps are a compact list under the
  title in their own section (The route), one row each and read across from 64rem: the camp band,
  the question, his remark, and the two links. Below 64rem the band leads and the rest stacks
  beside or under it. With the script on wider screens that section is hidden, so the title section
  never grows and the page is shorter.
- **The valleys:** each "Watch out for" lab note paired with the Hold blip it links to, in the order a
  team meets them (the blip's first stage, then file order). Each is a `.hm` row: a locator (the
  six stages as a strip, the valley's stage in vermilion and a second stage outlined in it) with
  "At Design · also Operate" in vermilion and ink-secondary, his note's title and body unchanged,
  and in the margin its evidence and "In the trail log".
- **Gear check:** the radar's four rings as a packing list: ring glyph, ring name, the climb framing
  ("Take on the climb", "Test on the approach", "Scout ahead", "Leave behind"), the ring's meaning,
  then every blip in it as a numbered disc linking to its entry on the radar. Hold links back up to
  the valleys.
- **Trail log (excerpt):** three columns on the lab plate's grid: the newest Testing now entry, the
  newest Using more effectively entry (the valleys already tell Watch out for) and the long notes,
  each under a vermilion band that links to the group on the trail log.
- **The guide:** his principles (the take's positions, unchanged, under "How I lead a climb") with
  the **who** list beside them in the margin (a `dl` on a 2px ink rule with small uppercase labels:
  Role, Based in, Paper, Open source, Elsewhere, then "Views are my own, not my employer's." in Jost),
  What I build, and Conversations as the close.
- **Sections:** a 2px ink rule and a light title-face h2 (The route, The valleys, Gear check, Trail
  log, The guide). A section's caption is never a grey subtitle: from 64rem it is a margin note in
  ink beside the title, under the same rule, and below 64rem a standfirst in ink after it. The
  first item of a section has no hairline of its own. No section numbers and no eyebrow labels.
- **Position:** an h3 in the position style and a paragraph in the essay style. Its margin holds an
  optional **remark** in vermilion Jost (his aside), then the cross-references.
- **Cross-reference (`.xref`):** one line per link, each led by the reference's own mark: a
  numbered ultramarine disc for a radar blip (with its ring), the unit glyph for a library source
  (with its year), a vermilion square for a note (with its id), a tint square with the stage numeral
  for a stage on the route (with the stage question), a vermilion square for a trail-log entry, a
  vermilion notch for a valley, and an ultramarine ↗ for an outside link. Screen readers hear "On
  the radar", "In the field guide", "On the route" or "In the trail log" before the name.
- **Lab plate** (the trail log's, and the home excerpt's): at 72rem and wider, three columns on a subgrid (band, caption, notes), divided by
  hairlines with 3px of paper between the bands, read across for groups and down for notes. Below
  that, the groups stack. Each note: Jost title, a meta line (date, then "Draft" until the note is
  confirmed), a body of at most 50 words, and its cross-references. Notes are newest first within a
  group. `:target` takes the tint highlight.
- **Trace chain:** under Problem-Based SRS, the real CP → CN → FR chain from the skill's CRM
  example. Ids in vermilion Jost, the kind as a small label, each level indented and joined to its
  parent by an ink elbow, on a 2px ink rule, with a caption.
- **Close:** Conversations in Jost 500 at a larger size, one plain inline link to LinkedIn. It is
  not a button.

#### Voice on the home page

- The guide framing stays grounded: how he works and what he holds to, never teams led, summits
  reached, clients, results or numbers that are not already public on the site. No "Sherpa" and no
  "shepherd". New first-person lines (the lede, the camp remarks, section intros) are drafts for his
  review until he confirms them.
- First person, plain words, short sentences. Opinions with a reason attached, and honesty about
  what is not settled (his own method is in Trial, not Adopt, and the page says so).
- No hype words, no exclamation marks, no self-descriptors (expert, leader, visionary, seasoned,
  passionate) and no "Hi, I'm" opener.
- Every lab note rests on something public and checkable: his paper, his open-source skill and its
  dashboard, this site and its source, his notes, or a radar placement. No invented experiments,
  results, numbers, clients or employer-internal material.
- Consulting stays a single sentence: open to conversations, reach him on LinkedIn. No service menu,
  prices, packages, availability or hire-me action.
- The rest of the site stays impersonal. "I" appears on the home page, in the trail log, in About's
  The story, Two voices and Colophon, and in notes only where the author speaks.

### Trail log

Rendered by `scripts/build.mjs` from `site-data/takes.json` and `site-data/notes.json` into
`site/log/index.html`. His notes from the climb: the lab notes (formerly on the home page) and the
long notes.

- **Head:** the light title beside the notes sheet corner, the lab intro as a standfirst in ink, and
  an edition line (entries, the latest date, Draft until confirmed, and a link to the long notes).
- **Lab plate** (`#lab`): three vermilion bands (Testing now, Using more effectively, Watch out
  for), each with its caption and its entries newest first, as described under Home. Entry anchors
  are `#take-<id>` and group anchors `#testing`, `#using` and `#watch`, as they were on the home
  page, which forwards the old ones here.
- **Notes** (`#notes`): each long note as a `.hm` row (`#gn-0001`): id, status and date, the title
  linking to the note, its summary, and in the margin its note pin and the stage it is charted at.
  The note itself stays at `/notes/<slug>/`; its meta line links back to its trail-log entry.

### Search

Rendered by `scripts/build.mjs` from every source above plus `site-data/search.json` (the themes)
into `site/search/index.html` and its index `site/search/index.json`; `site/assets/search.js`
searches it in the page. The index at the back of the atlas: auxiliary, so quiet. It has no art.

- **Head:** the light title and a caption, then one form (`role="search"`): a Jost label, the field
  set on a 2px ink rule with no box (Jost 400 at the position step; the focus ring goes round the
  whole ruled field), a text Search button in ultramarine, the themes as a line of quiet links
  (ink-2; the active theme takes ink and a 2px ultramarine underline, like the margin line), and a
  status line (Jost 0.84rem ink-2, `role="status"`) that says how the query was read.
- **Themes:** each theme names a family of words (`terms`, with `also` for the names it answers
  to). A query that is a theme searches its family, so the page and the index always agree; any
  other word that is a theme expands the same way, and words combine with AND. Terms of four or
  more letters match word starts; shorter ones match whole words. Folding (case, accents) and the
  matching rules are the same in the build and in `search.js`; change both together.
- **What is searched:** each note by section from its own page (citation keys and References left
  out), the positions, the lab notes, the blips, the field guide and the route's stages. Display
  meta (dates, rings, group names) is never matched.
- **Results:** grouped by kind as `.fi` rows: the kind in the title face with its tally beside, its
  lines as `.xref` lines with a snippet under each and matches in `mark` (ultramarine tint).
  A note lists up to four matching sections by numeral, then how many more.
- **Theme index** (`#themes`, no query): the same rows, one per theme (`#t-<id>`, tinted when
  targeted), its lines read down three short columns from 64rem; a note's matching sections follow
  as § numerals with 24px targets. It is the page without JavaScript, and its theme links
  (`?q=<theme>#t-<id>`) work either way.
- **States:** while the index loads the status says so; nothing found names the query and points to
  the themes; if the index fails the theme index stays. Escape clears the field and `/` focuses it.
  Print drops the form and keeps what is on screen.

### Radar

Rendered by `scripts/build.mjs` from `content/radar.json` into `site/radar/index.html`.

- **Disc:** an inline SVG, 720 user units square, centre at 360. Rings end at radii 175, 253, 308
  and 350, narrowing outward so Adopt holds the most. Each ring is a flat fill from the ring scale,
  separated by 2-unit paper lines; the plate edge is a 1-unit ink circle. Two paper axes cut the
  disc into four quarter plates, like the 3px gaps in the stage band. The horizontal axis is wider
  (26 units) and carries the ring scale: ring names in uppercase, centred in each ring, on both
  sides. Quadrant names and blip counts sit in the four corners (Governance in ink).
  Positions are fixed: Techniques top left, Platforms and protocols top right, Measures bottom
  left, Governance bottom right.
- **Blip:** a 12.5-unit ultramarine circle with a paper edge and a white Jost numeral. Numbers run
  in list order (quadrant, ring, then file order). Within a ring they sweep clockwise. Positions
  are computed at build time: seeded best-candidate sampling, a short Lloyd relaxation, then a
  repulsion pass. The build fails if two marks in a cell would overlap. Each blip is an SVG link to
  its ledger entry, with a `<title>` for mouse users. It is kept out of the tab order, because the
  ledger is the keyboard and screen-reader path. The SVG is `aria-hidden`, and a visually hidden
  figcaption describes it.
- **Movement marks:** no change = the bare blip; new = a full 1.5-unit ring at radius 15.5; moved
  in = a 3-unit arc on the side facing the centre; moved out = the same arc on the side facing the
  edge. The ledger always writes the movement in words.
- **Ring glyph:** a quarter disc with four bands, the ring's band solid ultramarine and the rest
  tint. It names the ring by position, not colour, in the key and on every ring heading.
- **Key:** under a 2px ink neatline, the intro sentence in the key's text column, then Ring (glyph,
  name, the climb framing from `site-data/story.json` in Jost ink, then the meaning from
  `radar.json`) and Mark (the four movement marks).
  Edition, status and ring counts follow on the quiet `.edition` line.
- **Quadrant index:** four bands in a two-by-two grid, in the same positions as the quadrants on the
  disc, each with its count. Governance is the ink band.
- **Ledger:** per quadrant, a band (`h2`) and its scope, then all four rings in order (`h3` on a 2px
  ink rule, with glyph and count; an empty ring says so). Each entry has a numbered disc matching
  the blip, the name (`h4`), a line of ring · quadrant · movement, the summary, then Evidence (unit
  glyph and short title, linked to `library/#src-<id>`) and On the map (tint stage chips with the
  stage numeral, linked to `#stage-<id>` on the map). `:target` takes the tint highlight. The
  quarter crops omit the corner names, which the quadrant band already carries.
- **Progressive enhancement (`radar.js`):** pointing at or focusing an entry lights its blip and
  names it in the readout under the disc; pointing at a blip does the reverse. While a quadrant
  section crosses the middle of the viewport, blips in the other quadrants drop to 28% opacity and
  their corner names turn ink secondary.
  Arriving at `#blip-<id>` keeps that blip lit.
- **Cross-links:** library entries carry "On the radar" for every blip that cites them, and each
  library stage section ends with "On the radar" for blips charted at that stage. On the map, each
  stage column ends with "On the radar": the numbered discs of the blips charted there (1.5rem, a
  24px target), each linked to its entry. `.stage:target` tints the column a blip links to.

### Mountain art (Contour Lineage)

Górski means "of the mountains". The site's art is a generative mountain system drawn the way a
cartographer draws one: contour lines (isohypses) seen from above, and a ridge seen from the side.
`scripts/art.mjs` draws it from the seeds in `site-data/art.json` as static SVG in
`site/assets/art/`, and `scripts/build.mjs` runs it first and stamps the files with the same `?v=`
content hash as the other assets. The site loads no script for it and it reads with JavaScript off.
The philosophy, the hidden parameters and the p5.js seed explorer are in `art/` (not published).

- **The system.** A main ridge through the summit with side ridges branching off it, smooth-joined
  into V-shaped valleys, roughened by ridged noise on the high ground. Every summit is normalised to
  2,499 m; contours every 50 m from a 1,000 m valley floor, every fifth (each 250 m) an index line
  drawn heavier. Same seed, same drawing, on any machine.
- **Where it appears.**
  - Page heads (map, library, note): a sheet corner, `.art-sheet`, behind the head. Its top and
    right edges are neatlines at the margin rule and the right gutter; its left and bottom fall
    away to the valley floor, so the title stands on open ground. On the map and the library it
    keeps to the last two columns of the legend row, beside the key and never behind it.
  - Home: until v3 the author's summit, `home.svg` (contours in rule grey with a vermilion Polish
    trail blaze), stood behind the thesis. It is still drawn, for the archived version, but the home
    page now sets the route's panorama there (below).
  - About: a portrait margin plate, `.art-margin`, in the right margin beside the prose; the title
    is lettered at its summit.
  - Radar: the apron, `.art-apron`. The disc is the summit seen from above and its four rings are
    the top contours (2,450 to 2,300 m); the apron draws the slopes falling away beyond the edge,
    in the disc's own units, clipped to the figure. Inside the disc the ring fills cover it.
  - Map: the ascent, `.ridge`. Each stage column opens with its own stretch of one route seen from
    the side, standing on its band with 3px of paper between, so the six join into one ridge that
    climbs to the summit above Govern. Each stage shapes its stretch from its own seed. The same
    six images climb above the library's stage index (`.lib-ascent`, on the index's own grid and
    3px off its bands; the row scrolls away and only the bands stick; hidden below 40rem, where the
    index wraps to two rows), and stand at the foot of each library stage head.
  - Home: the climb, `.climb-l`, the title's ground. The same ascent drawn as one panorama
    (`climb-far`, `climb-mid` and `climb-near`, 1,600 × 440 with 36 units more below the frame),
    behind the route, its camps and the blaze. `scripts/art.mjs` also computes the route: a smoothed line kept just below the
    skyline ridge and above the ridge in front, so it rises and dips with the range, with the camps
    on its high points nearest even steps from the start to the summit. It uses the ascent's seeds;
    no new seed.
  - 404: the slopes of a summit that lies beyond the sheet, full page behind the text.
- **Rules.**
  - Ground, never figure: never behind data (units, pins, blips, bands; where a head has a key, the
    sheet keeps above it), never behind vermilion text, never darker than ultramarine pale.
  - Decorative: `<img alt="" aria-hidden="true">`, no captions or alt text.
  - Still, except where the reader moves it: only the home page's climb responds to scroll, as the
    title scrolls away (the two nearer ridge bands settle by a few percent as the route is climbed). It never moves on its
    own, and with reduced motion it does not move at all.
  - Hidden in print and in forced colours.
  - On phones every sheet becomes a 9rem cropped corner at 75% opacity, and the stage ridges a
    3.5rem strip.
  - Each SVG stays small (the largest, `climb-mid`, is about 16 KB; all sixteen are about 97 KB).

## Do's and Don'ts

Do:

- Keep the map's six stage ids and order fixed. Content comes from `content/*.json` (owned by
  curation) and `site-data/*.json` (site copy, the notes registry and the home page's take and lab
  notes). Regenerate with `node scripts/build.mjs`.
- Pin every new note to exactly one stage in `site-data/notes.json`. It appears as a vermilion
  block on the map and in the library section for that stage.
- Show maturity honestly through fill. If a source is in revision, it is hatched.
- Keep all internal links relative, and run `node scripts/check-links.mjs` before publishing.
- Keep the radar's quadrant and ring ids and their order fixed. Placements live in
  `content/radar.json`; the build validates ids, stage and evidence references and the 30-word
  summary limit, and refuses a cell too full to draw.
- Respect `prefers-reduced-motion`. The only authored motions are the home page's climb (the route
  drawing itself up the panorama behind the title as the title scrolls away; see Home), units stamping in column
  by column on the map, radar blips stamping in ring by ring from Adopt outward, and trace bars
  drawing on note pages. Transform, opacity and the route's stroke only; nothing loops or autoplays.
- Change the mountain art through seeds and settings in `site-data/art.json` (explore them first in
  `art/viewer.html`), then run `node scripts/build.mjs`. The algorithm lives in `scripts/art.mjs`.

Don't:

- Use vermilion for anything other than the author's own voice: his notes, and on the home page
  his remarks, the valleys, the trail-log bands, the guide's trail blaze and trace-chain ids (plus
  error spans in exhibits).
- Add cards, shadows, rounded corners, gradients, icons or eyebrow labels.
- Add self-descriptors such as expert or leader, or a portrait, logos or testimonials.
- Use monospace as a "technical" costume. It is for code and data only.
- Edit `site/index.html`, `site/map/index.html`, `site/radar/index.html`,
  `site/library/index.html` or `site/log/index.html` by hand. They are generated.
- Call him a Sherpa or a shepherd, or let the metaphor turn cute: one image per section, with the
  engineering point explicit.
- Link to the map as `/` or `../`. The map is at `map/`; `scripts/check-links.mjs` fails on a link
  whose text names the map but lands on the home page.
- Colour radar blips by quadrant or ring. Position and text carry both.
- Put the mountain art behind data or vermilion text, draw it darker than ultramarine pale, animate
  it on its own (only the climb, and only with the reader's scroll), or load p5.js or any other
  script on the site to draw it. Do not edit `site/assets/art/` by
  hand; it is generated.
