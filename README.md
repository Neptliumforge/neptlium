# Neptlium

Neptlium is a capital operating platform for understanding, funding, governing, transferring, allocating, and reconciling capital without making any provider the source of financial truth.

## Monorepo

| Workspace    | Domain               | Responsibility                                                                  |
| ------------ | -------------------- | ------------------------------------------------------------------------------- |
| `apps/web`   | `neptlium.com`       | Public product and company website.                                             |
| `apps/app`   | `app.neptlium.com`   | Authenticated customer application.                                             |
| `apps/admin` | `admin.neptlium.com` | Internal operational-control console.                                           |
| `apps/api`   | `api.neptlium.com`   | Versioned API, provider, ledger, security, worker, and reconciliation boundary. |

Shared packages live under `packages/*`; append-only Supabase migration history lives under `supabase/migrations`.

## Current foundation

- Supabase provides the current Auth, Postgres, RLS, and server-data foundation.
- Clerk authentication/session/MFA with provider-independent Neptlium principals is TARGET architecture only; it is not installed or live.
- Circle Developer-Controlled Wallets is implemented for test USDC on Base Sepolia wallet/address/balance observation. Transfer execution and Circle webhook ingestion remain disabled.
- Stripe fiat funding and Stripe Onramp are TARGET only; neither is installed or live.
- Ledger, webhook inbox, idempotency, treasury policy, worker, audit, and reconciliation groundwork exists, but unsupported durable repository operations fail closed.

## Authoritative documentation

Start with:

- [`docs/00_PRODUCT_CONSTITUTION.md`](docs/00_PRODUCT_CONSTITUTION.md)
- [`docs/01_PLATFORM_ARCHITECTURE.md`](docs/01_PLATFORM_ARCHITECTURE.md)
- [`docs/02_AUTHENTICATED_APPLICATION.md`](docs/02_AUTHENTICATED_APPLICATION.md)
- [`docs/03_DESIGN_SYSTEM.md`](docs/03_DESIGN_SYSTEM.md)
- [`docs/04_IDENTITY_AND_ACCESS.md`](docs/04_IDENTITY_AND_ACCESS.md)
- [`docs/05_CAPITAL_ACCOUNT.md`](docs/05_CAPITAL_ACCOUNT.md)
- [`docs/06_TREASURY.md`](docs/06_TREASURY.md)
- [`docs/07_ALLOCATION_ENGINE.md`](docs/07_ALLOCATION_ENGINE.md)
- [`docs/08_TRANSFER_ARCHITECTURE.md`](docs/08_TRANSFER_ARCHITECTURE.md)
- [`docs/09_LEDGER_AND_RECONCILIATION.md`](docs/09_LEDGER_AND_RECONCILIATION.md)
- [`docs/10_PROVIDER_ARCHITECTURE.md`](docs/10_PROVIDER_ARCHITECTURE.md)
- [`docs/11_API_ARCHITECTURE.md`](docs/11_API_ARCHITECTURE.md)
- [`docs/12_ADMIN_OPERATIONS.md`](docs/12_ADMIN_OPERATIONS.md)
- [`docs/13_SECURITY.md`](docs/13_SECURITY.md)
- [`docs/14_DEPLOYMENT.md`](docs/14_DEPLOYMENT.md)

Files under `docs/archive` are historical only. Implementation-specific references that remain outside the numbered set are subordinate to it.

## Roadmap

1. Phase 0 — documentation and design-authority normalization.
2. Authenticated-shell alignment without changing financial behavior.
3. Durable Capital Account repository, ledger, webhook, and reconciliation completion.
4. Governed Treasury, Allocation, Transfer, and admin control workflows.
5. Separately reviewed identity migration from Supabase Auth to Clerk.
6. Separately reviewed Stripe fiat funding/Onramp and future provider expansion.

TARGET items are not promises of current availability.

## Financial correctness

- Provider observation is evidence, not canonical ledger truth.
- Modeling, approval, admin status, or provider submission does not prove execution or settlement.
- Financial mutations must be authenticated, authorized, owner-validated, idempotent, audited, balanced, and reconciled.
- Reservations precede spend/submission where required and prevent double use of capital.
- Posted financial history is append-only; corrections use reversals or compensating entries.
- Missing capability, verification, durable storage, or configuration fails closed.
- Never fabricate balances, holdings, execution, settlement, customers, providers, or regulatory status.

## Commands

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
```
