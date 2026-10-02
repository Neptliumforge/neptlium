# Neptlium Canonical Design System
**Status:** Authoritative
**Runtime token authority:** `packages/ui/src/styles/tokens.css`
**Shared component authority:** `packages/ui/src/components/**`
**Category:** NEPTLIUM — Capital Operating Platform
> Every movement has authority. Every position has evidence.
This document governs Marketing, Capital, Treasury, authenticated product, intelligence, records, settings and future provider-powered workflows. It never changes financial authority: the canonical ledger remains truth, provider state remains evidence, transaction intelligence remains observational and policy/preflight remains fail-closed.
## 1. Product character
Neptlium is advanced, precise, calm, premium, financial, institutional, responsive, evidence-aware and human-controlled. Avoid generic fintech dashboards, exchange aesthetics, neon crypto styling, pervasive glassmorphism/gradients, random card grids, oversized rounded rectangles, SaaS-template composition and gamification.
Marketing and authenticated products share one identity but intentionally differ in density. Marketing is editorial and spacious. Capital and Treasury are operational, evidence-aware and denser.
## 2. Token authority
Applications MUST consume semantic variables from `@neptlium/ui/styles/tokens.css`. Pages and feature components MUST NOT establish competing palettes, spacing scales, radii, shadows, typography scales or financial-state colors.
The approved dark foundation is:
- Absolute `#000000` — cinematic/deep transitions only.
- Owner-approved canonical dark canvas `#0B0C0E` (RGB 11, 12, 14); deep canvas resolves to the same base wherever a dark canvas is intended.
- Supporting elevated surface `#111214` (RGB 17, 18, 20), used for appropriate panels, cards and inputs. These values supersede the historical `#080C10`, `#041014`, `#0C1014` and `#0C1C20` guidance for those roles.
- Runtime authority: `packages/ui/src/styles/tokens.css`; preserve deliberately light sections, semantic status colors, approved teal accents and unrelated historical records.
- Graphite `#141414 #202020 #2C2C30 #404040 #585858`.
- Text `#F0F0E8 #F8F8F8 #FFFFFF #A0A0A0 #B8B8B8`.
- Mineral Teal `#0C3434 #1F6666 #387068 #4A9992 #59B7AE`.
- Luminous `#00CEC5` is exceptional, not ambient decoration.
Semantic tokens include background/surface/foreground, brand, border/divider, success/warning/danger/info, financial positive/negative/neutral and lifecycle states. Color is never the only status cue.
Subtle dark canvas signatures are defined centrally for Home, Capital, Portfolio, Allocation, Investments, Intelligence, Treasury, Institutional, Infrastructure, Security, Insights and Company. They are not independent page themes.
## 3. Themes
Dark is the primary Neptlium experience. Light and System are first-class. System follows `prefers-color-scheme`; the explicit preference persists under `neptlium-theme`. Light uses a deliberately derived neutral/mineral palette and is not an inversion.
All themes must preserve status meaning, focus visibility, financial legibility, tables, forms, overlays and charts.
## 4. Typography
Two roles govern typography:
1. Editorial display — major public propositions and selected high-level product moments.
2. Product sans — navigation, controls, forms, labels, tables, operational content and numerical data.
Use repository/project-available licensed families and safe fallbacks. Do not claim proprietary third-party fonts.
Canonical roles: Display XL/L/M, H1/H2/H3, Body XL/L/Body/Small, Label/Eyebrow/Caption, Financial XL/L/M/S and Mono/Data. Financial/data values use tabular numerals where alignment matters. Authenticated surfaces must not inherit poster-scale marketing type.
## 5. Geometry
Canonical spacing, containers, radii, shadows, motion, z-index and responsive gutters live in the token authority. Use the 4/8-derived rhythm. Marketing may breathe; operational surfaces may be denser. Elevation is exceptional. Prefer planes, rules, rows, tables and whitespace over nested cards.
Marketing header target is 88px desktop and approximately 72–80px mobile. Authenticated shell uses its own compact operational header/navigation geometry.
## 6. Component grammar
Shared primitives belong in `@neptlium/ui`. Reuse before creating. Canonical families include:
- action: Button, IconButton, Link;
- identity: Logo/BrandMark, Avatar;
- layout: Container, Stack, Cluster, Grid, Section, Divider, Surface/Panel/Card;
- forms: Input, Textarea, Select, Checkbox, Radio, Switch, Field, FieldMessage;
- overlays: Dialog, Sheet, Popover, Dropdown, Tooltip;
- navigation: Tabs, Breadcrumb, Pagination, authenticated navigation/account menu;
- feedback: Badge, Status, Alert, Notice, Empty/Loading/Skeleton/Error/Restricted states;
- data: Table/DataTable, Amount/CurrencyValue/Percentage/Delta/Balance;
- finance: TransactionRow/Status, EvidenceStatus, PortfolioSummary, PositionRow, AllocationBar, AuthorityProgress;
- marketing: header, hero, display headline, CTA, closing CTA and footer.
A second competing primitive requires a documented reason.
## 7. Financial authority presentation
UI state MUST preserve:
`UNKNOWN != ZERO`
`PROVIDER OBSERVATION != CANONICAL LEDGER`
`APPROVED != SUBMITTED`
`SUBMITTED != SETTLED`
`SETTLED != RECONCILED`
`VISIBLE != AUTHORITATIVE`
Supported presentation states include Available, Pending, Processing, Settled, Reconciling, Failed, Restricted, Unknown and Unavailable.
Money-movement UX is modeled as:
**Intent → amount/asset → source/destination → policy/preflight → review → authorization → submission → provider processing → evidence → ledger posting → reconciliation → available/settled**.
The component system may represent every stage even while execution is disabled. Disabled capability must render unavailable/restricted state; it must never fabricate successful execution.
## 8. Public grammar
Public expression: **Capital, intelligently managed.**
Canonical route propositions:
- Capital — Your capital. Your portfolio. One clear view.
- Treasury — Operate capital with control.
- Investments — Invest beyond the ordinary.
- Intelligence — Intelligence for every capital decision.
- Institutional — Infrastructure for modern capital.
- Infrastructure — Build on Neptlium.
Composition is header → generous opening space → proposition → concise support → appropriate CTA → intentional whitespace → evidence/product composition → structured sections → closing proposition. Pages need not share identical heroes.
`/personal` remains legacy convergence to `/capital`; `/business` remains legacy convergence to `/treasury`.
## 9. Authenticated Capital
Capital is an operational environment, not a marketing page or trading terminal. Canonical hierarchy follows Overview, Capital, Portfolio, Investments, Activity/Records, More/Workspace and Settings as supported by repository routes. Funding, withdrawal, transfer, wallet and allocation experiences must display real domain state and safe disabled states.
Treasury remains a separate organization product and authority boundary.
## 10. Treasury
Treasury is a controlled business capital environment. Its UX may expose only repository-supported liquidity, balances, accounts, movement, approvals, records, evidence, reconciliation, controls, operators and policy. Future execution stays gated until backend/provider authority is explicitly activated.
## 11. Intelligence
Intelligence is decision-support. Distinguish observation, analysis, recommendation, evidence, authorized action and canonical financial state. Transaction intelligence remains non-canonical. Never use visual confidence to imply financial authority.
## 12. Responsive and accessibility
Validate representative widths: 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440 and 1600+. Mobile is recomposed rather than shrunk desktop. Tables require deliberate overflow/record-view behavior. Touch targets remain accessible.
WCAG 2.2 AA is the minimum target: semantic HTML, landmarks, coherent headings, keyboard operation, visible focus, labels, focus-managed overlays, sufficient contrast, reduced motion, meaningful errors and non-color status cues.
## 13. Motion
Use motion only for cause/effect, hierarchy, continuity and state. Shared durations/easing come from tokens. Respect `prefers-reduced-motion`. Never animate a financial state in a way that implies execution, settlement or reconciliation not established by domain authority.
## 14. Contribution rules
Before frontend work:
1. Read this document and nearest `AGENTS.md`.
2. Reuse canonical tokens and primitives.
3. Preserve product and financial authority boundaries.
4. Test dark/light/system, responsive behavior, keyboard/focus and non-color state semantics.
5. Do not add raw brand colors or a new type/spacing/radius system in page-local CSS.
6. If a missing primitive is genuinely shared, add it to `@neptlium/ui`, document it and migrate consumers.
7. Provider configuration/execution is outside design authority.
Legacy CSS may remain temporarily where deleting it would create unsafe migration risk, but it MUST consume canonical semantics and MUST NOT define a competing active system. Any exception must be documented and removed in a focused migration.

