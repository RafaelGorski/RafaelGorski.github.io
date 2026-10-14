#!/usr/bin/env node
// Contour Lineage: the site's generative mountain art. Zero dependencies and deterministic, so the
// same seed always draws the same mountain. `node scripts/art.mjs` reads site-data/art.json and the
// colour tokens in site/assets/site.css, writes one static SVG per area to site/assets/art/, and
// copies the algorithm below into art/viewer.html so the explorer draws exactly what the site
// ships. scripts/build.mjs runs it before stamping asset versions. The philosophy is in art/.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

/* <core> Plain JavaScript with no imports. scripts/art.mjs copies this block verbatim into
   art/viewer.html; edit it here, never in the viewer. */

// Rysy, the highest point in Poland, in metres. Every summit is normalised to it. With the
// 50 m interval, 2,499 is 50² − 1: the 50th contour, 2,500 m, is never drawn.
const RYSY = 2499;

const ART_DEFAULTS = {
  interval: 50, // metres between contours; index contours every fifth
  floor: 1000, // the valley floor, in metres; nothing is drawn below it
  width: 0.17, // half-width of the main ridge, in sheet heights
  spurs: 8, // side ridges branching off the main ridge
  rock: 0.3, // ridged-noise crags on the high ground
  warp: 0.5, // domain warp that keeps lines from looking computed
  valley: 0.42, // share of the sheet left as valley floor
  bearing: null, // main ridge bearing in degrees; null lets the seed choose
  fadeLeft: 0.4, // the sheet falls to the valley floor toward its left edge...
  fadeBottom: 0.45, // ...and its bottom edge; top and right are neatlines
  cell: 8, // marching-squares grid, in user units
  tolerance: 0.9, // path simplification, in user units
  start: 0.34, // ascent: height of the route where it starts, as a share of the summit
  climb: 1.45, // ascent: how late the route steepens
  layers: 4, // ascent: ridgelines from the skyline to the foreground
};

