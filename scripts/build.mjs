#!/usr/bin/env node
// Zero-dependency build: renders the home page (site/index.html) from site-data/home.json,
// site-data/story.json and site-data/takes.json; the trail log (site/log/index.html) from
// site-data/takes.json and site-data/notes.json; and the route (site/map/index.html), the radar
// (site/radar/index.html) and the field guide (site/library/index.html) from content/*.json.
// Run: node scripts/build.mjs
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { generateArt } from "./art.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = (f) => path.join(root, "content", f);
const siteData = (f) => path.join(root, "site-data", f);
const site = (f) => path.join(root, "site", f);

async function loadJson(file) {
  if (!existsSync(file)) throw new Error(`Missing ${path.relative(root, file)}`);
  return { file: path.relative(root, file), data: JSON.parse(await readFile(file, "utf8")) };
}

// The mountain art (scripts/art.mjs, seeds in site-data/art.json) is drawn first, so its SVGs are
// versioned with everything else below.
const art = await generateArt({ root });
const artSize = Object.fromEntries(
  await Promise.all(
    art.map(async (a) => {
      const m = (await readFile(site(`assets/${a.file}`), "utf8")).match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/);
      return [a.name, m ? [Number(m[1]), Number(m[2])] : [16, 9]];
    })
  )
);

// Cache-busting: every page links its assets with a short content hash, so a browser holding an
// old copy fetches the new one as soon as the file changes. Line endings are normalised so the
// hash is the same on Windows checkouts and in CI.
// Fonts are binary, so their bytes are hashed as they are. site.css names them with the same ?v= as
// the preload links, so the preload and the @font-face request stay one fetch; it is rewritten
// before site.css is hashed.
const FONTS = ["fonts/jost-var.woff2", "fonts/barlow-condensed-light.woff2"];
const assetVersion = {};
for (const f of FONTS) {
  assetVersion[f] = createHash("sha256").update(await readFile(site(`assets/${f}`))).digest("hex").slice(0, 8);
}
{
  const css = await readFile(site("assets/site.css"), "utf8");
  let next = css;
  for (const f of FONTS) {
    next = next.replace(new RegExp(`url\\("${f.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(\\?v=[0-9a-f]*)?"\\)`, "g"), `url("${f}?v=${assetVersion[f]}")`);
  }
  if (next !== css) await writeFile(site("assets/site.css"), next);
}
const ASSETS = ["site.css", "radar.js", "climb.js", ...art.map((a) => a.file)];
for (const f of ASSETS) {
  const text = (await readFile(site(`assets/${f}`), "utf8")).replace(/\r\n/g, "\n");
  assetVersion[f] = createHash("sha256").update(text).digest("hex").slice(0, 8);
}
const asset = (rel, f) => `${rel}assets/${f}?v=${assetVersion[f]}`;

// Decorative art: empty alt and hidden from assistive technology; CSS places it and hides it in
// print and forced colours.
const artImg = (rel, name, cls, { lazy = false } = {}) => {
  const [w, h] = artSize[name];
  return `<img class="art ${cls}" src="${asset(rel, `art/${name}.svg`)}" alt="" aria-hidden="true" width="${w}" height="${h}" decoding="async"${lazy ? ' loading="lazy"' : ""}>`;
};

// Range lettering: the map's title is lettered in spaced capitals across the six-stage ridge, as a
// range name is lettered across a topographic sheet. The build measures the title in the title
// face (advance widths of Barlow Condensed Light, in em) so CSS can space it to the ridge's exact
// width. Titles of RANGE_MAX characters or more are set as a plain light title instead.
const RANGE_MAX = 36;
const ADVANCE = {
  A: 0.391, B: 0.443, C: 0.441, D: 0.463, E: 0.427, F: 0.399, G: 0.447, H: 0.47, I: 0.211, J: 0.419,
  K: 0.442, L: 0.388, M: 0.514, N: 0.488, O: 0.451, P: 0.436, Q: 0.439, R: 0.436, S: 0.409, T: 0.411,
  U: 0.475, V: 0.427, W: 0.606, X: 0.423, Y: 0.411, Z: 0.391, 0: 0.442, 1: 0.249, 2: 0.392, 3: 0.401,
  4: 0.397, 5: 0.401, 6: 0.402, 7: 0.355, 8: 0.418, 9: 0.395, " ": 0.2, ",": 0.169, ".": 0.181,
  "-": 0.309, "'": 0.106, "&": 0.527, ":": 0.194,
};
const rangeTitle = (text, cls = "range") => {
  const chars = [...String(text)];
  if (chars.length >= RANGE_MAX) return `<h1>${esc(text)}</h1>`;
  const tw = chars.reduce((w, c) => w + (ADVANCE[c.toUpperCase()] ?? 0.44), 0);
  return `<h1 class="${cls}" style="--tw:${tw.toFixed(3)};--tn:${chars.length}">${esc(text)}</h1>`;
};

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
// Story copy may name counts the build knows: {blips}, {sources}, {entries}, {notes}.
const fill = (s) =>
  String(s ?? "").replace(/\{(blips|sources|entries|notes)\}/g, (_, k) => String({ blips: blips.length, sources: entries.length, entries: (takes.entries || []).length, notes: notes.length }[k]));

function shortTitle(e) {
  if (plate.short?.[e.id]) return plate.short[e.id];
  const t = String(e.title).trim();
  const paren = t.match(/\(([^)]{2,32})\)\s*$/);
  if (paren && /[A-Za-z]{2}/.test(paren[1]) && !/^\d/.test(paren[1])) return paren[1];
  let s = t;
  const colon = s.indexOf(":");
  if (colon >= 3) {
    const pre = s.slice(0, colon).trim();
    const post = s.slice(colon + 1).trim();
    s = /^["“]/.test(pre) || (pre.length > 40 && post.length <= 48) ? post : pre;
  } else if (/\?\s/.test(s) && s.length > 48) {
    s = s.slice(0, s.indexOf("?") + 1);
  }
  if (s.length > 72) s = s.slice(0, s.lastIndexOf(" ", 69)) + "…";
  return s;
}
// Map bylines keep the first credit; an author list becomes "et al." (the library shows it in full).
const shortPublisher = (p) => {
  const [first, ...rest] = String(p).split(",");
  const tail = rest.join(",");
  return / and /.test(tail) && !/et al\./.test(first) ? `${first.trim()} et al.` : first.trim();
};

function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso || "");
  if (!m) return iso || "";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${m[3] ? Number(m[3]) + " " : ""}${months[Number(m[2]) - 1]} ${m[1]}`;
}

// ---------- Load and validate ----------
const stagesSrc = await loadJson(content("stages.json"));
// LIBRARY_FILE lets a preview render a different library (for example a stress test) without touching content/.
const librarySrc = await loadJson(process.env.LIBRARY_FILE || content("library.json"));
const notesSrc = await loadJson(siteData("notes.json"));
const plateSrc = await loadJson(siteData("plate.json"));
// RADAR_FILE works like LIBRARY_FILE, for previews and stress tests.
const radarSrc = await loadJson(process.env.RADAR_FILE || content("radar.json"));
const homeSrc = await loadJson(siteData("home.json"));
const takesSrc = await loadJson(siteData("takes.json"));
const storySrc = await loadJson(siteData("story.json"));

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
const illustrative = Boolean(library.illustrative);

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
for (const id of Object.keys(plate.tests || {})) if (!stageById[id]) warnings.push(`site-data/plate.json tests: unknown stage "${id}"`);
for (const s of stages) if (!plate.tests?.[s.id]) warnings.push(`site-data/plate.json tests: no test for stage "${s.id}"`);
for (const id of Object.keys(plate.short || {})) if (!seen.has(id)) warnings.push(`site-data/plate.json short: unknown entry "${id}"`);

// ---------- Radar: load and validate ----------
// Quadrant and ring ids, and their order, are fixed: the layout depends on them.
const RADAR_QUADRANTS = ["techniques", "platforms", "measures", "governance"];
const RADAR_RINGS = ["adopt", "trial", "assess", "hold"];
const MOVEMENT = { new: "New", "moved-in": "Moved in", "moved-out": "Moved out", unchanged: "No change" };
const radar = radarSrc.data;
{
  const rErr = (m) => errors.push(`${radarSrc.file}: ${m}`);
  const rWarn = (m) => warnings.push(`${radarSrc.file}: ${m}`);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(radar.edition || "")) rErr(`edition must be YYYY-MM, got "${radar.edition}"`);
  if (!radar.status) rErr("status is missing");
  const qIds = (radar.quadrants || []).map((q) => q.id).join(",");
  if (qIds !== RADAR_QUADRANTS.join(",")) rErr(`quadrants must be ${RADAR_QUADRANTS.join(", ")} in that order, got ${qIds || "none"}`);
  const rIds = (radar.rings || []).map((r) => r.id).join(",");
  if (rIds !== RADAR_RINGS.join(",")) rErr(`rings must be ${RADAR_RINGS.join(", ")} in that order, got ${rIds || "none"}`);
  for (const q of radar.quadrants || []) if (!q.name) rErr(`quadrant ${q.id}: name is missing`);
  for (const r of radar.rings || []) {
    if (!r.name) rErr(`ring ${r.id}: name is missing`);
    if (!r.meaning) rErr(`ring ${r.id}: meaning is missing`);
  }
  const blipIds = new Set();
  for (const b of radar.blips || []) {
    const at = `blip ${b.id || b.name || "?"}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.id || "")) rErr(`${at}: id must be kebab-case`);
    if (blipIds.has(b.id)) rErr(`${at}: duplicate id`);
    blipIds.add(b.id);
    if (!b.name) rErr(`${at}: name is missing`);
    if (!RADAR_QUADRANTS.includes(b.quadrant)) rErr(`${at}: unknown quadrant "${b.quadrant}"`);
    if (!RADAR_RINGS.includes(b.ring)) rErr(`${at}: unknown ring "${b.ring}"`);
    if (!MOVEMENT[b.movement]) rErr(`${at}: movement must be one of ${Object.keys(MOVEMENT).join(", ")}`);
    if (!Array.isArray(b.stages) || b.stages.length < 1 || b.stages.length > 2) rErr(`${at}: needs 1–2 stages`);
    for (const s of b.stages || []) if (!stageById[s]) rErr(`${at}: unknown stage "${s}"`);
    if (!Array.isArray(b.evidence) || b.evidence.length < 1 || b.evidence.length > 4) rErr(`${at}: needs 1–4 evidence ids`);
    for (const id of b.evidence || []) if (!seen.has(id)) rErr(`${at}: evidence "${id}" is not in the library`);
    if (!b.summary) rErr(`${at}: summary is missing`);
    else if (words(b.summary) > 30) rErr(`${at}: summary has ${words(b.summary)} words (max 30)`);
  }
  const blips = radar.blips || [];
  if (blips.length < 24 || blips.length > 40) rWarn(`${blips.length} blips (expected 24–40)`);
  for (const q of RADAR_QUADRANTS) {
    const n = blips.filter((b) => b.quadrant === q).length;
    if (n < 5) rWarn(`${q} has ${n} blips (expected at least 5)`);
  }
  const holds = blips.filter((b) => b.ring === "hold").length;
  if (holds < 3) rWarn(`hold has ${holds} blips (expected at least 3)`);
}

