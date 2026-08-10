# @neptlium/web

Public product and company website for `neptlium.com`. It owns no authenticated session, privileged operation, or canonical financial state.

## CURRENT

The site presents Neptlium's capital operating platform, Capital Account, Treasury, Allocation, capital universe, security/trust, company, research, and draft legal content. It must distinguish implemented foundation from target capability.

Current provider foundation is Supabase plus Circle testnet Capital Account observation. Clerk identity, Stripe fiat funding/Onramp, future equities providers, and other target capabilities must not be represented as live.

## Environment

No environment variable is currently required. Any future browser-safe value must use `NEXT_PUBLIC_*`; server credentials never belong in this app.

## Commands

```sh
pnpm --filter @neptlium/web dev
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web build
```

Never imply provider availability, custody/execution readiness, financial results, customers, pricing, certification, or regulatory approval without verified evidence.

Architecture: [`docs/00_PRODUCT_CONSTITUTION.md`](../../docs/00_PRODUCT_CONSTITUTION.md).
