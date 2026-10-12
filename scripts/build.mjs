#!/usr/bin/env node
// Builds the static site into _site/ from content/ and static/.
// Zero dependencies: run with `node scripts/build.mjs`. Set BUILD_DATE=YYYY-MM-DD
// to pin the register's "as of" date (defaults to today, UTC).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, process.env.OUT_DIR || "_site");
const CONTENT = path.join(ROOT, "content");
const STATIC = path.join(ROOT, "static");

// Fixed contract, mirrored by content/stages.json when it exists.
const STAGE_CONTRACT = [
  { id: "frame", name: "Frame", question: "Is this worth building, and what would prove it?" },
  { id: "pilot", name: "Pilot", question: "Does it work on real data, measured honestly?" },
  { id: "launch", name: "Launch", question: "Can we ship it safely to real users?" },
  { id: "scale", name: "Scale", question: "Can it grow in users, agents and cost without losing control?" },
  { id: "operate", name: "Operate", question: "Can we see, fix and improve it in production?" },
  { id: "govern", name: "Govern", question: "Who is accountable, and can we prove it?" },
];
const KINDS = {
  standard: "Standard", specification: "Specification", regulation: "Regulation", framework: "Framework",
  paper: "Paper", book: "Book", guide: "Guide", postmortem: "Postmortem",
};
const MATURITY = { stable: "Stable", evolving: "Evolving", draft: "Draft" };
const STATUS = { open: "Open", held: "Held", revised: "Revised" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const warnings = [];
const errors = [];
const warn = (m) => warnings.push(m);
const fail = (m) => errors.push(m);

// ---------- helpers ----------
const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function parseYM(s, where) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(s));
  if (!m) { fail(`${where}: expected YYYY-MM, got "${s}"`); return { y: 1970, m: 1 }; }
  return { y: +m[1], m: +m[2] };
}
function parseDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}
const mIdx = (v) => v.y * 12 + v.m - 1;
const fromIdx = (i) => ({ y: Math.floor(i / 12), m: (i % 12) + 1 });
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const dayFrac = (d) => mIdx(d) + (d.d - 1) / daysIn(d.y, d.m);
const monthLong = (v) => `${MONTHS[v.m - 1]} ${v.y}`;
const monthShort = (v) => `${MONTHS[v.m - 1].slice(0, 3)} ${v.y}`;
const dayLong = (d) => `${d.d} ${MONTHS[d.m - 1]} ${d.y}`;
const dayShort = (d) => `${d.d} ${MONTHS[d.m - 1].slice(0, 3)} ${d.y}`;
const pad = (n) => String(n).padStart(2, "0");
const isoDay = (d) => `${d.y}-${pad(d.m)}-${pad(d.d)}`;
const isoMonth = (v) => `${v.y}-${pad(v.m)}`;
const pct = (n) => Math.round(n * 100) / 100;

function asOf() {
  const env = process.env.BUILD_DATE && parseDay(process.env.BUILD_DATE);
  if (env) return env;
  const now = new Date();
  return { y: now.getUTCFullYear(), m: now.getUTCMonth() + 1, d: now.getUTCDate() };
}

// A site path ("" is the root, "library/" a folder) as seen from a page `depth` folders deep.
function linkTo(depth, p = "") {
  const up = "../".repeat(depth);
  return up + p || "./";
}

function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// ---------- load content ----------
function loadStages() {
  const file = path.join(CONTENT, "stages.json");
  if (!fs.existsSync(file)) return STAGE_CONTRACT;
  const raw = readJSON(file);
  const list = Array.isArray(raw) ? raw : raw.stages || raw.entries || [];
  const byId = new Map(list.map((s) => [s.id, s]));
  return STAGE_CONTRACT.map((c) => {
    const s = byId.get(c.id);
    if (!s) { warn(`stages.json has no stage "${c.id}"; using the contract text`); return c; }
    const name = s.name || s.title || c.name;
    const question = s.question || c.question;
    if (name !== c.name || question !== c.question) warn(`stages.json "${c.id}" differs from the fixed contract`);
    return { id: c.id, name, question };
  });
}

