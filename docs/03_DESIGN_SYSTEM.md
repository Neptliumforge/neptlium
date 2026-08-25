# Neptlium Design System

**Status:** Authoritative  
**Scope:** `neptlium.com`, `app.neptlium.com`, `admin.neptlium.com`, developer/API surfaces, research/intelligence surfaces, and shared brand expression  
**Category:** Capital Operating Platform

This is the central design authority for Neptlium. It governs durable visual, interaction, information, state, accessibility, motion, and surface principles. It does not convert strategy, modeled architecture, provider configuration, or planned capability into current product capability. Historical design material under `docs/archive/**` is non-authoritative unless explicitly reinstated.

## 1. Design thesis

Neptlium makes complex capital systems understandable, governable, and actionable. Its design communicates institutional authority, financial truth, operational control, computational intelligence, structural depth, technical precision, and calm confidence.

The governing principles are **precision, restraint, depth, and certainty**.

Sophistication must come from hierarchy, evidence, information quality, interaction clarity, and implementation coherence—not spectacle. The interface must never be more confident than the underlying domain.

The operating progression is:

**Know → Understand → Decide → Authorize → Execute → Verify**

These stages remain distinct. Recommendation is not authorization. Authorization is not execution. Execution is not settlement. Settlement is not reconciliation.

## 2. Surface responsibilities

### Marketing

Marketing establishes category, meaning, authority, relevance, verified capability, and a path into the product. It is editorial and architectural, not an authenticated financial dashboard.

### Application

Application establishes customer intelligence, control, and operation. It presents authoritative customer state, evidence, analysis, governed workflows, and available actions. Browser representation is not authorization.

### Admin

Admin establishes operator comprehension, evidence, exceptions, queues, approvals, risk visibility, lifecycle state, reconciliation, and auditability. Administrative action never visually proves external completion before authoritative confirmation.

### Developer / API

Developer surfaces establish programmability, integration clarity, predictable primitives, authentication, permissions, versioning, errors, examples, and fast time-to-first-success.

### Research / Intelligence

Research establishes intellectual authority while distinguishing fact, data, model output, scenario, estimate, interpretation, methodology, and opinion.

### API / Domain

The domain establishes authentication, authorization, ownership, durable state, provider isolation, ledger consequence, audit, reconciliation, and authoritative lifecycle transitions. Presentation cannot override domain state.

## 3. Identity architecture

Neptlium has one canonical mark geometry and one identity system.

The mark is structural, flat, precise, compact, monochrome-capable, and recognizable at small sizes. The repository-authoritative geometry must be reused directly; do not redraw it from prompts, screenshots, or generated artwork.

The primary lockup is the **Neptlium wordmark followed by the canonical mark**. Marketing may use the mark in Mineral Teal as a precision signal. Authenticated and operator surfaces are monochrome-first and normally inherit black/white foreground.

### Permitted identity modes

- **Institutional:** Ivory field, Carbon wordmark and mark.
- **Authority:** Carbon field, Ivory wordmark and mark.
- **Precision:** neutral composition with a restrained Mineral Teal mark or system signal.
- **Product:** white/black/neutral composition; semantic color only for actual state.

### Prohibited identity treatments

Do not stretch, rotate, bevel, emboss, outline, glow, extrude, add gradients, create glossy 3D treatments, create decorative shadows, place the mark in invented crests/coins/tokens, animate it decoratively, or create competing mark geometries.

Application icons and favicons derive from the same canonical geometry. Product icons should use flat monochrome treatments; glossy teal/cyan consumer-app artwork is not canonical product identity.

## 4. Color system

### Marketing identity palette

| Name | Value | Role |
| --- | --- | --- |
| Warm Ivory | `#F5F3EE` | Primary editorial and Marketing canvas |
| Carbon | `#101214` | Authority surface and primary dark tone |
| Mineral Teal | `#0F8F86` | Marketing precision signal and selective primary action |
| Interaction Teal | `#20AFA3` | Marketing hover/focus emphasis |
| Graphite | `#343A3F` | Secondary dark neutral |
| Stone | `#D8D5CE` | Structural divider |
| Soft Mist | `#ECEAE5` | Secondary light surface |
| Signal Amber | `#C88B28` | Warning/attention only |

**Ivory creates editorial space. Carbon creates authority. Teal signals precision. State communicates truth.**

Marketing should remain predominantly neutral. Teal is an instrument, not background paint.

### Application and Admin

Application and Admin are fundamentally **WHITE + BLACK + NEUTRAL**.

