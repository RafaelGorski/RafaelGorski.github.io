# rafaelgorski.com

Notes for leaders running AI at scale. A static site with no build step, served by GitHub Pages.

## Layout

```
site/                          published root (deployed as-is)
  index.html                   index of notes
  about/index.html             about page (bio is a placeholder)
  notes/<slug>/index.html      one folder per note
  assets/site.css              the whole design system
  404.html
.github/workflows/pages.yml    deploys site/ on every push to main
PRODUCT.md / DESIGN.md         product and design records
```

All internal links are relative, so the site works both at
`https://rafaelgorski.github.io/rafaelgorski.com/` and at the root of a custom domain.

## Preview locally

```
python -m http.server 8000 --directory site
```

Then open <http://localhost:8000>.

## Publish

1. In **Settings → Pages**, set **Source** to **GitHub Actions** (one time).
2. Push to `main`. The workflow uploads `site/` and deploys it.

## Moving the domain

When ready to serve from `rafaelgorski.com`:

1. Add a file `site/CNAME` containing `rafaelgorski.com`.
2. In **Settings → Pages → Custom domain**, enter `rafaelgorski.com` and enable **Enforce HTTPS**.
3. At the DNS provider, point the apex `A` records to GitHub Pages
   (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and `www` as a
   `CNAME` to `rafaelgorski.github.io`.

## Adding a note

Copy `site/notes/agentic-observability/` to a new folder, keep the header block and
section/requirement structure, give it the next ID (`GN-0002`), and add it to the
index in `site/index.html`.
