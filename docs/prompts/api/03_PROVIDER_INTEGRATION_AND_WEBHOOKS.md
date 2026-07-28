# NEPTLIUM API FOUNDATION
## Provider Integration & Webhook Architecture
### Version 1.0

---

# PURPOSE

This specification defines how the Neptlium API communicates with external blockchain infrastructure.

It establishes provider abstraction, webhook processing, reconciliation, confirmation tracking, and secure provider boundaries.

No provider may directly mutate wallet balances.

Every provider interaction must pass through the API domain.

---

# PROVIDER PHILOSOPHY

External providers are infrastructure.

They are not the system of record.

Neptlium remains the authoritative business system.

Providers only supply blockchain capabilities.

---

# INITIAL PROVIDERS

Primary custody provider:

Coinbase Developer Platform (CDP)

Primary blockchain infrastructure:

Alchemy

Additional providers may be introduced later without changing domain services.

---

# PROVIDER RESPONSIBILITIES

## Coinbase CDP

Responsible for:

- wallet provisioning
- deposit address creation
- transaction signing
- transaction submission
- custody interfaces
- wallet operations

Not responsible for:

- portfolio calculations
- ownership validation
- ledger balances
- allocation logic
- reporting

---

## Alchemy

Responsible for:

- blockchain observation
- address monitoring
- confirmation tracking
- webhook delivery
- blockchain metadata
- reconciliation support

Not responsible for:

- custody
- balances
- wallet ownership
- authorization
- accounting

---

# PROVIDER ABSTRACTION

All provider communication must occur through interfaces.

Example boundary:

Provider Interface

↓

Coinbase Adapter

↓

Alchemy Adapter

↓

Domain Services

↓

API Routes

Routes must never call SDKs directly.

---

# PROVIDER CONFIGURATION

Configuration is environment-driven.

Required variables include:

CDP_API_KEY_ID

CDP_API_KEY_SECRET

CDP_WALLET_SECRET

ALCHEMY_API_KEY

ALCHEMY_RPC_URL

ALCHEMY_WEBHOOK_SIGNING_KEY

Missing configuration must never prevent:

- installation
- build
- tests
- health endpoint

Provider routes must instead return:

provider_not_configured

---

# DISABLED PROVIDERS

When credentials are absent:

Wallet creation is unavailable.

Deposit address provisioning is unavailable.

Transaction submission is unavailable.

Webhook verification is unavailable.

Health endpoint remains operational.

No provider behaviour is simulated.

---

# WEBHOOK PHILOSOPHY

Every webhook is untrusted.

Verification occurs before processing.

Verification occurs before parsing.

Verification occurs before persistence.

No unverified webhook changes ledger state.

---

# WEBHOOK ENDPOINTS

POST

/v1/webhooks/alchemy

POST

/v1/webhooks/coinbase

Only POST is supported.

GET requests are rejected.

---

# RAW BODY

Webhook verification uses the raw request body.

Never verify against parsed JSON.

The original payload must remain available until verification completes.

---

# REQUEST SIZE

Webhook endpoints enforce request-size limits.

Oversized payloads are rejected.

---

# SIGNATURE VERIFICATION

Verification architecture must support:

timestamp

signature

payload digest

constant-time comparison

provider-specific verification

If provider documentation or credentials are unavailable:

Implement fail-closed verification boundaries.

Never invent signature algorithms.

---

# TIMESTAMP TOLERANCE

Reject stale webhook requests.

Reject requests outside acceptable tolerance.

Reject requests with missing timestamps.

---

# WEBHOOK EVENT ID

Each verified event must expose:

provider

provider_event_id

received_at

digest

processing_state

Provider event IDs must be unique.

---

# DUPLICATE EVENTS

If:

provider_event_id

and

payload digest

match an existing verified event

Return success without replaying side effects.

---

# REPLAY ATTACKS

If:

provider_event_id

matches

but payload digest differs

Treat as:

security_incident

No domain state changes occur.

---

# WEBHOOK STORAGE

Persist verified events before domain processing.

Suggested structures:

provider_webhook_events

provider_webhook_attempts

Persist:

provider

event ID

digest

headers

received timestamp

processing status

processing attempts

---

# PROCESSING STATES

received

verified

processing

processed

failed

dead_letter

Transitions must be deterministic.

---

# DOMAIN PROCESSING

Verified webhook events may trigger:

deposit observation

confirmation updates

withdrawal status updates

reconciliation events

No direct balance mutation.

Ledger updates occur through domain services only.

---

# CONFIRMATION TRACKING

Alchemy observations update confirmation progress.

Confirmation thresholds remain configurable.

Confirmed assets become eligible for ledger credit only after policy requirements.

---

# BLOCKCHAIN REORGANIZATION

Support:

reorg detection

confirmation reversal

compensating ledger entries

Audit every reorganization.

Never delete history.

---

# RECONCILIATION

Reconciliation compares:

provider state

ledger state

wallet state

transaction history

Observed mismatches are classified.

Nothing is silently corrected.

---

# RECONCILIATION CLASSIFICATIONS

Examples:

missing_provider_record

missing_internal_record

duplicate_provider_event

duplicate_internal_event

confirmation_mismatch

amount_mismatch

asset_mismatch

network_mismatch

pending_timeout

unknown_state

---

# PROVIDER FAILURES

Failures include:

network timeout

authentication failure

provider unavailable

rate limit

invalid signature

unsupported asset

configuration missing

Failures never create successful wallet operations.

---

# LOGGING

Never log:

provider secrets

wallet secrets

API secrets

raw signatures

private keys

Log:

request ID

provider

event ID

processing duration

safe error codes

processing outcome

---

# AUDIT EVENTS

Provider processing creates audit records containing:

provider

event ID

operation

resource

old state

new state

timestamp

actor (system)

---

# HEALTH ENDPOINT

GET

/v1/health

Must report:

API status

environment

provider readiness

without exposing secrets.

Example provider state:

configured

not_configured

degraded

disabled

---

# TEST REQUIREMENTS

Tests must cover:

missing credentials

provider disabled mode

signature failure

duplicate webhook

replay attack

raw body verification

timestamp validation

confirmation tracking

reconciliation classification

provider configuration parsing

health endpoint

---

# DOCUMENTATION

Update:

README

API documentation

Architecture documentation

Deployment documentation

Security documentation

Webhook setup documentation

Only document behaviour that actually exists.

---

# ACCEPTANCE CRITERIA

✓ Provider abstraction implemented

✓ Coinbase adapter boundary created

✓ Alchemy adapter boundary created

✓ Provider-disabled mode implemented

✓ Secure webhook architecture implemented

✓ Replay protection implemented

✓ Duplicate handling implemented

✓ Confirmation tracking implemented

✓ Reconciliation architecture implemented

✓ Audit logging implemented

✓ Health endpoint implemented

✓ Tests passing

Provider integrations remain testnet-first.

Mainnet activation requires separate production readiness review.

End of Specification 03.