// ---------- Home: load and validate ----------
// Group ids and their order are fixed; names and captions can change.
const TAKE_GROUPS = ["testing", "using", "watch"];
const home = homeSrc.data;
const takes = takesSrc.data;
const story = storySrc.data;
const noteById = Object.fromEntries(notes.map((n) => [n.id, n]));
// A link is exactly one of: a radar blip, a library entry, a note, a map stage or an absolute URL.
const LINK_KINDS = ["radar", "library", "note", "stage", "href"];
function checkLinks(at, links, err) {
  if (links == null) return;
  if (!Array.isArray(links)) return err(`${at}: links must be a list`);
  for (const l of links) {
    const kinds = LINK_KINDS.filter((k) => l?.[k] != null);
    if (kinds.length !== 1) {
      err(`${at}: each link needs exactly one of ${LINK_KINDS.join(", ")}`);
      continue;
    }
    const k = kinds[0];
    if (k === "radar" && !(radar.blips || []).some((b) => b.id === l.radar)) err(`${at}: radar blip "${l.radar}" is not in ${radarSrc.file}`);
    if (k === "library" && !seen.has(l.library)) err(`${at}: library entry "${l.library}" is not in the library`);
    if (k === "note" && !noteById[l.note]) err(`${at}: note "${l.note}" is not in site-data/notes.json`);
    if (k === "stage" && !stageById[l.stage]) err(`${at}: unknown stage "${l.stage}"`);
    if (k === "href") {
      if (!/^https?:\/\//.test(l.href)) err(`${at}: href "${l.href}" must be absolute http(s)`);
      if (!l.label) err(`${at}: href "${l.href}" needs a label`);
    }
  }
}
{
  const tErr = (m) => errors.push(`${takesSrc.file}: ${m}`);
  const tWarn = (m) => warnings.push(`${takesSrc.file}: ${m}`);
  const gIds = (takes.groups || []).map((g) => g.id).join(",");
  if (gIds !== TAKE_GROUPS.join(",")) tErr(`groups must be ${TAKE_GROUPS.join(", ")} in that order, got ${gIds || "none"}`);
  for (const g of takes.groups || []) if (!g.name) tErr(`group ${g.id}: name is missing`);
  const ids = new Set();
  for (const t of takes.entries || []) {
    const at = `entry ${t.id || t.title || "?"}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id || "")) tErr(`${at}: id must be kebab-case`);
    if (ids.has(t.id)) tErr(`${at}: duplicate id`);
    ids.add(t.id);
    if (!TAKE_GROUPS.includes(t.group)) tErr(`${at}: group must be one of ${TAKE_GROUPS.join(", ")}`);
    if (!t.title) tErr(`${at}: title is missing`);
    if (!t.body) tErr(`${at}: body is missing`);
    else if (words(t.body) > 50) tErr(`${at}: body has ${words(t.body)} words (max 50)`);
    if (!/^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/.test(t.date || "")) tErr(`${at}: date must be YYYY-MM-DD or YYYY-MM, got "${t.date}"`);
    if (typeof t.confirmed !== "boolean") tWarn(`${at}: confirmed should be true or false (shown as Draft until true)`);
    checkLinks(at, t.links, tErr);
  }
  for (const g of TAKE_GROUPS) if (!(takes.entries || []).some((t) => t.group === g)) tWarn(`group ${g} has no entries`);

  const hErr = (m) => errors.push(`${homeSrc.file}: ${m}`);
  const hWarn = (m) => warnings.push(`${homeSrc.file}: ${m}`);
  for (const k of ["title", "description", "thesis", "lede", "own"]) if (!home[k]) hErr(`${k} is missing`);
  const pIds = new Set();
  for (const p of home.take?.positions || []) {
    const at = `position ${p.id || p.title || "?"}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id || "")) hErr(`${at}: id must be kebab-case`);
    if (pIds.has(p.id)) hErr(`${at}: duplicate id`);
    pIds.add(p.id);
    if (!p.title || !p.body) hErr(`${at}: title and body are required`);
    else if (words(p.body) > 80) hWarn(`${at}: body has ${words(p.body)} words (aim for 80 or fewer)`);
    checkLinks(at, p.links, hErr);
  }
  for (const w of home.work?.items || []) checkLinks(`work ${w.id}`, w.links, hErr);

  const sErr = (m) => errors.push(`${storySrc.file}: ${m}`);
  for (const k of ["map", "radar", "library", "log", "about"]) if (!story.nav?.[k]) sErr(`nav.${k} is missing`);
  for (const k of ["route", "valleys", "gear", "log", "guide"]) if (!story.home?.[k]?.heading) sErr(`home.${k}.heading is missing`);
  for (const k of Object.keys(story.home?.route?.camps || {})) if (!stageById[k]) sErr(`home.route.camps: unknown stage "${k}"`);
  for (const k of RADAR_RINGS) if (!story.rings?.[k]) sErr(`rings.${k} is missing`);
  for (const k of ["radar", "library", "log"]) if (!story.pages?.[k]?.title) sErr(`pages.${k}.title is missing`);
}

if (errors.length) {
  console.error("Content errors:\n  " + errors.join("\n  "));
  process.exit(1);
}

const primaryAt = (id) => entries.filter((e) => e.stages[0] === id);
const secondaryAt = (id) => entries.filter((e) => e.stages[1] === id);
const notesAt = (id) => notes.filter((n) => n.stage === id);
const updatedLabel = formatDate(library.updated);
const stageRange = `${stages[0].name} to ${stages[stages.length - 1].name}`;

// ---------- Radar: numbering and placement ----------
const quadById = Object.fromEntries(radar.quadrants.map((q) => [q.id, q]));
const ringById = Object.fromEntries(radar.rings.map((r) => [r.id, r]));
// Blips are numbered in the reading order of the list: quadrant, then ring, then file order.
const blips = RADAR_QUADRANTS.flatMap((q) => RADAR_RINGS.flatMap((r) => radar.blips.filter((b) => b.quadrant === q && b.ring === r))).map(
  (b, i) => ({ ...b, n: i + 1 })
);
const blipsIn = (q, r) => blips.filter((b) => b.quadrant === q && (!r || b.ring === r));
const blipsCiting = (entryId) => blips.filter((b) => b.evidence.includes(entryId));
const blipsAtStage = (stageId) => blips.filter((b) => b.stages.includes(stageId));

// Disc geometry in SVG user units. Rings narrow outward, so Adopt has room for the most blips.
const RG = {
  size: 720,
  c: 360,
  edges: [0, 175, 253, 308, 350],
  gapV: 4, // half-width of the vertical paper axis
  gapH: 13, // half-width of the horizontal paper axis, which carries the ring scale
  r: 12.5, // blip
  halo: 15.5, // radius of the movement mark
  pad: 2,
};
// Techniques top-left, platforms top-right, measures bottom-left, governance bottom-right.
const QSIGN = { techniques: [-1, -1], platforms: [1, -1], measures: [-1, 1], governance: [1, 1] };
const fnv = (s) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
};

