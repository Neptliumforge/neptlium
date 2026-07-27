# API Foundation

## Status

API code is not implemented on this branch. Future branch: `feat/neptlium-api-foundation`. Base domain: `https://api.neptlium.com`. Credentials are not currently available. No Coinbase CDP or Alchemy integration is complete. Testnet comes before mainnet; use Base Sepolia first if supported.

A personal Coinbase retail API key must not be used for customer custody. Provider webhooks must not be configured before deployed endpoints verify signatures and return verified 2xx responses.

## Reserved endpoints

```text
GET  /v1/health
POST /v1/webhooks/alchemy
POST /v1/webhooks/coinbase
POST /v1/wallet/deposit-addresses
GET  /v1/wallet/deposits
POST /v1/wallet/withdrawals
GET  /v1/wallet/withdrawals/{withdrawal_id}
POST /v1/wallet/withdrawals/{withdrawal_id}/cancel
GET  /v1/wallet/transactions
```

These are reserved contracts, not implemented behavior.

## Proposed structure and trust boundaries

```text
apps/api/src/
  http/ auth/ wallet/ webhooks/ providers/
  ledger/ reconciliation/ audit/ jobs/
apps/api/tests/
```

Handlers validate and authorize, services enforce state transitions, database transactions enforce invariants, and workers isolate provider calls. The browser is untrusted. The Neptlium API owns authentication, authorization, validation, rate limits, orchestration, destination policy, state machines, idempotency, reconciliation, audit, and truthful responses.

Coinbase CDP is proposed for supported custody/wallet primitives, provider addresses, controlled transaction submission, and provider events; eligibility must be verified. Alchemy is proposed for RPC, chain observation, notifications, and metadata; it is not the ledger or authorization authority. Supabase owns Auth, PostgreSQL, RLS where applicable, durable webhook/idempotency records, immutable ledger data, state history, and audits. No callback is trusted because it reached a secret URL, and no client-supplied ownership or financial field is authoritative.

## Authentication and authorization

Customer endpoints require a valid Supabase token. Verify signature, issuer, audience, expiry, and subject server-side. Resolve profile and organization from the subject, then enforce ownership, role, account state, asset/network support, and operation policy. Webhooks use provider signatures, not customer auth. Jobs use separate workload identity. Service-role access is server-only and least-privileged. RLS is defense in depth, not a replacement for explicit authorization.

## Server-only variables

```text
SUPABASE_SERVICE_ROLE_KEY
CDP_API_KEY_ID
CDP_API_KEY_SECRET
CDP_WALLET_SECRET
ALCHEMY_API_KEY
ALCHEMY_RPC_URL
ALCHEMY_WEBHOOK_SIGNING_KEY
```

No secret may use `NEXT_PUBLIC_`. Store secrets per environment, never log them, and document rotation/revocation.

## Webhooks, replay, and idempotency

Read the unmodified raw body. Implement the current official signature scheme, constant-time comparison where applicable, timestamp tolerance, size limits, and fail-closed parsing. Persist provider, unique event ID, raw-body digest, signature metadata, receive time, and verification result. Atomically insert a verified event into a durable inbox and enqueue it. Uniquely constrain `(provider, provider_event_id)`. An identical duplicate may return 2xx; the same ID with another digest is a security incident. Reject stale, malformed, oversized, or unverifiable events. Retries never duplicate postings.

Every financial POST requires an `Idempotency-Key` scoped to principal, endpoint, and API version. In the resource transaction persist normalized request digest, response, resource ID, and expiry. Matching retries return the saved result; conflicting reuse returns `409 idempotency_conflict`. Provider command keys derive from stable internal operation IDs. Cancellation is idempotent.

## Immutable ledger

The ledger is append-only and double-entry. Each journal transaction balances to zero per asset at commit. Amounts are integers in asset atomic units, never floating point. Posted entries are never updated/deleted; corrections use linked reversing and replacement entries. Each posting has a unique business-event reference, account, asset, network, effective/recorded times, and trace ID.

Provider balances are reconciliation evidence, not the ledger. Available, pending, reserved, and settled positions derive from postings and explicit holds. Constraints and concurrency-safe transactions prevent duplicates and overspend. UI values are not custody facts unless reconciled.

## State machines

Deposit:

```text
address_requested -> address_ready
observed -> confirming -> confirmed -> credited
observed|confirming|confirmed -> reorged
any nonterminal state -> failed|manual_review
```

Address creation is provider-backed and idempotent. Observation is not available capital. Credit requires asset/network match, owned address, transaction uniqueness, and versioned confirmation policy. Unsupported transfers enter review. History is append-only.

Withdrawal:

```text
requested -> validating -> pending_authorization -> authorized
authorized -> submitted -> broadcast -> confirming -> completed
requested|validating|pending_authorization -> cancelled
authorized|submitted -> failed
broadcast|confirming -> failed_or_recovery
```

Reserve funds atomically. Cancellation is allowed only before submission is irrevocable. Submission requires ownership, sufficient available position, destination policy, supported asset/network, limits, approvals, and stable provider idempotency. Correct reservations with ledger entries, never balance mutation.