function hashSeed(text) {
  let h = 0x811c9dc5;
  for (const ch of String(text)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed >>> 0 || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded 2D gradient noise in about [-1, 1].
const GRAD = Array.from({ length: 16 }, (_, k) => [Math.cos((k * Math.PI) / 8 + 0.2), Math.sin((k * Math.PI) / 8 + 0.2)]);
function makeNoise(seed) {
  const r = rng(seed);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const dot = (ix, iy, dx, dy) => {
    const g = GRAD[p[p[ix] + iy] & 15];
    return g[0] * dx + g[1] * dy;
  };
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const u = fade(xf), v = fade(yf);
    const a = dot(X, Y, xf, yf) + u * (dot(X + 1, Y, xf - 1, yf) - dot(X, Y, xf, yf));
    const b = dot(X, Y + 1, xf, yf - 1) + u * (dot(X + 1, Y + 1, xf - 1, yf - 1) - dot(X, Y + 1, xf, yf - 1));
    return (a + v * (b - a)) * 1.41;
  };
}

function fbm(n, x, y, octaves) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * n(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

// Musgrave's ridged multifractal: sharp crests that feed their own detail. About [0, 1].
function ridged(n, x, y, octaves) {
  let sum = 0, amp = 0.5, freq = 1, weight = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    let v = 1 - Math.abs(n(x * freq, y * freq));
    v *= v * weight;
    weight = Math.min(1, v * 2);
    sum += v * amp;
    norm += amp;
    freq *= 2.1;
    amp *= 0.5;
  }
  return sum / norm;
}

const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// The massif: a main ridge through the summit with side ridges branching off it, the way the
// Tatras hang their side ridges off one main ridge. Returns h(x, y) in sheet units.
function massif(seed, sx, sy, P) {
  const r = rng(seed);
  const nWarp = makeNoise(seed + 1), nBend = makeNoise(seed + 2), nRock = makeNoise(seed + 3);
  const bearing = ((P.bearing ?? (r() * 2 - 1) * 24) * Math.PI) / 180;
  const dx = Math.cos(bearing), dy = Math.sin(bearing);
  const reachA = 0.55 + r() * 0.5, reachB = 0.45 + r() * 0.5;
  const bendAmp = 0.05 + r() * 0.07;
  const bend = (t) => bendAmp * (nBend(t * 1.6 + 5.3, 0.41) - nBend(5.3, 0.41));
  const crest = (t) =>
    Math.exp(-Math.pow(Math.abs(t) / (t < 0 ? reachA : reachB), 1.35)) * (1 + 0.09 * nBend(t * 5 + 1.7, 2.3) * Math.min(1, Math.abs(t) * 6));
  const across = (q, w) => Math.exp(-Math.pow(Math.abs(q) / w, 1.1));

  const spurs = [];
  const count = Math.max(0, Math.round(P.spurs));
  let side = r() < 0.5 ? -1 : 1;
  for (let i = 0; i < count; i++) {
    const t = -reachA * 1.15 + ((i + 0.5 + (r() - 0.5) * 0.6) / count) * (reachA + reachB) * 1.15;
    side = r() < 0.8 ? -side : side;
    const lean = (t < 0 ? -1 : 1) * (0.15 + r() * 0.45);
    const px = -dy * side, py = dx * side;
    const c = crest(t);
    spurs.push({
      ox: sx + dx * t - dy * bend(t),
      oy: sy + dy * t + dx * bend(t),
      ex: px * Math.cos(lean) + dx * Math.sin(lean),
      ey: py * Math.cos(lean) + dy * Math.sin(lean),
      len: (0.24 + r() * 0.26) * (0.55 + c),
      hf: c * (0.8 + r() * 0.14),
      w: P.width * (0.5 + r() * 0.2),
      curl: (r() * 2 - 1) * 0.6,
    });
  }

  const k = 0.025;
  const terms = new Float64Array(count + 1);
  return (x, y) => {
    const wx = x + P.warp * 0.08 * fbm(nWarp, x * 2.1, y * 2.1, 2);
    const wy = y + P.warp * 0.08 * fbm(nWarp, x * 2.1 + 19.7, y * 2.1 - 7.3, 2);
    const rx = wx - sx, ry = wy - sy;
    const t = rx * dx + ry * dy;
    const off = -rx * dy + ry * dx - bend(t);
    terms[0] = crest(t) * across(off, P.width * (1 + 0.9 * Math.abs(t)));
    for (let i = 0; i < count; i++) {
      const s = spurs[i];
      const qx = wx - s.ox, qy = wy - s.oy;
      let a = qx * s.ex + qy * s.ey;
      let q = -qx * s.ey + qy * s.ex - s.curl * a * a;
      if (a < 0) {
        q = Math.hypot(qx, qy);
        a = 0;
      }
      terms[i + 1] = s.hf * Math.exp(-Math.pow(a / s.len, 1.25)) * across(q, s.w * (1 + 1.2 * a));
    }
    // Smooth union: ridges meet in sharp valleys instead of overlapping.
    let m = 0;
    for (let i = 0; i <= count; i++) m = Math.max(m, terms[i]);
    let sum = 0;
    for (let i = 0; i <= count; i++) sum += Math.exp((terms[i] - m) / k);
    let h = m + k * Math.log(sum / (count + 1));
    // Rock roughens the slopes but leaves the summit where the sheet puts it.
    const rock = P.rock * smoothstep(0.03, 0.22, Math.hypot(wx - sx, wy - sy));
    h *= 1 + rock * (ridged(nRock, wx * 4.2, wy * 4.2, 3) - 0.5);
    return h + rock * 0.04 * fbm(nRock, wx * 1.7 + 40, wy * 1.7, 3);
  };
}

// Marching squares: every isoline of `level` over a grid, stitched into polylines.
function isolines(E, nx, ny, cell, level, ox = 0, oy = 0) {
  const VOFF = nx * ny;
  const nb = new Map();
  const link = (p, q) => {
    if (!nb.has(p)) nb.set(p, []);
    if (!nb.has(q)) nb.set(q, []);
    nb.get(p).push(q);
    nb.get(q).push(p);
  };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = E[j * nx + i], b = E[j * nx + i + 1], c = E[(j + 1) * nx + i + 1], d = E[(j + 1) * nx + i];
      const code = (a >= level ? 8 : 0) | (b >= level ? 4 : 0) | (c >= level ? 2 : 0) | (d >= level ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const T = j * nx + i, B = (j + 1) * nx + i, L = VOFF + j * nx + i, R = VOFF + j * nx + i + 1;
      const centre = (a + b + c + d) / 4 >= level;
      switch (code) {
        case 1: case 14: link(L, B); break;
        case 2: case 13: link(B, R); break;
        case 3: case 12: link(L, R); break;
        case 4: case 11: link(T, R); break;
        case 6: case 9: link(T, B); break;
        case 7: case 8: link(L, T); break;
        case 5: if (centre) { link(T, L); link(B, R); } else { link(T, R); link(L, B); } break;
        case 10: if (centre) { link(T, R); link(L, B); } else { link(L, T); link(B, R); } break;
      }
    }
  }
  const at = (id) => {
    if (id < VOFF) {
      const i = id % nx, j = (id - i) / nx;
      const a = E[id], b = E[id + 1];
      return [ox + (i + (level - a) / (b - a)) * cell, oy + j * cell];
    }
    const v = id - VOFF, i = v % nx, j = (v - i) / nx;
    const a = E[v], b = E[v + nx];
    return [ox + i * cell, oy + (j + (level - a) / (b - a)) * cell];
  };
  const seen = new Set();
  const walk = (start) => {
    const ids = [start];
    seen.add(start);
    let cur = start;
    for (;;) {
      const next = nb.get(cur).find((n) => !seen.has(n));
      if (next === undefined) break;
      seen.add(next);
      ids.push(next);
      cur = next;
    }
    const closed = ids.length > 2 && nb.get(cur).includes(start);
    return { pts: ids.map(at), closed };
  };
  const lines = [];
  for (const [id, ns] of nb) if (ns.length === 1 && !seen.has(id)) lines.push(walk(id));
  for (const id of nb.keys()) if (!seen.has(id)) lines.push(walk(id));
  return lines;
}

