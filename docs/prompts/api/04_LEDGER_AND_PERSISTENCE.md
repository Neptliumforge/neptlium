# NEPTLIUM API FOUNDATION
## Ledger, Persistence & Transaction Domain
### Version 1.0

---

# PURPOSE

This specification defines the canonical financial record system for Neptlium.

The ledger is the source of financial truth.

Wallet balances, portfolio values, available positions, transaction history, and capital allocation are all derived from immutable ledger events rather than mutable balance fields.

No external provider becomes the system of record.

---

# LEDGER PHILOSOPHY

Neptlium uses an append-only accounting model.

History is never rewritten.

Corrections create compensating entries.

Balances are always derived.

No endpoint may directly overwrite account balances.

---

# CORE PRINCIPLES

The ledger must guarantee:

- immutability
- traceability
- deterministic reconstruction
- auditability
- replay safety
- idempotency
- reconciliation compatibility

---

# SOURCE OF TRUTH

The ledger is authoritative for:

- wallet balances
- available balances
- reserved balances
- transaction history
- portfolio positions
- capital allocation inputs
- reconciliation

Provider balances are informational only.

---

# LEDGER MODEL

Implement a double-entry ledger.

Each financial event creates balanced postings.

Every debit has a corresponding credit.

No transaction may leave the ledger unbalanced.

---

# CORE STRUCTURES

Suggested persistence:

ledger_accounts

ledger_entries

ledger_postings

wallet_accounts

wallet_addresses

wallet_deposits

wallet_withdrawals

provider_webhook_events

api_idempotency_keys

api_audit_events

reconciliation_runs

reconciliation_items

Adapt names to the existing repository where appropriate.

---

# LEDGER ACCOUNTS

Examples include:

User Asset

Platform Custody

Pending Deposits

Pending Withdrawals

Settlement

Fees

Adjustments

Reserve

Suspense

Each account has:

UUID

asset

network

type

status

timestamps

---

# LEDGER ENTRIES

Entries describe business events.

Examples:

Deposit Confirmed

Withdrawal Requested

Withdrawal Cancelled

Fee Charged

Adjustment

Correction

Reorganization

Each entry contains:

entry ID

event type

timestamp

reference

actor

request ID

---

# LEDGER POSTINGS

Postings implement accounting movement.

Each posting records:

ledger account

debit

credit

asset

network

amount

entry ID

No posting exists without an entry.

---

# BALANCE CALCULATION

Balances are derived by summing postings.

Never store mutable balances as authoritative values.

Available balance is calculated using:

Confirmed credits

minus

Reserved funds

minus

Completed debits

Pending transactions are excluded according to policy.

---

# WALLET ACCOUNTS

Wallet accounts represent ownership.

Each wallet belongs to exactly one authenticated user.

Ownership is never inferred from request payloads.

---

# WALLET ADDRESSES

Wallet addresses include:

provider

asset

network

address

status

owner

created timestamp

Provider mapping

Addresses are provisioned only through provider adapters.

---

# DEPOSIT MODEL

Deposits reference:

wallet

address

asset

network

provider transaction

confirmation count

ledger entry

status

request metadata

---

# DEPOSIT STATES

Detected

Confirming

Confirmed

Credited

Reorged

Failed

Ignored

Transitions are validated.

Invalid transitions fail.

---

# WITHDRAWAL MODEL

Withdrawals include:

owner

destination

asset

network

amount

provider reference

approval state

ledger reference

audit reference

---

# WITHDRAWAL STATES

Requested

Validating

Held

Approved

Signing

Submitted

Confirming

Settled

Cancelled

Failed

Reversed

Transitions are enforced.

---

# LEGAL STATE TRANSITIONS

Examples:

Requested

↓

Validating

↓

Held

↓

Approved

↓

Signing

↓

Submitted

↓

Confirming

↓

Settled

Cancellation is allowed only before irreversible submission.

---

# IMPOSSIBLE TRANSITIONS

Examples:

Settled

↓

Requested

Rejected.

Failed

↓

Submitted

Rejected.

Cancelled

↓

Signing

Rejected.

All invalid transitions produce structured errors.

---

# IDENTITY OWNERSHIP

Every financial record belongs to an authenticated owner.

Ownership is derived from Supabase authentication.

Never trust:

user_id

profile_id

wallet_id

supplied by clients.

---

# IDEMPOTENCY

Mutation routes require:

Idempotency-Key

Persist:

request digest

response

timestamp

authenticated owner

operation

Replay identical requests safely.

Reject conflicting payloads.

---

# PERSISTENCE RULES

All privileged writes occur through server-side services.

Browser clients never mutate ledger tables directly.

Service-role access remains server-only.

---

# DATABASE CONSTRAINTS

Implement:

UUID primary keys

foreign keys

timestamps

indexes

unique provider identifiers

unique idempotency scopes

check constraints

append-only protections

---

# APPEND-ONLY GUARANTEE

Historical ledger rows are never updated to change accounting meaning.

Corrections create additional entries.

Deletes are prohibited.

---

# DEPOSIT FLOW

Deposit lifecycle:

Blockchain observation

↓

Verification

↓

Confirmation tracking

↓

Policy validation

↓

Ledger entry

↓

Balance derivation

No fake deposits.

---

# WITHDRAWAL FLOW

Withdrawal lifecycle:

Validation

↓

Policy review

↓

Approval

↓

Provider submission

↓

Confirmation

↓

Settlement

↓

Ledger posting

Mainnet submission remains disabled.

---

# TRANSACTION HISTORY

Transaction history is derived from ledger events.

Never fabricate transaction records.

Support:

cursor pagination

asset filter

network filter

status filter

date ordering

---

# RECONSTRUCTION

A fresh database instance must reconstruct balances entirely from ledger postings.

No mutable balance snapshots are required.

---

# AUDIT EVENTS

Every state transition records:

request ID

actor

resource

old state

new state

timestamp

operation

---

# RECONCILIATION

Ledger reconciliation compares:

provider transactions

wallet transactions

ledger postings

domain events

Differences are classified rather than automatically corrected.

---

# PERFORMANCE

Indexes should support:

wallet lookups

transaction history

withdrawal retrieval

deposit retrieval

provider references

ledger reconstruction

---

# MIGRATIONS

Create forward-only migrations.

Never modify historical migrations.

Never delete existing containment migrations.

---

# TEST REQUIREMENTS

Cover:

ledger balancing

append-only protection

deposit transitions

withdrawal transitions

idempotency replay

ownership enforcement

balance derivation

invalid transitions

pagination

database constraints

ledger reconstruction

---

# DOCUMENTATION

Update:

README

Architecture

Supabase

Deployment

API documentation

Migration documentation

Document only implemented behaviour.

---

# ACCEPTANCE CRITERIA

✓ Double-entry ledger implemented

✓ Immutable ledger architecture

✓ Append-only persistence

✓ Wallet ownership enforced

✓ Deposit state machine

✓ Withdrawal state machine

✓ Idempotency persistence

✓ Transaction history derived

✓ Balance derivation implemented

✓ Audit events generated

✓ Reconciliation supported

✓ Tests passing

The ledger becomes the canonical financial record for every Neptlium operation.

End of Specification 04.