// Spreads n blips over one ring of one quadrant: seeded best-candidate sampling (so cells
// with equal counts do not come out as mirror images), a short Lloyd relaxation to even the
// density, then a repulsion pass that opens up any pair closer than two marks apart.
// Works in local coordinates u, v >= 0 measured away from the centre.
function placeCell(n, ringIndex, seed) {
  const r0 = RG.edges[ringIndex];
  const r1 = RG.edges[ringIndex + 1];
  const m = RG.halo + RG.pad;
  const lo = r0 ? r0 + m : 0;
  const hi = r1 - m;
  const umin = RG.gapV + m;
  const vmin = RG.gapH + m;
  const ok = ([u, v]) => {
    const d = Math.hypot(u, v);
    return u >= umin && v >= vmin && d >= lo && d <= hi;
  };
  const cand = [];
  for (let u = umin; u <= hi; u += 2) for (let v = vmin; v <= hi; v += 2) if (ok([u, v])) cand.push([u, v]);
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  let state = seed || 1;
  const rand = () => {
    state = (Math.imul(state ^ (state >>> 15), 2246822519) + 0x9e3779b9) >>> 0;
    state ^= state >>> 13;
    return (state >>> 0) / 4294967296;
  };
  const pick = () => cand[Math.floor(rand() * cand.length)];
  const pts = [pick()];
  while (pts.length < n) {
    let best = null;
    let bestD = -1;
    for (let k = 0; k < 24; k++) {
      const p = pick();
      const d = Math.min(...pts.map((q) => d2(p, q)));
      if (d > bestD) [best, bestD] = [p, d];
    }
    pts.push(best);
  }
  for (let it = 0; it < 5; it++) {
    const acc = pts.map(() => [0, 0, 0]);
    for (const p of cand) {
      let j = 0;
      for (let k = 1; k < pts.length; k++) if (d2(p, pts[k]) < d2(p, pts[j])) j = k;
      acc[j][0] += p[0];
      acc[j][1] += p[1];
      acc[j][2]++;
    }
    acc.forEach(([su, sv, c], j) => {
      if (!c) return;
      let p = [su / c, sv / c];
      if (!ok(p)) p = cand.reduce((a, b) => (d2(b, p) < d2(a, p) ? b : a));
      pts[j] = p;
    });
  }
  const clamp = ([u, v]) => {
    for (let k = 0; k < 3; k++) {
      u = Math.max(u, umin);
      v = Math.max(v, vmin);
      const d = Math.hypot(u, v);
      const s = d > hi ? hi / d : d < lo ? lo / d : 1;
      u *= s;
      v *= s;
    }
    return [u, v];
  };
  const want = 2 * RG.halo + 12;
  for (let it = 0; it < 400; it++) {
    for (let i = 0; i < pts.length; i++)
      for (let k = i + 1; k < pts.length; k++) {
        const dx = pts[k][0] - pts[i][0];
        const dy = pts[k][1] - pts[i][1];
        const d = Math.hypot(dx, dy) || 0.01;
        if (d >= want) continue;
        const push = ((want - d) / d) * 0.25;
        pts[i] = [pts[i][0] - dx * push, pts[i][1] - dy * push];
        pts[k] = [pts[k][0] + dx * push, pts[k][1] + dy * push];
      }
    for (let i = 0; i < pts.length; i++) pts[i] = clamp(pts[i]);
  }
  return pts;
}

const placed = new Map(); // blip id -> { x, y, ri, j }
for (const q of RADAR_QUADRANTS) {
  const [sx, sy] = QSIGN[q];
  RADAR_RINGS.forEach((r, ri) => {
    const cell = blipsIn(q, r);
    if (!cell.length) return;
    const local = placeCell(cell.length, ri, fnv(q + r + cell.map((b) => b.id).join()));
    // Clockwise order around the centre, so numbers sweep like the radar arm.
    const abs = local
      .map(([u, v]) => ({ x: RG.c + sx * u, y: RG.c + sy * v }))
      .sort((a, b) => Math.atan2(a.y - RG.c, a.x - RG.c) - Math.atan2(b.y - RG.c, b.x - RG.c));
    let closest = Infinity;
    for (let i = 0; i < abs.length; i++)
      for (let k = i + 1; k < abs.length; k++) closest = Math.min(closest, Math.hypot(abs[i].x - abs[k].x, abs[i].y - abs[k].y));
    if (closest < 2 * RG.halo + 1)
      errors.push(`${radarSrc.file}: ${cell.length} blips in ${q} / ${r} do not fit on the disc without overlapping; move some to another ring`);
    cell.forEach((b, j) => placed.set(b.id, { ...abs[j], ri, j }));
  });
}
if (errors.length) {
  console.error("Content errors:\n  " + errors.join("\n  "));
  process.exit(1);
}

const f1 = (n) => Math.round(n * 10) / 10;
// Quarter-disc ring glyph: the ring's band is solid, the others tint. Says which ring by position, not colour.
function ringGlyph(ri) {
  const e = RG.edges.map((x) => (x / RG.edges[4]) * 15);
  const bands = RADAR_RINGS.map((_, i) => {
    const a = e[i];
    const b = e[i + 1];
    const d = a
      ? `M${f1(b + 0.5)} 15.5A${f1(b)} ${f1(b)} 0 0 0 0.5 ${f1(15.5 - b)}V${f1(15.5 - a)}A${f1(a)} ${f1(a)} 0 0 1 ${f1(a + 0.5)} 15.5Z`
      : `M${f1(b + 0.5)} 15.5A${f1(b)} ${f1(b)} 0 0 0 0.5 ${f1(15.5 - b)}V15.5Z`;
    return `<path d="${d}" class="${i === ri ? "rg-on" : "rg-off"}"/>`;
  }).join("");
  return `<svg class="rg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${bands}</svg>`;
}

// Movement marks: a full ring for new, an arc on the side facing the way the blip moved.
function markPath(movement, towardAngle) {
  const h = RG.halo;
  if (movement === "new") return `<circle class="bp-mk" r="${h}"/>`;
  if (movement === "unchanged") return "";
  const mid = movement === "moved-in" ? towardAngle : towardAngle + Math.PI;
  const span = (65 * Math.PI) / 180;
  const p = (a) => `${f1(h * Math.cos(a))} ${f1(h * Math.sin(a))}`;
  return `<path class="bp-mk bp-arc" d="M${p(mid - span)}A${h} ${h} 0 0 1 ${p(mid + span)}"/>`;
}

function blipSvg(b) {
  const p = placed.get(b.id);
  const toCentre = Math.atan2(RG.c - p.y, RG.c - p.x);
  const label = `${b.n}. ${b.name}: ${ringById[b.ring].name}, ${quadById[b.quadrant].name}`;
  return `<a class="bp" href="#blip-${esc(b.id)}" tabindex="-1" data-b="${esc(b.id)}" data-q="${b.quadrant}" style="--ri:${p.ri};--j:${p.j}"><title>${esc(label)}</title><g transform="translate(${f1(p.x)} ${f1(p.y)})">${markPath(b.movement, toCentre)}<g class="bp-g"><circle class="bp-c" r="${RG.r}"/><text class="bp-n" dy="0.36em">${b.n}</text></g></g></a>`;
}

function wrapWords(text, max) {
  const lines = [];
  for (const w of text.split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + w).length <= max) lines[lines.length - 1] = last + " " + w;
    else lines.push(w);
  }
  return lines;
}

// Rings, paper axes, the ring scale and the quadrant names. Shared by the disc and its quarter crops.
function discFrame({ corners = true } = {}) {
  const { c, edges, gapV, gapH } = RG;
  const R = edges[4];
  const fills = [...RADAR_RINGS]
    .reverse()
    .map((r) => `<circle class="rf rf-${r}" cx="${c}" cy="${c}" r="${edges[RADAR_RINGS.indexOf(r) + 1]}"/>`)
    .join("");
  const seps = edges.slice(1, 4).map((e) => `<circle class="r-sep" cx="${c}" cy="${c}" r="${e}"/>`).join("");
  const strips = `<rect class="strip" x="${c - gapV}" y="${c - R - 2}" width="${2 * gapV}" height="${2 * R + 4}"/><rect class="strip" x="${c - R - 2}" y="${c - gapH}" width="${2 * R + 4}" height="${2 * gapH}"/>`;
  const scale = [-1, 1]
    .flatMap((s) =>
      radar.rings.map((r, i) => `<text class="rl" x="${f1(c + s * ((edges[i] + edges[i + 1]) / 2))}" y="${c}" dy="0.36em">${esc(r.name.toUpperCase())}</text>`)
    )
    .join("");
  const corner = radar.quadrants
    .map((q) => {
      const [sx, sy] = QSIGN[q.id];
      const lines = wrapWords(q.name.toUpperCase(), 14);
      const count = `${blipsIn(q.id).length} blips`;
      const x = sx < 0 ? 12 : RG.size - 12;
      const lh = 18;
      const top = sy < 0 ? 26 : RG.size - 14 - lines.length * lh;
      const anchor = sx < 0 ? "start" : "end";
      const tspans = lines.map((l, i) => `<tspan x="${x}" y="${top + i * lh}">${esc(l)}</tspan>`).join("");
      return `<text class="ql${q.id === "governance" ? " ql-gov" : ""}" data-q="${q.id}" text-anchor="${anchor}">${tspans}<tspan class="qc" x="${x}" y="${top + lines.length * lh}">${count}</tspan></text>`;
    })
    .join("");
  return `<g class="frame">${fills}${seps}<circle class="r-edge" cx="${c}" cy="${c}" r="${R}"/>${strips}${scale}</g>${corners ? `<g class="corners">${corner}</g>` : ""}`;
}

