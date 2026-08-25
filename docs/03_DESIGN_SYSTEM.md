# Neptlium Design System

**Status:** Authoritative  
**Scope:** `neptlium.com`, `app.neptlium.com`, `admin.neptlium.com`, and shared brand expression  
**Category:** Capital Operating Platform

This is the central design authority for Neptlium. It defines durable principles and surface responsibilities; it does not convert target architecture into current product capability. Historical design material under `docs/archive/**` is non-authoritative.

## 1. Purpose

Neptlium is a capital operating platform. Its design system communicates institutional authority, operational clarity, financial truth, controlled complexity, and confidence without spectacle.

The shared identity is governed by **precision, restraint, depth, and certainty**. Visual sophistication must increase comprehension. It must never decorate ambiguity, imply unsupported factual claims, or obscure consequential state.

## 2. Surface responsibilities

### Marketing

Marketing establishes authority and meaning. It defines the category, frames customer relevance, explains the operating thesis, creates institutional confidence, and owns public editorial/visual expression. Marketing is intentionally independent from repository, deployment, migration, provider, and runtime implementation chronology. It is not a financial authority, authenticated dashboard, or build-status surface.

Marketing may describe the Neptlium product model, strategic category, audience, concepts, principles, and intended operating experience without narrating which engineering milestones are currently complete. Factual external claims still require evidence.

### Application

Application establishes control and operation. It presents authoritative customer state, requests governed actions, and distinguishes capability, availability, loading, error, and lifecycle state. Browser representation is not authorization.

### Admin

Admin establishes operator comprehension, risk visibility, status clarity, and auditability. It prioritizes exceptions, evidence, queues, approvals, and operational consequence. Administrative state changes do not prove external execution.

### API and domain

API establishes domain truth, authentication enforcement, authorization, ownership, durability, provider isolation, ledger effects, audit, and reconciliation. Presentation cannot override domain state.

The four surfaces share one Neptlium identity but must not be visually or operationally collapsed into one composition language.

## 3. Brand identity

Use only repository-authoritative canonical Neptlium mark geometry. The mark is compact, structural, architectural, flat, monochrome-capable, and recognizable at small size.

- Preserve the canonical relationship between mark and wordmark.
- Use monochrome treatments when color would reduce clarity or hierarchy.
- Maintain clear surrounding space sufficient to prevent collision and preserve legibility; do not invent unsupported pixel standards.
- Select light/dark mark treatment from actual surface contrast.
- Derive favicon and application-icon expression from the same canonical geometry.
- Control color through semantic implementation where technically appropriate.
- Maintain one canonical geometry source for favicon, browser icons, Apple/PWA icons, social mark, and Open Graph identity.

Prohibited treatments include redrawing from prompts/screenshots, stretching, rotating, adding effects, gradients, shadows, outlines, enclosing crests, token/coin forms, decorative animation, and alternate “N” geometries. Do not create multiple competing SVG sources.

## 4. Color philosophy

### Canonical identity palette

| Name | Value | Role |
| --- | --- | --- |
| Warm Ivory | `#F5F3EE` | Primary marketing canvas and editorial space. |
| Carbon | `#101214` | Authority surface and primary light-surface text. |
| Mineral Teal | `#0F8F86` | Canonical marketing precision accent and primary marketing action. |
| Interaction Teal | `#20AFA3` | Hover, focus, and interactive emphasis. |
| Graphite | `#343A3F` | Secondary text and structural dark neutral. |
| Stone | `#D8D5CE` | Dividers and subtle structure. |
| Soft Mist | `#ECEAE5` | Secondary light surfaces. |
| Signal Amber | `#C88B28` | Warning and attention semantics only. |

Teal is a precision signal. Carbon creates authority. Ivory creates editorial space. Semantic colors communicate state, not branding. Neptlium color is an instrument, not background paint.

Marketing should feel approximately 70% light neutral, 20–25% Carbon/Graphite, and 5–10% accent/semantic color. This is compositional guidance, not an implementation metric.

### Semantic color

