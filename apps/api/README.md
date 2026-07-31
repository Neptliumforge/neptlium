# Neptlium API

The API is a dependency-light Node.js/TypeScript HTTP service intended for `api.neptlium.com`. Versioned routes live below `/v1`. It is testnet-only and fails closed when Supabase or provider credentials are absent.

## Routes

- `GET /v1/health`, `/v1/status`, `/v1/version`
- `POST /v1/wallet/deposit-addresses`
- `GET /v1/wallet/deposits`, `/v1/wallet/transactions`
- `POST /v1/wallet/withdrawals`
- `GET /v1/wallet/withdrawals/:withdrawal_id`
- `POST /v1/wallet/withdrawals/:withdrawal_id/cancel`
- `POST /v1/webhooks/alchemy`, `/v1/webhooks/coinbase`

Wallet routes require a server-validated Supabase bearer token. Mutations require `Idempotency-Key`. Webhooks require a unique event ID and successful verification by the injected provider-specific verifier. Provider-backed success remains unavailable until reviewed adapters and credentials are installed.

The bundled memory repository is restricted to local development and tests. Production startup requires an injected durable repository implementing the reviewed Supabase transaction boundary; its idempotent withdrawal and webhook-inbox methods must be atomic, and its readiness probe controls `/v1/status`. The migration defines that persistence model. Likewise, webhook routes fail closed until a provider-specific verifier reviewed against the provider's official contract is injected. The included timestamped HMAC verifier is test-only and is not wired into production.

The operational layer adds durable job, reconciliation, treasury-policy, rate-limit, and observability contracts. Production requires database-backed job and repository adapters plus a distributed rate limiter; memory implementations are test-only. See [API operations](../../docs/API_OPERATIONS.md).

## Commands

```sh
pnpm --filter @neptlium/api dev
pnpm --filter @neptlium/api test
pnpm --filter @neptlium/api build
```

Copy `.env.example` to an untracked local environment file. Never expose the service-role key or provider secrets to browser applications.