function discSvg() {
  return `<svg class="disc-svg" viewBox="0 0 ${RG.size} ${RG.size}" aria-hidden="true" focusable="false">${discFrame()}<g class="blips-g">${blips.map(blipSvg).join("")}</g></svg>`;
}

// One quadrant at phone width: the same drawing, cropped to its quarter.
function cropSvg(q) {
  const [sx, sy] = QSIGN[q];
  const w = RG.c + RG.gapV;
  const h = RG.c + RG.gapH;
  const x = sx < 0 ? 0 : RG.c - RG.gapV;
  const y = sy < 0 ? 0 : RG.c - RG.gapH;
  return `<svg class="crop-svg" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true" focusable="false">${discFrame({ corners: false })}<g class="blips-g">${blipsIn(q).map(blipSvg).join("")}</g></svg>`;
}

// ---------- Shared pieces ----------
const CONTRACT = `<!--
THESIS: The map is an atlas plate of the AI lifecycle. Six stages run
  across; every curated source is one counted unit pinned below the stage where
  it matters, and its fill says whether that ground is stable, evolving or
  draft. Refuses the post list and the RFC sheet.
OWN-WORLD: White plate paper, ultramarine stage band and units, vermilion only
  for the author's own notes, black structure and hairline grid. Isotype unit
  glyphs: square rule, circle practice, triangle evidence; solid, hatched or
  open by maturity. Jost geometric lettering; system sans for reading.
STORY: Visitors see the whole route at once and where the canon is settled or
  still moving. They then open a red note or follow a unit to its library entry.
FIRST VIEWPORT: Name and nav on the margin line; the legend (caption and key)
  beside a contour corner; then the title lettered as a range name across the
  six-stage ridge, and the full-width plate. GN-0001 is the red block under Operate.
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
// year is null for living documents maintained in place.
const yearLabel = (e) => (e.year == null ? "living" : String(e.year));
const byline = (e) => `${esc(shortPublisher(e.publisher))} · ${yearLabel(e)}`;
const isVerified = (e) => Boolean(e.verified) && e.verified !== "false";

function page({ rel, current, title, description, bodyClass, main, foot = "", contract = CONTRACT, script = "", head = "" }) {
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
<link rel="preload" href="${asset(rel, "fonts/jost-var.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${asset(rel, "fonts/barlow-condensed-light.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset(rel, "site.css")}">
${script ? `<script src="${asset(rel, script)}" defer></script>\n` : ""}${head}${contract}
${GENERATED}
</head>
<body class="${bodyClass}">
<a class="skip" href="#content">Skip to content</a>
${SPRITE}
<header class="margin">
  <a class="name" href="${rel}"${cur("home")}>Rafael Gorski</a>
  <nav class="site-nav" aria-label="Site">
    <ul>
      <li><a href="${rel}map/"${cur("map")}>${esc(story.nav.map)}</a></li>
      <li><a href="${rel}radar/"${cur("radar")}>${esc(story.nav.radar)}</a></li>
      <li><a href="${rel}library/"${cur("library")}>${esc(story.nav.library)}</a></li>
      <li><a href="${rel}log/"${cur("log")}>${esc(story.nav.log)}</a></li>
      <li><a href="${rel}about/"${cur("about")}>${esc(story.nav.about)}</a></li>
    </ul>
  </nav>
</header>
<main id="content">
${main}
</main>
<footer class="foot">
  <p>© 2026 Rafael Gorski. Views are my own, not my employer's.</p>
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
// Each stage column ends with the radar blips charted there: numbered discs, as on the radar.
function radarDots(s, rel) {
  const rb = blipsAtStage(s.id);
  if (!rb.length) return "";
  return `<div class="map-radar"><p class="ghosts-l">On the radar</p><ul class="rdots" aria-label="Radar blips charted at ${esc(s.name)}">${rb
    .map((b) => {
      const label = `${b.n}. ${b.name}, ${ringById[b.ring].name}`;
      return `<li><a class="rdot" href="${rel}radar/#blip-${esc(b.id)}" title="${esc(label)}"><span aria-hidden="true">${b.n}</span><span class="vh">${esc(label)}</span></a></li>`;
    })
    .join("")}</ul></div>`;
}

function notePin(n, rel) {
  return `<a class="note-pin" href="${rel}notes/${esc(n.slug)}/">
            <span class="n-id">${esc(n.id)} · ${esc(n.status)}</span>
            <span class="n-t">${esc(n.short || n.title)}</span>
            <span class="vh">, original note</span>
          </a>`;
}

function renderMap() {
  const rel = "../";
  const cols = stages
    .map((s, c) => {
      const prim = primaryAt(s.id);
      const sec = secondaryAt(s.id);
      const test = plate.tests?.[s.id];
      const units = prim.length
        ? `<ul class="units" aria-label="Sources charted at ${esc(s.name)}">
${prim
  .map(
    (e, i) => `            <li style="--i:${i}"><a class="unit" href="${rel}library/#src-${esc(e.id)}">${glyphFor(e)}<span class="u-t">${esc(shortTitle(e))}</span><span class="u-m">${byline(e)}<span class="vh">. ${describe(e)}.</span></span></a></li>`
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
    (e) => `            <li><a class="ghost" href="${rel}library/#src-${esc(e.id)}">${glyphFor(e, " g-ghost")}<span class="u-t">${esc(shortTitle(e))}</span><span class="vh">, charted at ${esc(stageById[e.stages[0]].name)}. ${describe(e)}.</span></a></li>`
  )
  .join("\n")}${
            sec.length > GHOST_MAX
              ? `\n            <li><a class="ghost-more" href="${rel}library/#${esc(s.id)}-also">${sec.length - GHOST_MAX} more in the field guide</a></li>`
              : ""
          }
          </ul></div>`
        : "";
      return `      <li class="stage${s.id === "govern" ? " is-govern" : ""}" id="stage-${esc(s.id)}" style="--c:${c}">
        ${artImg(rel, `stage-${s.id}`, "ridge")}
        <h3 class="band"><a href="${rel}library/#${esc(s.id)}"><span class="band-n">${s.n}</span>${esc(s.name)}</a></h3>
        <p class="q">${esc(s.question)}</p>
        <div class="pins">
          ${notesAt(s.id).map((n) => notePin(n, rel)).join("\n")}
          ${units}
          ${ghosts}
          ${radarDots(s, rel)}
        </div>
        ${test ? `<p class="test"><b>${esc(test.label)}</b> ${esc(test.text)}</p>` : `<p class="test"></p>`}
      </li>`;
    })
    .join("\n");

  const main = `<div class="plate has-art">
  ${artImg(rel, "map", "art-sheet")}
  ${rangeTitle(plate.title)}
  <div class="legend">
    <p class="caption">${esc(plate.caption)}</p>
    <div class="legend-key">
      ${key()}
      <p class="edition">Edition ${esc(plate.edition)} · ${notes.length} note${notes.length === 1 ? "" : "s"}, ${entries.length} sources${updatedLabel ? ` · field guide updated ${esc(updatedLabel)}` : ""}</p>
      ${sampleNotice(rel)}
    </div>
  </div>
  <section class="route" aria-labelledby="route">
    <h2 id="route" class="vh">The route, camp by camp</h2>
    <p class="span-govern" aria-hidden="true"><span>Govern is charted last but holds from the first decision</span></p>
    <ol class="stages">
${cols}
    </ol>
    <p class="loop"><span>${esc(plate.loop)}</span></p>
  </section>
