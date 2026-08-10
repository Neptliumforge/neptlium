# Neptlium API

The API is a dependency-light Node.js/TypeScript HTTP service intended for `api.neptlium.com`. Versioned routes live below `/v1`. It is testnet-only and fails closed when Supabase or provider credentials are absent.

## Routes

- `GET /v1/health`, `/v1/status`, `/v1/version`
- `POST /v1/account/provision`, `/v1/account/onboarding`
- `POST /v1/wallet/deposit-addresses`
- `GET /v1/wallet/deposits`, `/v1/wallet/transactions`
- `POST /v1/wallet/withdrawals`
- `GET /v1/wallet/withdrawals/:withdrawal_id`
- `POST /v1/wallet/withdrawals/:withdrawal_id/cancel`
- `POST /v1/capital-account/provider-wallet` (idempotent, on-demand testnet provisioning)
- `GET /v1/capital-account/deposit-address?asset=USDC&network=BASE-SEPOLIA`
- `GET /v1/capital-account/balances`
- `POST /v1/webhooks/alchemy`, `/v1/webhooks/coinbase`

Account and wallet routes require a server-validated Supabase bearer token. Account provisioning is the privileged boundary for idempotent profile creation and atomic onboarding completion; the service-role credential remains inside this API. Wallet mutations require `Idempotency-Key`. Webhooks require a unique event ID and successful verification by the injected provider-specific verifier. Provider-backed success remains unavailable until reviewed adapters and credentials are installed.

The bundled memory repository is restricted to local development and tests. Production startup requires an injected durable repository implementing the reviewed Supabase transaction boundary; its idempotent withdrawal and webhook-inbox methods must be atomic, and its readiness probe controls `/v1/status`. The migration defines that persistence model. Likewise, webhook routes fail closed until a provider-specific verifier reviewed against the provider's official contract is injected. The included timestamped HMAC verifier is test-only and is not wired into production.

The operational layer adds durable job, reconciliation, treasury-policy, rate-limit, and observability contracts. Production requires database-backed job and repository adapters plus a distributed rate limiter; memory implementations are test-only. See [API operations](../../docs/API_OPERATIONS.md).

## Commands

```sh
pnpm --filter @neptlium/api dev
pnpm --filter @neptlium/api test
pnpm --filter @neptlium/api build
```

Copy `.env.example` to an untracked local environment file. Never expose the service-role key or provider secrets to browser applications.

## Circle provider foundation

Circle Developer-Controlled Wallets is the first real adapter behind the provider-neutral
Capital Provider interface. Its only enabled capability is test USDC on Base Sepolia
(`BASE-SEPOLIA`) using an EOA. The API returns canonical address and provider-observed balance
models rather than Circle SDK responses. Provider balances remain unreconciled evidence until
the Neptlium ledger process matches them.

`CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, and `CIRCLE_ENVIRONMENT=testnet` are server-only.
`CIRCLE_WALLET_SET_ID` is an optional safe runtime reference for on-demand provisioning. Never
give any of these variables a `NEXT_PUBLIC_` prefix. Mainnet and ambiguous environment values
fail closed. Circle transfer execution is intentionally disabled in this foundation phase;
customer withdrawal requests stop at Neptlium's authorization and policy boundary.

The `/v1/webhooks/circle` boundary is intentionally disabled. Circle signature verification has
not been implemented in this foundation because verification must follow a reviewed current
official contract rather than invented HMAC logic. Existing request size, correlation,
deduplication, inbox, and safe logging primitives are ready to receive that verifier later.
