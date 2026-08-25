# Neptlium Design System

**Status:** Authoritative
**Scope:** `neptlium.com`, `app.neptlium.com`, `admin.neptlium.com`, and shared brand expression
**Category:** Capital Operating Platform

This is the central design authority for Neptlium. It defines durable principles and surface responsibilities; it does not convert target architecture into current product capability. Historical design material under `docs/archive/**` is non-authoritative.

## 1. Purpose and surface responsibilities

Neptlium is a capital operating platform. Its identity is governed by **precision, restraint, depth, and certainty**. Visual sophistication must increase comprehension and must never decorate ambiguity or imply unsupported factual claims.

**Marketing** establishes category, narrative, customer relevance, institutional confidence, editorial authority, product meaning, and a path into the operating application. It is independent from repository/build/migration/provider/deployment chronology and is not a financial authority.

**Application** establishes customer control and operation. It presents authoritative customer state and governed actions while distinguishing capability, availability, loading, error, and lifecycle state.

**Admin** establishes operator comprehension, risk visibility, status clarity, evidence, queues, approvals, and auditability.

**API/domain** establishes authentication, authorization, ownership, durability, provider isolation, ledger effects, audit, reconciliation, and domain truth.

The surfaces share one identity without sharing one composition language.

## 2. Brand identity

Use only repository-authoritative Neptlium mark geometry. Preserve the canonical mark/wordmark relationship and derive browser/social identity from the same source.

Do not redraw, stretch, rotate, add gradients/shadows/outlines, create crests or token/coin forms, animate decoratively, or create competing “N” geometries.

## 3. Color philosophy

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

Teal is a precision signal. Carbon creates authority. Ivory creates editorial space. Semantic colors communicate state, not branding. Brand color must never make unknown, unavailable, pending, or failed state look active or successful.

Operational precision-blue tokens may remain in App/Admin where implementation establishes them; they are not the canonical marketing accent.

## 4. Typography, spacing, and hierarchy

Marketing combines restrained editorial display/serif expression with precise sans-serif utility/body typography. Public Web is **medium scale**: authority comes from hierarchy, space, composition, product relationships, and information rather than giant poster typography.

Application/Admin prioritize stable operational typography, tabular numerals, explicit units, and dense-but-readable data presentation.

Use a 4/8-derived spacing philosophy and existing repository tokens where possible. Build hierarchy through:

1. Typography
2. Whitespace
3. Alignment
4. Contrast
5. Scale
6. Surface
7. Border
8. Elevation

Do not default to card grids. Prefer rows, lists, relationships, structural rules, and whitespace where they explain more clearly.

## 5. Marketing architecture

Canonical direction is **warm architectural light + Carbon authority + Mineral Teal precision**.

The public site is one coherent system. Its top-level architecture is exactly:

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

The homepage establishes Neptlium and routes visitors into this architecture; it is not the entire website.

Marketing must not use token walls, exchange order books, glowing crypto imagery, fake dashboards, speculative cues, generic SaaS hero art, stock photography, glassmorphism, decorative blur, unsupported product/provider imagery, or excessive rounded cards.

Marketing may tell a strategic product story without exposing current engineering state. Named customers, provider relationships, licences, performance, custody, live execution, settlement, and availability remain evidence-bound claims.

## 6. Product visual language

Visual explanations derive from real Neptlium concepts: capital relationships, account structure, treasury context, allocation relationships, portfolio organization, performance context, capital-universe roles, and governance states.

They should resemble an operating language, not pasted-on illustration. Never fabricate balances, returns, transactions, AUM, customers, asset availability, integrations, or execution readiness. Use neutral/unavailable states where evidence does not exist.

## 7. Application and Admin composition

Application prioritizes information hierarchy, stable navigation, explicit state, low cognitive overhead, predictable controls, tabular data, and controlled density. Canonical authenticated desktop navigation remains Overview, Portfolio, Capital Account, Treasury, and Allocation.