function chaikin(pts, closed) {
  const n = pts.length;
  if (n < 3) return pts;
  const out = closed ? [] : [pts[0]];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

// Ramer–Douglas–Peucker, iterative.
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  const e2 = eps * eps;
  while (stack.length) {
    const [s, e] = stack.pop();
    const [ax, ay] = pts[s], [bx, by] = pts[e];
    const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
    let idx = -1, dmax = e2;
    for (let i = s + 1; i < e; i++) {
      const [px, py] = pts[i];
      const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
      const qx = ax + t * dx - px, qy = ay + t * dy - py;
      const d = qx * qx + qy * qy;
      if (d > dmax) {
        dmax = d;
        idx = i;
      }
    }
    if (idx >= 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

function simplify(pts, eps, closed) {
  if (!closed || pts.length < 4) return rdp(pts, eps);
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2;
    if (d > fd) {
      fd = d;
      far = i;
    }
  }
  const a = rdp(pts.slice(0, far + 1), eps);
  const b = rdp(pts.slice(far).concat([pts[0]]), eps);
  return a.slice(0, -1).concat(b.slice(0, -1));
}

const lengthOf = (pts, closed) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return closed ? L + Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]) : L;
};

// Contour every `interval` metres from the floor up to, never including, 2,500 m.
function contourField(E, nx, ny, P, ox = 0, oy = 0, top = RYSY) {
  const lines = [];
  for (let level = P.floor + P.interval; level < top; level += P.interval) {
    const index = Math.round(level / P.interval) % 5 === 0;
    for (const line of isolines(E, nx, ny, P.cell, level, ox, oy)) {
      const pts = simplify(chaikin(line.pts, line.closed), P.tolerance, line.closed);
      const L = lengthOf(pts, line.closed);
      if (L < (line.closed ? 6 : 3) * P.cell) continue;
      lines.push({ level, index, closed: line.closed, pts });
    }
  }
  return lines;
}

