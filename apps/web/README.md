# @neptlium/web

Public Neptlium website deployed separately at `https://neptlium.com` with Vercel root `apps/web`. It owns public product, security, research, contact, and draft legal content; it owns no authenticated or privileged operations.

```sh
pnpm --filter @neptlium/web dev
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web build
```

No environment variable is currently required. Browser-safe additions must use `NEXT_PUBLIC_`; server credentials never belong in this client. Missing provider credentials do not block deployment. Coinbase CDP and Alchemy integrations are not complete.

Neptlium is crypto-only. Planned provider-dependent assets are USDC on Base, ETH on Base, and BTC on Bitcoin. Do not imply provider availability, custody or execution readiness, financial results, customers, pricing, certifications, or regulatory approval. Legal drafts require qualified review. Support: `support@neptlium.com`.