Success, warning, danger, informational, disabled, focus, selected, loading, unknown, and unavailable states require distinct semantic treatment. Use text, iconography, shape, or labeling in addition to color. Signal Amber is never decorative. Brand Teal must not make an unknown, unavailable, pending, or failed state look active or successful.

Existing operational precision-blue tokens may remain within App/Admin where current implementation establishes them; they are not the canonical marketing accent and must not leak into Marketing by habit. Any cross-surface token change requires evidence and deliberate migration.

## 5. Theme system

### Marketing light

Warm Ivory/white dominates. Carbon establishes text and authority. Mineral Teal appears selectively for interaction and meaningful system emphasis.

### Marketing authority dark

Carbon and Graphite provide controlled full-bleed authority, technical depth, or institutional closure. Dark sections are selective, not the default canvas.

### Application light

Quiet neutral operational surfaces prioritize explicit state, readable data, stable control placement, and low cognitive overhead.

### Application dark

Dark neutral operational surfaces preserve hierarchy and state distinction without turning the product into an exchange or terminal aesthetic.

### Admin

Dense neutral surfaces optimize operator comprehension, exception recognition, evidence, and audit. Admin is not a recolored customer App.

Themes share identity tokens and accessibility requirements, not identical page compositions.

## 6. Typography

### Marketing

- **Display:** editorial/institutional expression for category-defining statements.
- **Heading:** strong section hierarchy with restrained line length.
- **Body:** highly readable sans-serif explanation with generous line height.
- **Utility:** navigation, metadata, captions, and controls without excessive micro-labeling.

Use repository-supported display/serif authority only where current implementation supports it. Do not introduce fonts without repository evidence, licensing, performance, and loading review.

### Application

- **Heading:** quiet operational orientation.
- **Body:** concise, legible task and state explanation.
- **Navigation:** stable, scannable, and predictable.
- **Financial/data:** tabular numerals, clear alignment, explicit units, and state provenance.

Geist/current operational typography remains the App baseline where implemented.

### Admin

- **Dense heading:** operational grouping and exception priority.
- **Body:** concise instructions and evidence.
- **Tables/data:** tabular numerals, compact but readable rows, explicit status and timestamps.

Recommended readable measures are approximately 45–65 characters for lead text and 55–72 for body text. They are guidance, not rigid constraints.

## 7. Type hierarchy

The conceptual hierarchy is Display, H1, H2, H3, H4, Lead, Body, Small, Caption, Label, Navigation, Button, and Data/Numeric.

Each role must have a clear job. Display carries rare category-level expression. H1 identifies the page. H2 separates major compositions. H3/H4 structure local concepts. Lead frames meaning. Body explains. Small/Caption provides supporting context. Label identifies a control or datum. Navigation and Button prioritize action clarity. Data/Numeric preserves units, alignment, provenance, and state.

Do not manufacture hierarchy by applying uppercase microcopy everywhere.

## 8. Spacing

Use a 4/8-derived scale and prefer existing repository tokens. The preferred conceptual progression is:

`4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160`

- **Micro:** icon/text gaps, compact labels, inline state.
- **Component:** internal control and component rhythm.
- **Section:** separation between content groups.
- **Composition:** major page rhythm, full-bleed transitions, and editorial negative space.

Do not create duplicate tokens merely to reproduce this list.

## 9. Grid and layout

- Use controlled maximum content widths and consistent responsive gutters.
- Marketing favors strong left alignment, meaningful editorial asymmetry, generous negative space, and selective full-bleed authority sections.
- Application favors predictable navigation, stable action placement, readable working widths, and controlled density.
- Admin favors operational scanning, evidence density, and persistent context.
- Section rhythm must be intentional across breakpoints.

Avoid defaulting page structure to a card grid. Use rows, planes, structural lines, and whitespace when they explain relationships more clearly.

## 10. Surface hierarchy

Build hierarchy in this order:

1. Typography
2. Whitespace
3. Alignment
4. Contrast
5. Scale
6. Surface
7. Border
8. Elevation

