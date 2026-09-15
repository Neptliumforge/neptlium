# Provider Doctrine and Activation

## Purpose

This document defines how Neptlium activates and evolves its strategic provider set without surrendering financial authority or coupling products to provider-specific models.

Current strategic providers:

| Provider | Strategic role | Never owns |
| --- | --- | --- |
| Circle | Stablecoin, digital-money, wallet and settlement infrastructure | Canonical balance, authorization, ledger, reconciliation |
| Alchemy | Multi-chain RPC, blockchain observation, simulation and intelligence | Ownership, movement authorization, canonical balance, ledger |
| Stripe | Fiat, card, bank-payment and billing infrastructure | Neptlium account model, canonical balance, authorization, ledger |

Neptlium Platform Core owns principal identity resolution, ownership, authorization, policy, risk, approvals, transaction intents, canonical ledger, reconciliation, audit and final financial truth.

## Architectural law

Provider APIs produce **capabilities and evidence**. Neptlium produces **authorization and financial truth**.

No provider credential, dashboard toggle, successful API call, blockchain confirmation, provider balance, payment status or webhook event is sufficient by itself to create canonical available balance or authorize another financial action.

## Activation ladder

Provider activation is progressive and capability-specific.

1. **Declared** — provider role and adapter contract exist in architecture.
2. **Configured** — required server-side credentials/configuration are present and validated.
3. **Connected** — authenticated non-consequential connectivity succeeds.
4. **Observed** — read/webhook evidence can be verified, normalized and persisted safely.
5. **Certified** — tests prove idempotency, signatures, lifecycle, failure handling, policy and reconciliation contracts for a capability.
6. **Eligible** — principal/jurisdiction/asset/network/rail requirements permit use.
7. **Authorized** — Neptlium policy/risk/approval state permits a specific intent.
8. **Execution-enabled** — a narrowly scoped operation may submit to the provider.
9. **Settled** — external settlement evidence satisfies the operation's settlement policy.
10. **Reconciled** — canonical ledger and provider evidence agree under Neptlium reconciliation.

A later state must never be inferred merely from an earlier state.

## Circle activation

Activate Circle by capability, not globally.

Recommended progression:

- authenticated API connectivity;
- wallet/address lookup;
- signed webhook/event verification;
- wallet provisioning only after ownership/idempotency/recovery controls are certified;
- deposit observation and reconciliation;
- transfer submission only after authorization, limits, idempotency, failure recovery and reconciliation are certified;
- cross-chain/stablecoin capabilities only per reviewed asset/network pair.

Circle transaction identifiers must be stored as provider references attached to Neptlium-owned intents/events. Provider wallet balances remain observations.

## Alchemy activation

Alchemy is a platform-wide multi-chain infrastructure adapter. Network support belongs in a canonical Neptlium chain registry.

Each chain entry should define stable Neptlium network identity and independently describe:

- environment and chain ID;
- RPC capability;
- activity/receipt capability;
- webhook capability;
- simulation capability;
- smart-account capability where applicable;
- deposit observation eligibility;
- withdrawal/execution eligibility;
- confirmation/finality policy;
- operational status.

The current Base-specific production configuration is a transition state. Multi-chain implementation must replace the single-RPC assumption with reviewed per-network configuration/registry resolution while preserving fail-closed behavior.

Adding an Alchemy-supported chain must not automatically expose deposits, withdrawals or contract execution. Observation and execution are separate capabilities.

## Stripe activation

Activate Stripe by payment capability.

Recommended progression:

- authenticated server-side connectivity;
- signed webhook ingress;
- billing/subscription lifecycle already supported by the reviewed contract;
- payment/funding intent creation only after a dedicated funding contract exists;
- payment success/failure/refund/dispute normalization;
- governed ledger posting;
- reconciliation;
- only then customer-facing live funding for eligible principals.

Stripe publishable credentials may exist in browser contexts only when an implemented Stripe client flow requires them. Secret keys and webhook secrets remain server-only.

## Shared engineering requirements

Every consequential provider operation must originate from a Neptlium-owned intent with a stable identifier. Provider idempotency keys, when supported, derive from stable Neptlium operation identity rather than random retry-time values.

Provider ingress must authenticate official signatures where available, tolerate duplicate delivery, preserve provider event identity, persist enough evidence for replay/reconciliation, and reject malformed or untrusted events.

Ambiguous provider timeouts must be resolved through lookup/recovery before retrying an operation that could duplicate money movement.

Provider errors are normalized into Neptlium domain errors. Raw secrets, privileged payloads and unnecessary PII must not be logged.

## Multi-provider reconciliation

One lifecycle may involve more than one provider. Example: Circle can provide wallet/transfer state while Alchemy independently observes chain settlement. These are separate evidence sources.

Neptlium reconciliation correlates them to one canonical intent and determines whether settlement policy is satisfied. Conflicting evidence must produce a review/degraded state rather than silently selecting whichever provider reported last.

## Environment and secret doctrine

Production provider secrets live only in approved server-side secret stores/runtime environments. Preview/test environments use separate non-production credentials wherever providers support them.

Environment variables must express configuration, never financial authority. Feature/capability flags must remain explicit and fail closed. Production deployment after secret changes is required before the new runtime can consume them.

No secret values belong in Git, documentation, browser bundles, screenshots, logs or support messages.

## Required implementation work

The provider doctrine is canonical immediately, but implementation changes must remain dependency-aware and reviewed.

Near-term engineering work:

1. reconcile the open Platform Core/Treasury dependency stack before provider execution work;
2. remove active Zengo-specific assumptions from the strategic provider foundation unless explicitly retained later as a separately reviewed external signer integration;
3. replace Base-only Alchemy production configuration with a canonical multi-chain registry and per-network runtime configuration;
4. preserve read-only Alchemy activation independently from chain execution;
5. formalize Circle capability states for observation, provisioning and transfer submission;
6. formalize Stripe billing versus capital-funding capabilities so credentials cannot imply funding availability;
7. implement shared provider health/capability reporting without leaking provider internals into product domain state;
8. certify webhook ingress, idempotency, ambiguous-timeout recovery and reconciliation before enabling consequential operations;
9. update product surfaces to consume normalized Neptlium capability contracts only;
10. keep README, AGENTS.md and numbered architecture documentation aligned whenever implementation materially changes this doctrine.

## Production gate

No production money movement is considered enabled by this document alone.

A capability may become execution-enabled only when its implementation, configuration, authorization, policy/risk, idempotency, provider contract, observability, settlement definition, reconciliation path, operational controls and rollback/disable mechanism have all been validated.

Validation truth remains `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`.