## 15. Neptlium Capital Rails

Capital Rails are the proprietary spatial and authority grammar derived from the three canonical strokes of NeptliumMark. They are part of this design system, not a marketing artwork layer.

### Geometry
- Preserve the mark's three independent curved strokes: upper movement, middle coordination/convergence, lower position/return.
- Rails may translate, crop, branch through nodes and change depth, but must remain recognizably related to those stroke proportions and curvature.
- Avoid literal pipes, generic blockchain networks, circuitry, particles, neon grids or arbitrary bezier decoration.
- Most rail geometry is distant/structural. Active movement is exceptional.

### Primitive vocabulary
CapitalRails is the shared SVG primitive. Supported variants are movement, position, allocation, evidence, treasury, infrastructure and security. CapitalRailStage is the operational lifecycle primitive. Nodes may be neutral, active, evidence, authorized, reconciling, complete, restricted or failed.

Color mapping is semantic:
- shadow/distant rail → deep mineral teal;
- structural rail → mid/mineral teal;
- active movement/authority → primary teal;
- evidence → bright teal;
- luminous teal → rare exceptional signal only;
- failure/restriction/reconciliation → existing canonical status tokens.

### Motion
Rail progression communicates direction or an active state transition only. Node activation communicates focus/state. Motion uses transform/opacity/stroke-dashoffset and canonical timing. No scroll-jacking or blocking animation. prefers-reduced-motion removes progression animation while preserving structure and labels.