// Plan view: the summit seen from above, as isohypses (contour lines).
function planView(spec, P) {
  const { W, H } = spec;
  const A = W / H;
  const sx = spec.summit[0] * A, sy = spec.summit[1];
  const h = massif(spec.seed >>> 0, sx, sy, P);
  const cell = P.cell;
  const nx = Math.ceil(W / cell) + 1, ny = Math.ceil(H / cell) + 1;
  const fade = (u, v) => (spec.fade === false ? 1 : smoothstep(0, P.fadeLeft, u) * smoothstep(0, P.fadeBottom, 1 - v));
  const g = new Float64Array(nx * ny);
  let best = 0;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      g[k] = h((i * cell) / H, (j * cell) / H) * fade((i * cell) / W, (j * cell) / H);
      if (g[k] > g[best]) best = k;
    }
  }
  // The true summit may lie beyond the sheet (the 404 page); normalise to it either way.
  const atSummit = h(sx, sy) * fade(spec.summit[0], spec.summit[1]);
  const hmax = Math.max(g[best], atSummit);
  const sorted = Float64Array.from(g).sort();
  const h0 = sorted[Math.floor(P.valley * (sorted.length - 1))];
  const E = g.map((v) => P.floor + Math.max(0, (v - h0) / (hmax - h0)) * (RYSY - P.floor));
  const onSheet = g[best] >= atSummit;
  return {
    view: "plan",
    W, H,
    box: [0, 0, W, H],
    lines: contourField(E, nx, ny, P),
    summit: onSheet ? { x: (best % nx) * cell, y: Math.floor(best / nx) * cell, z: RYSY } : null,
  };
}

// Apron: the radar is the summit seen from above, its four rings the top contours. The apron
// draws the slopes falling away beyond the disc, in the disc's own units (centre 360, edge 350).
function apronView(spec, P) {
  const C = 360, R = 350, x0 = -180, size = 1080;
  const r = rng(spec.seed >>> 0);
  const n = makeNoise((spec.seed >>> 0) + 7);
  const lobes = Array.from({ length: 5 }, () => ({ th: r() * Math.PI * 2, a: 0.4 + r() * 0.6, s: 0.18 + r() * 0.25 }));
  const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const rim = 2300; // the Hold ring's edge, four 50 m steps below the summit
  const cell = P.cell;
  const nx = Math.ceil(size / cell) + 1;
  const E = new Float64Array(nx * nx);
  for (let j = 0; j < nx; j++) {
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * cell, y = x0 + j * cell;
      const s = Math.hypot(x - C, y - C) - R;
      if (s <= 0) {
        E[j * nx + i] = rim;
        continue;
      }
      const th = Math.atan2(y - C, x - C);
      let lobe = 0;
      for (const l of lobes) lobe += l.a * Math.exp(-((angDiff(th, l.th) / l.s) ** 2));
      const sEff = s * Math.max(0.35, 1 - 0.42 * lobe + P.warp * 0.7 * fbm(n, x / 260, y / 260, 3));
      E[j * nx + i] = Math.max(P.floor, rim - P.interval * Math.pow(sEff / 38, 0.86));
    }
  }
  return { view: "apron", W: size, H: size, box: [x0, x0, size, size], lines: contourField(E, nx, nx, P, x0, x0, rim), summit: null };
}

// The ascent's height field: heightAt(u, k) is the height of ridgeline k (0 is the skyline, K − 1
// the nearest foothills) at u, the share of the way along the whole route, as a share of the
// summit. Each stage shapes its own stretch from its own seed; neighbouring stretches blend.
function ascentField(spec, P) {
  const seeds = spec.stageSeeds;
  const n = seeds.length;
  const noises = seeds.map((s) => makeNoise(s >>> 0));
  const hills = makeNoise((spec.seed >>> 0) + 11);
  const us = spec.summitAt ?? 0.93;
  const climb = (u) =>
    u <= us ? P.start + (1 - P.start) * Math.pow(u / us, P.climb) : 1 - 0.32 * Math.pow((u - us) / (1 - us), 1.15);
  const blend = (u) => {
    const f = Math.min(n - 1, Math.max(0, u * n - 0.5));
    const i0 = Math.min(n - 2, Math.floor(f));
    const t = f - i0;
    const s = t * t * (3 - 2 * t);
    return [i0, 1 - s, i0 + 1, s];
  };
  const K = Math.max(1, Math.round(P.layers));
  // Far layers are granite: jagged towers and notches. Near layers are the forested foothills in
  // front of them: lower, rounder, with their own rhythm.
  const heightAt = (u, k) => {
    const [a, wa, b, wb] = blend(u);
    const near = K > 1 ? k / (K - 1) : 0;
    const freq = n * (3.2 - 1.6 * near);
    const crag = (i) => {
      const v = ridged(noises[i], u * freq + k * 5.3, k * 2.9 + 0.7, 4);
      return Math.pow(v, 1.6 - 0.5 * near) - 0.35;
    };
    const detail = wa * crag(a) + wb * crag(b);
    const c = climb(u);
    const tip = k === 0 ? 1 - Math.exp(-(((u - us) / 0.035) ** 2)) : 1;
    const z = c * (1 - 0.55 * near) + P.rock * (1.5 - 0.8 * near) * detail * (0.3 + 0.7 * c) * tip;
    const roll = near * 0.08 * fbm(hills, u * 6 + k * 3.7, k * 1.3, 3);
    return k === 0 ? Math.min(z, 1 - 0.015 * (1 - Math.exp(-(((u - us) / 0.012) ** 2)))) : z + roll;
  };
  return { heightAt, us, n, K };
}

