# Public website content coverage

Scope: `apps/web` at `neptlium.com`. This is an editorial delivery record,
not a second product, financial, legal or design authority.

Inspected baseline: `4c3481d6b560da5210a50f2ccce9f3db5dd8148f`.
Evidence date: 2026-10-20. Main was fetched; the open PR query returned
#125, #126 and #127, with App/Payment scope rather than Web content overlap.
The public homepage was retrieved separately. A deployed homepage does
not establish deployment identity or validate all pages.

## Information responsibility

Existing route compositions own page structure, headlines and metadata.
`lib/content/page-context.ts` owns the new route-specific explanations,
practical considerations, questions and related links. The server component
`components/page-context.tsx` renders that content within each owning route.
It does not add tracking, forms, API calls or authorization behavior.

Canonical navigation and route classification remain in
`lib/content/public-architecture.ts`; legal content remains in
`lib/content/legal.ts`. Redirects, authentication/system routes and metadata
assets do not receive unrelated marketing sections.

## Page coverage

| Page | Additional information |
| --- | --- |
| `/` | Audience paths, account scope, illustrations and starting points |
| `/capital` | Available/invested/pending distinctions, movement review, account context |
| `/portfolio` | Composition, concentration, valuation dates, cash flows and incomplete data |
| `/investments` | Exposure research, suitability questions, documents, eligibility and risk |
| `/allocation` | Objectives, constraints, proposed changes and review versus execution |
| `/treasury` | Obligations, expected receipts, organization authority and Pay relationship |
| `/intelligence` | Evidence, uncertainty, interpretation and human decision boundaries |
| `/infrastructure` | Pay/API/Docs/Status responsibilities and integration questions |
| `/institutional` | Intended audience, mandates, ownership, oversight and initial inquiry |
| `/platform` | Connected product contexts, identity, ownership and financial lifecycle |
| `/payments` | Review, submission uncertainty, settlement, refunds and availability |
| `/solutions` | Choosing between visibility and coordination problems |
| `/solutions/capital-visibility` | Source, currency, timing, restrictions and follow-up |
| `/solutions/treasury-coordination` | Obligation planning, timing, forecasts and policy |
| `/company` | Purpose, audiences, integrity, product coherence and contact |
| `/contact` | Useful inquiry details, redaction, commercial/media inquiries and limits |
| `/security` | Safe access, concern reporting, organization permissions and boundaries |
| `/trust` | Reading claims, financial states, illustrations and conflicting information |
| `/learn` | Liquidity, valuation, payments and diversification foundations |
| `/insights` | General educational reading framework; no invented publication catalogue |
| `/research` | Intended method and publication standard; no fabricated original study |
| `/press` | Short company description, product naming and media inquiry requirements |
| `/pricing` | Fee questions, eligibility, terms and commercial inquiry route; no invented rates |
| `/products` | Product selection and relationships between capabilities |
| `/products/performance` | Cash flows, methodology, historical information and limitations |
| `/products/capital-universe` | Purpose, liquidity, classifications and changing obligations |
| `/accessibility` | Reading/navigation aims and actionable barrier-reporting instructions |

## Facts and approvals still required

These dependencies prevent a claim that all public information is final.
They do not justify inventing content or adding public engineering-status copy.

| Subject | Missing authority / next owner |
| --- | --- |
| Privacy, terms, cookies, risk documents | Existing documents explicitly remain drafts. Founder/legal must supply approved originals, legal operator, effective dates, jurisdiction, actual processing/retention/sharing practices, service scope and applicable rights/terms. Do not remove draft labels as editorial cleanup. |
| Corporate identity | Company source previously asserted Neptliumforge was the parent. Founder supplied EJEP Systems as the chosen interim name; neither establishes registered contracting identity. Remove the unsupported parent assertion without substituting an unverified legal entity. Founder/legal to confirm any public corporate disclosure. |
| Pricing and minimums | No approved commercial schedule was identified. Founder/commercial owner must approve rates, charging basis, applicable scope and terms before publication. |
| Service availability | Product-specific jurisdictions, investment catalogue, payment methods, networks, fees, custody and regulated service statements require confirmed operational/legal authority. Product descriptions do not activate them. |
| Support/contact operations | Support email is the existing source-defined channel. Mailbox operation and response commitments were not tested. No new SLA or security bounty is promised. |
| Research and press assets | No original publications, testimonials, customer metrics, awards or partnership evidence supplied. Do not create fictitious proof or download links. |
| Production certification | Candidate CI, preview/rendered review, governed integration and separately authorized production release are distinct from authored content. |

## Homepage continuity — owner direction, 2026-10-20

The owner-selected mobile reference preserves the near-black opening, ivory
capital proposition, restrained mineral teal, two audience actions and clearly
illustrative portfolio preview. This release retains that composition while
adding the approved route context below it. The header and cinematic opening
use existing canonical dark canvas/text tokens as a deliberate editorial
surface in every appearance mode; they do not change the stored preference,
System resolution or the semantic appearance of other routes. The preview's
labels and the scrolled header keep matching foreground/background pairs.
Desktop navigation receives readable separation; actions retain visible focus,
touch targets and restrained hover/pressed cues. No financial data or external
capability is introduced.

`homepage-continuity.spec.ts` checks contrast, audience destinations, responsive
overflow, navigation dismissal/focus restoration, scrolled headers and System
resolution. Committed Chromium snapshots cover desktop/mobile Light and Dark.
Source checks, rendered candidate evidence and post-release verification remain
separate evidence categories.

## Validation

Use the commands in `AGENTS.md`. Unit coverage checks the editorial route
inventory, route connections, destination policy and content consistency.
Existing Node architecture contracts remain in place. Source and build checks
are not rendered accessibility or production acceptance.