### Marketing use
Marketing may use expressive cropped rail fields, spatial depth and one signature hero object. Different routes use different variants rather than identical artwork. Background rails remain subordinate to copy. The closing experience may visually converge toward the Neptlium mark.

### Authenticated use
Capital Rails become quiet and operational. Use them for canonical position relationships, supported transaction progression, evidence/reconciliation and loading/progress relationships. Never use animation or an active node to imply execution that domain state has not established.

### Treasury use
Treasury may use the strongest operational rail expression to explain capital sources/destinations, authority, approvals, evidence and reconciliation. Unknown organization state must remain unknown; a rail must not manufacture a balance, permission, settlement or capability.

### Authority mapping
A movement lifecycle may distinguish Intent → Policy/Preflight → Review → Authorization → Submission → Provider Processing → Evidence → Ledger Posting → Reconciliation → Available only when those stages exist in the real domain. Provider confirmation never receives the Available treatment until canonical ledger/reconciliation authority establishes it.

### Performance and accessibility
Prefer SVG/CSS/browser-native animation. Do not add an animation dependency solely for rails. Keep decorative rail SVGs aria-hidden; semantic rails require a concise accessible label/legend. Financial meaning never depends on color or motion. Mobile crops complexity before shrinking text or controls.

### Extension rule
Future developers MUST extend CapitalRails, its canonical rail tokens and documented variants before creating new rail artwork. Page-local rail palettes, independent node semantics, duplicated mark-derived SVG geometry and generic fintech network art are prohibited.


## 16. Web product-language authority

Public Web defines the public language of the Capital Operating Platform without becoming backend/domain authority.

Primary public capability hierarchy:
**Capital → Portfolio → Investments → Treasury → Intelligence → Infrastructure**.

Supporting expressions are Institutional, Security, Insights and Company. Allocation remains a supported route and product concept inside Capital/Portfolio architecture rather than a competing top-level identity.

The Web header uses progressive disclosure: product discovery exposes the six capabilities; Solutions, Institutional and Insights provide audience/context discovery; Sign in and Get started remain account actions. Mobile uses the same information architecture with progressive disclosure rather than Personal/Business account switches.

The footer is an information architecture surface organized around Product, Platform, Resources, Company, Legal and Account destinations. Only real repository destinations may be listed.

### Public claims
Marketing claims must remain within repository truth. Use implemented/available language only when the capability exists at the relevant boundary. Use limited/developing/conceptual language when appropriate. Never present configured providers, synthetic intelligence, illustrative product states or future execution architecture as live capability.

### Host authority
The canonical public metadata authority is `https://neptlium.com`. Sitemap, robots, OpenGraph, structured data and route metadata use that origin. Deployment/domain redirects must converge alternate hosts to the same canonical origin before production certification.

<!-- Validation baseline: canonical design system final production gate. -->


## 17. One experience system

