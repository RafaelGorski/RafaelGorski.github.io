// Search (site/search/): live results over site/search/index.json, written by scripts/build.mjs.
// Without JavaScript the page is the theme index the build renders, and this file does nothing.
// The matching rules repeat the build's ("Search" in scripts/build.mjs), so a theme's results and
// its line in the index always agree: words are folded to lower case without accents; a term of
// four letters or more matches the start of a word, a shorter one only a whole word.
(() => {
  const form = document.querySelector(".find-form");
  const input = form && form.querySelector('input[type="search"]');
  const status = document.getElementById("find-status");
  const out = document.getElementById("results");
  const index = document.getElementById("themes");
  if (!input || !status || !out || !window.fetch) return;

  const REL = "../";
  const STOP = new Set(["a", "an", "and", "are", "as", "at", "be", "by", "for", "how", "in", "is", "it", "its", "of", "on", "or", "the", "to", "what", "with"]);
  const WHERE = { note: "", pos: "On the home page: ", take: "In the trail log: ", blip: "On the radar: ", src: "In the field guide: ", stage: "On the route: " };
  const CLS = { note: "x-note", pos: "x-take", take: "x-take", blip: "x-blip", src: "x-src", stage: "x-stage" };
  const SECTIONS_SHOWN = 4;

  const fold = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const alt = (t) => (t.length >= 4 ? reEsc(t) : `${reEsc(t)}s?(?=$|[^a-z0-9])`);
  const termsRe = (terms, flags) => new RegExp(`(^|[^a-z0-9])(${terms.map(alt).join("|")})`, flags || "");
  // A typed word loses a plural or verb ending, so "evals" finds "evaluation" and "tests" finds "testing".
  const stem = (w) => {
    for (const s of ["ings", "ing", "ies", "ied", "ed", "es", "s"]) {
      if (w.endsWith(s) && w.length - s.length >= 4 && !(s === "s" && /(ss|us|is)$/.test(w))) return w.slice(0, -s.length);
    }
    return w;
  };

  let data = null;
  let current = "";
  let statusTimer = 0;

  const themeFor = (q) => {
    const s = stem(q);
    return data.themes.find((t) => [t.id, t.name].concat(t.also).some((a) => fold(a) === q || stem(fold(a)) === s));
  };

  // A query is a list of groups; a record matches when every group matches. A theme's name, id or
  // one of its "also" words stands for all of its terms.
  function parse(raw) {
    const q = fold(raw).replace(/\s+/g, " ").trim();
    if (!q) return null;
    const theme = themeFor(q);
    if (theme) return { theme, groups: [theme.terms] };
    const words = q.split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));
    return {
      theme: null,
      groups: words.map((w) => {
        const th = themeFor(w);
        return th ? [stem(w)].concat(th.terms.filter((t) => t !== stem(w))) : [stem(w)];
      }),
    };
  }

  function prepare(d) {
    for (const r of d.records) {
      r._t = fold([r.t, r.a].filter(Boolean).join(" "));
      r._h = fold([r.t, r.a, r.x, r.h].filter(Boolean).join(" "));
      for (const s of r.s || []) s._h = fold(`${s.t} ${s.x}`);
      r._all = [r._h].concat((r.s || []).map((s) => s._h)).join(" ");
    }
    d.themes.forEach((t) => (t.also = t.also || []));
    return d;
  }

  function search(p) {
    const res = p.groups.map((g) => termsRe(g));
    if (!res.length) return [];
    const hits = [];
    data.records.forEach((r, i) => {
      if (!res.every((re) => re.test(r._all))) return;
      const secs = (r.s || [])
        .map((s) => ({ s, c: res.filter((re) => re.test(s._h)).length }))
        .filter((x) => x.c)
        .sort((a, b) => b.c - a.c)
        .map((x) => x.s);
      let score = Math.min(secs.length, 3);
      for (const re of res) score += re.test(r._t) ? 3 : re.test(r._h) ? 1 : 0;
      hits.push({ r, secs, own: res.some((re) => re.test(r._h)), score, i });
    });
    return hits.sort((a, b) => b.score - a.score || a.i - b.i);
  }

  // Marks every matched word in full, so "eval" lights the whole of "evaluation".
  function hl(text, re) {
    const t = String(text == null ? "" : text);
    const f = fold(t);
    if (!re || f.length !== t.length) return esc(t);
    let html = "";
    let last = 0;
    re.lastIndex = 0;
    for (const m of f.matchAll(re)) {
      const start = m.index + m[1].length;
      if (start < last) continue;
      let end = start + m[2].length;
      while (end < f.length && /[a-z0-9]/.test(f[end])) end++;
      html += `${esc(t.slice(last, start))}<mark>${esc(t.slice(start, end))}</mark>`;
      last = end;
    }
    return html + esc(t.slice(last));
  }

  function snip(text, re, max) {
    const t = String(text == null ? "" : text);
    if (t.length <= max) return hl(t, re);
    re.lastIndex = 0;
    const m = re.exec(fold(t));
    const at = m ? m.index + m[1].length : 0;
    let s = Math.max(0, at - 70);
    if (s > 0) {
      const sp = t.indexOf(" ", s);
      if (sp >= 0 && sp < at) s = sp + 1;
    }
    let e = Math.min(t.length, s + max);
    if (e < t.length) {
      const sp = t.lastIndexOf(" ", e);
      if (sp > at) e = sp;
    }
    return `${s > 0 ? "… " : ""}${hl(t.slice(s, e), re)}${e < t.length ? " …" : ""}`;
  }

  // The words the query actually found, most frequent first, for the status line.
  function foundWords(hits, re) {
    const n = new Map();
    for (const { r } of hits) {
      re.lastIndex = 0;
      for (const m of r._all.matchAll(re)) {
        const start = m.index + m[1].length;
        let end = start + m[2].length;
        while (end < r._all.length && /[a-z0-9-]/.test(r._all[end])) end++;
        const w = r._all.slice(start, end).replace(/-+$/, "");
        n.set(w, (n.get(w) || 0) + 1);
      }
    }
    return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([w]) => w);
  }

  function mark(r) {
    if (r.k === "blip") return `<span class="x-n" aria-hidden="true">${esc(r.n)}</span>`;
    if (r.k === "stage") return `<span class="x-sn" aria-hidden="true">${esc(r.n)}</span>`;
    if (r.k === "src") return `<svg class="g" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#g-${esc(r.g)}"/></svg>`;
    return '<span class="x-sq" aria-hidden="true"></span>';
  }

  function line({ r, secs, own }, re) {
    const meta = r.k === "stage" ? r.x : r.m;
    const title =
      r.k === "note"
        ? `<span class="x-id">${esc(r.id)}</span> ${hl(r.a, re)}<span class="vh">, original note</span>`
        : `<span class="vh">${WHERE[r.k]}</span>${hl(r.t, re)}`;
    let html = `<li class="fr"><a class="${CLS[r.k]}" href="${REL}${esc(r.u)}">${mark(r)}<span class="x-t">${title}${meta ? ` <span class="x-m">· ${esc(meta)}</span>` : ""}</span></a>`;
    if (r.k !== "stage" && r.x && (own || r.k !== "note")) html += `<p class="fr-x">${snip(r.x, re, 220)}</p>`;
    if (secs.length) {
      html += `<ul class="fr-secs">${secs
        .slice(0, SECTIONS_SHOWN)
        .map((s) => `<li><a href="${REL}${esc(r.u)}#${esc(s.id)}"><span class="secno">${esc(s.n)}</span><span class="x-t">${hl(s.t, re)}</span></a><p class="fr-x">${snip(s.x, re, 180)}</p></li>`)
        .join("")}</ul>`;
      if (secs.length > SECTIONS_SHOWN) {
        const more = secs.length - SECTIONS_SHOWN;
        html += `<p class="fr-more">and ${more} more section${more === 1 ? "" : "s"} in this note</p>`;
      }
    }
    return `${html}</li>`;
  }

  function say(text, now) {
    clearTimeout(statusTimer);
    if (now) status.textContent = text;
    else statusTimer = setTimeout(() => (status.textContent = text), 400);
  }

  function pressed(theme) {
    for (const a of document.querySelectorAll("[data-q]")) {
      if (theme && a.dataset.q === theme.name.toLowerCase()) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  }

  function run(raw, { now = false } = {}) {
    const q = raw.trim();
    if (q === current && !now) return;
    current = q;
    const url = q ? `?q=${encodeURIComponent(q)}` : location.pathname;
    history.replaceState(null, "", url);
    if (!data) return;
    const p = parse(q);
    if (!p) {
      out.hidden = true;
      out.innerHTML = "";
      if (index) index.hidden = false;
      pressed(null);
      say("", true);
      return;
    }
    pressed(p.theme);
    const hits = search(p);
    const re = termsRe([].concat(...p.groups), "g");
    if (index) index.hidden = true;
    out.hidden = false;
    if (!hits.length) {
      out.innerHTML = "";
      say(`Nothing on the site matches “${q}”. Try a theme above, or fewer words.`, now);
      return;
    }
    out.innerHTML = Object.keys(data.kinds)
      .map((k) => {
        const list = hits.filter((h) => h.r.k === k);
        if (!list.length) return "";
        return `<section class="fi fr-g" aria-labelledby="fr-${k}"><div class="fi-h"><h2 class="th-t" id="fr-${k}">${esc(data.kinds[k])}</h2><p class="fi-c">${list.length} ${esc(data.counts[k][list.length === 1 ? 0 : 1])}</p></div><ol class="xref fr-l">${list.map((h) => line(h, re)).join("")}</ol></section>`;
      })
      .join("");
    const words = p.groups.some((g) => g.length > 1) ? foundWords(hits, re) : [];
    const also = words.length > 1 ? `, finding ${words.slice(0, 6).join(", ")}${words.length > 6 ? " and more" : ""}` : "";
    say(`${hits.length} ${hits.length === 1 ? "result" : "results"} for “${q}”${p.theme ? `, read as the ${p.theme.name} theme` : ""}${also}.`, now);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value, { now: true });
  });
  input.addEventListener("input", () => run(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && input.value) {
      e.preventDefault();
      input.value = "";
      run("", { now: true });
    }
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-q]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    input.value = a.dataset.q;
    run(input.value, { now: true });
    if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ block: "start" });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    const el = document.activeElement;
    if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return;
    e.preventDefault();
    input.focus();
    input.select();
  });

  const initial = new URLSearchParams(location.search).get("q") || "";
  input.value = initial;
  if (!initial && window.matchMedia && matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
  if (initial) say("Searching…", true);

  fetch(form.dataset.index, { credentials: "same-origin" })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((d) => {
      data = prepare(d);
      if (initial && location.hash) history.replaceState(null, "", `?q=${encodeURIComponent(initial)}`);
      if (input.value.trim()) run(input.value, { now: true });
    })
    .catch(() => {
      say("Search could not load its index. The theme index below still works.", true);
    });
})();