Their default visual system derives from white, near-white, Carbon/black, near-black, graphite, gray, neutral dividers, neutral hover/selected states, and semantic exceptions.

Do not use Mineral Teal, blue, green, amber, or red as broad brand decoration in authenticated/operator UI. Semantic color exists only when it materially communicates state.

Product components should consume semantic neutral roles such as canvas, surface, inset, foreground-primary, foreground-secondary, foreground-muted, border-subtle, border-standard, border-strong, hover, selected, disabled, focus, overlay, and inverse rather than uncontrolled raw gray values.

## 5. Semantic color and financial truth

Success, warning, danger, informational, disabled, focus, selected, loading, stale, unknown, unavailable, pending, restricted, and error require distinct treatment. Color alone is insufficient; pair it with text, labels, icons, shape, stroke, or other semantics.

`UNKNOWN != ZERO`.

| State | Meaning |
| --- | --- |
| Known | Required authoritative evidence supports the value |
| Confirmed zero | Evidence confirms zero in the stated scope |
| Unknown | Evidence cannot establish the value |
| Unavailable | Capability/value cannot currently be supplied |
| Loading | A bounded operation is in progress and implies no value |
| Stale | Prior information exists but freshness requirements fail |
| Error | Retrieval or processing failed |
| Pending | Lifecycle progression has begun without reaching the next authoritative state |
| Modeled | Computed scenario or estimate, not observed authoritative state |
| Restricted | State may exist but permission/policy prevents access or action |

Never render `$0`, `$0.00`, `0%`, `0 units`, or an ambiguous dash unless the meaning is established. Provider-observed is not automatically canonical. Modeled is not observed. AI interpretation is not authoritative evidence.

## 6. Lifecycle semantics

Preserve configured, eligible, available, planned, modeled, recommended, requested, approved, authorized, submitted, processing, settled, reconciled, failed, reversed, cancelled, and restricted where applicable.

Configured does not prove available. Planned does not prove implemented. Modeled does not prove observed. Recommended does not prove approved. Authorized does not prove submitted. Submitted does not prove settled. Settled does not prove reconciled.

## 7. Typography

Typography establishes hierarchy before containers or decoration.

Marketing may combine restrained editorial display/serif authority with precise sans-serif body and utility typography. Public Web remains medium-scale: authority comes from composition and measure rather than poster-sized type.

Application/Admin use quiet operational typography, concise body copy, stable navigation, tabular numerals, explicit units, and readable density. Geist/current operational typography remains the baseline where implemented.

Conceptual roles: Display, H1, H2, H3, H4, Lead, Body, Small, Caption, Label, Navigation, Button, Numeric/Data, Code.

Do not manufacture hierarchy through excessive uppercase microcopy.

## 8. Spacing, grid, and hierarchy

