# @neptlium/web

Public product and company website for `neptlium.com`.

`apps/web` establishes Neptlium's public category, narrative, product meaning, editorial authority, discoverability, and path into the operating application. It owns no authenticated customer session, privileged financial operation, or canonical financial state.

## Public direction

Neptlium Web is a medium-scale, conversational, product-led institutional experience.

Canonical global CTA pair:

- `Enter Neptlium` → authenticated application entry
- `Explore platforms` → `/platform`

The public surface should explain how Portfolio, Capital Account, Treasury, and Allocation fit together without narrating repository progress, provider setup, migrations, environment readiness, or deployment state.

Marketing may communicate the intended product model and customer value strongly, but it must not fabricate customers, balances, AUM, performance, execution, settlement, custody, provider relationships, licences, regulatory status, or live capability.

## Visual system

Current Web authority:

- Warm Ivory / Carbon / Mineral Teal
- medium typography rather than oversized poster scale
- soft digital material rather than flat paper
- concise conversational copy
- compact desktop disclosures
- accessible mobile accordion navigation
- restrained illustrative product compositions rather than fake dashboards

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

Architecture: [`docs/00_PRODUCT_CONSTITUTION.md`](../../docs/00_PRODUCT_CONSTITUTION.md)

Design: [`docs/03_DESIGN_SYSTEM.md`](../../docs/03_DESIGN_SYSTEM.md)

Web system: [`docs/04_WEB_MARKETING_SYSTEM.md`](../../docs/04_WEB_MARKETING_SYSTEM.md)