Neptlium has one experience system with contextual density, not separate application brands.

| Mode | Primary surface | Expression |
| --- | --- | --- |
| Public / Editorial | `apps/web` | Spacious, explanatory, product-demonstrative |
| Authenticated / Operational | `apps/app` | Financially hierarchical, concise, action-oriented |
| Institutional / Organizational | `apps/treasury` | Higher-density organization capital operations |
| Focused Transactional | `apps/pay` | Minimal, trusted transaction flow |
| Operator | `apps/admin` | Highest information density and authorized diagnostics |
| Technical | `apps/docs` | Developer and integration information |
| Operational Public | `apps/status` | Service availability |

These modes share Neptlium mark/wordmark, Mineral Teal and neutral semantics, typography roles, spacing rhythm, geometry, borders, button grammar, financial-value grammar, icon grammar, Capital Rails, motion principles, state semantics and terminology. Layout and density MAY differ by audience.

A customer moving from `neptlium.com` to `app.neptlium.com` crosses an authentication boundary, not a brand boundary.

## 18. Provider-neutral presentation

Provider integrations MUST NOT introduce provider visual identity as Neptlium product identity. Hyperliquid or Aster must not redefine Invest; Circle must not redefine Capital; Stripe must not redefine Payments; a future Mercury integration must not redefine Treasury.

The presentation dependency is:

```text
Neptlium UI
    ↓
Normalized Neptlium state
    ↓
Neptlium domain / capability
    ↓
Provider adapter
```

Shared UI MUST NOT call provider SDKs directly or render arbitrary provider-native errors. Provider-specific colors may appear inside a materially appropriate asset/network/provider identity mark or required disclosure, but MUST NOT become application theme tokens or financial-state semantics.

## 19. Shared theme and component authority

The existing shared theme contract is authoritative. Dark, Light and System are the supported modes; System follows browser/OS preference and explicit preference persists through the existing `neptlium-theme` contract. Applications MUST converge toward the shared implementation rather than establish independent theme systems.

`@neptlium/ui` owns genuinely cross-surface presentation primitives. Convergence candidates include theme control, Status, Amount/FinancialValue/Balance, transaction/position/activity rows, Tabs, AccountMenu shell, Empty/Unavailable/Restricted/Pending/Error states, Skeleton, PortfolioSummary, CapitalSummary and allocation visualization. Application-owned routing, data loading, authorization and domain behavior remain application-owned.

Shared presentation consumes normalized Neptlium state and never owns provider calls or provider financial authority.

## 20. Recorded convergence debt

The following verified implementation debt is recorded for focused follow-up work; it is not an independent design authority and is not corrected by this architecture lock:

| Path | Debt |
| --- | --- |
| `apps/pay/app/global.css` | CONVERGE/REPLACE local palette with canonical semantic tokens |
| `apps/status/app/global.css` | CONVERGE/REPLACE local palette with canonical semantic tokens |
| `apps/docs/app/global.css` | CONVERGE/REPLACE local palette with canonical semantic tokens |
| `apps/admin/app/global.css` | CONVERGE local light palette into canonical theme semantics |
| `apps/admin/app/layout.tsx` | CONVERGE hard-coded appearance to shared Light/Dark/System authority |
| `apps/web/app/layout.tsx` | REMOVE duplicated theme-boot authority through focused convergence |
| `apps/app/app/layout.tsx` | REMOVE duplicated theme-boot authority through focused convergence |
| `apps/treasury/app/layout.tsx` | REMOVE duplicated theme-boot authority through focused convergence |
| `apps/app/components/navigation/ThemeSwitcher.tsx` | REPLACE local theme-control behavior with shared authority |
| `apps/app/app/global.css` | CONVERGE dark-only color-scheme assumption with first-class Light/Dark/System |

These classifications authorize no migration by themselves. Theme and experience migrations require focused implementation PRs with responsive, accessibility and financial-state validation.

## 21. Capital Rails continuity

Capital Rails remain one Neptlium-owned spatial/motion grammar across modes. Web may use them expressively; App uses them quietly and operationally; Treasury may use them to clarify organization capital authority; Admin may use them diagnostically. The geometry, semantic state mapping and financial-authority constraints remain those defined in section 15.

Provider replacement MUST NOT require new rail geometry, provider-colored lifecycle semantics, or a provider-branded customer experience.