// Ascent: the route seen from the side, climbing through the stages to the summit, cut into one
// slice per stage so the slices join when they stand side by side.
function ascentView(spec, P) {
  const { W, H } = spec; // one stage
  const { heightAt, us, n, K } = ascentField(spec, P);
  const step = 2;
  const slices = [];
  for (let s = 0; s < n; s++) {
    const xs = [];
    for (let x = 0; x < W; x += step) xs.push(x);
    xs.push(W);
    const xSummit = us * n * W - s * W;
    if (xSummit > 0 && xSummit < W) xs.push(xSummit), xs.sort((p, q) => p - q);
    const layers = [];
    for (let k = K - 1; k >= 0; k--) {
      const pts = xs.map((x) => [x, H - Math.max(0, heightAt((s * W + x) / (n * W), k)) * H * 0.9]);
      layers.push({ depth: k, pts: rdp(pts, P.tolerance * 0.35) });
    }
    slices.push({ view: "ascent", W, H, box: [0, 0, W, H], layers: layers.reverse(), stage: s });
  }
  return slices;
}

// Climb: the same ascent as one panorama, the home page's route. The ridgelines are the ascent's,
// from its seeds, and the route keeps to the skyline ridge (ridgeline 0): a little below its
// crest, so it stays on the rock, and above the next ridgeline, so nothing in front hides it. It
// follows the ridge's rises and dips, so the route has peaks and valleys of its own. Camps sit on
// the high points nearest even steps from the first camp, at the start, to the summit. The
// sheet runs `pad` units below its frame so nearer ridges can shift up without showing an edge.
function climbView(spec, P) {
  const { W, H } = spec;
  const pad = spec.pad ?? 32;
  const { heightAt, us, K } = ascentField(spec, P);
  const lift = spec.lift ?? 0.86;
  const yOf = (z) => H - Math.max(0, z) * H * lift;
  const step = 2;
  const xs = [];
  for (let x = 0; x < W; x += step) xs.push(x);
  xs.push(W);
  const xSummit = us * W;
  xs.push(xSummit);
  xs.sort((p, q) => p - q);
  const layers = [];
  for (let k = 0; k < K; k++) {
    const pts = xs.map((x) => [x, yOf(heightAt(x / W, k))]);
    layers.push({ depth: k, pts: rdp(pts, P.tolerance * 0.5) });
  }

  // The route, sampled every 1/N of the way along: below a smoothed lower envelope of the skyline
  // ridge, above a smoothed upper envelope of the ridge in front, then smoothed again so it reads
  // as a walked line with a few clear rises and dips rather than the rock's every notch.
  const N = 1200;
  const u0 = spec.start ?? 0.03;
  const at = (i) => u0 + ((us - u0) * i) / N;
  const z0 = (u) => heightAt(u, 0);
  const z1 = (u) => heightAt(u, 1);
  const env = (f, w, pick) => {
    const out = [];
    for (let i = 0; i <= N; i++) {
      let v = pick === "min" ? Infinity : -Infinity;
      for (let d = -w; d <= w; d += w / 8) {
        const z = f(Math.min(us, Math.max(0, at(i) + d)));
        v = pick === "min" ? Math.min(v, z) : Math.max(v, z);
      }
      out.push(v);
    }
    return out;
  };
  const blur = (a, r) =>
    a.map((_, i) => {
      let s = 0, c = 0;
      for (let j = Math.max(0, i - r); j <= Math.min(N, i + r); j++) s += a[j], c++;
      return s / c;
    });
  const below = blur(env(z0, 0.014, "min"), 10);
  const above = blur(env(z1, 0.01, "max"), 6);
  const target = below.map((z, i) => {
    const toTop = smoothstep(us - 0.12, us, at(i));
    return Math.max(z - 0.022 * (1 - toTop), above[i] + 0.008 * (1 - toTop));
  });
  const zs = blur(target, 14);
  const route = zs.map((z, i) => {
    const u = at(i);
    const toTop = smoothstep(us - 0.05, us, u);
    return { u, z: toTop * z0(us) + (1 - toTop) * z };
  });
  let pts = route.map(({ u, z }) => [u * W, yOf(z)]);
  pts = rdp(pts, 0.35);
  pts = chaikin(pts, false);
  const along = [0];
  for (let i = 1; i < pts.length; i++) along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const length = along.at(-1);

  // Camps: the first at the start, the last on the summit, the others on the highest point of the
  // route within `snap` of even steps between them.
  const count = spec.camps ?? 6;
  const snap = spec.snap ?? 0.035;
  const idxAt = (x) => {
    let best = 0;
    for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i][0] - x) < Math.abs(pts[best][0] - x)) best = i;
    return best;
  };
  const camps = [];
  for (let c = 0; c < count; c++) {
    let i;
    if (c === 0) i = 0;
    else if (c === count - 1) i = pts.length - 1;
    else {
      const u = u0 + ((us - u0) * c) / (count - 1);
      const a = idxAt((u - snap) * W), b = idxAt((u + snap) * W);
      i = a;
      for (let j = a; j <= b; j++) if (pts[j][1] < pts[i][1]) i = j;
    }
    camps.push({ x: pts[i][0], y: pts[i][1], f: along[i] / length });
  }
  return { view: "climb", W, H, pad, box: [0, 0, W, H + pad], layers, route: { pts, length, camps } };
}

