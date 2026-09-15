# Provider Security and Reconciliation

## Security boundary

Financial providers are accessed through trusted server-side Neptlium runtime boundaries. Provider secret keys, entity secrets, webhook signing keys, service credentials and privileged SDKs must never enter customer browser bundles.

Provider credentials authenticate Neptlium to infrastructure. They do not authorize a user transaction.

## Intent-first execution

Every consequential external operation must be attributable to a persisted Neptlium intent before provider submission. The intent records the principal/organization, operation, source scope, destination/counterparty where applicable, exact money/asset identity, network/rail, policy/approval state and stable idempotency identity.

No adapter may manufacture financial authority from provider configuration.

## Webhook/event ingress

Provider events are untrusted until authenticated.

Ingress must:

- verify official signature/authentication mechanisms;
- reject invalid signatures;
- deduplicate by stable provider event identity;
- preserve receipt time and provider timestamps;
- durably retain safe normalized evidence needed for replay/reconciliation;
- avoid performing irreversible work merely because an event arrived;
- tolerate out-of-order and repeated delivery;
- avoid logging secrets or unnecessary sensitive payloads.

## Idempotency

Retries must be safe. Stable Neptlium operation identity should map deterministically to provider idempotency controls where available.

A timeout after submission is ambiguous until lookup proves whether the provider accepted the operation. Do not blindly resubmit a money-moving request after an ambiguous timeout.

## Settlement and reconciliation

Provider lifecycle states are evidence. Neptlium defines canonical settlement and reconciliation rules per operation/rail/network.

Reconciliation must be able to distinguish at least:

- intent created;
- authorized;
- provider submission attempted;
- provider accepted/rejected/unknown;
- observed externally;
- confirmed/processed;
- settled under Neptlium policy;
- canonical posting complete;
- reconciled;
- exception/manual review.

Where Circle and Alchemy both observe one on-chain lifecycle, their evidence is correlated rather than allowed to independently mutate available balance.

Where Stripe reports payment/refund/dispute lifecycle, canonical accounting follows the reviewed Neptlium posting/reconciliation contract rather than raw webhook status.

## Failure posture

Unknown state fails closed for new consequential action but remains recoverable through lookup/reconciliation. Provider degradation must not silently switch to another execution provider unless the intent and policy explicitly support safe failover semantics.

## Operational controls

Production execution capabilities require:

- operation-level enable/disable control;
- provider/network/rail health visibility;
- structured audit trail;
- reconciliation exception visibility;
- rate/amount controls where applicable;
- deterministic incident disable path;
- no dependency on browser state for authoritative completion.
