# API Operations

## Worker lifecycle

Operational work is represented by durable, uniquely keyed jobs. Workers atomically lease one available job, renew or complete it only while holding the lease, and allow expired leases to be reclaimed after process failure. Failures use bounded exponential backoff; exhausted or unsupported jobs move to `dead_letter` for operator review. Webhook processing, reconciliation, and ledger settlement use separate job types and idempotent domain handlers. Production adapters must implement `JobStore` using `api_jobs` and `claim_api_job`; the memory store is test-only.

## Webhook lifecycle

The HTTP endpoint verifies the provider contract and atomically records a `verified` inbox item. A worker performs domain processing and may then mark the item processed. An identical event is acknowledged without replaying effects; the same provider event ID with a different digest is a security incident. Raw signatures and secret headers are never logged.

## Reconciliation

Scheduled jobs compare provider evidence with internal wallet and ledger records. Mismatches create open reconciliation items rather than silently changing financial history. Operators may acknowledge and resolve items with actor, timestamp, and resolution notes. Corrections use compensating ledger entries.

## Treasury controls

Withdrawal policies are versioned by asset and network. They enforce maximum amounts, destination allowlisting, self-approval prohibition, and distinct dual authorization above the configured threshold. Approval rows are append-only. Provider submission remains disabled until policy approval, available balance, custody, and provider launch gates all pass.

## Observability

The runtime emits correlated safe structured request records, counters, and latency measurements through `Observer`. Production can bridge this interface to OpenTelemetry. Records contain operation, request ID, duration, outcome, status, and safe error code only. Tokens, request bodies, destinations, webhook signatures, private keys, and provider secrets are excluded.

## Abuse controls

Reads and writes have separate quotas. Production startup requires a distributed `RateLimiter`; the in-memory limiter exists only for local development and tests. Edge/WAF controls remain an additional layer and must not replace owner- and operation-scoped server enforcement.

## Deployment order

1. Apply reviewed migrations to an isolated database and run concurrency/invariant tests.
2. Deploy durable repository, job store, distributed limiter, and observability adapters with providers disabled.
3. Verify readiness, lease recovery, retries, dead letters, reconciliation, alerts, and operator access.
4. Install provider verifiers and testnet adapters from reviewed official contracts.
5. Complete security, custody, compliance, recovery, and testnet reconciliation gates before any mainnet review.
