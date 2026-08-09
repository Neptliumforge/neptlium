# @neptlium/app

Authenticated Neptlium platform deployed separately at `https://app.neptlium.com` with Vercel root `apps/app`. Supabase Auth, server guards, and RLS protect access; UI checks are not authorization.

Primary navigation is exactly Overview, Portfolio, Capital Account, Treasury, and Allocation. Allocation modes are Observe, Model, and Authorize. Modeling does not move capital. Authorize remains unavailable until real ledger, custody, security, and execution infrastructure exists.

```sh
pnpm --filter @neptlium/app dev
pnpm --filter @neptlium/app typecheck
pnpm --filter @neptlium/app lint
pnpm --filter @neptlium/app build
```

Browser-safe variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`. This app does not require `SUPABASE_SERVICE_ROLE_KEY`. Missing provider credentials do not block frontend deployment; Coinbase CDP and Alchemy integrations are not complete.

Neptlium is crypto-only. Planned provider-dependent assets are USDC on Base, ETH on Base, and BTC on Bitcoin. Never fabricate financial or provider data.
