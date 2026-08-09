# Architecture

Neptlium is a pnpm/Turborepo monorepo. `apps/web`, `apps/app`, and `apps/admin` deploy independently to `https://neptlium.com`, `https://app.neptlium.com`, and `https://admin.neptlium.com`. Internal `@neptlium/*` packages provide UI, design tokens, runtime infrastructure, contracts, and configuration. `supabase` owns append-only migration history.

Supabase Auth, PostgreSQL, RLS, and Storage form the backend boundary. Browser code uses publishable credentials. Service-role access is server-only; UI checks never replace server authorization or RLS.

Neptlium is crypto-only. Planned provider-dependent assets are USDC on Base, ETH on Base, and BTC on Bitcoin. Customer navigation is exactly Overview, Portfolio, Capital Account, Treasury, and Allocation.

Allocation states are Observe, Model, and Authorize. Modeling does not move capital. Authorize remains unavailable until real ledger, custody, security, and execution infrastructure exists.

`https://api.neptlium.com` is planned; no API application is present. See [API Foundation](API_FOUNDATION.md).
