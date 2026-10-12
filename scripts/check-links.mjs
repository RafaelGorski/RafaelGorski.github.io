#!/usr/bin/env node
// Checks that every internal link and fragment in the built site resolves.
// Zero dependencies: run with `node scripts/check-links.mjs [_site]`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.resolve(ROOT, process.argv[2] || "_site");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : d.name.endsWith(".html") ? [p] : [];
  });
}

const pages = walk(SITE);
const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) {
    const html = fs.readFileSync(file, "utf8");
    ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return ids.get(file);
};

const problems = [];
let checked = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const base = /<base href="\/"/.test(html) ? SITE : path.dirname(page);
  const scan = html.replace(/<base\s[^>]*>/g, "");
  const refs = [
    ...[...scan.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]),
    ...[...scan.matchAll(/http-equiv="refresh" content="\d+;\s*url=([^"]+)"/g)].map((m) => m[1]),
  ];
  for (const ref of refs) {
    if (/^(https?:|mailto:|data:|tel:)/.test(ref) || ref.startsWith("//")) continue;
    if (ref.startsWith("/")) { problems.push(`${path.relative(SITE, page)}: root-absolute link "${ref}" breaks under the project path`); continue; }
    checked++;
    const [rawPath, frag] = ref.split("#");
    let target = rawPath ? path.resolve(base, rawPath.split("?")[0]) : page;
    if (rawPath && (rawPath.endsWith("/") || rawPath === "." || rawPath === "./" || fs.existsSync(target) && fs.statSync(target).isDirectory())) {
      target = path.join(target, "index.html");
    }
    if (!fs.existsSync(target)) { problems.push(`${path.relative(SITE, page)}: "${ref}" → missing ${path.relative(SITE, target)}`); continue; }
    if (frag && target.endsWith(".html") && !idsOf(target).has(decodeURIComponent(frag))) {
      problems.push(`${path.relative(SITE, page)}: "${ref}" → no id="${frag}" in ${path.relative(SITE, target)}`);
    }
  }
}

if (problems.length) {
  console.error(`Link check failed (${problems.length}):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`Link check passed: ${checked} internal links across ${pages.length} pages.`);
