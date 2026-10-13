#!/usr/bin/env node
// Zero-dependency check that every internal link and fragment in site/ resolves.
// Run: node scripts/check-links.mjs
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "site");

async function walk(dir) {
  const out = [];
  for (const d of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...(await walk(p)));
    else if (d.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const idCache = new Map();
async function idsOf(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, "utf8");
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

const files = await walk(siteDir);
const problems = [];
let checked = 0;

for (const file of files) {
  const rel = path.relative(siteDir, file);
  // 404.html is served at arbitrary paths, so its links are root-relative; resolve them from the site root.
  const is404 = rel === "404.html";
  const html = await readFile(file, "utf8");
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:)/i.test(ref)) continue;
    checked++;
    if (ref.startsWith("/") && !is404) {
      problems.push(`${rel}: root-relative link "${ref}" breaks under a project path`);
      continue;
    }
    // Asset links carry a ?v= content hash; the file on disk is the path without it.
    const [withQuery, frag] = ref.split("#");
    const p = withQuery.split("?")[0];
    let target = file;
    if (p) {
      target = p.startsWith("/") ? path.join(siteDir, p) : path.resolve(path.dirname(file), p);
      if (p.endsWith("/") || (existsSync(target) && (await stat(target)).isDirectory())) target = path.join(target, "index.html");
      if (!existsSync(target)) {
        problems.push(`${rel}: "${ref}" → missing ${path.relative(siteDir, target)}`);
        continue;
      }
    }
    if (frag && target.endsWith(".html") && !(await idsOf(target)).has(decodeURIComponent(frag))) {
      problems.push(`${rel}: "${ref}" → no id="${frag}" in ${path.relative(siteDir, target)}`);
    }
  }
  // The map moved from / to /map/. A link whose text names the map must not land on the home page.
  for (const m of html.matchAll(/<a\s[^>]*?href="([^"#?]*)[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
    const text = m[2].replace(/<[^>]+>/g, " ");
    if (!m[1] || !/\bmap\b/i.test(text) || /^(https?:|mailto:)/i.test(m[1])) continue;
    const target = m[1].startsWith("/") ? path.join(siteDir, m[1]) : path.resolve(path.dirname(file), m[1] || ".");
    if (path.resolve(target) === siteDir || path.resolve(target) === path.join(siteDir, "index.html")) {
      problems.push(`${rel}: link "${text.replace(/\s+/g, " ").trim()}" points at the home page, not the map at map/`);
    }
  }
}

if (problems.length) {
  console.error(`Broken internal links (${problems.length}):\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log(`All ${checked} internal links and fragments resolve across ${files.length} pages.`);
