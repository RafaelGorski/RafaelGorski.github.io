# Site architecture and technical decisions

This file is the technical orientation for the repository. `PRODUCT.md` is the authority for
audience, content and product constraints; `DESIGN.md` is the authority for visual, interaction and
accessibility decisions. The root `README.md` is intentionally only the published site URL:
`https://rafaelgorski.github.io/`.

## Architecture

- **Publication:** a static GitHub Pages user site, served from `site/` at
  `https://rafaelgorski.github.io/`. Internal links are relative so the site can also work beneath
  a path prefix.
- **Sources:** `content/` holds the curated lifecycle stages, library sources and radar edition.
  `site-data/` holds page copy, story framing, lab notes, note metadata, route details and art seeds.
  Long-form notes, About and the 404 page are hand-authored under `site/`.
- **Build:** `scripts/build.mjs` is a zero-dependency Node build. It validates cross-references and
  renders the home, route (`map/`), radar, field guide (`library/`) and trail log (`log/`). The
  generated HTML is committed alongside the authored pages.
- **Art and assets:** `scripts/art.mjs` generates seeded, deterministic SVG mountain art from
  `site-data/art.json`. The build runs it first, then applies content-hash query strings to CSS,
  scripts, fonts and generated art for cache invalidation. Edit sources, not generated output.
- **Enhancement:** the pages are semantic HTML and remain usable without JavaScript. The two
  first-party scripts enhance radar linking and the home-page climb; they are not required to read
  the content. There is no tracking or third-party runtime request.

The site is organized as one climb: the six-stage route provides the lifecycle structure; the radar
records maturity judgments; the field guide connects stages to evidence; the trail log and notes
hold the author's dated observations. Links between these views are generated from shared IDs so
claims and recommendations can be traced to their references.

## Technical decisions

- Keep deployment static and dependency-free: GitHub Actions uses Node 22, builds the site, checks
  links, and deploys the `site/` directory.
- Treat JSON in `content/` and `site-data/` as the structured source of truth. The build rejects
  invalid or unresolved references rather than silently emitting broken cross-links.
- Keep internal links relative and verify both targets and fragments; this preserves portability
  and catches broken navigation before deployment.
- Prefer progressively enhanced interactions with a complete HTML fallback. Respect reduced
  motion, and keep decorative art out of the accessibility tree.
- Keep copy and design decisions in their source records (`PRODUCT.md`, `DESIGN.md` and JSON data),
  not in the README. The README must remain a single line containing only the published site URL.

## Local validation and deployment

Run the same checks used by the Pages workflow:

```sh
node scripts/build.mjs
node scripts/check-links.mjs
```

The workflow is `.github/workflows/pages.yml`; it runs on pushes to `main` when published-site
sources, build scripts or the workflow itself change, and can also be started manually.
