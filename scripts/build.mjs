#!/usr/bin/env node
// Zero-dependency build: renders the map (site/index.html) and the library
// (site/library/index.html) from content/*.json. Run: node scripts/build.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = (f) => path.join(root, "content", f);
const site = (f) => path.join(root, "site", f);

async function loadJson(primary, fallback) {
  const file = existsSync(content(primary)) ? primary : fallback;
  if (!file || !existsSync(content(file))) throw new Error(`Missing content/${primary}`);
  return { file, data: JSON.parse(await readFile(content(file), "utf8")) };
}

const KINDS = {
  standard: { label: "Standard", family: "rule" },
  specification: { label: "Specification", family: "rule" },
  regulation: { label: "Regulation", family: "rule" },
  framework: { label: "Framework", family: "practice" },
  guide: { label: "Guide", family: "practice" },
  book: { label: "Book", family: "practice" },
  paper: { label: "Paper", family: "evidence" },
  postmortem: { label: "Postmortem", family: "evidence" },
};
const FAMILIES = {
  rule: { label: "Rule", kinds: "standard, specification, regulation" },
  practice: { label: "Practice", kinds: "framework, guide, book" },
  evidence: { label: "Evidence", kinds: "paper, postmortem" },
};
const MATURITY = {
  stable: "Stable",
  evolving: "Evolving",
  draft: "Draft",
};

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

function shortTitle(title) {
  const t = String(title).trim();
  const paren = t.match(/\(([^)]{2,18})\)\s*$/);
  if (paren && /[A-Z]{2}/.test(paren[1])) return paren[1];
  let s = t;
  const colon = s.indexOf(":");
  if (colon >= 12) s = s.slice(0, colon);
  if (s.length > 64) s = s.slice(0, s.lastIndexOf(" ", 61)) + "…";
  return s;
}

function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso || "");
  if (!m) return iso || "";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${m[3] ? Number(m[3]) + " " : ""}${months[Number(m[2]) - 1]} ${m[1]}`;
}

// ---------- Load and validate ----------
const stagesSrc = await loadJson("stages.json", "stages.sample.json");
// LIBRARY_FILE lets a preview render a different library (for example a stress test) without touching content/.
const librarySrc = process.env.LIBRARY_FILE
  ? { file: path.basename(process.env.LIBRARY_FILE), data: JSON.parse(await readFile(process.env.LIBRARY_FILE, "utf8")) }
  : await loadJson("library.json", "library.sample.json");
const notesSrc = await loadJson("notes.json");
const plateSrc = await loadJson("plate.json");

const rawStages = Array.isArray(stagesSrc.data) ? stagesSrc.data : stagesSrc.data.stages;
const stages = rawStages.map((s, i) => ({
  id: s.id,
  name: s.name || s.title || s.label || s.id[0].toUpperCase() + s.id.slice(1),
  question: s.question || s.prompt || "",
  n: i + 1,
}));
const stageById = Object.fromEntries(stages.map((s) => [s.id, s]));
const library = librarySrc.data;
const entries = library.entries || [];
const notes = notesSrc.data.notes || [];
const plate = plateSrc.data;
const illustrative = Boolean(library.illustrative) || librarySrc.file.includes("sample");

const errors = [];
const warnings = [];
const seen = new Set();
for (const e of entries) {
  if (!e.id) errors.push(`entry without id: ${e.title}`);
  if (seen.has(e.id)) errors.push(`duplicate id: ${e.id}`);
  seen.add(e.id);
  if (!KINDS[e.kind]) errors.push(`${e.id}: unknown kind "${e.kind}"`);
  if (!MATURITY[e.maturity]) errors.push(`${e.id}: unknown maturity "${e.maturity}"`);
  if (!Array.isArray(e.stages) || e.stages.length < 1 || e.stages.length > 2) errors.push(`${e.id}: needs 1–2 stages`);
  for (const s of e.stages || []) if (!stageById[s]) errors.push(`${e.id}: unknown stage "${s}"`);
  if (!/^https?:\/\//.test(e.url || "")) errors.push(`${e.id}: url must be absolute http(s)`);
  if (words(e.why) > 35) warnings.push(`${e.id}: why has ${words(e.why)} words (max 35)`);
  if (words(e.check) > 25) warnings.push(`${e.id}: check has ${words(e.check)} words (max 25)`);
}
for (const n of notes) if (!stageById[n.stage]) errors.push(`note ${n.id}: unknown stage "${n.stage}"`);
if (errors.length) {
  console.error("Content errors:\n  " + errors.join("\n  "));
  process.exit(1);
}

const primaryAt = (id) => entries.filter((e) => e.stages[0] === id);
const secondaryAt = (id) => entries.filter((e) => e.stages[1] === id);
const notesAt = (id) => notes.filter((n) => n.stage === id);
const updatedLabel = formatDate(library.updated);

// ---------- Shared pieces ----------
const CONTRACT = `<!--
THESIS: The home page is an atlas plate of the AI lifecycle. Six stages run
  across; every curated source is one counted unit pinned below the stage where
  it matters, and its fill says whether that ground is stable, evolving or
  draft. Refuses the personal-site hero and post list, and the RFC sheet.
