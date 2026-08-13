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
- Circle Developer-Controlled Wallets contains existing-wallet/address/balance/transaction observation code for configured Base Sepolia or Base environments. The Circle runtime is composed with explicit environment and live-execution gates; wallet provisioning is disabled and transfer submission remains unimplemented.
- A gated Stripe Treasury USD ACH inbound-transfer adapter exists. Repository presence does not prove eligibility, deployed configuration, live execution, canonical availability, or reconciliation. Stripe Onramp is not implemented.
- Ledger, webhook inbox, idempotency, treasury policy, worker, audit, and reconciliation groundwork exists, but unsupported durable repository operations fail closed.

## Authoritative documentation

Start with:

- [`docs/00_PRODUCT_CONSTITUTION.md`](docs/00_PRODUCT_CONSTITUTION.md)
- [`docs/01_PLATFORM_ARCHITECTURE.md`](docs/01_PLATFORM_ARCHITECTURE.md)
- [`docs/02_AUTHENTICATED_APPLICATION.md`](docs/02_AUTHENTICATED_APPLICATION.md)
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
- [`docs/15_PRODUCTION_READINESS_AUDIT.md`](docs/15_PRODUCTION_READINESS_AUDIT.md)

Files under `docs/archive` are historical only. Implementation-specific references that remain outside the numbered set are subordinate to it.

## Roadmap

1. Apply and verify the reviewed distributed rate-limit migration before the API release.
2. Complete durable Capital Account, provider-webhook, and reconciliation operations.
3. Validate governed Treasury, Allocation, Transfer, and admin control workflows.
4. Close the documented theme-runtime gaps without changing financial behavior.
5. Review identity migration, Stripe Onramp, and future provider expansion separately.

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