</div>`;

  return page({
    rel,
    current: "map",
    title: `${plate.title} — Rafael Gorski`,
    description: `The route for launching and scaling AI systems: ${stages.length} camps, from ${stageRange}, with original notes and curated sources pinned to the stretch where each matters.`,
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
          <p class="e-m">${esc(e.publisher)} · ${e.year == null ? "living document" : e.year}</p>
          <p class="e-k">${KINDS[e.kind].label} · ${MATURITY[e.maturity]}${other ? ` · also <a href="#${esc(other.id)}">${esc(other.name)}</a>` : ""}${isVerified(e) ? "" : ` · <span class="unverified">not yet verified</span>`}</p>
          ${onRadar(e.id)}
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
            .map((e) => `<a href="#src-${esc(e.id)}">${esc(shortTitle(e))}</a> <span class="ah-at">(${esc(stageById[e.stages[0]].name)})</span>`)
            .join(", ")}</p>`
        : "";
      const noteList = ns.length
        ? `<div class="lib-notes">${ns.map((n) => notePin(n, rel)).join("")}</div>`
        : "";
      const rb = blipsAtStage(s.id);
      const radarHere = rb.length
        ? `<p class="also-here on-radar" id="${esc(s.id)}-radar"><b>On the radar:</b> ${rb
            .map((b) => `<a href="../radar/#blip-${esc(b.id)}">${esc(b.name)}</a> <span class="ah-at">(${esc(ringById[b.ring].name)})</span>`)
            .join(", ")}</p>`
        : "";
      return `  <section class="lib-stage${s.id === "govern" ? " is-govern" : ""}" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-h">
    <div class="ls-head">
      <h2 id="${esc(s.id)}-h"><span class="band-n">${s.n}</span>${esc(s.name)}</h2>
      <p class="q">${esc(s.question)}</p>
      ${test ? `<p class="test"><b>${esc(test.label)}</b> ${esc(test.text)}</p>` : ""}
      ${noteList}
      ${artImg(rel, `stage-${s.id}`, "ridge", { lazy: true })}
    </div>
    <div class="ls-body">
    ${list}
    ${also}
    ${radarHere}
    </div>
  </section>`;
    })
    .join("\n");

  const main = `<div class="page-head lib-head has-art">
  ${artImg(rel, "library", "art-sheet")}
  ${rangeTitle(story.pages.library.title, "range range-short")}
  <div class="legend">
    <p class="caption">${esc(fill(story.pages.library.caption))}</p>
    <div class="legend-key">
      ${key({ withNotes: false })}
      ${updatedLabel ? `<p class="edition">Updated ${esc(updatedLabel)}${entries.every(isVerified) ? ". Every link, title, publisher and year checked against its source." : ""}</p>` : ""}
      ${sampleNotice(rel)}
    </div>
  </div>
  <div class="lib-ascent" aria-hidden="true">${stages.map((s) => artImg(rel, `stage-${s.id}`, "ridge")).join("")}</div>
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
    title: `${story.pages.library.title} — Rafael Gorski`,
    description: `The field guide to launching and scaling AI systems: curated sources grouped by stretch of the route, from ${stageRange}, each with why it matters and what to check.`,
    bodyClass: "is-library",
    main,
  });
}

// ---------- Radar ----------
const onRadar = (entryId) => {
  const rb = blipsCiting(entryId);
  return rb.length
    ? `<p class="e-r">On the radar: ${rb
        .map((b) => `<a href="../radar/#blip-${esc(b.id)}">${esc(b.name)}</a> <span class="ah-at">(${esc(ringById[b.ring].name)})</span>`)
        .join(", ")}</p>`
    : "";
};

const RADAR_CONTRACT = `<!--
THESIS: The radar is the plate's second reading. The map says when something
  matters; the radar says how far to rely on it. The disc stays pinned while
  the reader works down a ring-by-ring ledger. Refuses the dashboard radar and
  the borrowed Thoughtworks palette.
OWN-WORLD: Paper ground; four rings stepped in ultramarine value from Adopt out
  to Hold; paper axes, the horizontal one carrying the ring scale; numbered
  ultramarine blips; movement drawn as marks. Quadrant bands as on the map,
  Governance in ink. Jost lettering, system sans reading.
STORY: The reader sees every placement at once, reads why each sits where it
  does, and follows a blip to its evidence in the library or its stage on the map.
FIRST VIEWPORT: Margin line; the whole disc at left; at right the title as the
  summit's label, a hairline leader running to it from the disc's centre, then
  the legend (intro, ring key, edition) and the quadrant index.
FORM: Grounded structure 4 of 7 (sticky disc beside a ring-by-ring ledger);
  stagings declined; seed abd273c0.
-->`;

function markGlyph(movement, label) {
  // In the key the centre is taken to lie to the left, so "moved in" draws its arc on the left.
  return `<svg class="mk" viewBox="-19 -19 38 38" aria-hidden="true" focusable="false">${markPath(movement, Math.PI)}<circle class="bp-c" r="${RG.r}"/></svg><span><b>${label}</b>`;
}

function renderRadar() {
  const rel = "../";
  const edition = formatDate(radar.edition);
  const ringKey = radar.rings
    .map((r, i) => `<li>${ringGlyph(i)}<span><b>${esc(r.name)}</b> <span class="k-sub"><span class="k-frame">${esc(story.rings[r.id])}.</span> ${esc(r.meaning)}</span></span></li>`)
    .join("");
  const marks = [
    markGlyph("unchanged", "No change") + "</span>",
    markGlyph("new", "New") + "</span>",
    markGlyph("moved-in", "Moved in") + ` <span class="k-sub">toward ${esc(ringById.adopt.name)}</span></span>`,
    markGlyph("moved-out", "Moved out") + ` <span class="k-sub">toward ${esc(ringById.hold.name)}</span></span>`,
  ]
    .map((m) => `<li>${m}</li>`)
    .join("");
  const counts = RADAR_RINGS.map((r) => `${blips.filter((b) => b.ring === r).length} ${ringById[r].name.toLowerCase()}`).join(", ");

  const index = radar.quadrants
    .map(
      (q) =>
        `<li${q.id === "governance" ? ' class="is-gov"' : ""}><a href="#q-${q.id}"><span class="qi-name">${esc(q.name)}</span><span class="qi-c">${blipsIn(q.id).length}<span class="vh"> blips</span></span></a></li>`
    )
    .join("\n      ");

  const entry = (b) => {
    const q = quadById[b.quadrant];
    const r = ringById[b.ring];
    const say = `${b.n} · ${b.name} · ${r.name} · ${q.name}`;
    const evidence = b.evidence
      .map((id) => {
        const e = entries.find((x) => x.id === id);
        return `<li><a href="${rel}library/#src-${esc(id)}">${glyphFor(e)}<span>${esc(shortTitle(e))}<span class="vh">, ${describe(e)}</span></span></a></li>`;
      })
      .join("");
    const where = b.stages
      .map((s) => `<li><a href="${rel}map/#stage-${esc(s)}"><span class="band-n">${stageById[s].n}</span>${esc(stageById[s].name)}</a></li>`)
      .join("");
    return `        <li class="blip" id="blip-${esc(b.id)}" data-b="${esc(b.id)}" data-say="${esc(say)}">
          <span class="b-n" aria-hidden="true">${b.n}</span>
          <h4 class="b-t"><span class="vh">${b.n}. </span>${esc(b.name)}</h4>
          <p class="b-m">${esc(r.name)} · ${esc(q.name)} · ${MOVEMENT[b.movement]}</p>
          <p class="b-s">${esc(b.summary)}</p>
          <dl class="b-x">
            <div><dt>Evidence</dt><dd><ul class="b-ev">${evidence}</ul></dd></div>
            <div><dt>On the route</dt><dd><ul class="b-st">${where}</ul></dd></div>
          </dl>
        </li>`;
  };

  const sections = radar.quadrants
    .map((q) => {
      const rings = radar.rings
        .map((r, ri) => {
          const cell = blipsIn(q.id, r.id);
          return `    <div class="rr">
      <h3 class="rr-h" id="q-${q.id}-${r.id}">${ringGlyph(ri)}<span>${esc(r.name)}</span><span class="rr-c">${cell.length}<span class="vh"> blip${cell.length === 1 ? "" : "s"}</span></span></h3>
      ${
        cell.length
          ? `<ol class="blips">\n${cell.map(entry).join("\n")}\n      </ol>`
          : `<p class="empty">Nothing in ${esc(r.name)} for ${esc(q.name)} in this edition.</p>`
      }
    </div>`;
        })
        .join("\n");
      return `  <section class="rq${q.id === "governance" ? " is-gov" : ""}" id="q-${q.id}" data-q="${q.id}" aria-labelledby="q-${q.id}-h">
    <h2 class="rq-band" id="q-${q.id}-h"><span>${esc(q.name)}</span><span class="rq-c">${blipsIn(q.id).length}<span class="vh"> blips</span></span></h2>
    <p class="rq-scope">${esc(q.scope || "")}</p>
    <div class="q-crop">${cropSvg(q.id)}</div>
${rings}
  </section>`;
    })
    .join("\n");

  const main = `<div class="radar">
  <div class="radar-head">
    <h1>${esc(story.pages.radar.title)}</h1>
  </div>
  <div class="radar-legend">
    <p class="caption">${esc(fill(story.pages.radar.caption))}</p>
    <dl class="key radar-key">
      <div><dt>Ring</dt><dd><ol class="rk-rings">${ringKey}</ol></dd></div>
      <div><dt>Mark</dt><dd><ul class="rk-marks">${marks}</ul></dd></div>
    </dl>
    <p class="edition">Edition ${esc(edition)} · ${esc(radar.status)} · ${counts}. Placements are editorial judgement; the marks will show how they move between editions.</p>
  </div>
  <figure class="disc">
    <div class="disc-ground">
      ${artImg(rel, "radar", "art-apron")}
      ${discSvg()}
    </div>
    <figcaption>
      <span class="vh">The radar drawn as a disc: ${blips.length} numbered blips in four quadrants and four rings, from ${esc(ringById.adopt.name)} at the centre to ${esc(ringById.hold.name)} at the edge. Every blip is listed below with its ring, quadrant and evidence.</span>
      <span class="disc-read" aria-hidden="true">Each number matches an entry in the list. Select a blip to go to it.</span>
    </figcaption>
  </figure>
  <nav class="q-index" aria-label="Quadrants">
    <ol>
      ${index}
    </ol>
  </nav>
  <div class="ledger">
${sections}
  </div>
  <p class="radar-close">Read the same ground camp by camp on <a href="${rel}map/">the route</a>, or source by source in <a href="${rel}library/">the field guide</a>.</p>
