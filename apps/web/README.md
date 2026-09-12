# @neptlium/web

Public institutional marketing and information website for `neptlium.com`.

`apps/web` establishes Neptlium's public category, investor narrative, product meaning, editorial authority, discoverability, trust architecture, and path into the authenticated operating application. It owns no authenticated customer session, privileged financial operation, investment execution authority, or canonical financial state.

## Public architecture

The canonical top-level domains are:

- Platform → `/platform`
- Investments → `/investments`
- Insights → `/insights`
- Security → `/security`
- Company → `/about`

Products and Solutions remain important second-level platform architecture:

- Products → `/products`
- Solutions → `/solutions`
- Capital Account → `/products/capital-account`
- Treasury → `/products/treasury`
- Allocation → `/products/allocation`
- Portfolio Intelligence → `/products/portfolio-intelligence`

Route taxonomy, navigation data, sitemap authority, and route classification live in `lib/content/public-architecture.ts`.

## Positioning and conversion

Canonical positioning:

> **Capital, made clearer.**

The public site explains Neptlium as a modern capital platform for portfolio visibility, capital management, funding workflows, reporting, and governed financial activity.

Primary acquisition action:

- `Get Started` → authenticated application account creation

Authenticated return action:

- `Sign In` → authenticated application sign-in

Primary homepage exploration:

- `Explore the Platform` → `/platform`
- `View Investment Solutions` → `/investments`

Marketing may communicate the product model and investor value strongly, but it must not fabricate customers, balances, AUM, performance, returns, transaction history, investment opportunities, execution, settlement, custody, provider relationships, licences, regulatory status, or live capability.

## Investment and funding truth

Public investment content is organized around objective, strategy, structure, underlying exposure, risk, duration, liquidity, fees, documentation, eligibility, and investor suitability. Historical, target, projected, and illustrative information must remain distinguishable whenever those categories appear.

Funding communication must match actual capability. Digital-asset funding may be described as capability-controlled and account-specific. USD funding must not be represented as live until a supported production funding rail is implemented and verified.

## Visual system

Neptlium Web is more editorial and cinematic than the authenticated product while remaining visibly related to it.

Current visual direction:

- Warm Ivory / Carbon / Mineral Teal
- medium-scale editorial typography
- strong information hierarchy and deliberate negative space
- restrained product visualizations based on real product architecture
- no fabricated balances, charts, returns, holdings, or transaction screenshots
- accessible desktop disclosures and independently designed mobile navigation
- restrained motion with reduced-motion support
- route-scoped composition modules for newly rebuilt marketing surfaces, while `app/neptlium-visual-direction.css` remains the global visual authority

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

On Termux/Android:

```sh
pnpm --filter @neptlium/web exec next build --webpack
```

Architecture: [`docs/00_PRODUCT_CONSTITUTION.md`](../../docs/00_PRODUCT_CONSTITUTION.md)

Design: [`docs/03_DESIGN_SYSTEM.md`](../../docs/03_DESIGN_SYSTEM.md)

Web system: [`docs/04_WEB_MARKETING_SYSTEM.md`](../../docs/04_WEB_MARKETING_SYSTEM.md)
