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
- **Home page:** engineers and engineering leaders who design, build or scale agents and AI systems and want a practitioner's take, plus teams who may want to talk to him. *(from the owner's dictated brief, October 2026: "teach others or transfer the knowledge I have and experience I have building agents and systems that use AI … as well software engineering aspects")*

## Product Purpose
A personal publication for Rafael Gorski that builds executive presence: it teaches executive audiences how to run AI at scale while demonstrating deep technical expertise in the principles underneath. Success means the owner can send a link to a senior audience and the writing stands on its own as both strategically useful and technically correct.

The site has two voices. The home page (`/`) is the owner's own: a first-person take on building agents and AI systems, covering both the AI side and the software-engineering side, and a dated brain dump of lab notes (Testing now, Using more effectively, Watch out for). The map (`/map/`), radar, library and notes are the structured, impersonal reference that the take points into. Success for the home page: a practitioner reads it in a few minutes, can check every claim against something public, and knows how to start a conversation.

## Positioning
Executive guidance that is derived from the actual engineering standards and specifications (for example, OpenTelemetry semantic conventions), not from vendor marketing or trend commentary. Every executive recommendation is traceable to a technical source.

## Operating Context
- Hosted on GitHub Pages as the user site `RafaelGorski/RafaelGorski.github.io`, served at `https://rafaelgorski.github.io/`; the `rafaelgorski.com` domain will be rotated to it later.
- Readers arrive mostly from direct links (shared by the owner), on laptops and phones, often between meetings.
- First article: agentic observability, sourced from `open-telemetry/semantic-conventions-genai/docs/gen-ai`.

## Capabilities and Constraints
- Static output, no tracking, no third-party scripts or fonts. A zero-dependency Node build (`scripts/build.mjs`) renders the home page from `site-data/home.json` and `site-data/takes.json`, and the map, the radar and the library from `content/*.json`; the published pages are plain HTML that read without JavaScript. *(decision, inferred from "low profile")*
- Served at a domain root (`rafaelgorski.github.io` now, `rafaelgorski.com` later). Internal links stay relative so the site also works under a subpath.
- Contact channel: LinkedIn (<https://www.linkedin.com/in/rafaelgorski>). Undecided: newsletter, speaking.

## Consulting Stance
- The home page says, once and plainly, that he is open to conversations with teams designing or scaling agentic and AI systems, and that LinkedIn is the way to reach him.
- No service menu, prices, packages, availability promises or "hire me" call to action. Any paid outside work needs his employer's approval first, and that approval is pending. Revisit this section only after it is granted.
- "Views are my own, not my employer's" appears on the home page and in every footer.

## Brand Commitments
- "Low profile but professional." No hype, no self-promotion devices (badges, logo walls, testimonials).
- Owner name: Rafael Gorski.
- Home-page voice: first person, direct and practical, the voice of an engineer who builds things and teaches. Plain words, short sentences, opinions with reasons, honest about what is uncertain. No hype words, exclamation marks or self-descriptors.

## Evidence on Hand
Public facts the site may state:
- Engineering Manager at Microsoft (his public GitHub profile), based in Brazil.
- Co-author, with Paulo Cézar Stadzisz, of *Problem-Based Software Requirements Specification* (RESI, 2016, DOI 10.21529/RESI.2016.1502002).
- Maintainer of the Problem-Based SRS agent skill (<https://github.com/RafaelGorski/Problem-Based-SRS>, MIT; first release February 2026), whose CI publishes a Skills Health dashboard.
- This site, built by several coding-agent sessions in parallel, each on its own branch; its source is public.
- GitHub `RafaelGorski`, LinkedIn `rafaelgorski`, X `GorskiRafael`.

Never state: anything employer-confidential (internal team or product names, outcomes, metrics, headcounts, architecture, or disguised case studies), clients, years of experience, quotes or testimonials. Every lab note in `site-data/takes.json` must rest on something public; entries stay marked Draft until the owner sets `"confirmed": true`.

## Product Principles
1. Every executive claim traces to a technical source the reader can open.
2. Decision-useful first: what to ask for, what to fund, what to measure.
3. Quiet authority: understate, cite, and let the substance carry the credibility.
4. Honest about maturity: name what is still in development or uncertain.

## Accessibility & Inclusion
WCAG 2.2 AA as the baseline; readable without CSS and without JavaScript.