</div>`;

  return page({
    rel,
    current: "radar",
    title: `Radar: ${story.pages.radar.title.toLowerCase()} — Rafael Gorski`,
    description: `The gear check for launching and scaling AI systems: a radar of ${blips.length} techniques, platforms, measures and governance practices, each placed from ${ringById.adopt.name.toLowerCase()} to ${ringById.hold.name.toLowerCase()} and backed by sources in the field guide.`,
    bodyClass: "is-radar",
    main,
    contract: RADAR_CONTRACT,
    script: "radar.js",
  });
}

// ---------- Home ----------
const HOME_CONTRACT = `<!--
THESIS: The home page is the expedition: one climb told top to bottom. The
  title is the summit's label, set on the route's own panorama; scrolling out
  of it climbs the route. Then the six camps in a compact list, the valleys
  where climbs stall, the gear check, the trail log and, last, the guide. Refuses the personal-site hero, the
  metro-map journey slide, the post-card list and scroll-jacking.
OWN-WORLD: The atlas plate. The route's ridge is the map's own ascent as one
  panorama in ultramarine-pale screens; camps are stage-band squares
  (Govern in ink); the route is an ink line; the guide is the one vermilion
  mark, the trail blaze, and vermilion stays his voice (camp remarks, valleys,
  trail-log bands). Paper, ink rules, Barlow Condensed Light titles, Jost
  lettering, system sans reading.
STORY: Visitors read the thesis, watch the route draw itself up the ridge
  behind it as they scroll on, read the six camps, see the named failure modes
  with their evidence, check the gear on the radar, sample the trail log, and
  meet the guide: how he leads a climb, what he builds, how to reach him.
FIRST VIEWPORT: Margin line; the thesis as a two-line light h1, its last line
  on a hairline leader to the summit of the route's panorama, which rises from
  beside the lede to the right edge; the itinerary under the panorama.
FORM: Owner-specified scroll story (v3 brief: the climb), built on the
  annotated page (grounded structure 5 of 7, seed a1f6f0ec); no new roll.
MOTION: One authored moment. As the title scrolls away, the route draws up
  the ridge behind it, each camp fills as the route reaches it, the blaze
  climbs to the summit the title names, and the nearer ridges settle a few
  percent; it is done while the summit is still on screen. The camps are
  points on the panorama: pointing, focusing or tapping one walks the blaze to
  it (eased, no bounce) and opens its callout; letting go returns to the
  scroll. Scroll-driven CSS
  (one registered number, --p) with a small first-party fallback
  (assets/climb.js). Phones, reduced motion, no JS or no support: drawn in full.
-->`;

// Copy in site-data/*.json may carry [text](url) links; everything else is escaped.
const inline = (s) => esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);

// One line of the margin: what a point links to, drawn in the reference's own marks.
function xref(l, rel) {
  if (l.radar) {
    const b = blips.find((x) => x.id === l.radar);
    return `<li><a class="x-blip" href="${rel}radar/#blip-${esc(b.id)}"><span class="x-n" aria-hidden="true">${b.n}</span><span class="x-t"><span class="vh">On the radar: </span>${esc(b.name)} <span class="x-m">· ${esc(ringById[b.ring].name)}</span></span></a></li>`;
  }
  if (l.library) {
    const e = entries.find((x) => x.id === l.library);
    return `<li><a class="x-src" href="${rel}library/#src-${esc(e.id)}">${glyphFor(e)}<span class="x-t"><span class="vh">In the field guide: </span>${esc(shortTitle(e))} <span class="x-m">· ${yearLabel(e)}</span></span></a></li>`;
  }
  if (l.note) {
    const n = noteById[l.note];
    return `<li><a class="x-note" href="${rel}notes/${esc(n.slug)}/"><span class="x-sq" aria-hidden="true"></span><span class="x-t"><span class="x-id">${esc(n.id)}</span> ${esc(n.short || n.title)}<span class="vh">, original note</span></span></a></li>`;
  }
  if (l.stage) {
    const s = stageById[l.stage];
    return `<li><a class="x-stage" href="${rel}map/#stage-${esc(s.id)}"><span class="x-sn" aria-hidden="true">${s.n}</span><span class="x-t"><span class="vh">On the route: </span>${esc(s.name)} <span class="x-m">· ${esc(s.question)}</span></span></a></li>`;
  }
  if (l.take) {
    const t = l.take;
    const say = l.label ? `${esc(l.label)}<span class="vh">: ${esc(t.title)}</span>` : `<span class="vh">In the trail log: </span>${esc(t.title)}`;
    return `<li><a class="x-take" href="${rel}log/#take-${esc(t.id)}"><span class="x-sq" aria-hidden="true"></span><span class="x-t">${say}</span></a></li>`;
  }
  return `<li><a class="x-ext" href="${esc(l.href)}"><span class="x-arrow" aria-hidden="true">↗</span><span class="x-t">${esc(l.label)}</span></a></li>`;
}
const xrefs = (links, rel) => (links?.length ? `<ul class="xref">${links.map((l) => xref(l, rel)).join("")}</ul>` : "");

// Lab notes, newest first within a group; file order breaks ties.
const takesIn = (g) =>
  (takes.entries || [])
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.group === g)
    .sort((a, b) => b.t.date.localeCompare(a.t.date) || a.i - b.i)
    .map(({ t }) => t);
const takeEntry = (t, rel, { id = true } = {}) => `          <li class="take"${id ? ` id="take-${esc(t.id)}"` : ""}>
            <h4 class="tk-t">${id ? "" : `<a href="${rel}log/#take-${esc(t.id)}">`}${esc(t.title)}${id ? "" : "</a>"}</h4>
            <p class="tk-m"><time datetime="${esc(t.date)}">${esc(formatDate(t.date))}</time>${t.confirmed === true ? "" : ' · <span class="tk-draft">Draft</span>'}</p>
            <p class="tk-b">${inline(t.body)}</p>
            ${xrefs(t.links, rel)}
          </li>`;
// The valleys: each "Watch out for" note is paired with the Hold blip it links to, and they are
// told in the order a team meets them on the route (the blip's first stage), then file order.
const stageIndex = (id) => stages.findIndex((s) => s.id === id);
const valleys = (takes.entries || [])
  .map((t, i) => ({ t, i, b: t.group === "watch" ? blips.find((b) => b.ring === "hold" && (t.links || []).some((l) => l.radar === b.id)) : null }))
  .filter(({ b }) => b)
  .sort((x, y) => stageIndex(x.b.stages[0]) - stageIndex(y.b.stages[0]) || x.i - y.i);

// The route's panorama, the ground of the home page's title: three depth bands of the ascent
// (images), with the route, its camps and the guide's trail blaze drawn over them inline so they
// can respond to scroll. --p, from 0 at the first camp to 1 on the summit, is how far up the route
// the reader is; at rest (no motion, no script, no scroll-driven animation, phones) it is 1 and the
// route is drawn in full. The summit's place (--sx, --sy, as shares of the panorama's width) lets
// CSS end the thesis's leader on it.
const climb = art.climb;
const n1 = (v) => String(Math.round(v * 10) / 10);
const routeD = climb ? climb.pts.map((p, i) => `${i ? "L" : "M"}${n1(p[0])} ${n1(p[1])}`).join("") : "";
const climbVars = () => {
  const { W, H, camps } = climb;
  const summit = camps[camps.length - 1];
  return `--ar:${(W / H).toFixed(4)};--sx:${(summit.x / W).toFixed(4)};--sy:${(summit.y / W).toFixed(4)}`;
};
function climbScene(rel) {
  const { W, H, pad, camps, length } = climb;
  const summit = camps[camps.length - 1];
  const layers = climb.bands
    .map((b) => {
      const [w, h] = artSize[`climb-${b}`];
      return `<img class="art climb-l climb-${b}" src="${asset(rel, `art/climb-${b}.svg`)}" alt="" aria-hidden="true" width="${w}" height="${h}" decoding="async">`;
    })
    .join("");
  // Each camp: an open square (the camp ahead), a solid one laid over it once the route reaches it,
  // and its name beneath.
  const marks = camps
    .map((c) => {
      const s = stageById[c.stage];
      return `<g transform="translate(${n1(c.x)} ${n1(c.y)})"><g class="cp${s.id === "govern" ? " cp-gov" : ""}" data-camp="${esc(s.id)}" style="--f:${c.f.toFixed(4)}"><g class="cp-i"><g class="cp-o"><rect x="-9.25" y="-9.25" width="18.5" height="18.5"/><text dy="0.36em">${s.n}</text></g><g class="cp-f"><rect x="-10" y="-10" width="20" height="20"/><text dy="0.36em">${s.n}</text></g><text class="cp-l" y="31">${esc(s.name.toUpperCase())}</text></g></g></g>`;
    })
    .join("");
  // The guide: a trail blaze (one stripe of vermilion between two of white) on a short staff,
  // standing where the reader has reached. It is drawn before the camps, so at a camp the camp's
  // square covers the foot of the staff.
  const blaze = `<g class="mk" style="--route: path('${routeD}')" transform="translate(${n1(summit.x)} ${n1(summit.y)})"><g class="mk-i"><line class="mk-s" x1="0" y1="0" x2="0" y2="-30"/><rect class="mk-w" x="0" y="-34" width="24" height="14"/><rect class="mk-r" x="0" y="-29.5" width="24" height="5"/></g></g>`;
  // The drawing is decorative. With climb.js the six camps (the list under the title, #camps) move
  // into .climb-points, a layer laid exactly over it, where each camp's link stands on its point.
  return `<div class="climb-scene" aria-hidden="true">
      <div class="climb-frame" style="--pad:${((H + pad) / H).toFixed(4)}">
        ${layers}
        <svg class="climb-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
          <path class="rt-plan" d="${routeD}"/>
          <path class="rt-walk" d="${routeD}" style="--len:${length.toFixed(1)}"/>
          ${blaze}
          ${marks}
        </svg>
      </div>
    </div>
      <div class="climb-points"></div>`;
}

function renderHome() {
  const rel = "./";
  // One sentence per line. The last line ends in the leader that runs out to the summit of the
  // route behind it (CSS places the panorama so its summit sits on the leader's line).
  const sentences = String(home.thesis).split(/(?<=[.!?])\s+/);
  const thesis = sentences
    .map((s, i) =>
      i === sentences.length - 1
        ? `<span class="h1-l h1-last"><span class="h1-t">${esc(s)}</span><span class="leader" aria-hidden="true"></span></span>`
        : `<span class="h1-l">${esc(s)}</span>`
    )
    .join(" ");
  const S = story.home;
  const margin = (label, say, inner) =>
    say || inner ? `<aside class="mn" aria-label="${esc(label)}">${say ? `<p class="mn-say">${inline(say)}</p>` : ""}${inner || ""}</aside>` : "";

  // The itinerary: the route card for this page.
  const total = (takes.entries || []).length;
  const itinerary = [
    ["camps", S.route.heading, `${stages.length} camps, ${stageRange}`],
    ["valleys", S.valleys.heading, `${valleys.length} failure modes`],
    ["gear", S.gear.heading, `${blips.length} items on the radar`],
    ["log", S.log.heading, `${total} entries, ${notes.length} note${notes.length === 1 ? "" : "s"}`],
    ["guide", S.guide.heading, home.take?.heading || ""],
  ]
    .map(([id, name, note]) => `<li><a href="#${id}"><span class="it-n">${esc(name)}</span><span class="it-m">${esc(note)}</span></a></li>`)
    .join("\n        ");

  // The route: the six camps. Without the script they are a compact list under the title, one row
  // each: the camp, its question, the guide's remark and where to go next. climb.js moves the list
  // onto the title's panorama, where each camp's link stands on its point (--x, --y, shares of the
  // drawing) and the rest becomes its callout.
  const camps = stages
    .map((s, i) => {
      const c = climb?.camps[i];
      const at = c ? ` data-f="${c.f.toFixed(4)}" style="--x:${(c.x / climb.W).toFixed(4)};--y:${(c.y / climb.H).toFixed(4)}"` : "";
      return `      <li class="camp${s.id === "govern" ? " is-govern" : ""}" id="camp-${esc(s.id)}"${at}>
        <h3 class="camp-band"><a class="camp-a" href="${rel}map/#stage-${esc(s.id)}"><span class="band-n">${s.n}</span>${esc(s.name)}</a></h3>
        <div class="camp-c">
          <p class="camp-n" aria-hidden="true"><span class="band-n">${s.n}</span>${esc(s.name)}</p>
          <p class="camp-q">${esc(s.question)}</p>
          ${S.route.camps?.[s.id] ? `<p class="camp-say">${inline(S.route.camps[s.id])}</p>` : ""}
          <p class="camp-go"><a href="${rel}map/#stage-${esc(s.id)}">${esc(S.route.go)}</a><span aria-hidden="true"> · </span><a href="${rel}library/#${esc(s.id)}">${primaryAt(s.id).length} sources in the field guide</a></p>
        </div>
      </li>`;
    })
    .join("\n");

  // The valleys: the failure modes, in the order a team meets them.
  const valleyList = valleys
    .map(({ t, b }) => {
      const where = b.stages.map((id) => stageById[id]);
      const loc = stages.map((s) => `<i${s.id === b.stages[0] ? ' class="on"' : b.stages.includes(s.id) ? ' class="also"' : ""}></i>`).join("");
      const links = [...(t.links || []), { take: t, label: "In the trail log" }];
      return `      <li class="valley hm" id="valley-${esc(t.id)}">
        <div class="pos-main">
          <p class="v-where"><span class="v-loc" aria-hidden="true">${loc}</span><span>At ${esc(where[0].name)}${where[1] ? ` <span class="v-also">· also ${esc(where[1].name)}</span>` : ""}</span></p>
          <h3 class="v-t">${esc(t.title)}</h3>
          <p>${inline(t.body)}</p>
        </div>
        ${margin(`Evidence for: ${t.title}`, "", xrefs(links, rel))}
      </li>`;
    })
    .join("\n");

  // Gear check: the radar's four rings as a packing list.
  const gear = radar.rings
    .map((r, ri) => {
      const list = blips.filter((b) => b.ring === r.id);
      return `      <li class="gear-r${r.id === "hold" ? " is-hold" : ""}">
        <div class="gr-h">
          <h3 class="gr-t">${ringGlyph(ri)}<span class="gr-name">${esc(r.name)}</span><span class="gr-frame">${esc(story.rings[r.id])}</span></h3>
          <p class="gr-m">${esc(r.meaning)}${r.id === "hold" && S.gear.hold ? ` <a href="#valleys">${esc(S.gear.hold)}</a>` : ""}</p>
        </div>
        <ul class="rdots" aria-label="${esc(r.name)}: ${list.length} on the radar">${list
          .map((b) => {
            const say = `${b.n}. ${b.name}`;
            return `<li><a class="rdot" href="${rel}radar/#blip-${esc(b.id)}" title="${esc(say)}"><span aria-hidden="true">${b.n}</span><span class="vh">${esc(say)}</span></a></li>`;
          })
          .join("")}</ul>
      </li>`;
    })
    .join("\n");

  // Trail log: the newest entry from the two groups the valleys don't already tell, and the notes.
  const logCols = ["testing", "using"]
    .map((gid) => {
      const g = takes.groups.find((x) => x.id === gid);
      const list = takesIn(gid);
      return `      <section class="lab-g" aria-labelledby="x-${esc(gid)}-h">
        <h3 class="lab-band" id="x-${esc(gid)}-h"><a href="${rel}log/#${esc(gid)}"><span>${esc(g.name)}</span><span class="lb-c">${list.length}<span class="vh"> entries</span></span></a></h3>
        <p class="lab-q">${esc(g.caption || "")}</p>
        <ol class="takes">
