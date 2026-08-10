# Ledger and Reconciliation

The Neptlium ledger is canonical financial truth only when entries are validly created through reviewed workflows. Provider systems supply evidence; they do not replace the ledger.

## CURRENT migration evidence

The API foundation migration defines a private double-entry model:

- `ledger_accounts` scopes user and platform accounts by account type, asset, and network. Types include user asset, platform custody, pending deposit, pending withdrawal, settlement, fees, adjustment, reserve, and suspense.
- `ledger_entries` records event/reference identity, actor, request ID, and creation time. A uniqueness constraint prevents duplicate event posting for the same reference.
- `ledger_postings` records positive integer debit/credit amounts against ledger accounts with asset/network constraints.
- Deferred constraint triggers require every entry to have postings and require debits and credits to balance by asset and network at transaction commit.
- Update/delete triggers make entries and postings append-only. Audit events and withdrawal approvals have similar append-only enforcement.

The same migration defines `wallet_deposits` and `wallet_withdrawals` with explicit state machines, provider references, ledger-entry linkage, and supported asset/network checks. Later Circle groundwork adds provider observation timestamps and reconciliation state.

### Idempotency and webhook evidence

- `api_idempotency_keys` keys an owner, operation, and idempotency key to a request digest and saved response.
- Wallet/provider mutations require idempotency keys at the API boundary.
- `provider_webhook_events` deduplicates `(provider, provider_event_id)`, records a payload digest, safe headers, processing state, and timestamps.
- A repeated event ID with a different digest is a replay/conflict, not a retry.
- Alchemy and Coinbase webhook route groundwork exists but fails closed unless an injected verifier succeeds. Circle webhook verification is explicitly disabled.

### Reconciliation evidence

- `reconciliation_runs` records provider, state, and run timestamps.
- `reconciliation_items` records mismatch classification, resource, details, resolution state, resolver, time, and note.
- Code classifies missing provider/internal records, duplicates, confirmation/amount/asset/network mismatches, pending timeouts, and unknown states.
- Worker contracts include `webhook.process`, `reconciliation.run`, and `ledger.settle`; the in-memory job store is test/local only.

The Supabase durable repository currently supports readiness, account provisioning, Circle wallet linkage, and audit writes. Durable deposit, withdrawal, transaction, webhook-inbox, and related atomic operations still throw a safe unavailable error. Migration presence does not mean those paths are wired.

## Canonical posting principles

- All postings use atomic database transactions and exact integer minor/base units.
- An entry is balanced per asset and network; cross-asset value exchange requires explicit linked legs, prices, fees, and settlement evidence.
- Entries and postings are immutable after commit.
- Corrections use a linked reversal or compensating entry; no financial history is updated or deleted.
- Every entry carries an idempotent business reference, actor/system attribution, request ID, and audit evidence.
- Read balances are derived from posted entries, not mutable cached totals. Projections may be rebuilt and reconciled.

## Provider evidence versus canonical truth

Provider balances, addresses, transactions, confirmations, and webhooks are timestamped observations. They may be stale, duplicated, delayed, reorged, incomplete, or inconsistent. An observation becomes relevant canonical state only after verification, idempotent normalization, policy checks, balanced posting, and reconciliation.

Mismatch handling is explicit: preserve both sources, classify the discrepancy, restrict affected capital if required, investigate, and resolve through additional evidence or compensating entries. Never edit the ledger to match a provider dashboard.

## TARGET reservations

Reservations are durable holds against canonical available capital for authorized withdrawals, transfers, allocations, fees, or settlement obligations.

- Creation atomically checks available capital and prevents double spend.
- Each reservation links to one immutable intent and policy/approval version.
- States include active, consumed, released, expired, and reversed with strict transitions.
- Submission consumes or maintains the reservation according to workflow; failure releases it exactly once when safe.
- Reserved amounts are excluded from available balance and included in Treasury views.

## Reconciliation lifecycle

1. Ingest verified, deduplicated provider evidence or poll through a reviewed adapter.
2. Normalize provider records to Neptlium domain types without discarding the raw evidence digest/reference.
3. Match by stable provider and internal references.
4. Compare amount, asset, network, state, confirmations, fees, and timestamps.
5. Post only when canonical criteria are satisfied.
6. Record mismatch items and restrict/alert according to policy.
7. Resolve with actor, evidence, note, and compensating action where necessary.
8. Complete a run only when its scope and unresolved exceptions are explicit.

## Invariants

- Database status changes do not prove external execution or settlement.
- Provider observation does not become available balance by display convention.
- Failed/unknown submissions are reconciled before retry.
- No operation bypasses idempotency, ownership, balanced posting, audit, or reconciliation.
