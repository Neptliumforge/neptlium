# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public institutional marketing and information surface.

Marketing establishes category, narrative, customer relevance, institutional confidence, editorial authority, product meaning, and an intentional path into the operating application. Public Web is deliberately independent from repository, build, migration, environment, provider, deployment, and runtime implementation state.

`apps/web` must not expose or narrate internal build progress, migration status, environment configuration, provider setup, release readiness, testnet/production transitions, feature-flag state, deployment health, repository architecture progress, or engineering implementation status as part of ordinary marketing content. Those belong to engineering, release, operational, or specifically authorized public-status communications.

Marketing is free to develop its own visual, editorial, narrative, and information architecture without mirroring engineering implementation chronology. It may describe the Neptlium product model, customer problem, intended operating experience, principles, concepts, and strategic category in strong institutional language.

That freedom does not authorize fabrication. Public Web must not invent or falsely imply customers, balances, AUM, volume, performance, returns, testimonials, partnerships, licences, regulatory status, custody, provider relationships, live execution, settlement, product availability, or other factual claims that require external evidence.

Before Web work, follow root `AGENTS.md`, read `docs/00_PRODUCT_CONSTITUTION.md`, `docs/03_DESIGN_SYSTEM.md`, relevant current documents, current Web source/tests/configuration, relevant production behavior where needed for Web correctness, and overlapping open PRs. `docs/archive/**` is never current authority.

Do not change App, Admin, API, migrations, providers, remote environments, or shared packages unless a verified dependency requires it and the task authorizes that scope.

## Visual character

Neptlium Marketing is institutional, editorial, architectural, dimensional, restrained, premium, information-first, confident, and mobile-excellent.

It must not resemble a crypto exchange, retail brokerage, generic SaaS or dashboard-marketing page, neon fintech site, card-grid landing page, token website, or bank clone.

## Canonical marketing palette

| Token | Value | Purpose |
| --- | --- | --- |
| Warm Ivory | `#F5F3EE` | Primary marketing canvas. |
| Carbon | `#101214` | Authority surface and primary text on light backgrounds. |
| Mineral Teal | `#0F8F86` | Canonical marketing precision accent. |
| Interaction Teal | `#20AFA3` | Hover, focus, and interactive emphasis. |
| Graphite | `#343A3F` | Secondary text and structural dark neutral. |
| Stone | `#D8D5CE` | Dividers and subtle structure. |
| Soft Mist | `#ECEAE5` | Secondary light surfaces. |
| Signal Amber | `#C88B28` | Warning or attention semantics only; never decoration. |

Neptlium color is an instrument, not background paint. Marketing should feel approximately 70% light neutral, 20–25% Carbon/Graphite, and 5–10% accent/semantic color. This is a compositional principle, not a measurement gate. Brand color never overrides semantic state.

## Brand mark

Use only repository-authoritative canonical Neptlium mark geometry. Never redraw a logo from a screenshot or prompt, create competing SVG geometries, or invent token, coin, crest, or alternate “N” marks.

The canonical mark is compact, structural, architectural, flat, monochrome-capable, and legible at small size. Control color semantically where the implementation supports it. Do not change mark geometry in ordinary Web styling work.

The public identity system must support a consistent wordmark, symbol, horizontal lockup, favicon, browser icons, Apple/PWA icons, social mark, and Open Graph identity from one canonical geometry source.

## Typography

Marketing typography remains distinct from operational App typography.

- Use repository-supported editorial display/serif authority for major marketing expression.
- Use restrained sans-serif typography for utility and body content.
- Preserve narrow readable measures, generous line height, and deliberate hierarchy.
- Do not introduce a font without repository evidence, licensing review, loading/performance consideration, and explicit scope.
- Do not turn every label into tiny uppercase institutional microcopy.
- Do not begin every section with an eyebrow merely to simulate authority.

App retains Geist/current operational typography, denser readability, and tabular numerals for financial/data contexts.

## Composition and grid

Create hierarchy in this order: typography, whitespace, alignment, scale, contrast, structural lines, and surface changes. Borders, elevation, shadows, and cards come later.

Avoid card-per-concept layouts, excessive radius/shadow, nested containers, dashboard grids, generic three-card rows, decorative gradients, glassmorphism, and ornamental depth.

Use repository spacing tokens and a 4/8-derived philosophy. The conceptual progression is `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160`; do not duplicate equivalent existing tokens. Layout supports strong left alignment, meaningful editorial asymmetry, generous negative space, controlled maximum widths, consistent responsive gutters, and selective full-bleed authority sections.

