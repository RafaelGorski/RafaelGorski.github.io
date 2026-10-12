# DESIGN.md

## World: "the specification"

The site reads like a well-made engineering standard (an RFC or an ISO draft): a
document control block, numbered sections, normative requirements with source
traces, and exhibits. That matches the promise: guidance an executive can adopt
and an engineer can check. It stays low-profile on purpose, with no hero
imagery, no marketing sections and no calls to action.

## Tokens (`site/assets/site.css`, `:root`)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#ffffff` | the only background |
| `--ink` | `#15171c` | text, strong rules |
| `--ink-2` | `#474b55` | secondary text, metadata labels |
| `--rule` | `#d9dbe0` | hairlines between rows and sections |
| `--link` / `--link-visited` | `#1c3f9e` / `#4b3593` | the only accent colour |
| `--mark` | `#eef1fa` | ground for exhibits and requirements |
| `--span-*` | blue ramp, ink, `#b3261e` | trace exhibit categories; red is reserved for error |

Type:
- **Prose:** a book face, using the system Charter / Sitka / Cambria / Georgia stack.
- **Fixed-pitch:** a system monospace stack, used only for metadata, identifiers, attribute names and data. Never for headings or body copy.
- **Webfonts:** none.
- **Scale:** `--step--1` to `--step-3`. Measure 68ch, sheet 46rem.

## Components

- **Document control block** (`.docblock`): author, series, note ID, status, date and source. It replaces a hero.
- **Notes index** (`.notes`): ID, title, status and date, with an abstract under the title.
- **Numbered sections:** the numbers exist because requirements cite them (`§4`).
- **Requirements** (`.reqs`): `R1`–`Rn`. RFC 2119 keywords are set as bold, slightly tracked capitals (`.kw`), and each requirement ends with links to its sections and references.
- **Signals table** (`.signals`): question → plain explanation → attribute names. It stacks below 40rem.
- **Trace exhibit** (`.trace`): a waterfall drawn in CSS grid. Rows set `--depth`, `--s` (start %) and `--w` (width %). The data is synthetic and labelled as such.
- **Placeholder** (`.placeholder` + `.tag`): a dashed box marking copy the author must replace.

## Rules

- Light mode only; the use scene is daylight office reading.
- No eyebrow or kicker labels, cards, gradients, icons, tracking or JavaScript. The 404 page carries a single inline base-path fix.
- One authored motion: trace bars scale in on scroll, using `animation-timeline: view()` behind `@supports` and `prefers-reduced-motion`. Bars are fully drawn by default.
- All internal links are relative, so the site works under a project path and at a domain root.
- Every page starts with a direction-contract comment (THESIS / OWN-WORLD / STORY / FIRST VIEWPORT / FORM). Keep it updated when a page's purpose changes.
