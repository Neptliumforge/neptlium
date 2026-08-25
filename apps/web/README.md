# @neptlium/web

Public product and company website for `neptlium.com`.

`apps/web` establishes Neptlium's public category, narrative, product meaning, editorial authority, discoverability, and path into the operating application. It owns no authenticated customer session, privileged financial operation, or canonical financial state.

## Public architecture

The canonical top-level domains are:

- Platform → `/platform`
- Products → `/products`
- Solutions → `/solutions`
- Resources → `/resources`
- Company → `/company`

Canonical product family:

- Capital Account → `/products/capital-account`
- Treasury → `/products/treasury`
- Allocation → `/products/allocation`
- Portfolio Intelligence → `/products/portfolio-intelligence`
- Performance → `/products/performance`
- Capital Universe → `/products/capital-universe`

Superseded root product URLs permanently redirect to the nested canonical family.

Route taxonomy, navigation data, sitemap authority, and route classification live in `lib/content/public-architecture.ts`.

## Public direction

Neptlium Web is a medium-scale, conversational, product-led institutional experience.

Canonical global entry action:

- `Enter Neptlium` → authenticated application sign-in

Broad exploration:

- `Explore platform` → `/platform`

The public surface explains Neptlium as a connected capital operating environment without narrating repository progress, provider setup, migrations, environment readiness, or deployment state.

Marketing may communicate the intended product model and customer value strongly, but it must not fabricate customers, balances, AUM, performance, execution, settlement, custody, provider relationships, licences, regulatory status, or live capability.

## Visual system

Current Web authority:

- Warm Ivory / Carbon / Mineral Teal
- medium typography rather than oversized poster scale
- typography, structure, product relationships, and information rather than decorative hero artwork
- concise conversational copy
- direct top-level hub links with compact desktop disclosures
- independently designed accessible mobile navigation
- restrained product-system representations rather than fake dashboards
- `app/neptlium-visual-direction.css` as the canonical reconstructed-surface style authority

See [`docs/04_WEB_MARKETING_SYSTEM.md`](../../docs/04_WEB_MARKETING_SYSTEM.md).

## Environment

No environment variable is required for ordinary public rendering. Browser-safe values must use `NEXT_PUBLIC_*`; privileged credentials never belong in this app.

## Commands

```sh
pnpm --filter @neptlium/web dev
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

On Termux/Android, use:

```sh
pnpm --filter @neptlium/web exec next build --webpack
```

Architecture: [`docs/00_PRODUCT_CONSTITUTION.md`](../../docs/00_PRODUCT_CONSTITUTION.md)

Design: [`docs/03_DESIGN_SYSTEM.md`](../../docs/03_DESIGN_SYSTEM.md)

Web system: [`docs/04_WEB_MARKETING_SYSTEM.md`](../../docs/04_WEB_MARKETING_SYSTEM.md)