Discourage borders around every concept, rounded-card proliferation, decorative shadows, glass surfaces, nested containers, and generic dashboard blocks.

## 11. Marketing composition

Canonical direction: **warm architectural light + Carbon authority + Mineral Teal precision**.

Marketing may use large editorial statements, controlled full-bleed sections, abstract architectural graphics, selective dark authority surfaces, strong negative space, and subtle structural lines.

Marketing must not use token walls, candlesticks, exchange order books, glowing crypto spheres, random blockchain imagery, fake financial dashboards, speculative cues, generic SaaS hero layouts, or unsupported product/provider imagery.

The homepage explains what Neptlium is, why it matters, the capital operating model, Portfolio, Capital Account, Treasury, Allocation, institutional audiences, trust principles, and the next action. It should not report App/Admin/API build completion, provider configuration, migrations, environment readiness, testnet groundwork, deployment health, or internal implementation chronology.

Marketing is free to tell a strategic product story without exposing current engineering state. Factual claims such as named customers, provider relationships, licences, performance, custody, live execution, settlement, or availability remain evidence-bound.

## 12. Application composition

Application prioritizes information hierarchy, stable navigation, explicit state, low cognitive overhead, predictable controls, tabular data, and dense but controlled information. It is not Marketing reduced into cards and not a retail exchange interface.

Canonical desktop navigation is Overview, Portfolio, Capital Account, Treasury, and Allocation. Canonical mobile navigation remains separately governed by the authenticated-application authority.

## 13. Admin composition

Admin prioritizes auditability, operator comprehension, errors, statuses, exceptions, queues, risk, approvals, and evidence. Aesthetics never obscure operational meaning. Distinguish request, approval, submission, settlement, ledger consequence, and reconciliation.

## 14. Buttons

- **Primary:** the single dominant action in a context. Marketing primary uses Mineral Teal.
- **Secondary:** important alternative without equal visual dominance.
- **Tertiary/Text:** low-emphasis navigation or contextual action.
- **Destructive:** irreversible or materially harmful intent, with explicit semantic styling and confirmation.

Define default, hover, focus-visible, active, disabled, and loading states. Disabled and loading controls must not appear actionable. Do not make every action primary.

## 15. Links

Links remain visibly interactive and retain keyboard focus. Provide hover and focus treatment and visited behavior where the implementation supports it. Do not rely on color alone. External links require an accurate accessible name when opening a new context.

## 16. Forms

Every field has a persistent label. Help text explains format or consequence. Errors identify the problem and recovery. Validation is available at the relevant boundary. Disabled, read-only, unknown, unavailable, and loading are visually distinct. Placeholder text is never the only label.

Consequential workflows preserve input → review → authorization → outcome and do not imply success before domain confirmation.

## 17. Tables and financial data

- Use tabular numerals and right alignment for comparable numeric columns where appropriate.
- Keep units, asset, network, currency, valuation time, and provenance explicit.
- Distinguish confirmed zero, unknown, stale, error, unavailable, loading, pending, reserved, restricted, provider-observed, canonical, and reconciled values.
- Never substitute a placeholder dash or zero where its meaning is ambiguous.

`UNKNOWN != ZERO`.

## 18. Financial-truth UI

Canonical presentation states are:

| State | Meaning |
| --- | --- |
| Known value | Supported by the required authoritative evidence. |
| Confirmed zero | Evidence confirms no quantity/value in the stated scope. |
| Unknown | Required evidence is absent or cannot establish a value. |
| Unavailable | The capability or value cannot currently be supplied. |
| Loading | A bounded request is in progress; no value is implied. |
| Stale | A prior value exists but freshness requirements are not met. |
| Error | Retrieval or processing failed. |
| Pending | A lifecycle operation has begun but has not reached its next authoritative state. |

Do not render `$0`, `$0.00`, `0%`, or `0 units` unless zero is confirmed for the stated scope. Provider evidence never masquerades as canonical state. Empty does not mean zero; unavailable does not mean empty; loading does not mean unknown; unknown does not mean failed.

