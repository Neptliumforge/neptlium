# Neptlium Marketing Design Doctrine

**Status:** Authoritative
**Primary implementation:** `apps/web` → `https://neptlium.com`
**Doctrine:** Premium White / Cobalt / Crystalline Capital Experience

This document is the final marketing design authority for `apps/web`. Where it conflicts with older marketing-specific Capital Precision assumptions, this document wins. `docs/03_DESIGN_SYSTEM.md` continues to govern shared typography, operational-product restraint, accessibility and cross-product design principles unless this document explicitly overrides them for marketing.

## 1. Scope and boundary

This doctrine governs:

- `apps/web`
- shared marketing primitives
- shared brand-semantic tokens
- marketing tests
- public metadata and SEO
- public assets
- marketing documentation
- Vercel configuration owned by `apps/web`

It does not authorize redesign or behavior changes to `apps/app`, `apps/admin`, `apps/api`, Supabase, auth, ledger, deposits, withdrawals, treasury execution, allocation execution, custody or provider integrations.

The authenticated product remains recognizably Neptlium through the same identity, typography family, semantic color family and brand geometry, but remains materially quieter and more operational than marketing.

## 2. Core doctrine

Neptlium marketing is a **Premium White / Cobalt / Crystalline Capital Experience**.

It should feel premium, capital-grade, precise, institutional, calm, modern, intelligent, highly engineered, globally credible, product-led and operationally serious.

It must not feel crypto-hype driven, speculative, retail-trading oriented, blue-saturated, neon, generic-fintech, SaaS-template driven, consumer-exchange-like, token-launch oriented or card-heavy.

> **White establishes clarity. Midnight establishes authority. Cobalt establishes identity. Crystalline light establishes precision.**

The finished experience should feel like **an institution designed as software**.

## 3. Canonical identity

**Product:** Neptlium
**Primary domain:** `https://neptlium.com`
**Authenticated product:** `https://app.neptlium.com`
**API:** `https://api.neptlium.com`
**Administration:** `https://admin.neptlium.com`
**Connectivity identity:** Neptlium Link
**Link domain:** `https://link.neptlium.com`

Canonical positioning:

> **Neptlium is a capital operating platform for digital assets.**

Core expression:

> **Digital capital, organized with institutional intelligence.**

Supporting definition:

> Neptlium helps users understand, organize, govern and operate digital capital through one controlled capital environment.

Marketing explains the system. The authenticated application operates the system. Never blur those responsibilities.

## 4. Canonical brand palette

The shared brand-semantic token layer is the runtime authority for the marketing palette.

### Brand blues

- Midnight Blue — `#011255`
- Deep Cobalt — `#011D85`
- Core Blue — `#012ABD`
- Primary Brand Blue — `#0141F3`
- Bright Blue — `#026FFA`
- Signal Azure — `#11A3F9`
- Highlight Cyan — `#53D1F8`
- Ice Highlight — `#C0F5FC`

### Light system

- Canvas White — `#FFFFFF`
- Soft Canvas — `#F7F9FC`
- Cool Surface — `#F1F5FA`
- Soft Blue Surface — `#EDF4FF`

### Ink

- Primary Ink — `#08111F`
- Secondary Ink — `#39475A`
- Muted Ink — `#68758A`

### Borders

- Standard Border — `#DCE4EF`
- Blue Border — `#C8D9FF`

Marketing CSS must consume these semantic tokens. It must not own another hard-coded Neptlium palette.

## 5. Color governance

Approximate visual balance:

- 75–80% white and light-neutral territory
- 10–20% midnight/cobalt authority territory
- 5–10% active cobalt, azure and crystalline emphasis

This is compositional guidance, not a literal pixel quota.

`#0141F3` is the principal active identity and interaction blue. Use it for primary CTAs, active navigation, selected states, directional cues and focused system emphasis.

`#011255` establishes authority. Use it for major capital architecture, deliberate dark transitions, strong closing environments and high-confidence institutional surfaces.

Azure, Cyan and Ice are optical accents only. They may communicate directional flow, system traces, selected data and crystalline refraction, but they must never become the default atmosphere.

## 6. Signature gradient

One expressive gradient is governed:

`#011255 → #011D85 → #0141F3 → #11A3F9 → #53D1F8`

It may be used only for expressive hero identity, major brand transitions, capital-flow emphasis, selective premium illustration and controlled system illumination.

