# API Architecture

`apps/api` is the privileged backend boundary for `api.neptlium.com`.

## CURRENT runtime and routes

The dependency-light Node.js/TypeScript service supports public health/status/version/capability routes plus governed account, capital-account, wallet, customer, admin, and webhook routes. Route presence does not prove production capability.

Several provider and financial operations remain capability-gated or deliberately unimplemented. Unsupported paths must fail closed rather than manufacture availability.

## Auth boundary

Public health/status/version routes do not establish user authority.

`GET /v1/platform/capabilities` is the public, machine-readable product-boundary contract. It distinguishes `available`, `beta`, `planned`, and `unavailable` states; records the authority sequence; and explicitly keeps AI outside authority. It is intentionally separate from runtime/provider readiness. Provider configuration cannot promote a product capability.

Customer and operator bearer tokens are Supabase Auth access tokens. `apps/api` verifies the authenticated Supabase subject, resolves the active `SUPABASE_AUTH` mapping to a stable Neptlium principal, and performs Neptlium-owned authorization from that principal.

No alternate runtime authentication mode is supported.

Service-role credentials are confined to the API/dedicated server clients. A bearer token, UI role, email address, user-editable metadata, or caller-supplied owner ID never bypasses resource ownership and policy checks.

## Repository architecture

`ApiRepository` defines readiness, account provisioning/onboarding, wallet/withdrawal/deposit/transaction, provider-wallet, idempotency/audit, and webhook persistence boundaries.

- `MemoryRepository` is local/test only and cannot be injected in production.
- `SupabaseRepository` owns durable server-side persistence where implemented.
- Unsupported financial operations must remain explicitly unavailable until the corresponding atomic durable path exists.
- Production startup requires durable infrastructure and rejects memory persistence for authoritative state.

Those unsupported operations must be implemented as atomic database transactions consistent with reviewed migrations before corresponding production capability is enabled.

## Circle adapter

The provider-neutral `CapitalProvider` may select Circle when complete environment-specific configuration and capability gates are satisfied. The adapter currently supports reviewed observation/read paths for configured assets/networks. Automatic provisioning and transfer submission remain disabled where implementation is incomplete.

Responses expose Neptlium domain models and provider-observed state, not raw SDK objects or canonical balances.

## Webhooks

The generic boundary enforces raw-body size limits, provider-specific verification, provider event IDs, payload digests, replay conflict detection, deduplicated inbox persistence, safe logging, and request correlation.

Production webhook verification must implement each provider's reviewed official signing contract. A configured route or credential does not substitute for verification.

## Operations groundwork

- treasury policy evaluates governed withdrawal/approval conditions;
- reconciliation compares provider/internal records and classifies mismatches;
- workers define leased, retryable, dead-letter jobs for webhook processing, reconciliation, and settlement work;
- observability emits safe structured request/operation signals;
- durable tables support jobs, treasury policy, approvals, reconciliation resolution, audit, and idempotency.

Memory job/rate-limit implementations are local/test only. Production requires durable jobs and a distributed rate limiter shared across instances. Storage failure fails closed.

## TRANSITION

1. Complete remaining atomic Supabase repository operations and readiness checks.
2. Complete official provider webhook verifiers and durable inbox/job processing.
3. Connect ledger posting and reconciliation through reviewed transactions.
4. Keep Admin financial actions behind privileged API commands.
5. Complete Supabase Auth session/browser QA across App, Admin, and Neptlium Treasury.
6. Retain historical identity migration evidence without reintroducing retired runtime authentication paths.

## TARGET domains

### Allocation API

Mandates, policies, targets, observations, scenarios, proposals, reviews, approvals, reservations, execution intents, lifecycle, decision ledger, and reconciliation projections.

### Transfer API

Alias resolution, recipient verification, intent creation, validation, authorization, reservation, internal posting, provider execution, lifecycle, activity, and reconciliation.

### Treasury API

Read-only canonical liquidity projections, reserve requirement/coverage, restrictions, commitments, freshness, policy state, and exceptions. Treasury does not execute transfers merely because it presents state.

### Stripe APIs

The current Stripe boundary is evidence ingress for reviewed use cases. Stripe capital funding is not live merely because webhook infrastructure exists. Funding requires attribution, failure/refund handling, ledger posting, reconciliation, and explicit capability approval.

## API invariants

- Mutation commands are authenticated, authorized, owner-validated, idempotent, rate-limited, audited, and fail closed.
- Ambiguous provider timeouts are looked up/reconciled before retry.
- No route reports canonical settlement from a provider response alone.
- Secrets and raw sensitive provider payloads never appear in client responses or logs.
- Authentication identifies the principal; authorization and financial authority remain separate server-owned concerns.
- API responses are non-cacheable by default and include baseline anti-sniffing, frame-denial, referrer, and browser-feature restrictions. A future cacheable public response requires explicit review rather than inheriting permissive caching.


## Execution domain boundary

Provider-neutral execution semantics are owned by `apps/api/src/execution`. The current foundation defines domain types, lifecycle ambiguity, provider-evidence envelopes, explicit TEST/LIVE environment identity, and fail-closed capability semantics only. It does not expose provider routes or perform provider I/O.

Execution providers must remain beneath existing Neptlium identity, authorization, policy, reservation, reconciliation, and canonical-financial-truth boundaries. In particular, ambiguous submission results require lookup/reconciliation before any retry, and a provider `FILLED` state is not Neptlium `RECONCILED`. See [Execution](../financial/EXECUTION.md).

## Payment domain boundary

Provider-neutral payment semantics are owned by `apps/api/src/payments`. The current P0 foundation defines Neptlium Payment and PaymentAttempt identity, layered lifecycle semantics, provider-evidence envelopes, explicit TEST/LIVE provider environment identity, and fail-closed resubmission rules only. It exposes no payment route and performs no provider I/O, persistence, ledger posting, reconciliation, or payment execution.

A Neptlium Payment is not a provider payment object. One Payment may have multiple bounded PaymentAttempts without changing Payment identity. `SUBMISSION_UNKNOWN` prohibits automatic retry and alternate-provider submission until provider lookup and reconciliation establish what occurred. Authorization, capture, settlement observation, reconciliation, refund, and dispute outcomes remain distinct states.

Future payment providers must sit beneath Neptlium identity, authorization, policy, risk, reconciliation, and canonical-financial-truth boundaries. Existing Stripe subscription/billing ingress is unchanged and does not establish Payment Domain execution authority. See [Payments](../financial/PAYMENTS.md).

