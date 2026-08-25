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

Marketing may describe the Neptlium product model, strategic category, customer problem, concepts, principles, and intended operating experience without narrating which engineering milestones are currently complete. Factual external claims still require evidence.

### Application

Application establishes control and operation. It presents authoritative customer state, requests governed actions, and distinguishes capability, availability, loading, error, and lifecycle state. Browser representation is not authorization.

### Admin

Admin establishes operator comprehension, risk visibility, status clarity, and auditability. It prioritizes exceptions, evidence, queues, approvals, and operational consequence. Administrative state changes do not prove external execution.

### API and domain

API establishes domain truth, authentication enforcement, authorization, ownership, durability, provider isolation, ledger effects, audit, and reconciliation. Presentation cannot override domain state.

The four surfaces share one Neptlium identity but must not be visually or operationally collapsed into one composition language.

## 3. Brand identity

Use only repository-authoritative canonical Neptlium mark geometry. The mark is compact, structural, architectural, flat, monochrome-capable, and recognizable at small size.

Preserve the canonical mark/wordmark relationship, derive browser/social identity from the same geometry source, and choose light/dark treatment from actual contrast. Do not redraw, stretch, rotate, add effects, gradients, shadows, crests, token/coin forms, decorative animation, or competing “N” geometries.

## 4. Color philosophy

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

Teal is a precision signal. Carbon creates authority. Ivory creates editorial space. Semantic colors communicate state, not branding. Brand Teal must not make unknown, unavailable, pending, or failed state look active or successful.

Operational precision-blue tokens may remain within App/Admin where current implementation establishes them; they are not the canonical marketing accent.

## 5. Theme system

Marketing is light-first: Warm Ivory/white dominates, Carbon establishes authority, and Mineral Teal is selective. Carbon/Graphite full-bleed sections are reserved for deliberate authority or conceptual depth.

Application and Admin themes optimize operational state, data legibility, and task comprehension rather than mirroring Marketing composition.

## 6. Typography

Marketing combines restrained editorial display/serif expression with precise sans-serif utility/body typography. The public Web is **medium scale**: authority comes from hierarchy, space, composition, product relationships, and information rather than giant poster typography.

Application and Admin prioritize stable operational typography, tabular numerals, explicit units, and dense-but-readable data presentation.

Each role—Display, H1, H2, H3, Lead, Body, Utility, Navigation, Button, Data/Numeric—must have a clear job. Do not manufacture hierarchy by applying uppercase microcopy everywhere.

## 7. Spacing, grid, and hierarchy

Use a 4/8-derived scale and existing repository tokens where possible. The conceptual progression is `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160`.

Build hierarchy in this order:

1. Typography
2. Whitespace
3. Alignment
4. Contrast
5. Scale
6. Surface
7. Border
8. Elevation

Marketing favors strong left alignment, meaningful editorial asymmetry, purposeful negative space, controlled maximum widths, and selective full-bleed authority sections. Application favors predictable working widths and stable action placement. Admin favors operational scanning and evidence density.

Do not default page structure to card grids. Prefer rows, lists, relationships, structural rules, and whitespace when they explain more clearly.

## 8. Marketing architecture

Canonical direction: **warm architectural light + Carbon authority + Mineral Teal precision**.

The public site is one coherent system rather than a collection of feature pages. Its five top-level domains are:

1. **Platform** — how Neptlium works as one capital operating environment.
2. **Products** — the components that form the system.
3. **Solutions** — the operating problems the system addresses.
4. **Resources** — Learn, Security, Trust, and substantive Research when it exists.
5. **Company** — the organization, thesis, and verified company information.

Canonical product family:

- Capital Account
- Treasury
- Allocation
- Portfolio Intelligence
- Performance
- Capital Universe

Canonical product URLs live under `/products/*`. Superseded root product URLs converge permanently and must not compete as search authority.

The homepage establishes the proposition and routes visitors into this architecture. It is not the entire website.

Marketing must not use token walls, candlesticks, exchange order books, glowing crypto spheres, random blockchain imagery, fake dashboards, speculative cues, generic SaaS hero art, stock photography, glassmorphism, decorative blur, unsupported product/provider imagery, or excessive rounded cards.

Marketing is free to tell a strategic product story without exposing current engineering state. Factual claims such as named customers, provider relationships, licences, performance, custody, live execution, settlement, or availability remain evidence-bound.

## 9. Product visual language

Where visual explanation is useful, derive it from real Neptlium concepts: capital relationships, account structure, treasury context, allocation relationships, portfolio organization, performance context, capital-universe roles, and governance states.

These representations should resemble an operating language, not decorative illustrations. Never fabricate balances, returns, transactions, AUM, customers, asset availability, integrations, or execution readiness. Use neutral/unavailable states where evidence does not exist.

## 10. Application composition

Application prioritizes information hierarchy, stable navigation, explicit state, low cognitive overhead, predictable controls, tabular data, and controlled density. It is not Marketing reduced into cards and not a retail exchange interface.

Canonical authenticated desktop navigation remains Overview, Portfolio, Capital Account, Treasury, and Allocation. Mobile navigation remains separately governed by authenticated-application authority.

