# Editorial plan: proposed notes

> **Status: proposal for the owner's review.** Nothing here is a settled position of Rafael Gorski.
> Titles are working titles. Each "decision" is the question the note would help an executive answer,
> not the answer. Each note would be written only from the library entries listed, so that every
> claim traces to a source the reader can open (PRODUCT.md, principle 1).

The published note, *Agentic observability* (stage: operate, built on `otel-genai-semconv`), is the
model for the series: one decision, a small set of primary sources, and a clear statement of what
is still in development.

## 1. What must the pilot beat?

- **Primary stage:** purpose
- **Decision:** Do we approve an AI pilot, and what baseline, task scope and success threshold
  must it be judged against before any further funding?
- **Builds on:** `rules-of-ml`, `metr-time-horizons`, `ai-agents-that-matter`, `data-cascades`
- **Why now:** Agent capability claims are moving faster than measured reliability. A
  time-horizon measure and a cost-aware view of accuracy give sponsors a sober way to set scope
  before money is committed.

## 2. Once is a demo: measuring reliability before launch

- **Primary stage:** pilot
- **Decision:** What evidence should a pilot team present before we approve a launch:
  repeated-trial success, agreement between automated graders and human reviewers, or both?
- **Builds on:** `tau-bench`, `who-validates-the-validators`, `llm-as-a-judge`, `inspect-evals`
- **Why now:** Automated grading is how evaluation scales, but its criteria drift and its biases
  are documented. Open evaluation frameworks now make a shared, rerunnable test suite practical.

## 3. Who can stop a release?

- **Primary stage:** launch
- **Decision:** Who holds authority to block a model or prompt release, and on what evidence,
  including qualitative findings that the metrics do not show?
- **Builds on:** `openai-sycophancy-postmortem`, `sre-canarying-releases`, `ml-test-score`,
  `sre-reliable-launches`
- **Why now:** A widely used model update passed offline evaluations and A/B tests and was still
  rolled back. Release authority for systems that change weekly is an organisational design
  question, not only a testing one.

## 4. Prompt injection as an architecture decision

- **Primary stage:** launch
- **Decision:** How much autonomy do we grant an agent that reads untrusted content, and which
  capabilities are we prepared to give up to contain the risk?
- **Builds on:** `prompt-injection-design-patterns`, `nist-adversarial-ml-taxonomy`,
  `owasp-agentic-top-10-2026`, `owasp-llm-top-10-2025`
- **Why now:** Agentic security now has a peer-reviewed risk list and published design patterns
  with explicit utility-versus-security trade-offs, which turns a vague fear into a scoping choice.

## 5. Agents need their own identities

- **Primary stage:** scale
- **Decision:** Do we standardise on open agent protocols, and how do agents authenticate,
  receive delegated authority and remain attributable as their number grows?
- **Builds on:** `mcp-specification`, `a2a-specification`, `oauth-security-bcp`,
  `governing-agentic-ai`
- **Why now:** MCP (revision 2026-07-28) and A2A (v1.0) are both now governed under Linux
  Foundation projects. Whether that lowers the risk of standardising is a question the note
  should test rather than assume.

## 6. Cost is a reliability property

- **Primary stage:** scale
- **Decision:** Who owns AI spend, and do we budget per outcome with model routing, retry limits
  and latency targets, or per vendor contract?
- **Builds on:** `frugalgpt`, `finops-for-ai`, `tail-at-scale`, `sre-cascading-failures`
- **Why now:** Agent workflows multiply model and tool calls per request, so cost, tail latency and
  retry storms now grow together. FinOps guidance for AI is being written now.

## 7. When quality drops and nothing crashes

- **Primary stage:** operate
- **Decision:** Do we fund continuous production quality evaluation and a quality service-level
  objective, with the same standing as availability?
- **Builds on:** `anthropic-quality-postmortem`, `sre-service-level-objectives`,
  `otel-genai-semconv`, `sre-postmortem-culture`
- **Why now:** A public postmortem showed infrastructure bugs degrading model output without the
  evaluations in place catching it. This is the natural sequel to the observability note.

## 8. Who answers for the agent?

- **Primary stage:** govern
- **Decision:** Who is accountable when an agent acts, and how do we make human oversight real
  rather than a rubber stamp?
- **Builds on:** `moffatt-v-air-canada`, `ironies-of-automation`, `governing-agentic-ai`,
  `eu-ai-act`
- **Why now:** A tribunal has already declined to treat a chatbot as responsible for its own
  advice, and EU AI Act obligations are phasing in. A 1983 paper explains why oversight by humans
  is harder than it sounds.

## Coverage

| Stage   | Proposed notes |
|---------|----------------|
| purpose | 1              |
| pilot   | 2              |
| launch  | 3, 4           |
| scale   | 5, 6           |
| operate | 7 (plus the published observability note) |
| govern  | 8              |