Prefer existing repository tokens and a 4/8-derived rhythm. Conceptual progression: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160`.

Build hierarchy in this order:

1. Typography
2. Whitespace
3. Alignment
4. Contrast
5. Scale
6. Surface
7. Border
8. Elevation

Use controlled maximum widths and responsive gutters. Marketing favors left alignment, editorial asymmetry, negative space, selective full bleed, and structural rules. Application favors stable controls and readable working widths. Admin favors evidence density and scanning.

Do not default to card grids. Prefer rows, planes, tables, rules, whitespace, timelines, and progressive disclosure when they explain relationships more clearly.

## 9. Shape and elevation

Neptlium is not soft, bubbly, or consumer-fintech oriented. Use radii sparingly and consistently. Avoid giant pill controls, rounded-card proliferation, nested containers, decorative shadows, glassmorphism, and floating panels without structural purpose.

Elevation is a last resort.

## 10. Marketing composition

Canonical direction: **warm architectural light + Carbon authority + Mineral Teal precision**.

Marketing may use large editorial statements, original structural diagrams, data-derived abstraction, selective authority-dark sections, meaningful negative space, and subtle structural lines.

The homepage should establish what Neptlium is, why it matters, verified capability, trust, and next action. It should progress through **Capital → Structure → Intelligence → Action**, not default to a generic hero/cards/features/CTA template.

Avoid token walls, candlesticks as decoration, order books, crypto imagery, glowing spheres, fabricated dashboards, unsupported provider imagery, generic AI particles, stock-photo finance, and speculative wealth imagery.

## 11. Application composition

Application is a precision capital operating environment, not Marketing reduced into cards and not a retail trading terminal.

Primary expression is **white + black + neutral grayscale**. Information itself is the visual centerpiece. Favor strong typography, white space, precise dividers, tabular data, explicit state, low-noise navigation, controlled density, and clear action hierarchy.

Canonical desktop navigation remains Overview, Portfolio, Capital Account, Treasury, and Allocation until superseded by a newer authenticated-application authority.

## 12. Admin composition

Admin is a high-trust operational evidence system. It is also **white + black + neutral grayscale** by default and may be denser than Application.

Prioritize timestamps, identifiers, evidence, queues, statuses, lifecycle progression, reconciliation, exception visibility, and operator action. Semantic danger/warning colors should command attention because ordinary state is restrained.

## 13. Intelligence and AI

Intelligence should feel like evidence becoming understanding. A useful sequence is **Signal → Context → Evidence → Interpretation → Consequence → Possible Action**.

Distinguish observed, derived, modeled, recommended, authorized, and executed information. Where consequential, expose source, timestamp, confidence, methodology, assumptions, affected entities, freshness, and limitations.

AI should feel integrated into the operating system, not attached as a novelty chatbot. Avoid sparkle-icon abuse, magical gradients, fake typing, anthropomorphic certainty, and chat where structured interaction is clearer.

Never collapse Recommendation → Authorization → Execution. AI-generated text never masquerades as canonical financial state.

## 14. Graph and data visualization

Charts and relationship views answer real questions. Use them to clarify trend, comparison, distribution, exposure, dependency, ownership, concentration, chronology, provenance, or risk propagation.

Application/Admin charts remain primarily monochrome/neutral with semantic color only where meaningful. Distinguish observed, canonical, modeled, estimated, projected, incomplete, stale, unavailable, and uncertain data. Never animate modeled results as though capital is moving or interpolate missing financial data without identifying the interpolation.

## 15. Controls and forms

Primary actions represent one dominant action. Marketing may use Mineral Teal. Application/Admin primary actions should normally be black on light surfaces or white on dark surfaces, with restrained neutral secondary actions.

All controls define default, hover, focus-visible, active, disabled, and loading states. Disabled/loading controls must not appear actionable.

Every field has a persistent label. Help text explains format or consequence. Errors explain the problem and recovery. Placeholder text is never the only label.

Consequential workflows preserve **Input → Review → Authorization → Submission → Outcome**.

## 16. Tables and data

Use tabular numerals, explicit units, currency/asset/network context where relevant, valuation timestamps, freshness, and provenance. Comparable numeric columns should align appropriately.

Tables define density, sorting, filtering, selection, pagination, keyboard behavior, overflow, mobile transformation, loading, empty state, and actions. Never sacrifice meaning merely to fit more columns.

## 17. Navigation

Marketing desktop uses real hub destinations and concise accessible disclosures. Current canonical groups are Platform, Products, Solutions, Resources, and Company where repository architecture supports them.

Mobile navigation is deliberately recomposed for touch with large targets, semantic disclosure state, focus management, Escape behavior, scroll locking where appropriate, focus restoration, and route-close behavior.

Application navigation follows customer operating workflows. Admin navigation follows queues, exceptions, approvals, reconciliation, evidence, operations, and investigation. Do not mix Marketing IA into authenticated shells.

## 18. Overlays and feedback

Dialogs, confirmation dialogs, drawers, sheets, popovers, tooltips, menus, banners, and toasts each have distinct responsibilities. Blocking surfaces define focus entry/containment/restoration, Escape behavior, dismissal, scroll behavior, accessible naming, and mobile adaptation.

Do not use modals to avoid designing a page. Complex consequential workflows often deserve dedicated review surfaces.

Transient toasts are only for information that may safely disappear. Consequential financial outcomes require persistent representation. Never show generic success for an operation that is merely queued/submitted.

## 19. Motion and transitions

Motion communicates cause/effect, hierarchy, continuity, disclosure, spatial relationship, feedback, or real system state.

Conceptual timing bands:

- Immediate: `80–140ms`
- Fast: `120–200ms`
- Standard: `160–280ms`
- Deliberate: `280–500ms`

Longer motion requires specific justification. Define shared easing tokens rather than random easings.

Hover should feel immediate and precise. Button press may use subtle compression/contrast without cartoon scaling. Menus/popovers use short fade plus small spatial transition. Drawers move from their physical origin. Route transitions exist only when they improve orientation.

Never animate financial state in a way that implies execution, settlement, reconciliation, performance, success, or provider confirmation unless that state is established. `prefers-reduced-motion` is first-class.

## 20. Loading, empty, unavailable, and error

Distinguish initial loading, incremental loading, background refresh, action pending, deterministic progress, indeterminate progress, stale-while-refreshing, blocked, and unavailable states.

Preserve known stale information when safer than replacing it with blank skeletons; label freshness. Skeletons approximate actual content structure.

Empty means the authoritative scope is known and contains no records. Unknown means evidence cannot establish state. Unavailable means capability/data cannot currently be supplied. Restricted means permission/policy prevents access/action. Error means an attempt failed.

Errors should explain what failed, what is known, what remains unchanged, whether retry is safe, and whether investigation/support is required. Do not reduce every failure to “Something went wrong.”

## 21. Responsive design

Mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+` and transitions between them.

