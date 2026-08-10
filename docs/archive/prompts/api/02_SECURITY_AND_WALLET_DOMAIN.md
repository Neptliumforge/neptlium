# 02_SECURITY_AND_WALLET_DOMAIN.md

# NEPTLIUM API FOUNDATION
## Security & Wallet Domain
### Version 1.0

---

# PURPOSE

This specification defines the secure ownership model of the Neptlium API.

It establishes authentication, authorization, wallet architecture, ledger boundaries, deposits, withdrawals, transaction history, and state machines.

No provider-specific implementation belongs here.

All provider interaction is defined in Specification 03.

---

# SECURITY PHILOSOPHY

Every asset belongs to an authenticated owner.

Every request must prove identity.

Every state transition must be auditable.

Every financial event must be deterministic.

Nothing is trusted simply because it came from the client.

---

# AUTHENTICATION

Authentication is performed using Supabase access tokens.

The API reads:

Authorization

Bearer <access_token>

No cookies are required.

No session identifiers supplied by clients are trusted.

---

# AUTHENTICATION REQUIREMENTS

Every authenticated endpoint must:

Validate bearer token

Validate expiration

Validate signature

Load authenticated user

Reject invalid sessions

Reject expired sessions

Reject revoked sessions

Never trust user IDs from request payloads.

Identity is derived only from the validated session.

---

# AUTHORIZATION

Authorization occurs after authentication.

Every resource is ownership-scoped.

Examples:

wallet

deposits

withdrawals

transactions

ledger views

audit views

Users may only access resources they own.

---

# ADMIN AUTHORIZATION

Administrative privileges must never be asserted by:

request body

headers

query parameters

cookies

Role determination must come from trusted server-side identity.

---

# REQUEST CONTEXT

Create a reusable authenticated request context containing:

request ID

authenticated user

roles

permissions

environment

request timestamp

No downstream service should parse bearer tokens again.

---

# WALLET DOMAIN

The wallet is a domain service.

It does not directly communicate with providers.

It communicates through provider interfaces.

Responsibilities:

wallet ownership

deposit address lifecycle

withdrawal lifecycle

transaction history

asset policy

network policy

ledger coordination

---

# SUPPORTED ASSETS

Only:

USDC on Base

ETH on Base

BTC on Bitcoin

Everything else returns:

unsupported_asset

or

unsupported_network

---

# NETWORK POLICY

Network selection is explicit.

Never infer.

Never substitute.

Never silently reroute.

---

# WALLET ACCOUNT MODEL

Each authenticated user owns one or more wallet accounts.

Wallet accounts own:

addresses

deposits

withdrawals

transactions

ledger references

---

# DEPOSIT ADDRESSS

Deposit addresses belong to:

user

asset

network

provider

Address ownership is immutable.

No address may ever be exposed to another user.

---

# DEPOSIT ADDRESS ENDPOINT

POST

/v1/wallet/deposit-addresses

Responsibilities:

authentication

authorization

validation

ownership

asset policy

network policy

provider abstraction

idempotency

No fake address may ever be returned.

Without provider configuration:

Return:

provider_not_configured

---

# DEPOSIT HISTORY

GET

/v1/wallet/deposits

Returns only authenticated user's deposits.

Support:

pagination

filtering

asset

network

status

date range

No fabricated deposits.

---

# WITHDRAWAL CREATION

POST

/v1/wallet/withdrawals

Responsibilities:

authentication

authorization

ownership

asset validation

network validation

destination validation

amount validation

precision validation

policy validation

ledger coordination

idempotency

audit event

No automatic submission.

---

# WITHDRAWAL LOOKUP

GET

/v1/wallet/withdrawals/{withdrawal_id}

Only owner may retrieve.

Never leak another user's withdrawal.

---

# WITHDRAWAL CANCELLATION

POST

/v1/wallet/withdrawals/{withdrawal_id}/cancel

Allowed only before irreversible provider submission.

Illegal transitions must fail.

---

# TRANSACTION HISTORY

GET

/v1/wallet/transactions

Support:

cursor pagination

asset filter

network filter

type filter

status filter

date filter

Ordering must be deterministic.

---

# DESTINATION VALIDATION

Destination validation belongs to the wallet domain.

Responsibilities:

address format

supported network

supported asset

length

encoding

future provider validation hook

Validation never performs blockchain submission.

---

# IDENTITY OWNERSHIP

No endpoint accepts:

user_id

owner_id

profile_id

wallet_id

as trusted ownership identifiers.

Ownership always comes from authenticated identity.

---

# LEDGER PRINCIPLE

Balances are derived.

Balances are never authoritative mutable fields.

Ledger entries are append-only.

History is immutable.

Corrections create compensating entries.

Nothing is deleted.

---

# DEPOSIT STATES

detected

confirming

confirmed

credited

reorged

failed

ignored

Only legal transitions are permitted.

---

# WITHDRAWAL STATES

requested

validating

held

approved

signing

submitted

confirming

settled

cancelled

failed

reversed

Transitions must be deterministic.

---

# ILLEGAL TRANSITIONS

Examples:

submitted → requested

settled → approved

failed → submitted

cancelled → submitted

must always fail.

---

# LEDGER RULES

Every transition produces:

audit event

ledger event

timestamp

actor

request ID

No silent mutation.

---

# SECURITY HOLDS

Withdrawal creation may enter:

held

before provider submission.

The API must support future policy engines.

No automatic approval.

---

# AVAILABLE POSITION

Withdrawal eligibility must depend on:

available position abstraction

not mutable balance fields.

Implementation remains provider-independent.

---

# AUDIT EVENTS

Every mutation records:

request ID

actor

operation

resource

previous state

new state

timestamp

No mutation without audit.

---

# ERROR CONTRACTS

Possible wallet errors:

unsupported_asset

unsupported_network

invalid_destination

insufficient_position

provider_not_configured

withdrawal_not_found

deposit_not_found

permission_denied

invalid_state_transition

idempotency_conflict

---

# TEST REQUIREMENTS

Tests must cover:

authentication rejection

authorization

ownership

deposit validation

withdrawal validation

illegal transitions

supported assets

unsupported assets

supported networks

unsupported networks

pagination

state transitions

audit generation

provider disabled behaviour

---

# DOCUMENTATION

Update:

Wallet documentation

Security documentation

API reference

README

Architecture documentation

Only document implemented behaviour.

---

# ACCEPTANCE CRITERIA

✓ Authentication boundary implemented

✓ Authorization boundary implemented

✓ Wallet domain created

✓ Deposit architecture implemented

✓ Withdrawal architecture implemented

✓ Transaction history implemented

✓ Ownership enforced

✓ Ledger boundaries established

✓ State machines implemented

✓ Audit events generated

✓ Tests passing

✓ Documentation updated

No provider integration is implemented in this phase.

Provider communication begins in Specification 03.

End of Specification 02.