## Navigation and URL authority

Canonical primary marketing groups are:

1. Platform
2. Solutions
3. Resources
4. Company

Use real routes. Do not create dead pages to populate navigation.

Every promoted route, CTA, navigation item, footer link, canonical URL, sitemap URL, social asset, and internal destination must resolve intentionally. A completed Web build must not knowingly ship internal 404s, dead CTAs, broken canonical URLs, missing favicon/OG assets, redirect loops, or placeholder destinations.

Prefer one-hop permanent redirects for superseded public URLs. `https://neptlium.com` is the canonical search authority; `https://www.neptlium.com` should converge on the apex origin rather than act as an independent SEO authority.

Desktop disclosure surfaces are concise and institutional, not command palettes or architecture essays. They support keyboard operation, visible focus, Escape close, outside close, and focus return.

Mobile navigation begins at the top, is left-aligned, and uses accessible accordion/disclosure behavior. The entire row is tappable; children appear below parents; one group is open at a time where practical. Preserve large touch targets, focus containment, body scroll lock, Escape close, focus restoration, and route-close behavior.

## Homepage content contract

The homepage answers:

1. What is Neptlium?
2. Why does it matter?
3. What is the capital operating model?
4. How are Portfolio, Capital Account, Treasury, and Allocation related?
5. Who is Neptlium for?
6. Why should an institutional visitor trust the product philosophy and system design?
7. What should the visitor do next?

The homepage does **not** answer:

- which repository features are complete;
- which migrations are applied;
- which providers or credentials are configured;
- which capability flags are enabled;
- whether App/Admin/API construction is complete;
- current deployment or environment readiness;
- internal release-state classifications.

Do not teach the entire internal financial state machine. Avoid prominent public exposition of ledger mechanics, reconciliation internals, provider evidence, provisioning, provider internals, lifecycle machinery, testnet groundwork, engineering migration state, or implementation chronology unless it is the subject of an intentionally published technical document.

Marketing may use strategic and conceptual product language freely, but factual external claims remain evidence-bound. Never fabricate customers, balances, AUM, volume, performance, returns, testimonials, logos, providers, partnerships, licences, custody, regulatory status, or live product availability.

## Communication tone

Neptlium communicates with quiet authority.

Public language should be calm, exact, institutional, consequential, intelligent, sparse, and confident. Prefer declarative product/category language over startup hype. Avoid exaggerated superlatives, breathless future-of-finance language, generic “revolutionary”, “game-changing”, “10x”, “seamless everything”, or feature-count marketing.

Marketing should explain a worldview and operating model, not engineering progress.

## SEO and discoverability

Public search authority belongs to `neptlium.com` only. App, Admin, API, auth, internal utilities, drafts, and operational surfaces should not compete as public search destinations.

Every indexable page must have deliberate title, description, canonical URL, Open Graph metadata, Twitter/social metadata, robots behavior, internal links, and structured data only where legitimate. Do not manufacture ratings, reviews, offers, customer proof, or financial-product schema.

Index substantive durable pages. Thin, empty, speculative, duplicate, draft, operational, or future-only pages should be merged, redirected, removed, or noindexed rather than used to inflate page count.

## Accessibility

Preserve semantic HTML and landmarks, one clear H1, coherent heading order, keyboard access, visible focus, correct disclosure semantics, WCAG 2.2 AA contrast and interaction targets, reduced-motion support, accessible link names, correct external-link labeling, and meaningful ARIA only where native semantics are insufficient.

Essential content must remain visible and understandable without animation or client hydration.

## Motion

Motion communicates state, hierarchy, continuity, or relationship; it does not decorate. Guidance bands are approximately 120–200ms for micro-interactions, 160–280ms for navigation/state changes, and 300–600ms for justified editorial reveals. Respect `prefers-reduced-motion`. Never use motion to imply financial progress, execution, settlement, or success.

## Responsive behavior

Responsive design is content-driven, and mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+`. Preserve content priority, readable measures, stable navigation, touch behavior, and intentional whitespace rather than only preventing overflow.

## Required validation

When scripts and environment are available, run:

```sh
git diff --check
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

Perform browser validation for navigation, focus, content visibility, responsive layouts, console errors, representative widths, route/link integrity, canonical behavior, favicon/social assets, and internal 404s when browser tooling is available. Report every check as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Source inspection is never a build, render, accessibility, SEO, link-integrity, or production PASS.
