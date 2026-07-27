# Neptlium

Neptlium is capital operating infrastructure for modern ownership. This pnpm/Turborepo monorepo contains the public website, authenticated platform, internal console, shared packages, and tracked Supabase history.

Neptlium is crypto-only. Planned provider-dependent assets are USDC on Base, ETH on Base, and BTC on Bitcoin. Custody, execution, provider connectivity, pricing, regulatory approval, and production asset availability are not represented as complete.

## Workspaces

| Workspace    | Boundary                                      | Deployment                                  |
| ------------ | --------------------------------------------- | ------------------------------------------- |
| `apps/web`   | Public website                                | `apps/web` → `https://neptlium.com`         |
| `apps/app`   | Authenticated platform                        | `apps/app` → `https://app.neptlium.com`     |
| `apps/admin` | Role-gated internal console                   | `apps/admin` → `https://admin.neptlium.com` |
| `packages/*` | Shared UI, design, runtime, types, and config | Internal packages                           |
| `supabase`   | Append-only migration history                 | Separately reviewed process                 |

`https://api.neptlium.com` is planned; no API application exists here.

## Product boundaries

Authenticated navigation is exactly Overview, Portfolio, Neptlium Wallet, Treasury, and Allocation. Allocation modes are Observe, Model, and Authorize.

Modeling does not move capital.

Authorize remains unavailable until real ledger, custody, security, and execution infrastructure exists.

Never fabricate financial data, customers, partners, pricing, certifications, custody readiness, regulatory approval, or provider availability.

## Commands

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
```

## Environment and security

Copy the relevant app example to untracked `.env.local`. Browser-safe variables use `NEXT_PUBLIC_`; server-only variables must never enter browser bundles, logs, or tracked files. Missing provider credentials are expected and do not block frontend deployment.

Supabase Auth and RLS remain authorization boundaries. Preserve applied migrations and containment records. See [Architecture](docs/ARCHITECTURE.md), [API Foundation](docs/API_FOUNDATION.md), [Deployment](docs/DEPLOYMENT.md), [Security](docs/SECURITY.md), and [Supabase](docs/SUPABASE.md).

Support: `support@neptlium.com`.