## Confirmations, reorganizations, destinations

Version confirmation thresholds per network/asset and record the applied policy. Workers obtain canonical status from supported observations. Reorganizations preserve replaced evidence, move affected transfers out of confirmed state, reverse provisional accounting when required, and alert operations.

Validate destination syntax/checksum for the chosen network, supported contracts, and cross-network ambiguity. Reject zero, burn, internal, sanctioned, blocked, or prohibited destinations. Apply allowlists, cooling periods, ownership/compliance checks, limits, and approvals. Never infer network only from address shape. Present the canonical destination for customer confirmation.

## Rate limiting and errors

Layer limits by IP, principal, organization, endpoint, and risk; tighten address creation, withdrawal, cancellation, and failed-auth limits. Bound body size, pagination, timeout, and concurrency. Return `429` with `Retry-After`.

```json
{
  "error": {
    "code": "destination_invalid",
    "message": "The destination is not valid for the selected network.",
    "request_id": "req_...",
    "details": {}
  }
}
```

Use correct HTTP status and stable provider-independent codes. Disclose no secrets, stacks, or cross-tenant resource existence.

## Audit, reconciliation, recovery

Audit actor, organization, action, target, outcome, request ID, source, policy result, state transition, idempotency identity, and time. Redact tokens, signatures, keys, wallet secrets, and unnecessary personal data. Financial/security audits are append-only, access-controlled, retention-governed, exportable, and correlated to provider events and postings.

Continuously reconcile status and periodically compare provider/chain evidence with inbox state, application state, holds, and ledger totals by wallet/network/asset. Differences create durable incidents with evidence, owner, and resolution. Never create unexplained balancing entries.

Use bounded exponential retry with jitter, circuit breakers, dead-letter queues, and audited, authorized, dry-run-capable, idempotent replay from immutable inbox records. Routinely test backups and point-in-time restoration.

## Test strategy

- Unit-test validation, authorization, adapters, errors, and every transition.
- Property-test balancing, integer precision, idempotency, and illegal transitions.
- Integration-test database constraints and concurrency on isolated PostgreSQL.
- Contract-test official provider/signature fixtures.
- Test duplicate, reordered, delayed, stale, malformed, and conflicting webhooks.
- Simulate confirmations and reorganizations.
- End-to-end test tenant isolation, limits, cancellation races, outages, and recovery.
- Load-test webhook bursts; run security, dependency, and secret scans.

Use provider sandboxes and Base Sepolia first if supported, with isolated test keys/data.

## Deployment and rollback

1. Build on `feat/neptlium-api-foundation` after threat-model, provider-eligibility, contract, and migration review.
2. Provision isolated preview, testnet, and production configuration with server-only secrets.
3. Apply reviewed migrations to disposable and staging databases through the approved process.
4. Deploy with webhooks disabled; verify health, auth isolation, limits, errors, queues, audits, and observability.
5. Exercise signed fixtures and verify 2xx, duplicate handling, and async processing.
6. Configure testnet webhooks only after deployed endpoints return verified 2xx.
7. Pass reconciliation, recovery, load, restore, and rollback drills; promote an immutable artifact with approval.
8. Configure production webhooks last; keep mutations gated until launch gates pass.

Retain immutable releases and route to the last known-good artifact. If correctness is uncertain, pause withdrawal authorization/submission while safely ingesting verified events where possible. Never roll back append-only ledger/inbox data. Use expand/migrate/contract migrations, reconcile the rollback window, and verify invariants before resuming.

## Milestones and definition of done

Milestones: (1) threat model/provider/contract/data review; (2) runtime, health, auth, errors, limits, observability; (3) ledger, idempotency, audit, invariant tests; (4) CDP deposits on testnet; (5) Alchemy observation, inboxes, confirmations, reorganizations; (6) withdrawal holds, approval, submission, cancellation, recovery; (7) reconciliation, operator tools, load/security/recovery drills; (8) mainnet review and controlled launch.

Done means contracts are versioned; routes enforce customer auth or provider signatures; tenant isolation and limits are tested; mutations are idempotent; ledger invariants are database-enforced; all state, replay, recovery, and reconciliation tests pass; audits and observability operate; secrets are rotatable/server-only; testnet completes sustained reconciliation; runbooks and rollback drills are approved; and unsupported activity is never shown as available.

## Mainnet launch gates

- Provider legal, custody, product, account, asset, network, region, and volume eligibility confirmed.
- No personal Coinbase retail API key.
- Security review and threat-model actions complete.
- Least privilege, key rotation, incident response, and break-glass controls approved.
- Ledger, reconciliation, restore, reorganization, outage, and rollback drills pass.
- Compliance, sanctions, destination, approval, limits, and support procedures approved.
- Testnet reliability/reconciliation targets met for the agreed period.
- Monitoring, paging, audit retention, capacity, and provider escalation live.
- Production endpoints return verified 2xx before webhooks are configured.
- Financial mutations gated until final operational approval.