Never use it on ordinary buttons, body text, ordinary panels, every section or as permanent page atmosphere.

## 7. Reference principles

Use principles, never imitation.

**Apple:** typographic hierarchy, whitespace discipline, few competing treatments, adaptive composition, craftsmanship and restraint.

**Vercel / Geist:** exact grids, compact precision, spacing consistency, typography discipline and quiet contrast.

**GitHub / Primer:** semantic tokens, accessibility, metadata readability and operational hierarchy.

**Stripe:** infrastructure storytelling, technical credibility, controlled depth and enterprise seriousness.

**Link:** direct language, concise propositions and confident conversion architecture.

**OpenAI Business / Enterprise:** category-level positioning, capability-led narrative, governance storytelling and disciplined information density.

Never reproduce proprietary branding, layouts, copy, illustrations, interaction patterns or assets.

## 8. Visual character

Neptlium marketing should feel:

**WHITE · OPTICAL · COBALT · CRYSTALLINE · CAPITAL-GRADE · PRECISE · COMPOSED · INSTITUTIONAL · INTELLIGENT**

Avoid purple, neon, candlesticks, ticker walls, token-icon walls, glassmorphism, glowing card borders, floating dashboard tiles, generic blockchain nodes, coin illustrations, fake trading screens, decorative gradient blobs and excessive shadow.

## 9. Typography

Typography carries most of Neptlium's authority.

Preferred fallback stack:

```css
font-family:
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI Variable",
  "Segoe UI",
  "Helvetica Neue",
  Arial,
  sans-serif;
```

An already-installed and appropriately licensed local family may be retained if it follows the same hierarchy. Do not fetch remote Google Fonts. Do not pretend proprietary Apple fonts are universally available. Do not add unnecessary font binaries. Use monospace only for technically meaningful identifiers.

### Semantic roles

- `display-72`: 72px exceptional display, 500–600, 0.98–1.04 line-height, `-0.035em`
- `display-64`: 64px primary display, 500–600, 1.00–1.06, `-0.032em`
- `display-56`: 56px restrained display, 500–600, 1.02–1.08, `-0.028em`
- `hero-title-64`: 64px desktop / 40–52px mobile, 500–600, 1.00–1.07
- `hero-title-56`: 56px desktop / 38–48px mobile, 500–600, 1.02–1.08
- `page-title-48`: 48px desktop / 34–42px mobile, 500–600
- `section-title-36`: 36px desktop / 28–32px mobile, 500–600
- `section-title-32`: 32px desktop / 26–30px mobile, 500–600
- `panel-title-22`: 22px, 500–600
- `component-title-18`: 18px, 500–600
- `lead-22`: 22px desktop / 18–20px mobile, 400
- `lead-20`: 20px desktop / 18px mobile, 400
- `body-17`: 17px desktop / 16px mobile, 400
- `body-16`: 16px, 400
- `body-14`: 14px, 400
- `label-14`: 14px, 500
- `metadata-12`: 12px, 400–500
- `caption-11`: 11px, non-critical only
- `mono-13` / `mono-12`: technical metadata only

Use sentence case by default. Uppercase is reserved for rare technical or structural overlines.

## 10. Editorial voice

Every visible sentence should sound direct, institutional, concise, technically credible, composed, capital-aware and non-promotional.

Prefer: organize, govern, observe, allocate, preserve, connect, operate, authorize, measure, understand, control.

Avoid: revolutionary, seamless, game-changing, limitless, future of finance, financial freedom, moon, yield-maximizing, next-gen crypto and DeFi hype.

Preferred:

> Operate digital capital with greater control.

> Organize digital assets, capital policy and operational activity in one governed environment.

## 11. Marketing responsibility

The public website must explain what Neptlium is, who it serves, the fragmentation it addresses, the capital operating model, how governance works, how connectivity participates, what the authenticated product does, where operation is constrained and how users move from understanding toward controlled operation.

The public website must not impersonate the authenticated dashboard.

## 12. Homepage architecture

Target approximately six major compositions:

1. Navigation + Hero
2. Capital Operating Thesis
3. Product Operating System
4. Treasury + Allocation + Connectivity
5. Governance + Technical Foundation
6. Conversion + Footer

Portfolio, Capital Account, Treasury, Allocation and Link are internal moments inside this larger narrative. Avoid twelve equally weighted sections and long sequences of identical cards.