function loadLibrary(stageIds) {
  const real = path.join(CONTENT, "library.json");
  const sample = path.join(CONTENT, "library.sample.json");
  const usingSample = !fs.existsSync(real);
  if (usingSample && !fs.existsSync(sample)) {
    fail("content/library.json is missing");
    return { updated: null, entries: [], illustrative: false };
  }
  const raw = readJSON(usingSample ? sample : real);
  const entries = (raw.entries || []).filter((e, i) => {
    const where = `library entry ${e.id || i}`;
    for (const k of ["id", "title", "publisher", "url", "kind", "stages", "why", "check", "maturity"]) {
      if (e[k] === undefined || e[k] === "") { fail(`${where}: missing "${k}"`); return false; }
    }
    if (!KINDS[e.kind]) fail(`${where}: unknown kind "${e.kind}"`);
    if (!MATURITY[e.maturity]) fail(`${where}: unknown maturity "${e.maturity}"`);
    if (!Array.isArray(e.stages) || e.stages.length < 1 || e.stages.length > 2) fail(`${where}: needs 1–2 stages`);
    for (const s of e.stages || []) if (!stageIds.has(s)) fail(`${where}: unknown stage "${s}"`);
    if (words(e.why) > 35) warn(`${where}: "why" is ${words(e.why)} words (max 35)`);
    if (words(e.check) > 25) warn(`${where}: "check" is ${words(e.check)} words (max 25)`);
    if (!/^https?:\/\//.test(e.url)) fail(`${where}: url must be absolute`);
    return true;
  });
  const ids = new Set();
  for (const e of entries) {
    if (ids.has(e.id)) fail(`library: duplicate id "${e.id}"`);
    ids.add(e.id);
  }
  return { updated: raw.updated, entries, illustrative: usingSample || raw.illustrative === true };
}

function loadLog(stageIds) {
  const raw = readJSON(path.join(CONTENT, "log.json"));
  const entries = (raw.entries || []).map((e) => {
    const where = `log entry ${e.id}`;
    for (const k of ["id", "slug", "topic", "title", "status", "logged", "revisit", "position", "body"]) {
      if (!e[k]) fail(`${where}: missing "${k}"`);
    }
    if (!STATUS[e.status]) fail(`${where}: unknown status "${e.status}"`);
    for (const s of e.stages || []) if (!stageIds.has(s)) fail(`${where}: unknown stage "${s}"`);
    const bodyFile = path.join(CONTENT, e.body);
    const body = fs.existsSync(bodyFile) ? fs.readFileSync(bodyFile, "utf8") : (fail(`${where}: body ${e.body} not found`), "");
    return { ...e, loggedYM: parseYM(e.logged, where), revisitYM: parseYM(e.revisit, where), verdicts: e.verdicts || [], html: body };
  });
  const preparing = (raw.preparing || []).filter((p) => {
    if (!p.title) { fail("preparing: entry without title"); return false; }
    if (p.stage && !stageIds.has(p.stage)) fail(`preparing "${p.title}": unknown stage "${p.stage}"`);
    return true;
  });
  return { entries, preparing };
}

// ---------- shared fragments ----------
function statusOf(e, today) {
  const overdue = e.status === "open" && mIdx(today) > mIdx(e.revisitYM);
  return { key: overdue ? "overdue" : e.status, label: STATUS[e.status], overdue };
}

function mark(key) {
  return `<span class="mark mark-${key}" aria-hidden="true"></span>`;
}

function stageTab(stage, depth, extra = "") {
  return `<a class="tab" href="${linkTo(depth, `library/${stage.id}/`)}"${extra}>${esc(stage.name)}</a>`;
}

function contract(lines) {
  return `<!--\n${lines.trim()}\n-->`;
}

const SITE_CONTRACT = `
THESIS: A public register of positions, not a personal publication. Each entry
  is one sentence that can turn out wrong, with stakes, evidence, what would
  change it and a revisit date; the held/revised record is the credential.
  Refuses the notes index, the portrait hero and the RFC look.
OWN-WORLD: White register stock, print black #121316, ledger ruling #cfd5de
  with column rules and a double-ruled totals line. One signing blue #2235c9
  reserved for the author's accountable acts: status, revisit dates, verdict
  lines, citations. Archivo at normal and expanded widths; mono only for code.
STORY: A leader opens a shared link, reads the position in one sentence, sees
  when it will be judged and what would overturn it, and trusts it because the
  record cannot be quietly edited.
FIRST VIEWPORT: Masthead rule; statement left, standfirst right; the register:
  number, position (link), window on a shared month axis with an as-of rule,
  status over a blank verdict line; double-ruled totals.
FORM: Grounded direction 3 of 7 ("the signed register"); staging: the record
  leads, a sticky record slip on entries; seed 7ae720f0.`;

function layout({ depth, title, description, current, main, head = "", bodyClass = "", today }) {
  const u = (p) => linkTo(depth, p);
  const nav = [
    ["positions", "", "Positions"],
    ["library", "library/", "Library"],
    ["about", "about/", "About"],
  ].map(([key, p, label]) => {
    const cur = current === key ? ' aria-current="page"' : current === `${key}:section` ? ' aria-current="true"' : "";
    return `<a href="${u(p)}"${cur}>${label}</a>`;
  }).join("\n      ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light">
<link rel="icon" href="${u("assets/favicon.svg")}" type="image/svg+xml">
<link rel="preload" href="${u("assets/fonts/archivo-roman.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u("assets/site.css")}">
${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip" href="#content">Skip to content</a>
<div class="page">
  <header class="masthead">
    <a class="name" href="${u("")}">Rafael Gorski</a>
    <nav aria-label="Site">
      ${nav}
    </nav>
  </header>
  <main id="content">
${main}
  </main>
  <footer class="colophon">
    <p>© ${today.y} Rafael Gorski. Views are the author’s own.</p>
    <p>Register as of <time datetime="${isoDay(today)}">${dayLong(today)}</time>. No tracking.</p>
  </footer>
</div>
</body>
</html>
`;
}

// ---------- the register (home) ----------
function buildAxis(entries, today) {
  const starts = entries.map((e) => mIdx(e.loggedYM));
  const ends = entries.map((e) => mIdx(e.revisitYM) + 3);
  const start = Math.min(mIdx(today), ...starts);
  const end = Math.max(mIdx(today) + 3, ...ends);
  const span = end - start;
  const x = (f) => pct(((f - start) / span) * 100);
  const ticks = [];
  for (let i = start; i <= end; i++) {
    const v = fromIdx(i);
    ticks.push({ x: x(i), major: (v.m - 1) % 3 === 0, label: monthShort(v) });
  }
  return { x, ticks, today: x(dayFrac(today)) };
}

function axisHeader(axis, today) {
  const ticks = axis.ticks.map((t) =>
    `<span class="tick${t.major ? " major" : ""}" style="--x:${t.x}">${t.major && t.x < 88 ? `<span>${t.label}</span>` : ""}</span>`).join("");
  return `<span class="axis" aria-hidden="true"><span class="asof">As of ${dayShort(today).replace(/ \d{4}$/, "")}</span>${ticks}</span>`;
}

function registerRow(e, axis, stages, today) {
  const st = statusOf(e, today);
  const a = axis.x(mIdx(e.loggedYM));
  const b = axis.x(mIdx(e.revisitYM) + 1);
  const last = e.verdicts[e.verdicts.length - 1];
  const sentence = last && last.verdict === "revised" && last.previous
    ? `<del datetime="${esc(last.date)}">${last.previous}</del> <ins datetime="${esc(last.date)}">${e.position}</ins>`
    : e.position;
  const tabs = (e.stages || []).map((id) => stageTab(stages.get(id), 0)).join(" ");
  const verdict = last
    ? `<p class="verdict is-given"><span class="verdict-line" aria-hidden="true"></span>${esc(STATUS[last.verdict])}, ${monthShort(parseYM(last.date, e.id))}</p>`
    : `<p class="verdict"><span class="verdict-line" aria-hidden="true"></span>Verdict due by ${monthShort(e.revisitYM)}</p>`;
  return `        <tr class="reg-row" data-status="${st.key}">
          <th scope="row" class="reg-no">${esc(e.id)}</th>
          <td class="reg-pos">
            <p class="reg-sentence"><a href="log/${esc(e.slug)}/">${sentence}</a></p>
            <p class="reg-meta"><span>${esc(e.topic)}</span> ${tabs}</p>
          </td>
          <td class="reg-win" style="--a:${a};--b:${b};--t:${axis.today}">
            <span class="lane" aria-hidden="true"><span class="lane-asof">As of ${dayShort(today).replace(/ \d{4}$/, "")}</span><span class="window"></span><span class="elapsed"></span><span class="due"></span></span>
            <p class="win-dates"><span class="win-logged"><span class="lbl">Logged</span> <time datetime="${e.logged}">${monthShort(e.loggedYM)}</time></span><span class="win-due"><span class="lbl">Revisit by</span> <time datetime="${e.revisit}">${monthShort(e.revisitYM)}</time></span></p>
          </td>
          <td class="reg-status">
            <p class="st">${mark(st.key)}${st.overdue ? "Open, revisit overdue" : st.label}</p>
            ${verdict}
          </td>
        </tr>`;
}

function renderHome(ctx) {
  const { log, stages, stageList, library, today } = ctx;
  const entries = [...log.entries].sort((p, q) => q.id.localeCompare(p.id));
  const axis = buildAxis(entries, today);
  const counts = { open: 0, held: 0, revised: 0, overdue: 0 };
  for (const e of entries) {
    counts[e.status] += 1;
    if (statusOf(e, today).overdue) counts.overdue += 1;
  }
  const rows = entries.length
    ? entries.map((e) => registerRow(e, axis, stages, today)).join("\n")
    : `        <tr><td colspan="4" class="reg-empty">No positions are logged yet.</td></tr>`;

  const prep = log.preparing.map((p) => `        <li>
          <span class="prep-no" aria-hidden="true">—</span>
          <span class="prep-title">${esc(p.title)}</span>
          <span class="prep-stage">${p.stage ? stageTab(stages.get(p.stage), 0) : ""}</span>
          <span class="prep-st">Not logged</span>
        </li>`).join("\n");

  const positionsByStage = new Map(stageList.map((s) => [s.id, []]));
  for (const e of entries) for (const s of e.stages || []) positionsByStage.get(s).push(e);
  const sourcesByStage = new Map(stageList.map((s) => [s.id, library.entries.filter((l) => l.stages.includes(s.id)).length]));
  const stageRows = stageList.map((s) => {
    const ps = positionsByStage.get(s.id);
    const pos = ps.length ? ps.map((e) => `<a href="log/${esc(e.slug)}/">${esc(e.id)}</a>`).join(", ") : `<span class="none">None yet</span>`;
    return `        <tr>
          <th scope="row">${stageTab(s, 0)}</th>
          <td class="q">${esc(s.question)}</td>
          <td class="pos">${pos}</td>
          <td class="num">${sourcesByStage.get(s.id)}</td>
        </tr>`;
  }).join("\n");

  const sampleNote = library.illustrative
    ? `\n      <p class="placeholder-inline"><span class="tag">Illustrative sample</span> Counts come from a six-source sample until the curated library is published.</p>`
    : "";

  const main = `    <div class="home-head">
      <h1 class="statement">Positions on launching and scaling AI, logged in public and revisited on schedule.</h1>
      <p class="standfirst">Each is one sentence with what is at stake, the evidence and what would change it. On its revisit date it is marked held or revised, and the original stays on the record.</p>
    </div>

    <section class="register-wrap" aria-label="Register of positions">
      <table class="register">
        <caption class="vh">Register of positions as of ${dayLong(today)}</caption>
        <colgroup><col class="c-no"><col class="c-pos"><col class="c-win"><col class="c-st"></colgroup>
        <thead>
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Position</th>
            <th scope="col" class="win-head" style="--t:${axis.today}"><span class="vh">Logged and revisit by</span>${axisHeader(axis, today)}</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colspan="2">Totals as of ${dayLong(today)}</th>
            <td colspan="2"><p class="totals"><span>Open<b>${counts.open}</b></span><span>Held<b>${counts.held}</b></span><span>Revised<b>${counts.revised}</b></span><span>Overdue<b>${counts.overdue}</b></span></p></td>
          </tr>
        </tfoot>
      </table>
    </section>

    <section class="sec prep" aria-labelledby="prep-h">
      <div class="sec-head">
        <h2 id="prep-h">In preparation</h2>
        <p>Working titles from the editorial plan. No number is assigned and no position is taken until an entry is logged.</p>
      </div>
      <ul class="prep-list">
${prep}
      </ul>
    </section>

    <section class="sec protocol" id="protocol" aria-labelledby="protocol-h">
      <div class="sec-head">
        <h2 id="protocol-h">How the register works</h2>
        <p>The rules are fixed before the positions are, so the record can be checked against them.</p>
      </div>
      <ol class="rules">
        <li>A position is one sentence that could turn out to be wrong.</li>
        <li>It is logged with what is at stake, the evidence and its sources, and what would change it.</li>
        <li>Its revisit date is set when it is logged, not later.</li>
        <li>At the revisit it is marked held or revised, with the reasoning. Revised wording is struck through and kept, never deleted.</li>
        <li>A position past its revisit date without a verdict is shown as overdue, automatically, on every weekly rebuild.</li>
        <li>Numbers are given in the order positions are logged and are never reused.</li>
      </ol>
      <dl class="legend">
        <div><dt>${mark("open")}Open</dt><dd>Logged and waiting for its revisit date.</dd></div>
        <div><dt>${mark("held")}Held</dt><dd>Revisited and kept, with the reasoning.</dd></div>
        <div><dt>${mark("revised")}Revised</dt><dd><del>The original wording stays on the record</del> <ins>and the new wording follows it, dated.</ins></dd></div>
        <div><dt>${mark("overdue")}Overdue</dt><dd>Past its revisit date with no verdict yet.</dd></div>
      </dl>
    </section>

    <section class="sec territory" aria-labelledby="terr-h">
      <div class="sec-head">
        <h2 id="terr-h">The evidence base</h2>
        <p>${plural(library.entries.length, "source", "sources")} behind the positions, filed by the stage of an AI program where they decide the most. <a href="library/">Open the library</a></p>
      </div>${sampleNote}
      <table class="stage-table">
        <caption class="vh">Stages of an AI program, with positions and sources for each</caption>
        <thead>
          <tr><th scope="col">Stage</th><th scope="col">The question it answers</th><th scope="col">Positions</th><th scope="col" class="num">Sources</th></tr>
        </thead>
        <tbody>
${stageRows}
        </tbody>
      </table>
    </section>`;

  write("index.html", layout({
    depth: 0, today, current: "positions", bodyClass: "is-home",
    title: "Rafael Gorski — Positions on launching and scaling AI",
    description: "A public register of positions on launching and scaling AI. Each states what is at stake, the evidence, what would change it and a date to revisit it, and is later marked held or revised.",
    head: contract(SITE_CONTRACT),
    main,
  }));
}

// ---------- entry pages ----------
function sectionsOf(html) {
  const out = [];
  const re = /<h3 id="([^"]+)">(?:<a class="self" href="#[^"]+"><span class="secno">([^<]*)<\/span>([^<]+)<\/a>|([^<]+))<\/h3>/g;
  let m;
  while ((m = re.exec(html))) out.push({ id: m[1], no: (m[2] || "").replace(/\.$/, ""), title: (m[3] || m[4]).trim() });
  return out;
}

function resolveLibrary(e, library) {
  const byId = new Map(library.entries.map((l) => [l.id, l]));
  const found = new Map();
  for (const id of e.library || []) if (byId.has(id)) found.set(id, byId.get(id));
  for (const prefix of e.libraryUrls || []) {
    for (const l of library.entries) if (l.url.startsWith(prefix)) found.set(l.id, l);
  }
  if ((e.library || []).length && !found.size) warn(`${e.id}: none of its library sources are in the current library`);
  return [...found.values()];
}

function renderEntry(e, ctx) {
  const { stages, library, today } = ctx;
  const depth = 2;
  const u = (p) => linkTo(depth, p);
  const st = statusOf(e, today);
  const sections = sectionsOf(e.html);
  const sources = resolveLibrary(e, library);
  const last = e.verdicts[e.verdicts.length - 1];

  const tabs = (e.stages || []).map((id) => stageTab(stages.get(id), depth)).join(" ");
  const toc = [
    ["stakes", "", "At stake"], ["evidence", "", "Evidence"], ["change", "", "What would change it"], ["revisit", "", "Revisit"],
  ].map(([id, n, t]) => `<li><a href="#${id}"><span class="n">${n}</span>${t}</a></li>`).join("")
    + `<li class="toc-split"><a href="#argument"><span class="n"></span>The note</a></li>`
    + sections.map((s) => `<li><a href="#${s.id}"><span class="n">${esc(s.no)}</span>${esc(s.title)}</a></li>`).join("");

  const history = [
    `<li><time datetime="${e.logged}">${monthShort(e.loggedYM)}</time><span>Logged, open</span></li>`,
    ...e.verdicts.map((v) => `<li><time datetime="${esc(v.date)}">${monthShort(parseYM(v.date, e.id))}</time><span class="ink">${esc(STATUS[v.verdict])}</span></li>`),
    e.status === "open" ? `<li class="is-due"><time datetime="${e.revisit}">${monthShort(e.revisitYM)}</time><span>Revisit due</span></li>` : "",
  ].join("");

  const libList = sources.length
    ? `<p class="lib-cite">In the library: ${sources.map((l) => `<a href="${u(`library/#${esc(l.id)}`)}">${esc(l.title)}</a> (${esc(l.publisher)})`).join("; ")}.</p>`
    : "";

  const heading = last && last.verdict === "revised" && last.previous
    ? `<del datetime="${esc(last.date)}">${last.previous}</del> <ins datetime="${esc(last.date)}">${e.position}</ins>`
    : e.position;

  const verdictBlock = last
    ? `<div class="sign is-given"><span class="sign-line" aria-hidden="true"></span><span class="sign-cap">${esc(STATUS[last.verdict])}, ${monthLong(parseYM(last.date, e.id))}. ${last.note || ""}</span></div>`
    : `<div class="sign"><span class="sign-line" aria-hidden="true"></span><span class="sign-cap">Verdict: held or revised, with the reasoning. Due by ${monthLong(e.revisitYM)}.</span></div>`;

  const main = `    <article class="entry">
      <header class="entry-head">
        <h1>${heading}</h1>
        <p class="derivation">${e.derivation || ""}</p>
      </header>

      <aside class="slip" aria-label="Record of ${esc(e.id)}">
        <p class="slip-no">${esc(e.id)}</p>
        <dl class="slip-fields">
          <div><dt>Status</dt><dd class="ink">${mark(st.key)}${st.overdue ? "Open, overdue" : st.label}</dd></div>
          <div><dt>Logged</dt><dd><time datetime="${e.logged}">${monthLong(e.loggedYM)}</time></dd></div>
          <div><dt>Revisit by</dt><dd class="ink"><time datetime="${e.revisit}">${monthLong(e.revisitYM)}</time></dd></div>
          <div><dt>Stages</dt><dd>${tabs}</dd></div>
        </dl>
        <ol class="slip-history" aria-label="History">${history}</ol>
        <nav class="slip-toc" aria-label="On this page">
          <ol>${toc}</ol>
        </nav>
      </aside>

      <div class="record">
        <section class="field" id="stakes" aria-labelledby="stakes-h">
          <h2 class="field-label" id="stakes-h">At stake</h2>
          <div class="field-body">
            <p class="field-lead">${e.stakes.lead}</p>
            <ul class="stakes">
              ${e.stakes.items.map(([h, t]) => `<li><b>${h}</b> ${t}</li>`).join("\n              ")}
            </ul>
          </div>
        </section>
        <section class="field" id="evidence" aria-labelledby="evidence-h">
          <h2 class="field-label" id="evidence-h">Evidence</h2>
          <div class="field-body">
            <ul class="evidence">
              ${e.evidence.items.map((t) => `<li>${t}</li>`).join("\n              ")}
            </ul>
            <p class="field-note">${e.evidence.sources || ""}</p>
            ${libList}
          </div>
        </section>
        <section class="field field-ink" id="change" aria-labelledby="change-h">
          <h2 class="field-label" id="change-h">What would change it</h2>
          <div class="field-body">
            <p class="field-lead">${e.change.lead}</p>
            <ol class="change">
              ${e.change.items.map((t) => `<li>${t}</li>`).join("\n              ")}
            </ol>
          </div>
        </section>
        <section class="field field-ink" id="revisit" aria-labelledby="revisit-h">
          <h2 class="field-label" id="revisit-h">Revisit by</h2>
          <div class="field-body">
            <p class="revisit-date"><time datetime="${e.revisit}">${monthLong(e.revisitYM)}</time></p>
            <p>${e.revisitCheck || ""}</p>
            ${verdictBlock}
          </div>
        </section>
      </div>

      <section class="argument" id="argument" aria-labelledby="argument-h">
        <h2 class="argument-title" id="argument-h">${esc(e.title)}</h2>
        <p class="argument-meta">The full note behind ${esc(e.id)}, logged ${monthLong(e.loggedYM)}.</p>
${e.html.split("\n").map((l) => (l ? `        ${l}` : l)).join("\n")}
      </section>
    </article>`;

  write(`log/${e.slug}/index.html`, layout({
    depth, today, current: "positions:section", bodyClass: "is-entry",
    title: `${e.id}: ${e.topic} — Rafael Gorski`,
    description: e.description || e.position,
    head: contract(`
THESIS: One position on the record: a sentence, its stakes, its evidence, what
  would change it and when it will be judged, followed by the full note it
  rests on. Refuses the blog-post template and the RFC header block.
OWN-WORLD: Inherits the signed register (see the home page contract).
STORY: The reader gets the position first, the conditions for overturning it
  second, and the argument third, with a blank verdict line waiting in public.
FIRST VIEWPORT: Sticky record slip left (number, status, dates, stages,
  history, contents); position as the H1 right, then the ruled record fields.
FORM: Grounded direction 3 of 7; staging: record leads; seed 7ae720f0.`),
    main,
  }));

  // The note's original address keeps working.
  if (e.slug === "agentic-observability") {
    write("notes/agentic-observability/index.html", `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved — Rafael Gorski</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=../../log/agentic-observability/">
</head>
<body>
<p>This note is now entry GN-0001 in the register: <a href="../../log/agentic-observability/">Agentic observability</a>.</p>
</body>
</html>
`);
  }
}

// ---------- library ----------
function citedBy(entries) {
  const map = new Map();
  for (const e of entries) for (const l of e._sources || []) {
    if (!map.has(l.id)) map.set(l.id, []);
    map.get(l.id).push(e);
  }
  return map;
}

function sourceRow(l, ctx, depth, level, cites) {
  const { stages } = ctx;
  const u = (p) => linkTo(depth, p);
  const year = l.year ? `, ${l.year}` : ", living document";
  const ver = l.verified === true ? "Verified" : typeof l.verified === "string" && parseDay(l.verified) ? dayShort(parseDay(l.verified)) : l.verified === false ? "Not yet verified" : "";
  const tabs = l.stages.map((id, i) => stageTab(stages.get(id), depth, i === 0 ? ' data-primary=""' : "")).join(" ");
  const cited = cites && cites.length
    ? `<div><dt>Cited in</dt><dd class="ink">${cites.map((e) => `<a href="${u(`log/${esc(e.slug)}/`)}">${esc(e.id)}</a>`).join(", ")}</dd></div>`
    : "";
  return `          <li class="src" id="${esc(l.id)}">
            <div class="src-file">
              <p class="src-kind">${esc(KINDS[l.kind] || l.kind)}</p>
              <p class="src-pub">${esc(l.publisher)}${year}</p>
            </div>
            <div class="src-main">
              <h${level} class="src-title"><a href="${esc(l.url)}">${esc(l.title)}</a></h${level}>
              <dl class="src-notes">
                <div><dt>Why it matters</dt><dd>${esc(l.why)}</dd></div>
                <div><dt>What to check</dt><dd>${esc(l.check)}</dd></div>
              </dl>
            </div>
            <dl class="src-meta">
              <div><dt>Maturity</dt><dd>${esc(MATURITY[l.maturity] || l.maturity)}</dd></div>
              <div><dt>Stages</dt><dd class="tabs">${tabs}</dd></div>
              ${ver ? `<div><dt>Checked</dt><dd>${ver}</dd></div>` : ""}
              ${cited}
            </dl>
          </li>`;
}

function libraryShell({ ctx, depth, current, inner, title, description }) {
  const { stageList, library, today } = ctx;
  const u = (p) => linkTo(depth, p);
  const count = (id) => library.entries.filter((l) => l.stages.includes(id)).length;
  const tabs = [
    `<a href="${u("library/")}"${current === "all" ? ' aria-current="page"' : ""}><span class="t-name">All stages</span><span class="t-count">${library.entries.length}</span></a>`,
    ...stageList.map((s) => `<a href="${u(`library/${s.id}/`)}"${current === s.id ? ' aria-current="page"' : ""}><span class="t-name">${esc(s.name)}</span><span class="t-count">${count(s.id)}</span></a>`),
  ].join("\n        ");
  const updated = parseDay(library.updated);
  const banner = library.illustrative
    ? `\n    <div class="placeholder"><span class="tag">Illustrative sample</span><p>Six real, well-known sources stand in for the curated library, which is in preparation. Entries, notes and counts on this page will change.</p></div>`
    : "";
  const main = `    <div class="lib-head">
      <h1>Library</h1>
      <p class="standfirst">The sources the positions rest on, filed by the stage of an AI program where they decide the most. Each has a reason to read it and a check an engineer can run.</p>
    </div>${banner}
    <nav class="index-tabs" aria-label="Filter the library by stage">
        ${tabs}
    </nav>
${inner}
    <p class="lib-updated">${plural(library.entries.length, "source", "sources")}${updated ? `. Library updated <time datetime="${isoDay(updated)}">${dayLong(updated)}</time>` : ""}.</p>`;
  return layout({
    depth, today, current: current === "all" ? "library" : "library:section", bodyClass: "is-library",
    title, description, main,
    head: depth === 1 ? contract(`
THESIS: The evidence base filed like a tabbed register binder: six stage tabs,
  each opening on the stage's question, then sources as ruled rows with a
  reason to read and a check to run. Refuses card grids and tag clouds.
OWN-WORLD: Inherits the signed register; index tabs on a print rule; ink only
  for back-references to positions.
STORY: The reader picks the stage they are in, reads its question, and finds
  the few sources that decide it, each with who should read it and why.
FIRST VIEWPORT: Title and standfirst; tab row; first stage question large.
FORM: Grounded direction 3 of 7; staging: index tabs, one static page per
  stage so filtering works without JavaScript; seed 7ae720f0.`) : "",
  });
}

function renderLibrary(ctx) {
  const { stageList, library, log } = ctx;
  const cites = citedBy(log.entries);
  const groups = stageList.map((s) => {
    const items = library.entries.filter((l) => l.stages[0] === s.id);
    const list = items.length
      ? `<ol class="sources">\n${items.map((l) => sourceRow(l, ctx, 1, 3, cites.get(l.id))).join("\n")}\n        </ol>`
      : `<p class="empty">No source has ${esc(s.name)} as its primary stage yet. <a href="${s.id}/">See the sources that also bear on it</a>.</p>`;
    return `    <section class="stage-group" id="stage-${s.id}" aria-labelledby="h-${s.id}">
      <header class="stage-head">
        <h2 id="h-${s.id}"><a href="${s.id}/">${esc(s.name)}</a></h2>
        <p class="question">${esc(s.question)}</p>
      </header>
        ${list}
    </section>`;
  }).join("\n");
  write("library/index.html", libraryShell({
    ctx, depth: 1, current: "all", inner: groups,
    title: "Library — Rafael Gorski",
    description: "The sources behind the positions on launching and scaling AI, filed by stage: frame, pilot, launch, scale, operate and govern.",
  }));

  for (const s of stageList) {
    const primary = library.entries.filter((l) => l.stages[0] === s.id);
    const secondary = library.entries.filter((l) => l.stages[0] !== s.id && l.stages.includes(s.id));
    const prim = primary.length
      ? `<ol class="sources">\n${primary.map((l) => sourceRow(l, ctx, 2, 3, cites.get(l.id))).join("\n")}\n      </ol>`
      : `<p class="empty">No source has ${esc(s.name)} as its primary stage yet.</p>`;
    const sec = secondary.length
      ? `\n      <h3 class="also">Also relevant to ${esc(s.name)}</h3>\n      <ol class="sources">\n${secondary.map((l) => sourceRow(l, ctx, 2, 4, cites.get(l.id))).join("\n")}\n      </ol>`
      : "";
    const inner = `    <section class="stage-group is-single" aria-labelledby="h-${s.id}">
      <header class="stage-head">
        <h2 id="h-${s.id}">${esc(s.name)}</h2>
        <p class="question">${esc(s.question)}</p>
      </header>
      ${prim}${sec}
    </section>`;
    write(`library/${s.id}/index.html`, libraryShell({
      ctx, depth: 2, current: s.id, inner,
      title: `${s.name}: ${s.question} — Library — Rafael Gorski`,
      description: `Sources for the ${s.name} stage of an AI program: ${s.question}`,
    }));
  }
}

// ---------- about and 404 ----------
function renderAbout(ctx) {
  const main = `    <div class="page-head">
      <h1>About</h1>
    </div>
    <div class="about prose">
      <h2 id="this-register">This register</h2>
      <p>Large AI programs fail less often on model quality than on the things around the model: how work is decomposed, how agents are observed, how cost and risk are governed, and how decisions made in a steering committee survive contact with production.</p>
      <p>This site keeps a public register of positions on those things. Each position is grounded in a public engineering standard or specification, says what would change it, and is revisited on a date set when it is logged. The aim is guidance an executive can act on and an engineer can check.</p>
      <p><a href="../#protocol">How the register works</a> · <a href="../library/">The library</a></p>

      <h2 id="author">The author</h2>
      <div class="placeholder">
        <span class="tag">Placeholder: replace with your bio</span>
        <p>Rafael Gorski works on large-scale AI and software systems. Add two or three sentences here on your current role, the kind of programs you lead or advise, and the background that informs this register.</p>
      </div>

      <h2 id="contact">Contact</h2>
      <p>The best way to reach me for now is through <a href="https://github.com/RafaelGorski">GitHub</a>.</p>

      <h2 id="colophon">Colophon</h2>
      <p>Set in Archivo by Omnibus-Type, served from this site under the SIL Open Font License. Built as plain HTML from data files, with no tracking and no third-party scripts.</p>
    </div>`;
  write("about/index.html", layout({
    depth: 1, today: ctx.today, current: "about", bodyClass: "is-about",
    title: "About — Rafael Gorski",
    description: "About Rafael Gorski and this public register of positions on launching and scaling AI.",
    main,
  }));
}

function render404(ctx) {
  const { today } = ctx;
  write("404.html", `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found — Rafael Gorski</title>
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light">
<base href="/">
<script>
  // GitHub Pages serves this file at any depth: point relative links at the site root,
  // under the project path today and at the domain root later.
  (function () {
    var p = "/rafaelgorski.com/";
    if (location.pathname.indexOf(p) === 0) document.querySelector("base").setAttribute("href", p);
  })();
</script>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/site.css">
</head>
<body class="is-404">
<a class="skip" href="#content">Skip to content</a>
<div class="page">
  <header class="masthead">
    <a class="name" href="./">Rafael Gorski</a>
    <nav aria-label="Site">
      <a href="./">Positions</a>
      <a href="library/">Library</a>
      <a href="about/">About</a>
    </nav>
  </header>
  <main id="content">
    <div class="nf">
      <h1>Nothing is logged at this address.</h1>
      <p>The page may have moved, or the entry may not be logged yet. Error 404.</p>
      <p class="nf-links"><a href="./">Go to the register of positions</a><a href="library/">Open the library</a></p>
    </div>
  </main>
  <footer class="colophon">
    <p>© ${today.y} Rafael Gorski. Views are the author’s own.</p>
  </footer>
</div>
</body>
</html>
`);
}

// ---------- main ----------
function main() {
  const today = asOf();
  const stageList = loadStages();
  const stageIds = new Set(stageList.map((s) => s.id));
  const stages = new Map(stageList.map((s) => [s.id, s]));
  const library = loadLibrary(stageIds);
  const log = loadLog(stageIds);
  for (const e of log.entries) e._sources = resolveLibrary(e, library);

  if (errors.length) {
    console.error(`Build failed:\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.cpSync(STATIC, OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

  const ctx = { today, stageList, stages, library, log };
  renderHome(ctx);
  for (const e of log.entries) renderEntry(e, ctx);
  renderLibrary(ctx);
  renderAbout(ctx);
  render404(ctx);

  for (const w of warnings) console.warn(`warning: ${w}`);
  console.log(`Built ${path.relative(ROOT, OUT)}/ as of ${isoDay(today)}: ${plural(log.entries.length, "position", "positions")}, ${plural(library.entries.length, "source", "sources")}${library.illustrative ? " (illustrative sample)" : ""}.`);
}

main();