${list.slice(0, 1).map((t) => takeEntry(t, rel, { id: false })).join("\n")}
        </ol>
      </section>`;
    })
    .join("\n");
  const noteCol = `      <section class="lab-g" aria-labelledby="x-notes-h">
        <h3 class="lab-band" id="x-notes-h"><a href="${rel}log/#notes"><span>${esc(story.pages.log.notesHeading)}</span><span class="lb-c">${notes.length}<span class="vh"> notes</span></span></a></h3>
        <p class="lab-q">${esc(story.pages.log.notesIntro)}</p>
        <ol class="takes">
${notes
  .map(
    (n) => `          <li class="take">
            ${notePin(n, rel)}
            <p class="tk-m">${esc(n.dateLabel || formatDate(n.date))} · Charted at ${esc(stageById[n.stage].name)}</p>
            <p class="tk-b">${esc(n.summary)}</p>
          </li>`
  )
  .join("\n")}
        </ol>
      </section>`;

  const who = (home.who || []).map((w) => `<div><dt>${esc(w.label)}</dt><dd>${inline(w.text)}</dd></div>`).join("\n        ");
  const positions = (home.take?.positions || [])
    .map(
      (p) => `      <li class="pos hm" id="p-${esc(p.id)}">
        <div class="pos-main">
          <h4 class="pos-t">${esc(p.title)}</h4>
          <p>${inline(p.body)}</p>
        </div>
        ${margin(`Evidence for: ${p.title}`, p.say, xrefs(p.links, rel))}
      </li>`
    )
    .join("\n");
  const chain = (w) =>
    `<figure class="chain">
          <ol>${w.chain
            .map(
              (c, i) =>
                `<li style="--d:${i}"><span class="c-id">${esc(c.id)}</span><span class="c-k">${esc(c.kind)}</span><span class="c-x">${esc(c.text)}</span></li>`
            )
            .join("")}</ol>
          ${w.chainCaption ? `<figcaption>${inline(w.chainCaption)}</figcaption>` : ""}
        </figure>`;
  const work = (home.work?.items || [])
    .map(
      (w) => `    <article class="work hm" id="w-${esc(w.id)}" aria-labelledby="w-${esc(w.id)}-h">
      <div class="pos-main">
        <h4 class="pos-t" id="w-${esc(w.id)}-h">${esc(w.title)}</h4>
        <p>${inline(w.body)}</p>
        ${w.chain ? chain(w) : ""}
      </div>
      ${margin(`More on ${w.title}`, w.say, xrefs(w.links, rel))}
    </article>`
    )
    .join("\n");

  const head = (id, h, cap) => `<div class="sec-head hm">
      <h2 id="${id}-h">${esc(h)}</h2>
      ${cap ? `<p class="sec-cap">${inline(fill(cap))}</p>` : ""}
    </div>`;

  const main = `<div class="home">
  <div class="home-head hm"${climb ? ` style="${climbVars()}"` : ""}>
    <div class="summit">
      <h1>${thesis}</h1>
      ${climb ? `<div class="climb-track" aria-hidden="true"></div>\n      ${climbScene(rel)}` : ""}
    </div>
    <p class="lede">${inline(home.lede)}</p>
    <nav class="itin" aria-label="On this page">
      <ol>
        ${itinerary}
      </ol>
    </nav>
  </div>

  <section class="sec route-x" id="route" aria-labelledby="route-h">
    ${head("route", S.route.heading, S.route.intro)}
    <ol class="camps" id="camps" aria-labelledby="route-h">
