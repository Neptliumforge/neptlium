# Stripe Payment Contract

Stripe is Neptlium's primary adapter for explicitly certified fiat/card/bank-payment and billing infrastructure.

## Current truth

Current source supports governed subscription-billing webhook ingress. That does not establish live customer capital funding or general fiat deposit capability.

## Target responsibilities

Where separately implemented and certified, Stripe may provide payment collection, Checkout, supported card/bank methods, billing/subscriptions, refunds/disputes and signed provider payment evidence.

## Authority boundary

Stripe does not own Neptlium account models, transaction semantics, authorization, available balance, canonical ledger or reconciliation. Stripe payment success remains provider evidence until the applicable settlement/reconciliation contract completes.

## Funding certification

Before fiat capital funding is enabled, the exact contract must cover eligibility, payment creation, idempotency, signed webhook ingress, asynchronous/failure states, refunds/disputes, settlement evidence, ledger posting and reconciliation. A Stripe secret key or webhook secret is configuration, not funding certification.
