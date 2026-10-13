# content/

Curated, source-traceable content for the site. The design sessions render these files; they do
not edit them. Nothing in this folder is published HTML.

## Files

| File | Purpose |
|------|---------|
| `stages.json` | The six stages of an AI programme (purpose, pilot, launch, scale, operate, govern), each with the question it answers. The ids are fixed: the site hardcodes them. |
| `library.json` | The curated library: primary sources for launching and scaling AI systems, including agentic systems. |
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
  versioned protocols, and texts whose obligations or guidance are still being phased in;
  `draft` for unfinished texts (none are currently included).
- `verified`: the date the URL was fetched and the title, publisher and year were checked
  against the source.

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
   publisher's research page, sre.google). ISO/IEC standards and Bainbridge (1983) are paid; no
   free canonical version exists.
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
the EU AI Act (obligations phasing in), MCP and A2A (new revisions), and the OpenTelemetry GenAI
conventions (still in Development status).
