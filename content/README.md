# content/

Curated, source-traceable content for the site. The design sessions render these files; they do
not edit them. Nothing in this folder is published HTML.

## Files

| File | Purpose |
|------|---------|
| `stages.json` | The six stages of an AI programme (purpose, design, launch, scale, operate, govern), each with the question it answers. The ids are fixed: the site hardcodes them. |
| `library.json` | The curated library: primary sources for launching and scaling AI systems, including agentic systems. |
| `radar.json` | A readiness radar: techniques, protocols, measures and controls placed in Adopt, Trial, Assess or Hold, each citing library entries as evidence. A draft for the owner's review. |
| `editorial-plan.md` | Eight proposed future notes, each built on library entries. A proposal for the owner's review, not settled positions. |

## `library.json` schema

```json
{
  "updated": "YYYY-MM-DD",
  "entries": [
    {
      "id": "kebab-case-unique",
      "title": "Exact published title",
      "publisher": "Organisation or authors",
      "year": 2025,
      "url": "https://canonical-url",
      "kind": "standard | specification | regulation | framework | paper | book | guide | postmortem",
      "stages": ["operate"],
      "why": "Executive-facing, max 35 words.",
      "check": "Engineer-facing, max 25 words.",
      "maturity": "stable | evolving | draft",
      "verified": "YYYY-MM-DD"
    }
  ]
}
```

- `year`: year of the linked version's publication, or `null` for living documents that are
  maintained in place (for example the OpenTelemetry conventions, Inspect, FinOps for AI).
- `stages`: one or two ids from `stages.json`; the first is the primary stage.
- `why`: why it matters to someone deciding whether and how to launch or scale AI.
- `check`: the one concrete thing an engineer should verify or adopt from it.
- `maturity`: `stable` for published, final texts; `evolving` for documents in active revision,
  versioned protocols, texts whose obligations or guidance are still being phased in, and
  proposals for practices that are not yet standardised; `draft` for unfinished or not yet
  published texts (one is included: `evals-for-ai-engineers`, announced for November 2026).
- `verified`: the date the URL was fetched and the title, publisher and year were checked
  against the source.

## `radar.json` schema

> **Status: draft for the owner's review.** Ring placements are editorial judgement attributed
> to Rafael Gorski once he confirms them. Until then the file carries `"status": "draft"`.

The map shows *when* in the lifecycle something matters; the radar shows *how ready* it is.
Blips are things to use or avoid (techniques, protocols, measures, controls), not documents.
Each blip cites the library entries that justify its placement.

```json
{
  "edition": "2026-10",
  "status": "draft",
  "quadrants": [
    {"id": "techniques", "name": "Techniques", "scope": "Methods and practices"},
    {"id": "platforms", "name": "Platforms and protocols", "scope": "Shared infrastructure, interfaces and wire protocols"},
    {"id": "measures", "name": "Measures", "scope": "Metrics, evaluations and signals"},
    {"id": "governance", "name": "Governance", "scope": "Standards, regulation and controls"}
  ],
  "rings": [
    {"id": "adopt", "name": "Adopt", "meaning": "One sentence, max 20 words."},
    {"id": "trial", "name": "Trial", "meaning": "..."},
    {"id": "assess", "name": "Assess", "meaning": "..."},
    {"id": "hold", "name": "Hold", "meaning": "..."}
  ],
  "blips": [
    {
      "id": "kebab-case-unique",
      "name": "Short name",
      "quadrant": "techniques",
      "ring": "adopt",
      "stages": ["operate"],
      "summary": "Max 30 words.",
      "evidence": ["library-entry-id"],
      "movement": "new"
    }
  ]
}
```

- `quadrants` and `rings`: ids, names and order are fixed; the site codes against them.
- `edition`: `YYYY-MM` of the radar edition. `status` is `draft` until the owner approves it.
- `stages`: one or two ids from `stages.json`, linking the blip back to the map.
- `evidence`: one to four library entry ids. Every placement must be defensible from these
  sources: their maturity, standards status and documented failure modes.
- `movement`: change since the previous edition. Every blip is `new` in the first edition.
- Hold blips name a practice to stop or avoid, and the summary gives the reason from the
  evidence.
