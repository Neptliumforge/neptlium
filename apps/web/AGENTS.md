# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public institutional marketing and information surface.

Marketing establishes category, narrative, customer relevance, institutional confidence, editorial authority, product meaning, and an intentional path into the operating application. Public Web is deliberately independent from repository, build, migration, environment, provider, deployment, and runtime implementation state.

`apps/web` must not expose or narrate internal build progress, migration status, environment configuration, provider setup, release readiness, testnet/production transitions, feature-flag state, deployment health, repository architecture progress, or engineering implementation status as part of ordinary marketing content.

Marketing is free to develop its own visual, editorial, narrative, and information architecture without mirroring engineering implementation chronology. It may describe the Neptlium product model, customer problem, intended operating experience, principles, concepts, and strategic category in strong institutional language.

That freedom does not authorize fabrication. Public Web must not invent or falsely imply customers, balances, AUM, volume, performance, returns, testimonials, partnerships, licences, regulatory status, custody, provider relationships, live execution, settlement, product availability, or other factual claims that require external evidence.

Before Web work, follow root `AGENTS.md`, read `docs/00_PRODUCT_CONSTITUTION.md`, `docs/03_DESIGN_SYSTEM.md`, `docs/04_WEB_MARKETING_SYSTEM.md`, current Web source/tests/configuration, relevant production behavior where needed for Web correctness, and overlapping open PRs. `docs/archive/**` is never current authority.

Do not change App, Admin, API, migrations, providers, remote environments, or shared packages unless a verified dependency requires it and the task authorizes that scope.

## Public information architecture

The canonical top-level public domains are exactly:

1. Platform
2. Products
3. Solutions
4. Resources
5. Company

Each domain has a meaningful destination:

- `/platform`
- `/products`
- `/solutions`
- `/resources`
- `/company`

Do not collapse Products into Platform. Do not use product capabilities as additional top-level navigation categories. Do not keep legacy routes merely because they existed previously.

Canonical product URLs are:

- `/products/capital-account`
- `/products/treasury`
- `/products/allocation`
- `/products/portfolio-intelligence`
- `/products/performance`
- `/products/capital-universe`

Superseded root product URLs converge by one-hop permanent redirects and must not compete as canonical/indexable pages.

The route taxonomy, navigation data, sitemap authority, and migration classification are centralized in `lib/content/public-architecture.ts`. Keep it aligned with `next.config.mjs`, page metadata, navigation, footer, and tests.

## Domain responsibilities

**Platform** explains how the complete Neptlium system works: operating model, lifecycle, product relationships, intelligence, governance, and architectural principles.

**Products** explains the components Neptlium provides. Product pages must remain truthful about capability and availability and must not fabricate financial values.

**Solutions** explains operating problems rather than repeating the product list. Current taxonomy is capital visibility, treasury coordination, allocation workflows, and governance/control; do not invent personas without evidence.

**Resources** separates Learn, Security, Trust, and Research. Research remains truthful/noindex until substantive dated publications exist.

**Company** explains the organization and principles. `/about` may go deeper into the Neptlium thesis; `/press` remains noindex until verified substantive communications exist.

## Visual character

Neptlium Marketing is institutional, editorial, architectural, dimensional, restrained, premium, information-first, confident, and mobile-excellent.

It must not resemble a crypto exchange, retail brokerage, generic SaaS or dashboard-marketing page, neon fintech site, card-grid landing page, token website, or bank clone.

The identity should come from typography, space, structure, product relationships, information, controlled motion, and precise use of the canonical brand rather than decorative hero imagery.

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

Neptlium color is an instrument, not background paint. Teal is a precision signal, not a field color.

## Brand mark

Use only repository-authoritative canonical Neptlium mark geometry. Never redraw a logo from a screenshot or prompt, create competing SVG geometries, or invent token, coin, crest, or alternate “N” marks.

The public identity system must support a consistent wordmark, symbol, horizontal lockup, favicon, browser icons, Apple/PWA icons, social mark, and Open Graph identity from one canonical geometry source.

## Typography

Marketing typography remains distinct from operational App typography.

- Use repository-supported editorial display/serif authority for major marketing expression.
- Use restrained sans-serif typography for utility and body content.
- Keep public type medium-scale; authority comes from hierarchy and composition rather than enormous headlines.
- Preserve narrow readable measures, generous line height, and deliberate hierarchy.
- Do not introduce a font without repository evidence, licensing review, loading/performance consideration, and explicit scope.
- Do not turn every label into tiny uppercase institutional microcopy.

## Composition and grid

Create hierarchy in this order: typography, whitespace, alignment, scale, contrast, structural lines, and surface changes. Borders, elevation, shadows, and cards come later.

Avoid card-per-concept layouts, excessive radius/shadow, nested containers, dashboard grids, generic three-card rows, decorative gradients, glassmorphism, ornamental blur, and meaningless visual depth.