${camps}
    </ol>
  </section>

  <section class="sec valleys" id="valleys" aria-labelledby="valleys-h">
    ${head("valleys", S.valleys.heading, S.valleys.intro)}
    <ol class="valley-list">
${valleyList}
    </ol>
  </section>

  <section class="sec gear" id="gear" aria-labelledby="gear-h">
    ${head("gear", S.gear.heading, S.gear.intro)}
    <ol class="gear-rings">
${gear}
    </ol>
    <p class="sec-go"><a href="${rel}radar/">${esc(S.gear.go)}</a></p>
  </section>

  <section class="sec log-x" id="log" aria-labelledby="log-h">
    ${head("log", S.log.heading, S.log.intro)}
    <div class="lab-plate">
${logCols}
${noteCol}
    </div>
    <p class="sec-go"><a href="${rel}log/">${esc(S.log.go)}</a> <span class="sec-go-m">· ${total} entries and ${notes.length} note${notes.length === 1 ? "" : "s"}</span></p>
  </section>

  <section class="sec guide" id="guide" aria-labelledby="guide-h">
    ${head("guide", S.guide.heading, S.guide.intro)}
    <div class="sub hm" id="take">
      <div class="pos-main">
        <h3 class="sub-t">${esc(home.take?.heading || "How I lead a climb")}</h3>
        ${home.take?.intro ? `<p class="sub-cap">${inline(home.take.intro)}</p>` : ""}
      </div>
      <aside class="who" aria-label="Who writes this">
        <dl>
        ${who}
        </dl>
        <p class="own">${esc(home.own)}</p>
      </aside>
    </div>
    <ol class="positions">
${positions}
    </ol>
    <div class="sub hm" id="work">
      <div class="pos-main"><h3 class="sub-t">${esc(home.work?.heading || "What I build")}</h3></div>
    </div>
${work}
    <div class="talk hm" id="conversations">
      <div class="pos-main">
        <h3 class="sub-t">${esc(home.conversations?.heading || "Conversations")}</h3>
        <p class="talk-p">${inline(home.conversations?.body || "")}</p>
      </div>
    </div>
  </section>
</div>`;

  // Old links still land: /#stage-… on the route's column, and the lab notes, which moved to the
  // trail log, on their entries there.
  const legacy = `<script>(function(h){if(/^#stage-[a-z]+$/.test(h))location.replace("map/"+h);else if(/^#(lab|testing|using|watch|take-[a-z0-9-]+)$/.test(h))location.replace("log/"+h);})(location.hash);</script>\n`;
  return page({
    rel,
    current: "home",
    title: home.title,
    description: home.description,
    bodyClass: "is-home",
    main,
    contract: HOME_CONTRACT,
    head: legacy,
    script: climb ? "climb.js" : "",
  });
}

// ---------- Trail log ----------
const LOG_CONTRACT = `<!--
THESIS: The trail log is the author's notes from the climb: short dated lab
  notes in three vermilion columns, then the long notes, each pinned to its
  camp on the route. Refuses the blog index and the post-card grid.
OWN-WORLD: The home page's voice: vermilion bands, Jost lettering, system
  sans reading; ultramarine only where a note points into the reference.
STORY: Readers see what he is testing, getting better at and would stop,
  newest first, follow any entry to its evidence, and open a long note.
FIRST VIEWPORT: Margin line; the light title beside a contour sheet corner
  with the intro as a standfirst; the three vermilion bands indexing the
  groups.
FORM: The home page's former lab plate, moved to its own page (v3).
-->`;

function renderLog() {
  const rel = "../";
  const total = (takes.entries || []).length;
  const latest = (takes.entries || []).map((t) => t.date).sort().at(-1);
  const groups = takes.groups
    .map((g) => {
      const list = takesIn(g.id);
      return `      <section class="lab-g" id="${esc(g.id)}" aria-labelledby="${esc(g.id)}-h">
        <h3 class="lab-band" id="${esc(g.id)}-h"><span>${esc(g.name)}</span><span class="lb-c">${list.length}<span class="vh"> entries</span></span></h3>
        <p class="lab-q">${esc(g.caption || "")}</p>
        ${list.length ? `<ol class="takes">\n${list.map((t) => takeEntry(t, rel)).join("\n")}\n        </ol>` : `<p class="empty">Nothing here yet.</p>`}
      </section>`;
    })
    .join("\n");
  const noteList = notes
    .map((n) => {
      const s = stageById[n.stage];
      return `      <li class="log-n hm" id="${esc(n.id.toLowerCase())}">
        <div class="pos-main">
          <p class="tk-m"><span class="x-id">${esc(n.id)}</span> · ${esc(n.status)} · <time datetime="${esc(n.date)}">${esc(n.dateLabel || formatDate(n.date))}</time></p>
          <h3 class="pos-t"><a href="${rel}notes/${esc(n.slug)}/">${esc(n.title)}</a></h3>
          <p>${esc(n.summary)}</p>
        </div>
        <aside class="mn" aria-label="Where ${esc(n.id)} sits">${notePin(n, rel)}${xrefs([{ stage: s.id }], rel)}</aside>
      </li>`;
    })
    .join("\n");

  const main = `<div class="log">
  <div class="page-head log-head has-art">
    ${artImg(rel, "notes", "art-sheet")}
    <h1>${esc(story.pages.log.title)}</h1>
    <p class="caption">${inline(home.lab?.intro || "")}</p>
    <p class="edition">${total} entries${latest ? `, the latest ${esc(formatDate(latest))}` : ""}, shown as Draft until confirmed · <a href="#notes">${notes.length} long note${notes.length === 1 ? "" : "s"}</a></p>
  </div>
  <section class="sec log-lab" id="lab" aria-labelledby="lab-h">
    <h2 id="lab-h" class="vh">${esc(home.lab?.heading || "Lab notes")}</h2>
    <div class="lab-plate">
${groups}
    </div>
  </section>
  <section class="sec log-notes" id="notes" aria-labelledby="notes-h">
    <div class="sec-head hm">
      <h2 id="notes-h">${esc(story.pages.log.notesHeading)}</h2>
      <p class="sec-cap">${inline(story.pages.log.notesIntro)}</p>
    </div>
    <ol class="log-nl">
${noteList}
    </ol>
  </section>
</div>`;

  return page({
    rel,
    current: "log",
    title: `${story.pages.log.title} — Rafael Gorski`,
    description: `Rafael Gorski's trail log: ${total} short, dated notes on what he is testing, using more effectively and would stop before production, and his long notes, each linked to its evidence.`,
    bodyClass: "is-log",
    main,
    contract: LOG_CONTRACT,
  });
}

await mkdir(site("map"), { recursive: true });
await mkdir(site("library"), { recursive: true });
await mkdir(site("radar"), { recursive: true });
await mkdir(site("log"), { recursive: true });
await writeFile(site("index.html"), renderHome());
await writeFile(site("map/index.html"), renderMap());
await writeFile(site("radar/index.html"), renderRadar());
await writeFile(site("library/index.html"), renderLibrary());
await writeFile(site("log/index.html"), renderLog());

// Hand-written pages (about, notes, 404) link the same assets; keep their versions in step.
async function htmlFiles(dir) {
  const out = [];
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (d.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const versioned = [];
for (const file of await htmlFiles(site(""))) {
  const html = await readFile(file, "utf8");
  let next = html;
  for (const f of [...ASSETS, ...FONTS]) {
    const re = new RegExp(`(assets/${f.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")})(\\?v=[0-9a-f]*)?(")`, "g");
    next = next.replace(re, `$1?v=${assetVersion[f]}$3`);
  }
  if (next !== html) {
    await writeFile(file, next);
    versioned.push(path.relative(site(""), file));
  }
}

console.log(
  `Built home, route (map), radar, field guide (library) and trail log: ${(takes.entries || []).length} lab notes (${takesSrc.file}), ${stages.length} stages, ${entries.length} sources (${librarySrc.file}), ${blips.length} blips (${radarSrc.file}, edition ${radar.edition}, ${radar.status}), ${notes.length} notes, stages from ${stagesSrc.file}.`
);
console.log(`Asset versions: ${["site.css", "radar.js", "climb.js", ...FONTS].map((f) => `${f}?v=${assetVersion[f]}`).join(", ")}${versioned.length ? ` (updated ${versioned.join(", ")})` : ""}.`);
console.log(`Art: ${art.length} SVGs in site/assets/art/, ${(art.reduce((s, a) => s + a.bytes, 0) / 1024).toFixed(1)} KB in all, largest ${art.reduce((m, a) => (a.bytes > m.bytes ? a : m)).name} at ${(Math.max(...art.map((a) => a.bytes)) / 1024).toFixed(1)} KB${art.some((a) => a.changed) ? ` (redrawn: ${art.filter((a) => a.changed).map((a) => a.name).join(", ")})` : ""}.`);
if (warnings.length) console.warn("Warnings:\n  " + warnings.join("\n  "));
