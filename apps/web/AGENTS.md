# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public marketing, investor-information, business-product, editorial, SEO and acquisition surface. It owns no authenticated customer session, privileged financial operation, canonical financial state, custody, execution or settlement authority.

Canonical design authority is `docs/03_DESIGN_SYSTEM.md` with runtime tokens in `packages/ui/src/styles/tokens.css`. Public Web uses the same Neptlium identity as Capital and Treasury while retaining an editorial marketing density. Capital Rails are the canonical mark-derived spatial/authority grammar; extend shared primitives rather than creating page-local fintech artwork.

Before Web work, follow root `AGENTS.md`, `docs/00_PRODUCT_CONSTITUTION.md`, canonical `docs/03_DESIGN_SYSTEM.md`, current Web source/tests/configuration and relevant open PRs. `docs/marketing-design-system.md` is compatibility-only and cannot override the canonical design authority. Do not change App, Admin, API, migrations, providers, remote environments or shared packages unless a verified dependency requires it and task scope explicitly authorizes it.

## Canonical public architecture

Primary capability hierarchy:
1. Capital → `/capital`
2. Portfolio → `/portfolio`
3. Investments → `/investments`
4. Treasury → `/treasury`
5. Intelligence → `/intelligence`
6. Infrastructure → `/infrastructure`

Supporting expressions: Institutional, Security, Insights and Company. Allocation remains a valid supporting product route without becoming a seventh primary capability.

Legacy `/personal` converges to `/capital`; legacy `/business` converges to `/treasury`. Never reintroduce them as competing canonical product identities.

Canonical product-story routes include `/investments`, `/capital`, `/portfolio`, `/allocation` and `/treasury`.

Personal authenticates at `app.neptlium.com`. Business returns to Neptlium Treasury at `treasury.neptlium.com`. Do not force one audience through the other product’s login.

Route taxonomy and classification are centralized in `lib/content/public-architecture.ts`. Keep them aligned with redirects, metadata, sitemap, header, footer and tests.

## Financial truth

Public Web must not expose repository progress, migration state, provider setup or deployment health as ordinary marketing content. It must not invent customers, balances, AUM, performance, returns, payment history, testimonials, partnerships, licences, regulatory status, custody, provider capability, live execution, settlement or investment availability.

Investment and business capabilities must be qualified as live, limited, informational, developing, illustrative or unavailable when required by product truth.

`UNKNOWN != ZERO`. Provider evidence is not canonical state. Configured is not live. Modeled is not executed. Submitted is not settled. Settled is not reconciled. Wallet observation is not canonical treasury truth by display convention.

## Marketing visual character

One canonical semantic token system applies across public Web, Capital and Treasury. Web MUST consume the approved canvas, surface, warm-white, graphite and mineral-teal roles from packages/ui/src/styles/tokens.css; raw page-local brand palettes are prohibited. Dark is primary; Light and System are supported. Capital Rails use the canonical rail tokens and the existing Neptlium mark geometry.

Differentiate journeys through product content, information density, rail variant and workflows, not separate color brands or competing design systems.

Avoid crypto-exchange styling, fake trading terminals, decorative token imagery, excessive gradients, glassmorphism, fabricated dashboards, unsupported partner marks and card-per-concept layouts.

## Product visualization

Preferred Personal concepts: capital state, portfolio intelligence, allocation lifecycle, activity and documents.

Preferred Business concepts: treasury state, payment lifecycle, approvals, deterministic policy, preflight, risk evidence and audit.

Shared concepts: identity, authority, evidence, ledger, reconciliation and audit.

Illustrative product states must be labeled whenever they could be mistaken for live customer data.

## Navigation and footer

Every top-level domain is a real link. `Sign in` and `Get started` may expose a product chooser rather than guessing account type. Mobile navigation requires large targets, body-scroll lock, focus containment/restoration, Escape close and route-close behavior.

Footer exposes only real routes and approved product destinations, plus concise disclosure.

## SEO, accessibility and responsive behavior

Every indexable page requires deliberate title, description, canonical URL, one clear H1, coherent heading order, keyboard access, visible focus, accessible names, sufficient contrast and 44px+ touch targets. Motion respects reduced-motion and must never imply financial execution or performance.

Release viewports: `360, 390, 768, 1280, 1440`.

## CSS ownership

Current design authority is shared tokens/primitives plus the consolidated Web global grammar in `app/globals.css` and route-owned CSS modules. Do not restore retired global refinement layers. Shared Capital Rails geometry belongs in `@neptlium/ui`; Web owns only route composition/cropping.

## Required validation

```sh
git diff --check origin/main...HEAD
pnpm --filter @neptlium/ui typecheck
pnpm --filter @neptlium/ui lint
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

Use GitHub-hosted Ubuntu for Playwright. Source inspection is never a browser, accessibility, performance or production PASS.