function mix(paper, ink, share) {
  const c = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(c(paper, i) + (c(ink, i) - c(paper, i)) * share).toString(16).padStart(2, "0")).join("");
}

// Colours come from the site's tokens. Nothing is darker than ultramarine pale, so text on top
// keeps its WCAG contrast; vermilion is only the author's summit mark.
function artPalette(tokens, voice) {
  const ink = voice === "author" ? tokens.rule : tokens.ultraPale;
  return {
    paper: tokens.paper,
    contour: mix(tokens.paper, ink, 0.62),
    index: ink,
    mark: tokens.red,
    screens: [0.5, 0.66, 0.83, 1].map((s) => mix(tokens.paper, tokens.ultraPale, s)),
  };
}

const numbers = (a) => a.map((v, i) => (i && v >= 0 ? " " : "") + v).join("");
function pathData(lines) {
  let d = "";
  for (const { pts, closed } of lines) {
    let px = Math.round(pts[0][0]), py = Math.round(pts[0][1]);
    const rel = [];
    for (let i = 1; i < pts.length; i++) {
      const x = Math.round(pts[i][0]), y = Math.round(pts[i][1]);
      if (x === px && y === py) continue;
      rel.push(x - px, y - py);
      px = x;
      py = y;
    }
    if (rel.length) d += `M${Math.round(pts[0][0])} ${Math.round(pts[0][1])}l${numbers(rel)}${closed ? "z" : ""}`;
  }
  return d;
}
const f1 = (v) => String(Math.round(v * 10) / 10);

