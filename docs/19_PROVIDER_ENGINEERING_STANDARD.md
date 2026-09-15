# Provider Engineering Standard

## Design objective

Provider integrations must remain replaceable, observable, auditable and subordinate to Neptlium domain authority. The standard applies to Circle, Alchemy, Stripe and any future provider admitted through architecture review.

## Ports and adapters

Domain/application code depends on Neptlium ports and types. Provider-specific SDK objects terminate inside adapter modules. Adapters normalize requests, responses, errors, references, timestamps and evidence into stable Neptlium contracts.

## Commands versus evidence

Execution adapters accept already-authorized Neptlium commands; they do not decide authorization. Observation/webhook adapters produce provider evidence; they do not post canonical balances by themselves.

## Idempotency and ambiguous outcomes

Every externally mutating operation must have a Neptlium idempotency identity and use provider idempotency where supported. A timeout after submission is an ambiguous state, not a failed transaction. Recovery must query by stable provider/idempotency reference before any retry that could duplicate economic effect.

## Webhooks and event ingress

Verify the provider's official signature contract before accepting evidence. Reject malformed, unverifiable or replayed input. Preserve a durable inbox/event identity where applicable. Processing must be idempotent and separately auditable from receipt.

## Capability certification

Capabilities are granular tuples of provider, environment, operation, asset/currency, network/rail and eligibility constraints. Certification records must never be inferred from provider marketing, SDK presence, environment-variable presence or successful unrelated operations.

## Chain architecture

Canonical chain IDs and metadata are Neptlium-owned. Alchemy endpoint configuration maps onto those identities. Product surfaces never construct provider RPC URLs or use provider network slugs as financial-domain identifiers.

## Financial lifecycle

Provider states must map into, not replace, Neptlium lifecycle states. Preserve requested/approved/submitted/observed/confirmed/settled/reconciled distinctions. Corrections to canonical financial history use governed reversals/compensating entries rather than destructive rewrites.

## Observability

Log safe correlation IDs, Neptlium intent IDs, provider references, operation, environment, network/rail, latency and normalized outcome. Never log provider secrets, authorization headers, signing material or sensitive raw payloads. Provider health is operational telemetry, not balance truth.

## Degradation

Fail closed when required provider capability/evidence is unavailable. Read-only observation degradation must not silently authorize alternate execution. Execution degradation must preserve durable intent state and prevent blind duplicate submission.

## Testing gates

Provider changes require proportionate coverage for configuration validation, domain boundary rules, capability selection, idempotency, signature verification, lifecycle mapping, ambiguous-timeout recovery and reconciliation behavior. Mainnet or live execution must not be used merely to make automated tests pass.
