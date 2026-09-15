# Neptlium Web Engineering Contract

## Authority and scope

`apps/web` owns `neptlium.com`, the public marketing, investor-information, business-product, editorial, SEO and acquisition surface. It owns no authenticated customer session, privileged financial operation, canonical financial state, custody, execution or settlement authority.

Marketing design authority is `docs/marketing-design-system.md`. It defines one Neptlium company with two product journeys: **Personal / Neptlium Capital** and **Business / Neptlium Treasury**. It overrides former PR #68, ivory-first and Personal-only marketing assumptions. It does not override authenticated App/Admin design, the product constitution, financial truth, security boundaries, API authority, ledger logic, migrations, Gate 04/05 evidence or provider architecture.

Before Web work, follow root `AGENTS.md`, `docs/00_PRODUCT_CONSTITUTION.md`, `docs/marketing-design-system.md`, current Web source/tests/configuration and relevant open PRs. Do not change App, Admin, API, migrations, providers, remote environments or shared packages unless a verified dependency requires it and task scope explicitly authorizes it.

## Canonical public architecture

1. Personal → `/personal`
2. Business → `/business`
3. Platform → `/platform`
4. Insights → `/insights`
5. Security → `/security`
6. Company → `/company`

Canonical product-story routes include `/investments`, `/capital`, `/portfolio`, `/allocation` and `/treasury`.

Personal authenticates at `app.neptlium.com`. Business returns to Neptlium Treasury at `treasury.neptlium.com`. Do not force one audience through the other product’s login.

Route taxonomy and classification are centralized in `lib/content/public-architecture.ts`. Keep them aligned with redirects, metadata, sitemap, header, footer and tests.

## Financial truth

Public Web must not expose repository progress, migration state, provider setup or deployment health as ordinary marketing content. It must not invent customers, balances, AUM, performance, returns, payment history, testimonials, partnerships, licences, regulatory status, custody, provider capability, live execution, settlement or investment availability.

Investment and business capabilities must be qualified as live, limited, informational, developing, illustrative or unavailable when required by product truth.

`UNKNOWN != ZERO`. Provider evidence is not canonical state. Configured is not live. Modeled is not executed. Submitted is not settled. Settled is not reconciled. Wallet observation is not canonical treasury truth by display convention.

## Marketing visual character

One black-first design system applies to Personal and Business:

- Black `#050505`
- Raised black `#0D0D0D`
- Surface `#141414`
- White `#F7F7F2`
- Muted gray accessible refinement around `#999994`
- Mineral Teal `#35D5C1`
- Soft Teal `#8CE8DC`
- Ivory `#F3F0E8`
- Ink `#101010`

Differentiate journeys through product content, information density and workflows, not a separate color brand or design system.

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

Current marketing authority:

- `app/marketing-system.css`
- `app/unified-shell.css`
- `app/unified-marketing.module.css`

Legacy global layers exist only for routes not yet migrated and should be retired rather than expanded.

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