OWN-WORLD: White plate paper, ultramarine stage band and units, vermilion only
  for the author's own notes, black structure and hairline grid. Isotype unit
  glyphs: square rule, circle practice, triangle evidence; solid, hatched or
  open by maturity. Jost geometric lettering; system sans for reading.
STORY: Visitors see the whole route at once and where the canon is settled or
  still moving. They then open a red note or follow a unit to its library entry.
FIRST VIEWPORT: Name and nav on the margin line; title, caption and key; then
  the full-width six-column plate. GN-0001 is the red block under Operate.
FORM: Grounded direction 7 of 7 (statistical atlas plate, Isotype unit
  grammar); stagings declined; seed 01706d71.
-->`;

const GENERATED = "<!-- Generated by scripts/build.mjs from content/*.json. Edit the content or the script, not this file. -->";

const SPRITE = `<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0">
  <defs>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.6" height="4" fill="currentColor"/></pattern>
    <symbol id="g-rule-stable" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" fill="currentColor"/></symbol>
    <symbol id="g-rule-evolving" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" fill="url(#hatch)" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="g-rule-draft" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="g-practice-stable" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.9" fill="currentColor"/></symbol>
    <symbol id="g-practice-evolving" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="url(#hatch)" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="g-practice-draft" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="g-evidence-stable" viewBox="0 0 16 16"><path d="M8 1 15.4 14.6H.6Z" fill="currentColor"/></symbol>
    <symbol id="g-evidence-evolving" viewBox="0 0 16 16"><path d="M8 2.6 14.1 13.9H1.9Z" fill="url(#hatch)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="g-evidence-draft" viewBox="0 0 16 16"><path d="M8 2.6 14.1 13.9H1.9Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
  </defs>
</svg>`;

const glyph = (family, maturity, extra = "") =>
  `<svg class="g${extra}" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#g-${family}-${maturity}"/></svg>`;
const glyphFor = (e, extra) => glyph(KINDS[e.kind].family, e.maturity, extra);
const describe = (e) => `${KINDS[e.kind].label}, ${MATURITY[e.maturity].toLowerCase()}`;
const byline = (e) => `${esc(e.publisher)}${e.year ? ` · ${e.year}` : ""}`;

function page({ rel, current, title, description, bodyClass, main, foot = "" }) {
  const cur = (k) => (k === current ? ' aria-current="page"' : "");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light">
<link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${rel}assets/fonts/jost-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}assets/site.css">
${CONTRACT}
${GENERATED}
</head>
<body class="${bodyClass}">
<a class="skip" href="#content">Skip to content</a>
${SPRITE}
<header class="margin">
  <a class="name" href="${rel}">Rafael Gorski</a>
  <nav class="site-nav" aria-label="Site">
    <ul>
      <li><a href="${rel}"${cur("map")}>Map</a></li>
      <li><a href="${rel}library/"${cur("library")}>Library</a></li>
      <li><a href="${rel}about/"${cur("about")}>About</a></li>
    </ul>
  </nav>
</header>
<main id="content">
${main}
</main>
<footer class="foot">
  <p>© 2026 Rafael Gorski. Views are the author's own.</p>
  ${foot}<p><a href="https://github.com/RafaelGorski">github.com/RafaelGorski</a></p>
</footer>
</body>
</html>
`;
}

function key({ withNotes = true } = {}) {
  const fam = Object.entries(FAMILIES)
    .map(([f, v]) => `<li>${glyph(f, "stable")}<span><b>${v.label}</b> <span class="k-sub">${v.kinds}</span></span></li>`)
    .join("");
  const mat = Object.entries(MATURITY)
    .map(([m, label]) => `<li>${glyph("rule", m)}<span><b>${label}</b></span></li>`)
    .join("");
  return `<dl class="key">
      <div><dt>Shape</dt><dd><ul>${fam}</ul></dd></div>
      <div><dt>Fill</dt><dd><ul>${mat}</ul></dd></div>
      ${withNotes ? `<div><dt>Red</dt><dd><ul><li><span class="k-note" aria-hidden="true"></span><span><b>Original note</b></span></li></ul></dd></div>` : ""}
    </dl>`;
}

const sampleNotice = (rel) =>
  illustrative
    ? `<p class="sample"><b>Illustrative sample.</b> ${entries.length} real, well-known sources stand in until the curated library is published.</p>`
    : "";

// ---------- Map ----------
function notePin(n, rel) {
  return `<a class="note-pin" href="${rel}notes/${esc(n.slug)}/">
            <span class="n-id">${esc(n.id)} · ${esc(n.status)}</span>
            <span class="n-t">${esc(n.short || n.title)}</span>
            <span class="vh">, original note</span>
          </a>`;
}

function renderMap() {
  const rel = "./";
  const cols = stages
    .map((s, c) => {
      const prim = primaryAt(s.id);
      const sec = secondaryAt(s.id);
      const test = plate.tests?.[s.id];
      const units = prim.length
        ? `<ul class="units" aria-label="Sources charted at ${esc(s.name)}">
${prim
  .map(
    (e, i) => `            <li style="--i:${i}"><a class="unit" href="${rel}library/#src-${esc(e.id)}">${glyphFor(e)}<span class="u-t">${esc(shortTitle(e.title))}</span><span class="u-m">${byline(e)}<span class="vh">. ${describe(e)}.</span></span></a></li>`
  )
  .join("\n")}
          </ul>`
        : `<p class="empty">No sources charted here yet.</p>`;
      const GHOST_MAX = 3;
      const ghosts = sec.length
        ? `<div class="ghosts"><p class="ghosts-l">Also read here</p><ul aria-label="Also relevant at ${esc(s.name)}, charted at another stage">
${sec
  .slice(0, GHOST_MAX)
  .map(
    (e) => `            <li><a class="ghost" href="${rel}library/#src-${esc(e.id)}">${glyphFor(e, " g-ghost")}<span class="u-t">${esc(shortTitle(e.title))}</span><span class="vh">, charted at ${esc(stageById[e.stages[0]].name)}. ${describe(e)}.</span></a></li>`
  )
  .join("\n")}${
            sec.length > GHOST_MAX
              ? `\n            <li><a class="ghost-more" href="${rel}library/#${esc(s.id)}-also">${sec.length - GHOST_MAX} more in the library</a></li>`
              : ""
          }
          </ul></div>`
        : "";
      return `      <li class="stage${s.id === "govern" ? " is-govern" : ""}" id="stage-${esc(s.id)}" style="--c:${c}">
        <h3 class="band"><a href="${rel}library/#${esc(s.id)}"><span class="band-n">${s.n}</span>${esc(s.name)}</a></h3>
        <p class="q">${esc(s.question)}</p>
        <div class="pins">
          ${notesAt(s.id).map((n) => notePin(n, rel)).join("\n")}
          ${units}
          ${ghosts}
        </div>
        ${test ? `<p class="test"><b>${esc(test.label)}</b> ${esc(test.text)}</p>` : `<p class="test"></p>`}
      </li>`;
    })
    .join("\n");

  const main = `<div class="plate-head">
  <div class="ph-title">
    <h1>${esc(plate.title)}</h1>
    <p class="caption">${esc(plate.caption)}</p>
  </div>
  <div class="ph-key">
    ${key()}
    <p class="edition">Edition ${esc(plate.edition)} · ${notes.length} note${notes.length === 1 ? "" : "s"}, ${entries.length} sources${updatedLabel ? ` · library updated ${esc(updatedLabel)}` : ""}</p>
    ${sampleNotice(rel)}
  </div>
</div>
<section class="plate" aria-labelledby="route">
  <h2 id="route" class="vh">The route, stage by stage</h2>
  <p class="span-govern" aria-hidden="true"><span>Govern is charted last but holds from the first decision</span></p>
  <ol class="stages">
${cols}
  </ol>
  <p class="loop"><span>${esc(plate.loop)}</span></p>
</section>`;

  return page({
    rel,
    current: "map",
    title: `Rafael Gorski — ${plate.title}: a map from first decision to accountable operation`,
    description: `A map of launching and scaling AI systems in six stages, from Frame to Govern, with original notes and curated sources pinned to the stage where each matters.`,
    bodyClass: "is-map",
    main,
  });
}

// ---------- Library ----------
function renderLibrary() {
  const rel = "../";
  const index = stages
    .map(
      (s) =>
        `<li${s.id === "govern" ? ' class="is-govern"' : ""}><a href="#${esc(s.id)}"><span class="band-n">${s.n}</span><span class="si-name">${esc(s.name)}</span><span class="si-c">${primaryAt(s.id).length}<span class="vh"> sources</span></span></a></li>`
    )
    .join("\n      ");

  const sections = stages
    .map((s) => {
      const prim = primaryAt(s.id);
      const sec = secondaryAt(s.id);
      const test = plate.tests?.[s.id];
      const ns = notesAt(s.id);
      const list = prim.length
        ? `<ol class="entries">
${prim
  .map((e) => {
    const other = e.stages[1] ? stageById[e.stages[1]] : null;
    return `      <li class="entry" id="src-${esc(e.id)}">
        ${glyphFor(e)}
        <div class="e-id">
          <h3 class="e-t"><a href="${esc(e.url)}">${esc(e.title)}</a></h3>
          <p class="e-m">${byline(e)}</p>
          <p class="e-k">${KINDS[e.kind].label} · ${MATURITY[e.maturity]}${other ? ` · also <a href="#${esc(other.id)}">${esc(other.name)}</a>` : ""}${e.verified === false ? ` · <span class="unverified">not yet verified</span>` : ""}</p>
        </div>
        <dl class="e-read">
          <div class="why"><dt>Why it matters</dt><dd>${esc(e.why)}</dd></div>
          <div class="check"><dt>What to check</dt><dd>${esc(e.check)}</dd></div>
        </dl>
      </li>`;
  })
  .join("\n")}
    </ol>`
        : `<p class="empty">No sources charted at ${esc(s.name)} yet.</p>`;
      const also = sec.length
        ? `<p class="also-here" id="${esc(s.id)}-also"><b>Also read here:</b> ${sec
            .map((e) => `<a href="#src-${esc(e.id)}">${esc(shortTitle(e.title))}</a> <span class="ah-at">(${esc(stageById[e.stages[0]].name)})</span>`)
            .join(", ")}</p>`
        : "";
      const noteList = ns.length
        ? `<div class="lib-notes">${ns.map((n) => notePin(n, rel)).join("")}</div>`
        : "";
      return `  <section class="lib-stage${s.id === "govern" ? " is-govern" : ""}" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-h">
    <div class="ls-head">
      <h2 id="${esc(s.id)}-h"><span class="band-n">${s.n}</span>${esc(s.name)}</h2>
      <p class="q">${esc(s.question)}</p>
      ${test ? `<p class="test"><b>${esc(test.label)}</b> ${esc(test.text)}</p>` : ""}
      ${noteList}
    </div>
    <div class="ls-body">
    ${list}
    ${also}
    </div>
  </section>`;
    })
    .join("\n");

  const main = `<div class="page-head lib-head">
  <div class="ph-title">
    <h1>Library</h1>
    <p class="caption">${entries.length} sources, each pinned to the stage where it matters most. The first line is for the person who decides; the second is for the person who builds.</p>
  </div>
  <div class="ph-key">
    ${key({ withNotes: false })}
    ${updatedLabel ? `<p class="edition">Updated ${esc(updatedLabel)}</p>` : ""}
    ${sampleNotice(rel)}
  </div>
</div>
<nav class="stage-index" aria-label="Stages">
  <ol>
      ${index}
  </ol>
</nav>
<div class="lib">
${sections}
</div>`;

  return page({
    rel,
    current: "library",
    title: "Library — Rafael Gorski",
    description: `Curated sources for launching and scaling AI systems, grouped by stage from Frame to Govern, each with why it matters and what to check.`,
    bodyClass: "is-library",
    main,
  });
}

await mkdir(site("library"), { recursive: true });
await writeFile(site("index.html"), renderMap());
await writeFile(site("library/index.html"), renderLibrary());

console.log(
  `Built map and library: ${stages.length} stages, ${entries.length} sources (${librarySrc.file}), ${notes.length} notes, stages from ${stagesSrc.file}.`
);
if (warnings.length) console.warn("Warnings:\n  " + warnings.join("\n  "));
