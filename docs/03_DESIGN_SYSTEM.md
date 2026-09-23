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
- Canvas `#080C10`; deep canvas `#041014`.
- Surface `#0C1014`; raised surface `#0C1C20`.
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