Use repository spacing tokens and a 4/8-derived philosophy. Layout supports strong left alignment, meaningful editorial asymmetry, purposeful negative space, controlled maximum widths, consistent responsive gutters, and selective full-bleed authority sections.

## Navigation and URL authority

Every top-level domain is a real link. A disclosure may supplement the direct link but must not replace it.

Desktop disclosure surfaces are concise and institutional, not command palettes or architecture essays. They support keyboard operation, visible focus, Escape close, outside/focus close, and focus return.

Mobile navigation begins at the top, is left-aligned, and is designed independently from desktop. Parent domains remain direct links while child destinations may use accessible accordion/disclosure behavior. Preserve 44px+ touch targets, focus containment, body scroll lock, Escape close, focus restoration, and route-close behavior.

Every promoted route, CTA, navigation item, footer link, canonical URL, sitemap URL, social asset, and internal destination must resolve intentionally. A completed Web build must not knowingly ship internal 404s, dead CTAs, broken canonical URLs, missing favicon/OG assets, redirect loops, or placeholder destinations.

Prefer one-hop permanent redirects for superseded public URLs. `https://neptlium.com` is the canonical search authority; `https://www.neptlium.com` should converge on the apex origin rather than act as an independent SEO authority.

## Homepage content contract

The homepage is the entry into the wider Web architecture, not the entire site.

It establishes:

1. the Neptlium proposition;
2. the operating model;
3. the Platform relationship;
4. the Products family;
5. solution/problem relevance;
6. intelligence, governance, and trust;
7. why Neptlium exists;
8. the next action.

Canonical proposition remains:

> Digital capital,  
> organized  
> around you.

The homepage does not narrate repository features, migrations, provider configuration, capability flags, App/Admin/API construction state, deployment health, or internal release classifications.

Marketing may use strategic and conceptual product language freely, but factual external claims remain evidence-bound.

## CTA authority

Global primary CTA is `Enter Neptlium` and links to the authenticated application sign-in.

Broad secondary exploration is `Explore platform` and links to `/platform`. Contextual pages may use precise next steps such as Explore products, Explore Security, or About Neptlium.

Contact remains a Company destination, not the primary product-entry action.

## Footer

Footer navigation mirrors the canonical architecture:

- Platform
- Products
- Solutions
- Resources
- Company
- Legal

Do not retain dead destinations for symmetry. Do not add unverified social links.

## Communication tone

Neptlium communicates with quiet authority.

Public language should be calm, exact, institutional, consequential, intelligent, sparse, and confident. Prefer declarative product/category language over startup hype. Avoid exaggerated superlatives, breathless future-of-finance language, generic “revolutionary”, “game-changing”, “10x”, or “seamless everything”.

Marketing should explain a worldview and operating model, not engineering progress.

## SEO and discoverability

Public search authority belongs to `neptlium.com` only. App, Admin, API, auth, internal utilities, drafts, and operational surfaces should not compete as public search destinations.

Every indexable page must have deliberate title, description, canonical URL, Open Graph metadata, Twitter/social metadata, robots behavior, internal links, and structured data only where legitimate.

Index substantive durable pages. Thin, empty, speculative, duplicate, draft, operational, or future-only pages should be merged, redirected, removed, or noindexed rather than used to inflate page count.

Sitemap, robots, route policy, canonical metadata, redirects, navigation, and internal links must agree.

## Accessibility

Preserve semantic HTML and landmarks, one clear H1, coherent heading order, keyboard access, visible focus, correct disclosure semantics, WCAG 2.2 AA contrast and interaction targets, reduced-motion support, accessible link names, correct external-link labeling, and meaningful ARIA only where native semantics are insufficient.

Essential content must remain visible and understandable without animation or client hydration.

## Motion

Motion communicates state, hierarchy, continuity, or relationship; it does not decorate. Respect `prefers-reduced-motion`. Never use motion to imply financial progress, execution, settlement, or success.

## Responsive behavior

Responsive design is content-driven, and mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+`. Preserve content priority, readable measures, stable navigation, touch behavior, and intentional whitespace rather than only preventing overflow.

## CSS ownership

Do not add a new global override stylesheet for visual iterations.

`neptlium-visual-direction.css` is the current canonical visual authority for reconstructed public surfaces. Historical route-specific layers may remain only while current untouched routes rely on them. When a reconstructed surface becomes fully owned by the canonical layer, remove its superseded overlapping stylesheet after proving it is no longer required.

## Required validation

When scripts and environment are available, run:

```sh
git diff --check origin/main...HEAD
pnpm --filter @neptlium/ui typecheck
pnpm --filter @neptlium/ui lint
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

On Termux/Android use `pnpm --filter @neptlium/web exec next build --webpack`.

Perform browser validation for navigation, focus, content visibility, responsive layouts, console errors, representative widths, route/link integrity, canonical behavior, favicon/social assets, and internal 404s when browser tooling is available.

Report every check as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Source inspection is never a build, render, accessibility, SEO, link-integrity, or production PASS.