These state semantics govern operational/data-bearing surfaces. They are not a requirement for ordinary Marketing copy to publish internal product readiness.

## 19. State semantics

Preserve configured, available, planned, modeled, approved, submitted, settled, reconciled, failed, reversed, and cancelled as distinct states inside App/Admin/API and any public content that intentionally presents such operational state.

- Configured does not prove eligible, healthy, or live.
- Planned does not prove available.
- Modeled does not prove authorized or executed.
- Approved does not prove submitted.
- Submitted does not prove settled.
- Settled does not prove reconciled.
- Failed, reversed, and cancelled preserve different evidence and consequences.

Labels, color, iconography, motion, and calls to action on operational surfaces must not collapse these distinctions.

## 20. Navigation

### Marketing desktop

Canonical groups are Platform, Solutions, Resources, and Company. Use real destinations. Disclosures are concise, institutional, keyboard accessible, and support Escape/outside close and focus return. Avoid command-palette appearance and internal architecture essays.

### Marketing mobile

Use a top-origin, left-aligned accordion/disclosure model with large touch targets, the entire row tappable, children beneath the parent, one group open where practical, body scroll lock, focus containment/restoration, Escape close, and route-close behavior.

### Application

Use authenticated customer navigation. Do not mix marketing IA into the operating shell.

### Admin

Use operator navigation organized around workflows, queues, evidence, risk, and exceptions. Do not mirror customer navigation merely for visual consistency.

## 21. Motion

Motion communicates micro-interaction, navigation/disclosure state, justified content entrance, or system-state change. Guidance bands are approximately 120–200ms, 160–280ms, and 300–600ms respectively. Reduced motion is first-class. Essential content never depends on animation. Decorative motion must never imply financial execution, progress, settlement, or success.

## 22. Responsive design

Responsive behavior is content-driven. Mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+` and the transitions between them. Preserve content priority, readable measure, gutters, navigation behavior, action clarity, data legibility, safe areas, and touch targets.

## 23. Accessibility

WCAG 2.2 AA is the minimum target. Preserve semantic HTML, landmarks, one clear H1, coherent heading order, keyboard operation, visible focus, screen-reader naming, correct disclosure semantics, sufficient contrast, large touch targets, reduced motion, meaningful error messaging, and non-color state cues. Use ARIA only when native semantics are insufficient.

## 24. Empty, loading, and error

- **Empty:** the authoritative scope is known and contains no records.
- **Loading:** a bounded request is in progress.
- **Unknown:** evidence cannot establish the state.
- **Unavailable:** capability or data cannot currently be provided.
- **Error:** an attempted operation or retrieval failed.

Each state has distinct copy, visual treatment, and safe next action on operational/data-bearing surfaces. Never fabricate financial/data content to make a composition feel complete.

## 25. Brand prohibitions

Prohibit excessive blue or teal, decorative gradients, neon, token imagery, crypto trading visuals, bank crests, generic “N” variants, cards everywhere, generic SaaS heroes, fake dashboards, fabricated data, fake logos/testimonials, unsupported partnerships, unsupported regulatory claims, and visual language that falsely implies speculative performance.

## 26. Validation

Design correctness requires:

- source and implementation comparison;
- responsive validation across representative widths;
- accessibility and keyboard validation;
- actual typecheck, lint, test, and build execution where scripts exist;
- browser rendering and console inspection where tooling is available;
- route/link/canonical/asset integrity for Web;
- source/live comparison when the task concerns production;
- open-PR overlap review.

Report checks as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Never infer build, render, accessibility, SEO, link-integrity, or production success from source inspection.

## 27. Governing expression

> Marketing establishes authority, category, narrative, and meaning.
> The application establishes control and operation.  
> Admin establishes operator comprehension, risk visibility, and auditability.  
> API establishes domain truth, authorization, durability, and financial state.

> Ivory creates editorial space. Carbon creates authority. Teal signals precision. Operational truth creates trust where financial state is shown.