- No vendor products are named. Open specifications and protocols are named (MCP, A2A,
  OpenTelemetry, OAuth).

Placement rules applied in this draft:

- **Adopt:** the cited evidence is stable and either drawn from production experience or
  consistent across independent sources; or the source is a published standard, consensus guide
  or law in force.
- **Trial:** sound, but the standard is still evolving, or the evidence is a single study or not
  yet shown at production scale.
- **Assess:** new protocols, measures and practices with little evidence of production value yet.
- **Hold:** the cited evidence shows the practice fails, misleads or hides risk.

## Curation criteria

1. **Primary sources first.** Standards bodies (ISO/IEC, NIST, W3C, IETF), official
   specifications (OpenTelemetry, Model Context Protocol, A2A), legal texts (EU AI Act, a
   tribunal decision), peer-reviewed or widely cited papers, vendor-neutral engineering books
   (Google SRE, freely readable online), and public postmortems written by the organisation
   that had the incident.
2. **Decision-useful.** Every entry must change what an executive asks for, funds or measures,
   and give an engineer one concrete action.
3. **Vendor writing only as evidence.** Engineering write-ups and postmortems from AI vendors are
   included for what they disclose about practice or failure, never for product claims.
4. **Free where possible.** Free canonical versions are linked where they exist (arXiv, the
   publisher's research page, sre.google). ISO/IEC standards, Bainbridge (1983) and the books by
   Hubbard, Meadows, Aniche, the Poppendiecks, and Shankar and Husain are paid; no free canonical
   version exists.
5. **Honest about maturity.** Drafts, revisions in progress and phased obligations are flagged in
   `maturity` and, where it matters, in `why`.
6. **Voice.** Plain English, British spelling, no hype words, no exclamation marks.
7. **Disclosure.** `problem-based-srs` is the site owner's own paper. It is listed first, as the
   method for the purpose stage, at the owner's request. It was verified the same way as every
   other entry.

## Conventions

- **Titles** are copied from the source. Two exceptions, both for length or clarity: the EU AI Act
  title omits the list of amended acts, and the MCP title carries the pinned revision date.
- **ISO/IEC standards** link to the IEC Webstore, the co-publisher's official page, because
  iso.org blocks automated verification. Titles and dates were checked there.
- **Versioned specifications** link to a pinned revision (MCP 2026-07-28, A2A v1.0.0) so the year
  and the text stay in step.
- **`postmortem`** covers public, first-party accounts of a failure, and also *Moffatt v. Air
  Canada*, a tribunal decision that serves as the public record of an AI incident.
- **Essays** use `guide`, the closest kind, because they propose practices (for example
  `models-as-insider-risks`).
- **Books** link to the publisher's page for the edition cited. The Google SRE chapters are the
  exception: they link to Google's free online text.
- **O'Reilly pages** block automated fetching. The link for *Evals for AI Engineers* is the
  O'Reilly page that the authors' own site (ai-evals.com) links to; its title, authors, ISBN and
  publication date were checked against a retailer listing. It is forthcoming, so it is cited for
  its announced scope only and never quoted.
- **Publisher** names the organisation, or the first author with "et al." and the venue where one
  was verified.

## Validation

There are no dependencies. From the repository root:

```sh
node -e "const s=require('./content/stages.json').map(x=>x.id),l=require('./content/library.json');let p={};for(const e of l.entries){if(!e.stages.every(x=>s.includes(x)))throw e.id;p[e.stages[0]]=(p[e.stages[0]]||0)+1}console.log(l.entries.length,p)"
```

It should print the entry count and the number of entries per primary stage, and throw if any
entry references an unknown stage.

## Maintenance

Re-verify every entry when `updated` changes. Watch especially: the NIST AI RMF (under revision),
the EU AI Act (obligations phasing in), MCP and A2A (new revisions), the OpenTelemetry GenAI
conventions (still in Development status), and *Evals for AI Engineers* (forthcoming: on
publication, re-check the date and URL, set `maturity` to `stable`, and check GN-0003 against the
published text).