Dense components recompose rather than merely shrink. Tables may scroll, prioritize columns, expand rows, or become record views. Dialogs may become sheets/full-screen workflows. Do not hide consequential information to fit mobile.

## 22. Accessibility

WCAG 2.2 AA is the minimum target. Preserve semantic HTML, landmarks, one clear H1, coherent heading order, keyboard operation, visible focus, correct disclosure/dialog semantics, persistent form labels, sufficient contrast, large touch targets, reduced motion, meaningful errors, table semantics, chart alternatives, and non-color state cues.

Prefer native semantics before ARIA. Every icon-only interactive control requires an accessible name.

## 23. Content design

Copy is concise, precise, evidence-aware, institutional, calm, and explicit around uncertainty. Avoid generic SaaS/crypto language, inflated AI claims, “revolutionary,” “seamless,” “effortless,” “instant,” “secure,” or “guaranteed” without evidence.

Use exact lifecycle verbs: Review, Approve, Authorize, Submit, Confirm, Retry, Reverse, Cancel. Do not say “Complete” when the system means “Submitted.”

## 24. Component architecture

Prefer: **Foundation tokens → Accessible primitives → Shared components → Surface components → Domain components → Page composition**.

Do not place financial business logic inside generic visual primitives. Do not force Marketing components into Application merely to maximize reuse. Shared behavior does not require identical composition.

Core patterns should define purpose, variants, states, keyboard/accessibility behavior, responsive behavior, motion, loading/error behavior, and surface-specific differences.

## 25. Performance

Design accounts for font loading, images, animation cost, JavaScript, visualization libraries, hydration, route bundles, layout shift, and interaction latency. Do not add visual sophistication that materially damages responsiveness.

## 26. Security-aware UX

UI availability never implies authorization. Disabled UI is not a security control. Browser visibility does not define financial authority. Clearly represent insufficient permission, additional authorization, session expiry, unavailable capability, and actions that cannot safely complete.

## 27. Brand prohibitions

Prohibit excessive blue/teal, decorative gradients, neon, glassmorphism, crypto/token imagery, bank crests, competing mark geometries, cards everywhere, generic SaaS heroes, glowing AI imagery, random network particles, fabricated dashboards/data/logos/testimonials, unsupported partnerships/regulatory claims, and visual language implying guaranteed/speculative performance.

## 28. Validation

Design correctness requires source/implementation comparison, responsive validation, accessibility/keyboard validation, actual typecheck/lint/test/build execution where available, browser rendering/console inspection where tooling exists, production comparison when relevant, and open-PR overlap review.

Report checks as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Never infer build, rendering, accessibility, financial correctness, or production success from source inspection alone.

## 29. Governing laws

> Marketing establishes authority and meaning.  
> Application establishes intelligence, control, and operation.  
> Admin establishes operator comprehension, evidence, risk visibility, and auditability.  
> Developer surfaces establish programmability and integration clarity.  
> Research establishes intellectual authority without manufacturing certainty.  
> API and domain establish authorization, durability, ownership, and financial truth.

> Observation is not interpretation.  
> Interpretation is not recommendation.  
> Recommendation is not authorization.  
> Authorization is not execution.  
> Execution is not settlement.  
> Settlement is not reconciliation.

> Unknown is not zero.  
> Modeled is not observed.  
> Provider-observed is not automatically canonical.  
> Configured is not available.  
> Planned is not implemented.

> Typography creates hierarchy.  
> Whitespace creates structure.  
> Carbon creates authority.  
> Ivory creates editorial space.  
> Teal signals precision.  
> Evidence creates trust.

## 30. Final standard

Neptlium should not look like software attempting to appear institutional. It should feel like institutional infrastructure expressed with exceptional product design.

Every significant surface should let a user determine with minimum unnecessary effort: **What is true? What changed? Why does it matter? What evidence supports it? What is inferred? What can I do? What authorization is required? What happens next? What happened after the action? Is the result authoritative and reconciled?**

> **Make complexity legible. Make intelligence useful. Make interaction precise. Make action governed. Make state truthful. Make evidence visible. Remove everything that does not help.**
