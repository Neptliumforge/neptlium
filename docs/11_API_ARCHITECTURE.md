# API Architecture

`apps/api` is the existing privileged backend boundary for `api.neptlium.com`. It is not future-only.

## CURRENT runtime and routes

The dependency-light Node.js/TypeScript service supports:

- `GET /health`, `GET /v1/health`
- `GET /v1/status`, `GET /v1/version`
- `POST /v1/account/provision`, `POST /v1/account/onboarding`
- `POST /v1/wallet/deposit-addresses` — retained only to return `410 route_replaced`
- `POST /v1/capital-account/provider-wallet`
- `GET /v1/capital-account/deposit-address`
- `GET /v1/capital-account/balances`
- `GET /v1/wallet/deposits`
- `POST /v1/wallet/withdrawals`
- `GET /v1/wallet/withdrawals/:withdrawal_id`
- `POST /v1/wallet/withdrawals/:withdrawal_id/cancel`
- `GET /v1/wallet/transactions`
- `POST /v1/webhooks/alchemy`, `/v1/webhooks/coinbase`, `/v1/webhooks/circle`

Route presence does not prove production capability. Circle webhook verification is disabled. Alchemy/Coinbase ingestion requires an injected verifier. Several wallet routes reach unsupported durable repository methods in production and therefore fail closed.

## Auth boundary

Public health/status/version routes do not establish user authority. Account, Capital Account, and wallet routes require a Supabase bearer token. The API validates it server-side with Supabase Auth and uses the returned user ID for repository ownership. `apps/app` forwards the current access token only from its server-only API client.

Service-role credentials are confined to the API/dedicated server clients. A bearer token, UI role, or caller-supplied owner ID never bypasses resource ownership checks.

## Repository architecture

`ApiRepository` defines readiness, account provisioning/onboarding, wallet/withdrawal/deposit/transaction, provider-wallet, idempotency/audit, and webhook persistence boundaries.

- `MemoryRepository` is local/test only and cannot be injected in production.
- `SupabaseRepository` currently implements readiness, provider-wallet lookup/linkage, account provisioning/onboarding RPCs, and audit insertion.
- Durable withdrawal create/read/cancel, deposit listing, transaction listing, and webhook recording are explicitly unsupported in that adapter.
- Production startup requires an injected durable repository and rejects memory persistence.

Those unsupported operations must be implemented as atomic database transactions consistent with the migrations before the corresponding routes can be enabled.

## Circle adapter

The provider-neutral `CapitalProvider` selects the Circle adapter only when complete testnet configuration is present. Circle supports USDC on Base Sepolia wallet/address/balance observation. Transfer execution is disabled. Responses expose Neptlium domain models and provider-observed state, not raw SDK objects or canonical balances.

## Webhooks

The generic boundary enforces raw-body size limits, provider-specific verification, a provider event ID, payload digest, replay conflict detection, deduplicated inbox persistence, safe logging, and request correlation. The included timestamped HMAC verifier is test/local only. Production verification must implement each provider's reviewed official contract.

Circle currently returns a disabled error before ingestion. Credentials or a configured route do not substitute for signature verification.

## Operations groundwork

- `treasury.ts` evaluates withdrawal policy, allowlists, approval thresholds, and self-approval prohibition.
- `reconciliation.ts` compares provider/internal records and classifies mismatches.
- `workers.ts` defines leased, retryable, dead-letter jobs for webhook processing, reconciliation, and ledger settlement.
- `observability.ts` emits safe structured request/operation signals.
- Migration tables support durable jobs, treasury policy, approvals, reconciliation resolution, audit, and idempotency.

Memory job/rate-limit implementations are local/test only. Production requires durable jobs and a **distributed rate limiter** shared across instances. The runtime already refuses production startup without an injected rate limiter.

## TRANSITION

1. Complete atomic Supabase repository operations and readiness checks.
2. Implement official provider webhook verifiers and durable inbox/job processing.
3. Connect ledger posting and reconciliation through reviewed transactions.
4. Replace direct admin financial status updates with privileged API commands.
5. Introduce provider-independent principal resolution before Clerk session cutover.
6. Add distributed rate-limit storage and operational monitoring.

## TARGET domains

### Allocation API

Mandates, policies, targets, observations, scenarios, proposals, reviews, approvals, reservations, execution intents, lifecycle, decision ledger, and reconciliation projections.

### Transfer API

Alias resolution, safe recipient verification, intent creation, validation, authorization, reservation, internal posting, provider execution, lifecycle, activity, and reconciliation.

### Treasury API

Read-only canonical liquidity projections, reserve requirement/coverage, restrictions, commitments, freshness, policy state, and exceptions. Treasury does not execute transfers.

### Stripe APIs

Provider-neutral fiat funding and Onramp intents, verified webhook ingestion, settlement/refund/dispute state, ledger posting, and reconciliation. Stripe is TARGET only.

## API invariants

- Mutation commands are authenticated, authorized, owner-validated, idempotent, rate-limited, audited, and fail closed.
- Ambiguous provider timeouts are looked up/reconciled before retry.
- No route reports canonical settlement from a provider response alone.
- Secrets and raw sensitive provider payloads never appear in client responses or logs.
