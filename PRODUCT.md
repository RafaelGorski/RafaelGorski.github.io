# Product

<!-- impeccable:product-schema 1 -->

> Interview probe was unanswered (owner unavailable). Facts below are inferred
> from the owner's written brief and are marked *(inferred)* where not stated
> verbatim. Confirm or correct before treating them as settled.

## Platform

web

## Users
- **Primary:** executives and senior technology leaders (CTO, CIO, VP Eng, program sponsors) responsible for large-scale AI and agentic programs, who need to make governance, investment, and architecture decisions without hands-on time in the code. *(inferred from brief: "teach others at executive level how to handle AI in large scale projects")*
- **Secondary:** principal engineers and architects who will be asked to implement what those executives decide, and who will judge the site's technical credibility. *(inferred)*

## Product Purpose
A personal publication for Rafael Gorski that builds executive presence: it teaches executive audiences how to run AI at scale while demonstrating deep technical expertise in the principles underneath. Success means the owner can send a link to a senior audience and the writing stands on its own as both strategically useful and technically correct.

## Positioning
Executive guidance that is derived from the actual engineering standards and specifications (for example, OpenTelemetry semantic conventions), not from vendor marketing or trend commentary. Every executive recommendation is traceable to a technical source.

## Operating Context
- Hosted on GitHub Pages as the user site `RafaelGorski/RafaelGorski.github.io`, served at `https://rafaelgorski.github.io/`; the `rafaelgorski.com` domain will be rotated to it later.
- Readers arrive mostly from direct links (shared by the owner), on laptops and phones, often between meetings.
- First article: agentic observability, sourced from `open-telemetry/semantic-conventions-genai/docs/gen-ai`.

## Capabilities and Constraints
- Static output, no tracking, no third-party scripts or fonts. A zero-dependency Node build (`scripts/build.mjs`) renders the map and library from `content/*.json`; the published pages are plain HTML that read without JavaScript. *(decision, inferred from "low profile")*
- Served at a domain root (`rafaelgorski.github.io` now, `rafaelgorski.com` later). Internal links stay relative so the site also works under a subpath.
- Undecided: contact channel, newsletter, speaking/advisory offer.

## Brand Commitments
- "Low profile but professional." No hype, no self-promotion devices (badges, logo walls, testimonials).
- Owner name: Rafael Gorski.

## Evidence on Hand
- None yet: no bio, credentials, employer, client list, or testimonials were provided. Do not fabricate any. About page carries a clearly marked placeholder bio.

## Product Principles
1. Every executive claim traces to a technical source the reader can open.
2. Decision-useful first: what to ask for, what to fund, what to measure.
3. Quiet authority: understate, cite, and let the substance carry the credibility.
4. Honest about maturity: name what is still in development or uncertain.

## Accessibility & Inclusion
WCAG 2.2 AA as the baseline; readable without CSS and without JavaScript.
