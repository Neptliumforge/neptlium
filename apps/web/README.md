# @neptlium/web

Public marketing and information website for `neptlium.com`.

`apps/web` establishes Neptlium's public category, investor narrative, product meaning, editorial authority, discoverability, trust architecture, and path into the authenticated operating application. It owns no authenticated customer session, privileged financial operation, investment execution authority, or canonical financial state.

## Stage 01 marketing authority

The authoritative marketing-design specification is [`docs/marketing-design-system.md`](../../docs/marketing-design-system.md). It supersedes the former ivory-first visual direction and PR #68 homepage assumptions. Legacy styles remain only where later marketing routes have not yet been migrated.

## Public architecture

Canonical top-level domains are:

- Platform → `/platform`
- Investments → `/investments`
- Capital → `/products/capital-account`
- Insights → `/insights`
- Security → `/security`
- Company → `/company`

Products and Solutions remain valid second-level architecture. Route taxonomy, navigation data, sitemap authority, and route classification live in `lib/content/public-architecture.ts`.

## Positioning and conversion

Canonical Stage 01 positioning:

> **Capital, intelligently managed.**

Primary acquisition action:

- `Open account` → `https://app.neptlium.com/auth/sign-up`

Authenticated return action:

- `Sign in` → `https://app.neptlium.com/auth/sign-in`

Primary homepage exploration:

- `Explore Neptlium` → `/platform`
- `Explore Investments` → `/investments`
- `Explore Capital` → `/products/capital-account`
- `Explore Treasury` → `/products/treasury`

## Financial truth

Marketing must not fabricate customers, balances, AUM, performance, returns, transaction history, investment opportunities, execution, settlement, custody, provider relationships, licences, regulatory status, or live capability.

Funding communication must match actual capability. Digital-asset funding may be described only as capability-controlled/account-specific unless a specific supported production rail is verified. USD funding must not be represented as live until a supported production funding rail is implemented and verified.

`UNKNOWN != ZERO`. Configured is not live. Provider evidence is not canonical state. Modeled is not executed. Submitted is not settled. Settled is not reconciled.

## Visual system

Marketing is black-first, cinematic, product-first, editorial, restrained, and financially credible. Core implementation authority:

- `app/marketing-system.css`
- `app/homepage-stage01.module.css`
- `components/homepage-product-visuals.tsx`
- `components/site-header.tsx`
- `components/mobile-navigation.tsx`
- `components/site-footer.tsx`
- `components/global-conversion-cta.tsx`
- `components/marketing-disclosure.tsx`

The authenticated product design system remains separate; Stage 01 overrides marketing design only.

## Environment and commands

No environment variable is required for ordinary public rendering. Browser-safe values must use `NEXT_PUBLIC_*`; privileged credentials never belong in this app.

```sh
pnpm --filter @neptlium/web dev
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

On Termux/Android, do not run Playwright. GitHub-hosted Ubuntu is the browser QA environment.

Architecture: [`docs/00_PRODUCT_CONSTITUTION.md`](../../docs/00_PRODUCT_CONSTITUTION.md)

Marketing design: [`docs/marketing-design-system.md`](../../docs/marketing-design-system.md)
