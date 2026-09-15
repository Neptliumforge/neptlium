# Provider Reconciliation Doctrine

## Principle

Provider evidence becomes Neptlium financial truth only through governed reconciliation. Circle, Alchemy and Stripe are evidence sources, not canonical accounting authorities.

## Evidence classes

- Circle may supply wallet, transfer and settlement-provider evidence.
- Alchemy may supply blockchain transaction, receipt, confirmation and activity evidence.
- Stripe may supply payment, refund, dispute and billing-provider evidence.

Evidence must retain provider identity, stable provider reference, observation timestamp and relevant network/rail metadata. Evidence begins non-canonical and unreconciled.

## Settlement determination

Settlement is determined according to the Neptlium contract for the exact operation. Chain confirmation count alone, a provider `success` field, HTTP 2xx response or webhook receipt does not universally establish settlement.

## Reconciliation

Reconciliation correlates durable Neptlium intent/state, provider evidence and the applicable settlement policy. Only the governed ledger/reconciliation boundary may produce canonical financial posting or a reconciled projection.

## Ambiguous submission

A provider timeout after a potentially successful submission is `ambiguous`, not automatically failed. Recovery must perform controlled lookup using Neptlium idempotency/provider references before deciding whether retry is safe.

## Corrections

Never rewrite settled/reconciled financial history destructively. Corrections use governed reversals or compensating entries with auditable linkage.