function toSVG(geom, palette, note = "") {
  const [bx, by, bw, bh] = geom.box;
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx} ${by} ${bw} ${bh}" width="${bw}" height="${bh}"${geom.view === "ascent" ? ' preserveAspectRatio="none"' : ""}>${note ? `<!-- ${note} -->` : ""}`;
  if (geom.view === "ascent") {
    const parts = geom.layers.map((l, i) => {
      const top = l.pts.map((p, j) => `${j ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join("");
      const fill = palette.screens[Math.min(palette.screens.length - 1, Math.round((i / Math.max(1, geom.layers.length - 1)) * (palette.screens.length - 1)))];
      const body = `<path fill="${fill}" d="${top}L${bw} ${bh}L0 ${bh}Z"/>`;
      return i ? body + `<path fill="none" stroke="${palette.paper}" stroke-width="1.25" stroke-linejoin="round" vector-effect="non-scaling-stroke" d="${top}"/>` : body;
    });
    return `${head}${parts.join("")}</svg>\n`;
  }
  const regular = pathData(geom.lines.filter((l) => !l.index));
  const index = pathData(geom.lines.filter((l) => l.index));
  let mark = "";
  if (geom.summit && geom.mark) {
    // A Polish trail blaze: one stripe of colour between two white ones, painted where the red
    // route reaches the top.
    const w = 22, h = 13, x = Math.round(geom.summit.x - w / 2), y = Math.round(geom.summit.y - h / 2);
    mark = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${palette.paper}" stroke="${palette.index}" stroke-width="1" vector-effect="non-scaling-stroke"/><rect x="${x}" y="${y + Math.round(h / 3)}" width="${w}" height="${h - 2 * Math.round(h / 3)}" fill="${palette.mark}"/>`;
  }
  return `${head}<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="${palette.contour}" stroke-width=".75" vector-effect="non-scaling-stroke" d="${regular}"/><path stroke="${palette.index}" stroke-width="1.3" vector-effect="non-scaling-stroke" d="${index}"/></g>${mark}</svg>\n`;
}

// One depth band of the climb panorama: the ridgelines in `depths`, each a flat screen of
// ultramarine pale (lighter the farther it is), with a paper hairline along every ridge in front
// of the skyline, as on the ascent.
function climbSVG(geom, palette, depths, note = "") {
  const [, , bw, bh] = geom.box;
  const last = geom.layers.length - 1;
  const parts = geom.layers
    .filter((l) => depths.includes(l.depth))
    .map((l) => {
      const top = l.pts.map((p, j) => `${j ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join("");
      const fill = palette.screens[Math.min(palette.screens.length - 1, Math.round((l.depth / Math.max(1, last)) * (palette.screens.length - 1)))];
      const body = `<path fill="${fill}" d="${top}L${bw} ${bh}L0 ${bh}Z"/>`;
      return l.depth ? body + `<path fill="none" stroke="${palette.paper}" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke" d="${top}"/>` : body;
    });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bw} ${bh}" width="${bw}" height="${bh}">${note ? `<!-- ${note} -->` : ""}${parts.join("")}</svg>\n`;
}

// The ascent's stage seeds: one per stage id, derived from the ascent seed unless set.
function stageSeeds(ascent, stageIds) {
  return stageIds.map((id) => ascent.stageSeeds?.[id] ?? (hashSeed(`${ascent.seed}/${id}`) % 99999) + 1);
}

// One area of the site, from its entry in site-data/art.json.
function drawArea(area, config) {
  const P = { ...ART_DEFAULTS, interval: config.interval ?? ART_DEFAULTS.interval, floor: config.floor ?? ART_DEFAULTS.floor, ...(area.params || {}) };
  if (area.view === "apron") return [apronView(area, P)];
  if (area.view === "ascent") return ascentView(area, P);
  if (area.view === "climb") return [climbView(area, P)];
  return [{ ...planView({ W: area.size[0], H: area.size[1], summit: area.summit, seed: area.seed, fade: area.fade }, P), mark: Boolean(area.mark) }];
}
/* </core> */

const here = path.dirname(fileURLToPath(import.meta.url));

function readTokens(css) {
  const t = (name) => {
    const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
    if (!m) throw new Error(`site.css has no --${name} colour`);
    return m[1].toLowerCase();
  };
  return { paper: t("paper"), ultraPale: t("ultra-pale"), rule: t("rule"), red: t("red") };
}

export async function generateArt({ root = path.resolve(here, ".."), log = false } = {}) {
  const config = JSON.parse(await readFile(path.join(root, "site-data", "art.json"), "utf8"));
  const tokens = readTokens(await readFile(path.join(root, "site", "assets", "site.css"), "utf8"));
  const stagesRaw = JSON.parse(await readFile(path.join(root, "content", "stages.json"), "utf8"));
  const stageIds = (Array.isArray(stagesRaw) ? stagesRaw : stagesRaw.stages).map((s) => s.id);
  const outDir = path.join(root, "site", "assets", "art");
  await mkdir(outDir, { recursive: true });

  const files = [];
  const emit = async (name, svg) => {
    const file = path.join(outDir, `${name}.svg`);
    const old = existsSync(file) ? await readFile(file, "utf8") : null;
    if (old !== svg) await writeFile(file, svg);
    files.push({ name, file: `art/${name}.svg`, bytes: Buffer.byteLength(svg), changed: old !== svg });
  };

  for (const [name, area] of Object.entries(config.areas)) {
    const [geom] = drawArea(area, config);
    const note = `Contour Lineage · ${name} · seed ${area.seed} · generated by scripts/art.mjs`;
    await emit(name, toSVG(geom, artPalette(tokens, area.voice), note));
  }
  const ascent = { ...config.ascent, view: "ascent", W: config.ascent.size[0], H: config.ascent.size[1] };
  ascent.stageSeeds = stageSeeds(config.ascent, stageIds);
  const slices = drawArea(ascent, config);
  for (const [i, geom] of slices.entries()) {
    const note = `Contour Lineage · ${stageIds[i]} · stage ${i + 1} of ${stageIds.length} · seeds ${config.ascent.seed}/${ascent.stageSeeds[i]} · generated by scripts/art.mjs`;
    await emit(`stage-${stageIds[i]}`, toSVG(geom, artPalette(tokens, "reference"), note));
  }

  // The home page's route: the ascent as one panorama in depth bands, plus the route and its camps
  // for scripts/build.mjs to draw over it (it is drawn inline so it can draw itself on scroll).
  if (config.climb) {
    const spec = {
      ...config.ascent,
      ...config.climb,
      view: "climb",
      W: config.climb.size[0],
      H: config.climb.size[1],
      stageSeeds: ascent.stageSeeds,
      camps: stageIds.length,
    };
    const [geom] = drawArea(spec, config);
    const palette = artPalette(tokens, "reference");
    const bands = Object.entries(config.climb.bands || { far: [0], mid: [1, 2], near: [3] });
    for (const [band, depths] of bands) {
      const note = `Contour Lineage · climb ${band} · ridgelines ${depths.join(", ")} of the ascent · seeds ${config.ascent.seed}/${ascent.stageSeeds.join("/")} · generated by scripts/art.mjs`;
      await emit(`climb-${band}`, climbSVG(geom, palette, depths, note));
    }
    files.climb = {
      W: geom.W,
      H: geom.H,
      pad: geom.pad,
      bands: bands.map(([band]) => band),
      length: geom.route.length,
      pts: geom.route.pts,
      camps: geom.route.camps.map((c, i) => ({ ...c, stage: stageIds[i] })),
    };
  }

  // Keep the explorer's copy of the algorithm, the seeds and the palette in step with the site.
  const viewer = path.join(root, "art", "viewer.html");
  if (existsSync(viewer)) {
    const source = await readFile(fileURLToPath(import.meta.url), "utf8");
    const core = source.slice(source.indexOf("/* <core>"), source.indexOf("/* </core> */") + "/* </core> */".length);
    const html = await readFile(viewer, "utf8");
    const data = `/* <data> */\nconst SITE_ART = ${JSON.stringify({ ...config, stageIds, stageSeeds: ascent.stageSeeds, tokens })};\n/* </data> */`;
    const next = html
      .replace(/\/\* <core>[\s\S]*?\/\* <\/core> \*\//, () => core)
      .replace(/\/\* <data> \*\/[\s\S]*?\/\* <\/data> \*\//, () => data);
    if (next !== html) await writeFile(viewer, next);
  }

  if (log) {
    for (const f of files) console.log(`${f.file.padEnd(26)} ${(f.bytes / 1024).toFixed(1).padStart(6)} KB${f.changed ? "" : "  (unchanged)"}`);
  }
  return files;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateArt({ log: true });
}
