# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public institutional marketing, investor-information, editorial, SEO, and acquisition surface.

Marketing establishes category, narrative, customer relevance, institutional confidence, investment understanding, trust, product meaning, and an intentional path into the authenticated application. Public Web owns no authenticated customer session, privileged financial operation, canonical financial state, custody, execution, or settlement authority.

Public Web must not expose repository progress, migrations, provider setup, environment readiness, deployment health, or feature flags as ordinary marketing content. It may explain product concepts and operating relationships, but must not invent customers, balances, AUM, performance, returns, testimonials, partnerships, licences, regulatory status, custody, provider capability, live execution, settlement, or investment availability.

Before Web work, follow root `AGENTS.md`, `docs/00_PRODUCT_CONSTITUTION.md`, `docs/03_DESIGN_SYSTEM.md`, `docs/04_WEB_MARKETING_SYSTEM.md`, current Web source/tests/configuration, and relevant open PRs. `docs/archive/**` is historical only.

Do not change App, Admin, API, migrations, providers, remote environments, or shared packages unless a verified dependency requires it and task scope explicitly authorizes it.

## Public information architecture

Canonical top-level public domains are:

1. **Platform** → `/platform`
2. **Investments** → `/investments`
3. **Insights** → `/insights`
4. **Security** → `/security`
5. **Company** → `/about`

Products and Solutions remain second-level platform architecture rather than competing top-level domains.

Canonical product URLs remain:

- `/products/capital-account`
- `/products/treasury`
- `/products/allocation`
- `/products/portfolio-intelligence`

Route taxonomy, navigation data, sitemap authority, and route classification are centralized in `lib/content/public-architecture.ts`. Keep them aligned with `next.config.mjs`, page metadata, navigation, footer, and tests.

## Domain responsibilities

**Platform** answers what Neptlium is as one connected capital environment. It explains portfolio visibility, capital management, funding, transaction visibility, reporting, documents, communication, security, and account controls without implying unsupported capability.

**Investments** explains how Neptlium presents opportunities and investment information. It prioritizes objective, strategy, structure, exposure, risk, duration, liquidity, fees, documentation, eligibility, and suitability. It must not invent a marketplace or offering when none is verified.

**Insights** is the editorial authority surface for markets, investing, portfolio strategy, digital assets, platform understanding, and investor education. Research is published only when substantive original dated work exists.

**Security** explains account security, identity, authorization, infrastructure, transaction controls, operational review, financial record integrity, reconciliation, and incident-aware principles without inventing certifications or regulatory claims.

**Company** explains Neptlium's mission, operating philosophy, technology, investor experience, capital discipline, and long-term vision without invented history, offices, investors, employees, partnerships, or registrations.

## Positioning and conversion

Canonical public positioning:

> **Capital, made clearer.**

Supporting language should explain that Neptlium connects portfolio visibility, capital management, funding workflows, reporting, and governed financial activity.

Primary acquisition action:

- **Get Started** → authenticated application account creation.

Authenticated return action:

- **Sign In** → authenticated application sign-in.

Primary homepage exploration:

- **Explore the Platform** → `/platform`
- **View Investment Solutions** → `/investments`

Every major page should have one obvious next action and avoid competing CTA clutter.

## Investment and funding truth

Never reduce investment communication to projected profit. Clearly distinguish historical, target, projected, and illustrative information whenever those categories appear.

Digital-asset funding may be described only as capability-controlled and account-specific unless a specific rail is verified as publicly available. USD funding must not be marketed as live before an approved production funding flow exists.

`UNKNOWN != ZERO`. Provider evidence is not canonical state. Configured is not live. Modeled is not executed. Submitted is not settled. Settled is not reconciled.

## Visual character

Neptlium Marketing is institutional, editorial, architectural, restrained, premium, information-first, technologically current, and mobile-excellent.

Canonical palette:

- Warm Ivory `#F5F3EE`
- Carbon `#101214`
- Mineral Teal `#0F8F86`
- Interaction Teal `#20AFA3`
- Graphite `#343A3F`
- Stone `#D8D5CE`
- Soft Mist `#ECEAE5`

Teal is a precision signal, not background paint.

Marketing can be more cinematic than the authenticated product, but avoid crypto-exchange styling, fake trading terminals, decorative token imagery, excessive gradients, glassmorphism, neon, generic stock photography, fabricated dashboards, unnecessary 3D spectacle, and card-per-concept layouts.

Use repository-authoritative Neptlium mark geometry. Do not redraw the logo.

## Product visualization

Public product compositions must communicate real capabilities or truthful unavailable/empty states. Do not hard-code fake balances, returns, allocations, transaction histories, investor counts, or activity.

A small set of purposeful compositions is preferred over generic browser mockups. Each should explain a real product responsibility such as portfolio visibility, capital state, funding lifecycle, investment review, reporting, or security boundaries.

## Navigation and footer

Every top-level domain is a real link. Desktop disclosures supplement direct links and preserve keyboard support, Escape close, outside/focus close, visible focus, and focus return.

Mobile navigation is independently composed for touch, with large targets, body-scroll lock, focus containment/restoration, Escape close, and route-close behavior.

Footer exposes only real routes and verified public destinations. It should include Platform, Company, Account, Legal, and concise risk/informational disclosure.

## SEO and discoverability

Every indexable page needs deliberate title, description, canonical URL, Open Graph metadata, Twitter metadata, semantic headings, and useful internal links.

Thin, speculative, duplicate, operational, or future-only pages should be merged, redirected, removed, or noindexed. Sitemap, robots, route policy, redirects, metadata, navigation, and internal links must agree.

## Accessibility, motion, responsive behavior

WCAG 2.2 AA is the minimum target. Preserve semantic HTML, one clear H1, coherent heading order, keyboard access, visible focus, meaningful form labels, sufficient contrast, 44px+ touch targets, reduced motion, meaningful link names, and native semantics before ARIA.

Motion communicates hierarchy, continuity, product relationship, or genuine state. It must never imply financial execution, settlement, performance, or success that has not occurred.

Mobile is not compressed desktop. Validate representative widths `320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1600+`.

## CSS ownership

`neptlium-visual-direction.css` remains global public visual authority. Newly reconstructed route families may use scoped CSS modules where that improves ownership and prevents another global override layer. Do not add another globally imported `v2`, `final`, or override stylesheet.

Historical global layers may remain temporarily for untouched routes. Remove superseded layers only after proving no current route depends on them.

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

Also validate route/link integrity, canonical metadata, keyboard navigation, representative responsive widths, reduced motion, actual rendered pages, console errors, and internal 404s when browser tooling is available.

Report checks only as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Source inspection is never a build, browser, accessibility, performance, or production PASS.
