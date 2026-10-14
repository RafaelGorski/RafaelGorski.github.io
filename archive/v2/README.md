# v2 archive

A frozen copy of the published site as it stood before v3 ("the climb") went live: commit
`4789d46`, "Titles v2: cartographic lettering", also tagged `v2`.

It sits outside `site/`, so GitHub Pages does not publish it and the link check does not scan it.

## View it

```
python -m http.server 8000 --directory archive/v2/site
```

Then open <http://localhost:8000>. The pages use relative links, so they work from any folder
served as a root.

## Revert to it

The tag is the reliable way back, because it also restores the scripts and data that built these
pages:

```
git checkout v2 -- site scripts site-data content DESIGN.md README.md PRODUCT.md
git commit -m "Revert the site to v2"
git push origin HEAD:main
```

Or open a branch from the tag (`git switch -c back-to-v2 v2`) and merge it.
