# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public institutional marketing and information surface.

Marketing establishes category, narrative, customer relevance, institutional confidence, editorial authority, product meaning, and an intentional path into the operating application. Public Web is deliberately independent from repository, build, migration, environment, provider, deployment, and runtime implementation state.

`apps/web` must not expose internal build progress, migration status, provider setup, release readiness, feature-flag state, deployment health, or engineering implementation status as ordinary marketing content.

Marketing may describe the Neptlium product model, customer problem, intended operating experience, principles, concepts, and strategic category. It must not invent or falsely imply customers, balances, AUM, volume, performance, returns, testimonials, partnerships, licences, regulatory status, custody, provider relationships, live execution, settlement, or product availability.

Before Web work, follow root `AGENTS.md`, `docs/00_PRODUCT_CONSTITUTION.md`, `docs/03_DESIGN_SYSTEM.md`, `docs/04_WEB_MARKETING_SYSTEM.md`, current Web source/tests/configuration, and overlapping open PRs. `docs/archive/**` is never current authority.

Do not change App, Admin, API, migrations, providers, remote environments, or shared packages unless a verified dependency requires it and the task authorizes that scope.

## Public information architecture

Canonical top-level public domains are exactly:

1. Platform
2. Products
3. Solutions
4. Resources
5. Company

Each has a meaningful hub destination: `/platform`, `/products`, `/solutions`, `/resources`, `/company`.

Do not collapse Products into Platform. Do not use product capabilities as additional top-level categories. Do not preserve legacy routes merely because they existed previously.

Canonical product URLs are:

- `/products/capital-account`
- `/products/treasury`
- `/products/allocation`
- `/products/portfolio-intelligence`
- `/products/performance`
- `/products/capital-universe`

Superseded root product URLs converge by one-hop permanent redirects and must not compete as canonical/indexable pages.

Route taxonomy, navigation data, sitemap authority, and route classification are centralized in `lib/content/public-architecture.ts`. Keep them aligned with `next.config.mjs`, page metadata, navigation, footer, and tests.

## Domain responsibilities

**Platform** explains the complete system: operating model, lifecycle, product relationships, intelligence, governance, and architectural principles.

**Products** explains the components Neptlium provides. Product pages remain truthful about capability and availability and never fabricate financial values.

**Solutions** explains operating problems rather than repeating products. Current taxonomy is capital visibility, treasury coordination, allocation workflows, and governance/control; do not invent personas without evidence.

**Resources** separates Learn, Security, Trust, and Research. Research remains truthful/noindex until substantive dated publications exist.

**Company** explains the organization and principles. `/about` may go deeper into the thesis; `/press` remains noindex until verified substantive communications exist.

## Visual character

Neptlium Marketing is institutional, editorial, architectural, restrained, premium, information-first, confident, and mobile-excellent.

It must not resemble a crypto exchange, retail brokerage, generic SaaS/dashboard-marketing page, neon fintech site, card-grid landing page, token website, or bank clone.

Identity comes from typography, space, structure, product relationships, information, controlled motion, and precise use of the canonical brand rather than decorative hero imagery.

Canonical palette: Warm Ivory `#F5F3EE`, Carbon `#101214`, Mineral Teal `#0F8F86`, Interaction Teal `#20AFA3`, Graphite `#343A3F`, Stone `#D8D5CE`, Soft Mist `#ECEAE5`, and Signal Amber `#C88B28` for warning semantics only.

Teal is a precision signal, not background paint.

## Brand and typography

Use only repository-authoritative Neptlium mark geometry. Never redraw or create competing logo geometry.

Marketing uses repository-supported editorial display/serif expression with restrained sans-serif utility/body typography. Keep public type medium-scale; authority comes from hierarchy and composition rather than enormous headlines. Do not introduce fonts without repository evidence, licensing review, and performance consideration.

## Composition

Create hierarchy through typography, whitespace, alignment, scale, contrast, structural lines, and surface changes before borders/elevation.

Avoid card-per-concept layouts, excessive radius/shadow, nested containers, dashboard grids, decorative gradients, glassmorphism, ornamental blur, and meaningless depth.

Use controlled maximum widths, purposeful negative space, responsive gutters, and selective authority-dark sections.

## Navigation and URL authority

Every top-level domain is a real link. A disclosure may supplement the direct link but must not replace it.

Desktop disclosures are concise and support keyboard operation, visible focus, Escape close, outside/focus close, and focus return.

Mobile navigation is independently designed. Parent domains remain direct links while child destinations may use accessible disclosure behavior. Preserve 44px+ touch targets, focus containment, body scroll lock, Escape close, focus restoration, and route-close behavior.

Every promoted route, CTA, footer link, canonical URL, sitemap URL, social asset, and internal destination must resolve intentionally. Prefer one-hop permanent redirects for superseded URLs. `https://neptlium.com` is canonical search authority.

## Homepage content contract

The homepage is the entry into the wider architecture, not the entire site. It establishes proposition, operating model, Platform, Products, solution relevance, intelligence/governance/trust, why Neptlium exists, and the next action.

Canonical proposition:

> Digital capital,
> organized
> around you.

The homepage does not narrate repository features, migrations, provider configuration, capability flags, App/Admin/API construction state, deployment health, or internal release classifications.

## CTA authority

Global primary CTA is `Enter Neptlium` → authenticated application sign-in.

Broad secondary exploration is `Explore platform` → `/platform`. Contextual pages may use precise next steps such as Explore products, Explore Security, or About Neptlium.

Contact remains a Company destination, not the primary product-entry action.

## Footer

Footer navigation mirrors Platform, Products, Solutions, Resources, Company, and Legal. Do not retain dead destinations for symmetry or add unverified social links.

## Communication tone

Public language is calm, exact, institutional, intelligent, economical, and confident. Prefer mechanisms and relationships over startup hype. Marketing explains a worldview and operating model, not engineering progress.

## SEO and discoverability

Public search authority belongs to `neptlium.com`. Every indexable page needs deliberate title, description, canonical URL, social metadata, robots behavior, and useful internal links.

Thin, empty, speculative, duplicate, draft, operational, or future-only pages should be merged, redirected, removed, or noindexed. Sitemap, robots, route policy, canonical metadata, redirects, navigation, and internal links must agree.

## Accessibility, motion, and responsive behavior

Preserve semantic HTML/landmarks, one clear H1, coherent heading order, keyboard access, visible focus, correct disclosure semantics, WCAG 2.2 AA contrast/targets, reduced motion, accessible link names, and meaningful ARIA only where native semantics are insufficient.

Motion communicates state or continuity; it does not decorate or imply financial execution/success.

Mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+` and preserve content priority, readable measures, stable navigation, touch behavior, and intentional whitespace.

## CSS ownership

Do not add a new global override stylesheet for visual iterations.

`neptlium-visual-direction.css` is the canonical visual authority for reconstructed public surfaces. Historical route-specific layers may remain only while current untouched routes rely on them. When a reconstructed surface is fully owned by the canonical layer, remove its superseded overlapping stylesheet after proving it is no longer required.

## Required validation

When scripts/environment are available, run:

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
