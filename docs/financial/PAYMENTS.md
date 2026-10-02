# Payments

Payments are an API-owned financial domain beneath Neptlium identity, authorization, policy, risk, reconciliation, and canonical financial truth.

## CURRENT

The P0 foundation under `apps/api/src/payments` defines provider-neutral payment identity, bounded payment attempts, layered lifecycle semantics, provider-evidence envelopes, and fail-closed resubmission rules only.

It does not expose payment routes, integrate a payment provider, collect payment credentials, create provider payment objects, persist payment state, post ledger entries, reconcile payments, or move money.

A **Neptlium Payment** is the Neptlium-owned payment relationship and intent governed by Neptlium identity and authority. It is not a provider-native payment object.

A **PaymentIntent** describes the immutable economic instruction associated with that Neptlium Payment: principal/organization context, merchant context, exact-unit amount, purpose reference, and creation time.

A **PaymentAttempt** is one bounded provider submission context for a Payment. One Payment may have multiple attempts without changing Payment identity.

```text
Payment
  1
  └── N PaymentAttempt
```

Provider retries or future alternate routing create another attempt; they do not mutate provider identity into the Payment.

## Lifecycle and ambiguity

Payment, attempt, authorization, settlement, refund, and dispute state are modeled separately. Provider-native states may be normalized into these states in future adapters, but provider state never defines Neptlium state.

`NOT_SUBMITTED` is the only P0 attempt state that may permit consideration of another provider. P0 still performs no automatic retry.

`SUBMISSION_UNKNOWN` means a request may have reached a provider. It is not failure and not proof that nothing was submitted. Automatic retry and alternate-provider submission are prohibited; provider lookup and reconciliation are required before another submission decision.

`AUTHORIZED` and `CAPTURED` prohibit duplicate submission. Settlement pending/observed state never authorizes an alternate payment submission.

Unknown state remains `UNKNOWN`; it is not coerced to zero, success, or failure.

## Provider evidence boundary

Payment provider observations are evidence, not canonical payment or balance truth. The P0 evidence envelope preserves provider, environment, operation/source, provider reference, Neptlium Payment ID, PaymentAttempt ID, timestamps, provider-native state/reason, payload digest/reference, and schema version while explicitly remaining non-canonical.

The financial distinctions remain:

- authorization != capture;
- capture != settlement;
- settlement observation != reconciliation;
- provider payout != merchant canonical balance;
- provider balance != Neptlium balance;
- refund requested != refunded;
- dispute opened != final loss;
- checkout success != canonical settlement;
- UNKNOWN != ZERO.

Provider evidence can affect canonical financial state only through a separately reviewed governed financial workflow, ledger posting criteria where applicable, and reconciliation.

## Payment methods

A `PaymentMethodReference` is a reference to an eligible provider-backed payment method. It may carry a provider/token reference and safe display metadata.

It is not custody, unrestricted movement authority, a Capital balance, or a merchant balance. Raw PAN, CVC, bank-login credentials, wallet private keys, seed phrases, provider secret keys, and equivalent sensitive credentials do not belong in this domain model.

## Domain boundaries

`PaymentProvider` is not introduced by P0. No provider interface is required to establish the authority model, and P0 deliberately avoids a universal provider abstraction.

Payment providers remain distinct from CapitalProvider, execution providers, chain-observation providers, communication providers, and banking providers.

Stripe subscription/webhook ingress remains unchanged. Future Stripe Payments or Link support, if separately approved, must sit beneath this Payment Domain; Stripe Customer, Stripe PaymentIntent, and Link identity do not become Neptlium identity or canonical Payment authority.

The public Pay application remains a fail-closed presentation surface. A public token grants presentation context only; it grants no payment authorization, settlement authority, or financial truth.

Pay is transaction interaction. Capital is personal capital context. Treasury is organization financial management. The Financial Core retains canonical financial authority.

## Economics

Gross payment volume is not Neptlium revenue. Future processing margin, platform fees, subscriptions, orchestration, payout/settlement services, FX, billing, risk/intelligence, developer/API services, or Treasury integration require separate commercial, regulatory, contractual, and implementation review.

## TARGET

Future payment persistence, provider adapters, hosted Pay interaction, merchant APIs, reusable payment identity, Treasury settlement integration, additional rails, routing, and payment intelligence are separate phases.

P0 creates no environment variable, capability flag, provider client, SDK dependency, route, or runtime path capable of executing a payment.
