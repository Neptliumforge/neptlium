# Execution

Execution is an API-owned financial domain beneath Neptlium identity, authorization, policy, reservation, reconciliation, and canonical financial truth.

## CURRENT

The repository contains provider-neutral execution-domain types and fail-closed capability semantics under `apps/api/src/execution`. No execution provider is integrated. No provider client, network transport, credential, signer, router, persistence schema, order submission, cancellation, modification, testnet execution, or production execution is implemented by this foundation.

The authority sequence is:

`Neptlium principal → authorization / eligibility → risk / policy → execution intent → reservation → future execution adapter → provider evidence → normalization → reconciliation → canonical financial core → customer projection`.

An `ExecutionIntent` is an immutable command concept, not proof of authorization beyond its referenced upstream authority and not proof of execution. Provider orders, fills, positions, account collateral, stream events, and other provider observations remain provider evidence.

## Financial truth boundary

- Provider account balance or collateral is not Neptlium Capital balance.
- Provider position observation is not canonical portfolio ownership.
- Provider fill observation is not a reconciled ledger posting.
- Provider `FILLED` means the provider order lifecycle is terminal; it does not mean Neptlium reconciliation is complete.
- Provider stream events are evidence, not ledger events.
- Provider identity or configuration does not confer execution capability.

The canonical ledger and existing reconciliation doctrine remain unchanged.

## Lifecycle and ambiguity

The normalized order lifecycle can represent open, partially filled, filled, cancelled, rejected, expired, provider unavailable, not submitted, submission unknown, unknown, and discrepancy states.

`SUBMISSION_UNKNOWN` is reserved for ambiguous outcomes such as a timeout or connection loss after a request may have reached a provider. It is not failure, rejection, or proof that nothing was submitted. Automatic retry is prohibited; provider lookup and reconciliation are required before a later execution decision.

Unknown provider lifecycle values remain `UNKNOWN`; the foundation does not silently translate them into progress, completion, or failure.

## Capabilities and environments

Execution environment is explicit as `TEST` or `LIVE`. Capabilities are scoped by provider, environment, operation, and optional product scope. Read capability does not imply submit/cancel/modify capability, and test capability does not imply live capability.

The current foundation mode is `DOMAIN_ONLY`. Every capability returned by the foundation is unavailable and uncertified. No environment variable can activate execution through this domain.

## TARGET

Future providers may implement these contracts beneath Neptlium after separate review. Provider adapters must preserve provider-native evidence and reason codes, remain replaceable, and cannot become alternate financial truth or account systems. Durable evidence ingestion, execution routing, reservations, signing custody, provider clients, reconciliation expansion, testnet certification, and production certification are separate future scopes.