Admin prioritizes auditability, exceptions, statuses, risk, approvals, and evidence. Distinguish request, approval, submission, settlement, ledger consequence, and reconciliation.

## 8. Interaction controls

Primary actions express the single dominant action in context; Marketing primary uses Mineral Teal. Secondary/tertiary actions remain subordinate. Destructive actions require explicit semantic styling and confirmation.

Links remain visibly interactive and keyboard-focusable. External links require accurate accessible names where they open a new context.

Fields have persistent labels. Errors explain the problem and recovery. Placeholder text is never the only label. Consequential workflows preserve input → review → authorization → outcome.

## 9. Financial truth

Use tabular numerals and explicit units/provenance where appropriate. Distinguish confirmed zero, unknown, stale, error, unavailable, loading, pending, reserved, restricted, provider-observed, canonical, and reconciled values.

`UNKNOWN != ZERO`.

Do not substitute `$0`, `$0.00`, `0%`, `0 units`, or an ambiguous dash when zero is not confirmed.

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

Provider evidence never masquerades as canonical state. These semantics govern operational/data-bearing surfaces and do not require ordinary Marketing copy to publish internal product readiness.

## 10. State semantics

Configured, available, planned, modeled, approved, submitted, settled, reconciled, failed, reversed, and cancelled remain distinct states in operational surfaces.

Configured does not prove available. Planned does not prove available. Modeled does not prove executed. Approved does not prove submitted. Submitted does not prove settled. Settled does not prove reconciled.

## 11. Navigation

### Marketing desktop

Canonical groups are **Platform, Products, Solutions, Resources, Company**. Every group has a real hub destination. Disclosures expose hierarchy but do not replace hub links. They are concise, keyboard accessible, and support visible focus, Escape/outside close, and focus return.

### Marketing mobile

Mobile is designed independently. Use direct hub links plus accessible child disclosures, large touch targets, children beneath parents, body scroll lock, focus containment/restoration, Escape close, and route-close behavior.

### Application/Admin

Do not mix marketing IA into authenticated or operator shells. Their navigation follows their own workflow authority.

## 12. Motion and responsive design

Motion communicates interaction, disclosure state, justified content entrance, or real state change. Reduced motion is first-class. Essential content never depends on animation and decorative motion never implies financial execution, settlement, or success.

Responsive behavior is content-driven. Mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+` and transitions between them.

## 13. Accessibility

WCAG 2.2 AA is the minimum target. Preserve semantic HTML, landmarks, one clear H1, coherent heading order, keyboard operation, visible focus, screen-reader naming, correct disclosure semantics, sufficient contrast, large touch targets, reduced motion, meaningful error messaging, and non-color state cues. Use ARIA only when native semantics are insufficient.

## 14. Empty, loading, and error

Empty, loading, unknown, unavailable, and error are different states. Each requires distinct copy, visual treatment, and safe next action on operational/data-bearing surfaces. Never fabricate financial/data content to make a composition feel complete.

## 15. Brand prohibitions

Prohibit excessive blue/teal, decorative gradients, neon, token imagery, crypto trading visuals, bank crests, generic “N” variants, cards everywhere, generic SaaS heroes, fake dashboards, fabricated data, fake logos/testimonials, unsupported partnerships, unsupported regulatory claims, and visual language that falsely implies speculative performance.

## 16. Validation

Design correctness requires source/implementation comparison, responsive validation, accessibility/keyboard validation, actual typecheck/lint/test/build execution, route/link/canonical/asset integrity for Web, browser rendering where tooling is available, and open-PR overlap review.

Report checks as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Never infer build, render, accessibility, SEO, link-integrity, or production success from source inspection.

## 17. Governing expression

> Marketing establishes authority, category, narrative, and meaning.
> The application establishes control and operation.
> Admin establishes operator comprehension, risk visibility, and auditability.
> API establishes domain truth, authorization, durability, and financial state.

> Ivory creates editorial space. Carbon creates authority. Teal signals precision. Operational truth creates trust where financial state is shown.