## 13. Navigation + Hero

Recommended eyebrow:

> **DIGITAL CAPITAL OPERATING INFRASTRUCTURE**

Recommended headline:

> **Capital, organized around you.**

Supporting copy:

> Neptlium brings digital assets, capital policy, portfolio visibility, treasury structure and connectivity into one controlled operating environment.

Primary CTA:

> **Explore Neptlium**

Secondary CTA:

> **Enter the App**

The hero must not default to left copy plus a dashboard screenshot. Prefer an asymmetric editorial composition with strong white space, one capital-system visual, cobalt dimensional architecture, restrained system traces, crystalline highlights, minimal motion and one understandable transformation.

Conceptual sequence:

**CAPITAL → STRUCTURE → POLICY → CONTROL → OPERATION**

Never place token logos, coins, market tickers, candlesticks, fake balances, fake returns or fabricated customer data in the hero.

## 14. Capital operating thesis

Digital capital may exist across wallets, exchanges, custodians, networks, providers, treasury systems, spreadsheets and disconnected operating tools.

Canonical conceptual sequence:

**CAPITAL SOURCES → CONNECTIVITY → PORTFOLIO → TREASURY → POLICY → ALLOCATION → AUTHORIZATION → OPERATIONAL RECORD**

The architecture must remain understandable without hover and at mobile widths.

## 15. Product system

The principal public product model is Overview, Portfolio, Capital Account, Treasury and Allocation. These are components of one capital operating system, not five unrelated tiles.

Use editorial compositions, layered product states, system diagrams, split layouts and full-width product moments.

## 16. Product truth

Portfolio may explain ownership, exposure, concentration, liquidity, classification, contribution and activity. Never fabricate balances, returns, performance, holdings or live positions.

Capital Account may explain account readiness, provisioning, deposit capability, withdrawal capability, network state and capital activity. Never imply a rail is enabled unless verified.

Treasury may explain reserve structure, liquidity, obligations, operating capacity, policy controls and capital readiness. Never fabricate balances, reserve percentages, runway, yield or obligations.

Allocation uses **OBSERVE → MODEL → AUTHORIZE** and the classifications Reserve, Core, Growth, Opportunity and Restricted. Do not imply autonomous trading, automatic rebalancing, fiduciary advice or automatic execution.

## 17. Neptlium Link

Positioning:

> **Institutional Connectivity Infrastructure for Digital Capital.**

Link may explain connectivity to wallets, custody, blockchains, exchanges, treasury providers and infrastructure services. It is supporting infrastructure and must not overtake the primary Neptlium platform narrative.

## 18. Governance and live-state language

Governance communicates explicit authorization, policy boundaries, human approval, controlled execution, provider isolation, permission boundaries, operational records and system-state visibility.

Do not fabricate regulatory approvals, certifications, custody assurances, insurance or institutional adoption.

Permitted operational states include Connected, Configured, Restricted, Awaiting provisioning, Capability disabled, No activity recorded, Provider unavailable and Not configured.

Never use **Live** unless backed by verified production capability.

## 19. Surface architecture

**Editorial Surface:** White or Soft Canvas, typography-led, broad composition, little or no border, negligible elevation.

**Capital Surface:** Midnight Blue, high-contrast typography, restrained cobalt structures and subtle system lines.

**Standard Panel:** 20–24px padding, 1px cool border, shallow radius, minimal elevation.

**Status Panel:** compact, one state, one explanation and one real action only when available.

Not every surface is a card.

## 20. Geometry, controls and navigation

Use the 4px rhythm:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 120`

Page gutters:

- mobile: 16px
- tablet: 24px
- desktop: 32–48px

Major section spacing:

- desktop: approximately 64–96px
- mobile/tablet: approximately 48–72px

Buttons are 40–44px by default with a minimum 44px mobile touch target. Primary buttons use `#0141F3` with white foreground; hover uses `#026FFA`. No cyan or gradient buttons.

Navigation should be compact, deliberate and editorial. It may organize around Platform, Capital, Connectivity, Security / Governance, Company and Enter App. Dropdowns exist only when information architecture requires them.

Mobile navigation must retain scroll lock, current-route visibility, 44px targets, keyboard/focus management, Escape behavior and focus restoration.

## 21. Motion and crystalline language

Timing bands:

