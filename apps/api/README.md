# @neptlium/api

Node.js/TypeScript API for `api.neptlium.com`. Versioned routes live under `/v1`; the API is an existing trust boundary, not a planned application.

## CURRENT

- Health, status, version, account provisioning/onboarding, Capital Account, wallet, and provider-webhook routes.
- Supabase bearer-token validation and owner-scoped repository boundary.
- Supabase durable adapter for readiness, account RPCs, Circle wallet linkage, and audit writes.
- Circle Developer-Controlled Wallets code for existing-wallet/address/balance/transaction observation on configured Base Sepolia or Base environments, with explicit runtime environment and live-execution gates.
- Ledger, idempotency, webhook inbox, treasury policy, reconciliation, worker, observability, and rate-limit contracts.

Production rejects memory persistence and process-local rate limiting. Standalone and serverless runtimes use the service-role-only Supabase distributed limiter RPC. Durable deposit, withdrawal, transaction, and webhook operations remain unsupported and fail closed. Circle transfer execution and Circle webhook verification are disabled. Alchemy/Coinbase webhook routes require injected reviewed verification.

A gated Stripe Treasury inbound-transfer adapter exists; Stripe Onramp and Clerk are not implemented.

## Environment

Copy `.env.example` to an untracked local file. Supabase service-role values, Circle credentials/entity secret, and webhook/provider secrets are server-only. Production provider configuration requires `ENABLE_MAINNET=true`; configuration is not execution authorization.

## Commands

```sh
pnpm --filter @neptlium/api dev
pnpm --filter @neptlium/api test
pnpm --filter @neptlium/api build
```

## Truth boundary

- Provider responses are observed evidence until ledger posting and reconciliation.
- Route or schema presence does not prove production capability.
- Mutations require authentication, ownership, idempotency, policy, audit, and durable atomic persistence.
- Webhooks fail closed without official-contract verification.

Architecture: [`docs/11_API_ARCHITECTURE.md`](../../docs/11_API_ARCHITECTURE.md).
