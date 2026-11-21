# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public marketing, investor-information, business-product, editorial, SEO and acquisition surface. It owns no authenticated customer session, privileged financial operation, canonical financial state, custody, execution or settlement authority.

Canonical design authority is `docs/experience/DESIGN_SYSTEM.md` with runtime tokens in `packages/ui/src/styles/tokens.css`. Public Web uses the same Neptlium identity as Capital and Treasury while retaining an editorial marketing density. Capital Rails are the canonical mark-derived spatial/authority grammar; extend shared primitives rather than creating page-local fintech artwork.

Before Web work, follow root `AGENTS.md`, `docs/product/PRODUCT.md`, canonical `docs/experience/DESIGN_SYSTEM.md`, current Web source/tests/configuration and relevant open PRs. Do not change App, Admin, API, migrations, providers, remote environments or shared packages unless a verified dependency requires it and task scope explicitly authorizes it.

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

## Product identity and public claims

Neptlium is the **Capital Operating Platform**. Use the canonical public proposition **Capital, intelligently managed.** and the principle **Every movement has authority. Every position has evidence.** The six primary capabilities are Capital, Portfolio, Investments, Treasury, Intelligence and Infrastructure. Recheck `docs/product/PRODUCT.md`, `lib/content/public-architecture.ts` and current page implementations before adding or renaming a capability or route.

Describe capability state accurately as operational, Preview-only, planned, limited or unavailable. Preview is not production. Wallet is a planned product direction unless current source and approved product evidence establish otherwise; do not imply supported networks, custody, key management, live transaction submission, settlement or available balances. Label illustrative product data clearly and preserve all public financial disclosures.

## Frontend implementation standards

- Use the existing Next.js App Router, TypeScript, React, Tailwind CSS 4 conventions, CSS Modules and `@neptlium/ui` primitives already present. Reuse shared components and tokens before creating local abstractions or adding dependencies.
- The current Web manifest declares Next.js 16.2.10, React/React DOM 19.2.7, TypeScript 6.0.3 and Tailwind CSS 4.3.2; the root package manifest declares pnpm 11.9.0. Treat the package manifests and lockfile, not this version note, as the executable dependency authority.
- The shared design authority is `docs/experience/DESIGN_SYSTEM.md` and `packages/ui/src/styles/tokens.css`. Do not introduce page-local brand palettes, duplicate typography/spacing scales, competing theme systems or unapproved visual primitives.
- Build responsive compositions rather than shrinking desktop layouts. Check at least 360, 390, 768, 1280 and 1440 CSS pixels; avoid horizontal overflow and preserve readable line lengths and 44px minimum interactive targets.
- Use semantic landmarks, a single meaningful H1 per page, ordered headings, real links for navigation, buttons for actions, accessible names, visible keyboard focus, focus-managed dialogs and non-color-only status cues. Target WCAG 2.2 AA contrast and interaction behavior.
- Support Dark, Light and System themes through the existing theme authority. Verify theme persistence and system preference behavior; do not hardcode a competing theme.
- Keep client components and JavaScript to the minimum required for interaction. Prefer optimized Next/Image and existing local fonts/assets; avoid unnecessary trackers and unreviewed remote assets. Preserve deliberate metadata, canonical URLs, Open Graph, sitemap and robots behavior.
- Motion must clarify hierarchy or state, use existing timing tokens, avoid scroll hijacking and expensive rendering, and respect `prefers-reduced-motion`. Decorative motion must not imply financial execution or progress.

## Web engineering and verification

Use existing workspace/package conventions and verified scripts. Current Web package commands are:

```sh
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test:node
pnpm --filter @neptlium/web test:unit
pnpm --filter @neptlium/web build
```

Shared UI checks are `pnpm --filter @neptlium/ui typecheck` and `pnpm --filter @neptlium/ui lint`. Browser release QA is run on GitHub-hosted Ubuntu through `.github/workflows/web-preview-browser-qa.yml` using the Playwright suite in `tests/e2e`. Inspect generated screenshots and failure artifacts; never treat a passing build or source-contract test as visual/browser certification. Keep Node source contracts in `test/`, Vitest unit tests in `unit/`, and Playwright release tests in `tests/e2e/`.

Before implementation, read root and local agent instructions, current product/design authority, source, tests, configuration and relevant open PRs. Keep functional changes inside `apps/web`. Coordinate any genuinely required shared-package change separately; do not modify App, API, Supabase, financial infrastructure, provider credentials or production configuration as part of Web work. Use small commits, update meaningful tests, report PASS/FAIL/BLOCKED/NOT RUN accurately, and include verification evidence and known limitations in the PR. Never merge or deploy Production without current-task authorization.

## Required validation

```sh
git diff --check origin/main...HEAD
pnpm --filter @neptlium/ui typecheck
pnpm --filter @neptlium/ui lint
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test:node
pnpm --filter @neptlium/web test:unit
pnpm --filter @neptlium/web build
```

Retain the Node architecture/source contracts in `test/`. Vitest owns executable unit behavior in `unit/` through `vitest.config.ts`; it must not collect the Node or Playwright suites. The `test` script remains an alias for the Node suite. Both test commands are required in CI and Product Family Validation.

Use GitHub-hosted Ubuntu for Playwright. Source inspection is never a browser, accessibility, performance or production PASS.