- Instant: 80–120ms
- Interface: 160–220ms
- Editorial: 320–500ms
- Ambient: 8–20s

Motion may support hero entrance, capital-path traces, architecture progression, navigation transitions and controlled product-state transitions.

Do not hijack scrolling, float cards indefinitely, animate every component, introduce particle systems or run expensive continuous JavaScript loops.

Always respect `prefers-reduced-motion: reduce`.

The approved crystalline accent vocabulary includes slow cobalt-to-azure light passes, thin capital-path illumination, restrained refraction, rare cyan edge light and directional blue shimmer. It is an accent vocabulary, never the resting state of every element.

## 22. Responsive and accessibility

Verify at 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1600+ pixels.

Required: no horizontal overflow, no clipped headings, no unreadable architecture, no hidden CTA, no excessive hero height, no fixed desktop cards on mobile, no tiny critical labels, no hover-only functionality and no broken sticky navigation.

Target WCAG 2.1 AA principles. Preserve semantic landmarks, one meaningful H1 per route, logical headings, keyboard navigation, visible focus, skip link, touch targets, contrast, reduced motion, meaningful link labels, non-color-only states and accessible mobile navigation.

## 23. Performance and SEO

Keep marketing lean. Avoid giant video backgrounds, unnecessary animation libraries, continuous JavaScript animation, excessive blur, unoptimized assets and avoidable layout shift.

Prefer CSS, lightweight SVG, optimized static assets, lazy loading, responsive images and efficient observers.

Preserve functioning metadata infrastructure. Audit titles, descriptions, canonical URLs, Open Graph, social metadata, sitemap, robots, structured data, favicon and social preview. Do not fabricate ratings, reviews, awards, customer counts, offices, partnerships or adoption metrics.

## 24. Truthfulness authority

Marketing may demonstrate architecture. It must never manufacture evidence.

Never fabricate balances, holdings, execution, reconciled state, deposit capability, withdrawal capability, provider connectivity, AUM, customers, transaction volume, uptime, partnerships, certifications or regulated status.

Any system-state representation must be verified production state, clearly labeled structural demonstration or clearly labeled unavailable/not-configured state.

## 25. Repository implementation doctrine

Before implementation:

1. inspect current `main`
2. inspect active marketing routes
3. inspect shared semantic tokens
4. inspect marketing-local CSS and aliases
5. inspect current tests
6. inspect public assets
7. inspect metadata, sitemap and robots
8. inspect authoritative documentation
9. distinguish active authority from historical implementation

Never rebuild functioning architecture without necessity. Do not introduce a duplicate palette. Do not add another calibration stylesheet merely to overpower earlier CSS. Do not modify financial infrastructure as part of marketing work.

## 26. Token migration rule

The shared brand-semantic source owns canonical Neptlium brand colors. Marketing-local aliases may exist only as references to those canonical tokens.

A migration must not globally replace every existing Neptlium blue across the monorepo. Authenticated operational surfaces remain stable unless separately authorized.

## 27. Test authority

Marketing tests protect contracts, not obsolete implementation.

They should verify canonical positioning, real CTA destinations, accessibility behavior, navigation interaction, reduced-motion handling, semantic token usage, public metadata, sitemap/robots integrity and the absence of fabricated financial values.

When doctrine changes intentionally, stale assertions must be updated. Test discovery must include every intended marketing test file.

## 28. Implementation gate

Before changing a marketing component ask:

1. Does this communicate something meaningful?
2. Is every claim truthful?
3. Does typography establish hierarchy before decoration?
4. Is cobalt restrained?
5. Does the composition remain excellent without animation?
6. Does it belong to the Neptlium capital system?
7. Is it understandable on mobile?
8. Does it avoid impersonating the authenticated application?
9. Does it preserve accessibility behavior?
10. Is it materially better than removing it?

If the final answer is no, remove the element.

## 29. Execution boundary

This doctrine is documentation and design authority. Its adoption does not by itself authorize production deployment, secrets, migrations, provider configuration, financial execution, database changes or pull-request merge.

## 30. Final standard

The completed Neptlium marketing experience should feel like:

> **an institution designed as software.**

White gives it clarity.
Midnight gives it authority.
Cobalt gives it identity.
Crystalline light gives it precision.
The product gives it credibility.

Neptlium must never rely on hype, fabricated financial evidence, excessive decoration, visual fashion or crypto clichés to appear sophisticated.