## 11. Admin composition

Admin prioritizes auditability, operator comprehension, errors, statuses, exceptions, queues, risk, approvals, and evidence. Aesthetics never obscure operational meaning. Distinguish request, approval, submission, settlement, ledger consequence, and reconciliation.

## 12. Buttons, links, and forms

Primary actions express the single dominant action in context. Marketing primary uses Mineral Teal. Secondary and tertiary actions remain visibly subordinate. Destructive actions require explicit semantic styling and confirmation.

Links remain visibly interactive with keyboard focus. External links require accurate accessible names where they open a new context.

Every field has a persistent label. Errors explain the problem and recovery. Placeholder text is never the only label. Consequential workflows preserve input → review → authorization → outcome and never imply success before domain confirmation.

## 13. Tables and financial data

Use tabular numerals and explicit units/provenance where appropriate. Distinguish confirmed zero, unknown, stale, error, unavailable, loading, pending, reserved, restricted, provider-observed, canonical, and reconciled values.

`UNKNOWN != ZERO`.

Never substitute `$0`, `$0.00`, `0%`, `0 units`, or an ambiguous dash when zero is not confirmed for the stated scope.

## 14. Financial-truth UI

| State | Meaning |
| --- | --- |
| Known value | Supported by required authoritative evidence. |
| Confirmed zero | Evidence confirms no quantity/value in the stated scope. |
| Unknown | Required evidence is absent or cannot establish a value. |
| Unavailable | Capability or value cannot currently be supplied. |
| Loading | A bounded request is in progress; no value is implied. |
| Stale | A prior value exists but freshness requirements are not met. |
| Error | Retrieval or processing failed. |
| Pending | A lifecycle operation has begun but has not reached its next authoritative state. |

Provider evidence never masquerades as canonical state. Empty does not mean zero; unavailable does not mean empty; loading does not mean unknown; unknown does not mean failed.

These semantics govern operational/data-bearing surfaces. They do not require ordinary Marketing copy to publish internal product readiness.

## 15. State semantics

Preserve configured, available, planned, modeled, approved, submitted, settled, reconciled, failed, reversed, and cancelled as distinct states inside App/Admin/API and any intentional operational public content.

Configured does not prove available. Planned does not prove available. Modeled does not prove executed. Approved does not prove submitted. Submitted does not prove settled. Settled does not prove reconciled.

## 16. Navigation

### Marketing desktop

Canonical groups are **Platform, Products, Solutions, Resources, Company**. Every group has a real hub destination. Disclosures expose hierarchy but do not replace the hub link. They are concise, keyboard accessible, and support visible focus, Escape/outside close, and focus return.

### Marketing mobile

Mobile is designed independently. Use direct hub links plus accessible child disclosures, large touch targets, children beneath parents, body scroll lock, focus containment/restoration, Escape close, and route-close behavior.

### Application and Admin

Do not mix marketing IA into authenticated or operator shells. Their navigation follows their own workflow authority.

## 17. Motion

Motion communicates micro-interaction, disclosure state, justified content entrance, or real system-state change. Reduced motion is first-class. Essential content never depends on animation. Decorative motion must never imply financial execution, progress, settlement, or success.

## 18. Responsive design

Responsive behavior is content-driven. Mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+` and the transitions between them. Preserve content priority, readable measure, gutters, navigation behavior, action clarity, data legibility, safe areas, and touch targets.

## 19. Accessibility

WCAG 2.2 AA is the minimum target. Preserve semantic HTML, landmarks, one clear H1, coherent heading order, keyboard operation, visible focus, screen-reader naming, correct disclosure semantics, sufficient contrast, large touch targets, reduced motion, meaningful error messaging, and non-color state cues. Use ARIA only when native semantics are insufficient.

## 20. Empty, loading, and error

Empty, loading, unknown, unavailable, and error are different states. Each requires distinct copy, visual treatment, and safe next action on operational/data-bearing surfaces. Never fabricate financial/data content to make a composition feel complete.

## 21. Brand prohibitions

Prohibit excessive blue or teal, decorative gradients, neon, token imagery, crypto trading visuals, bank crests, generic “N” variants, cards everywhere, generic SaaS heroes, fake dashboards, fabricated data, fake logos/testimonials, unsupported partnerships, unsupported regulatory claims, and visual language that falsely implies speculative performance.

## 22. Validation

Design correctness requires source/implementation comparison, responsive validation, accessibility and keyboard validation, actual typecheck/lint/test/build execution, route/link/canonical/asset integrity for Web, browser rendering where tooling is available, and open-PR overlap review.

Report checks as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Never infer build, render, accessibility, SEO, link-integrity, or production success from source inspection.

## 23. Governing expression

> Marketing establishes authority, category, narrative, and meaning.  
> The application establishes control and operation.  
> Admin establishes operator comprehension, risk visibility, and auditability.  
> API establishes domain truth, authorization, durability, and financial state.

> Ivory creates editorial space. Carbon creates authority. Teal signals precision. Operational truth creates trust where financial state is shown.
