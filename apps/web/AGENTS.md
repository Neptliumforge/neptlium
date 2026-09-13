# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public marketing, investor-information, editorial, SEO, and acquisition surface. It owns no authenticated customer session, privileged financial operation, canonical financial state, custody, execution, or settlement authority.

Stage 01 marketing design authority is `docs/marketing-design-system.md`. It overrides prior Web marketing visual direction, including the ivory-first palette, former five-item navigation, `Get Started` language, and PR #68 homepage assumptions. It does not override authenticated App/Admin design, product constitution, financial truth, security boundaries, API authority, ledger logic, migrations, Gate 04/05 evidence, or provider architecture.

Before Web work, follow root `AGENTS.md`, `docs/00_PRODUCT_CONSTITUTION.md`, `docs/marketing-design-system.md`, current Web source/tests/configuration, and relevant open PRs. `docs/archive/**` is historical only.

Do not change App, Admin, API, migrations, providers, remote environments, or shared packages unless a verified dependency requires it and task scope explicitly authorizes it.

## Public information architecture

Canonical top-level public domains are:

1. **Platform** → `/platform`
2. **Investments** → `/investments`
3. **Capital** → `/products/capital-account`
4. **Insights** → `/insights`
5. **Security** → `/security`
6. **Company** → `/company`

Products and Solutions remain valid second-level architecture. Canonical product URLs remain `/products/capital-account`, `/products/treasury`, `/products/allocation`, and `/products/portfolio-intelligence`.

Route taxonomy and classification are centralized in `lib/content/public-architecture.ts`. Keep them aligned with redirects, metadata, sitemap, header, footer, and tests.

## Positioning and conversion

Canonical public positioning:

> **Capital, intelligently managed.**

Primary acquisition action: **Open account** → authenticated application account creation.

Authenticated return action: **Sign in** → authenticated application sign-in.

Homepage exploration uses direct canonical destinations such as **Explore Neptlium**, **Explore Investments**, **Explore Capital**, and **Explore Treasury**.

Every major page should have one obvious next action and avoid competing CTA clutter.

## Financial truth

Public Web must not expose repository progress, migrations, provider setup, environment readiness, deployment health, or feature flags as ordinary marketing content. It must not invent customers, balances, AUM, performance, returns, testimonials, partnerships, licences, regulatory status, custody, provider capability, live execution, settlement, or investment availability.

Never reduce investment communication to projected profit. Clearly distinguish historical, target, projected, illustrative, informational, limited, and live capability whenever those categories appear.

Digital-asset funding may be described only as capability-controlled and account-specific unless a specific rail is verified as publicly available. USD funding must not be marketed as live before an approved production funding flow exists.

`UNKNOWN != ZERO`. Provider evidence is not canonical state. Configured is not live. Modeled is not executed. Submitted is not settled. Settled is not reconciled.

## Marketing visual character

Marketing is black-first, cinematic, product-first, editorial, restrained, technologically current, and mobile-excellent.

Canonical marketing palette:

- Black `#050505`
- Raised black `#0D0D0D`
- Surface `#141414`
- White `#F7F7F2`
- Muted gray approximately `#999994` / accessible refinement
- Neptlium Teal `#35D5C1`
- Soft Teal `#8CE8DC`
- Ivory `#F3F0E8` for deliberate contrast sections
- Ink `#101010`

Teal is a precision signal, not a neon flood. Avoid crypto-exchange styling, fake trading terminals, decorative token imagery, excessive gradients, glassmorphism, generic stock photography, fabricated dashboards, unnecessary 3D spectacle, and card-per-concept layouts.

Use repository-authoritative Neptlium mark geometry. Do not redraw the logo.

## Product visualization

Public product compositions communicate real responsibilities or explicitly illustrative/limited/unavailable state. Do not hard-code fake balances, returns, allocations, transaction histories, investor counts, or activity.

Preferred concepts include capital state, treasury lifecycle, portfolio intelligence, allocation lifecycle, evidence/activity, reporting, and security/governance boundaries.

## Navigation and footer

Every top-level domain is a real link. Mobile navigation is independently composed for touch with large targets, body-scroll lock, focus containment/restoration, Escape close, and route-close behavior.

Footer exposes only real routes and verified public destinations and includes concise risk/informational disclosure.

## SEO, accessibility, motion and responsive behavior

Every indexable page needs deliberate title, description, canonical URL, semantic headings, and useful internal links. Thin, speculative, duplicate, operational, or future-only pages should be merged, redirected, removed, or noindexed.

WCAG 2.2 AA is the minimum target. Preserve semantic HTML, one clear H1, coherent heading order, keyboard access, visible focus, meaningful link names, sufficient contrast, 44px+ touch targets, and reduced motion.

Motion communicates hierarchy, continuity, product relationship, or genuine state. It must never imply financial execution, settlement, performance, or success that has not occurred.

Mobile is not compressed desktop. Stage 01 release viewports are `360, 390, 768, 1280, 1440`, with additional representative widths encouraged.

## CSS ownership

`app/marketing-system.css` and `app/homepage-stage01.module.css` are the Stage 01 marketing visual authority. Historical global layers remain temporarily for untouched routes and should be retired as those routes migrate. Do not add another ambiguously named global `v2`, `final`, or override layer.

## Required validation

Run when scripts/environment are available:

```sh
git diff --check origin/main...HEAD
pnpm --filter @neptlium/ui typecheck
pnpm --filter @neptlium/ui lint
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

Use GitHub-hosted Ubuntu for Playwright. Validate canonical routes, CTA destinations, keyboard/focus behavior, all Stage 01 viewports, reduced motion, console errors, failed resources, responsive composition, and disclosures. Source inspection is never a browser, accessibility, performance, or production PASS.
