# Neptlium Provider Doctrine

## Purpose

This document freezes the platform-wide responsibility model for Circle, Alchemy and Stripe. It complements `docs/10_PROVIDER_ARCHITECTURE.md` and applies to Capital, Treasury, Pay, App, Admin, API and Forge.

## Platform invariant

Neptlium Platform Core owns identity resolution, ownership, authorization, policy, risk, approvals, transaction intents, reservations, canonical ledger, lifecycle, audit, reconciliation and product-facing financial truth.

External providers supply capabilities and evidence. They do not own Neptlium domain truth.

## Circle

**Role:** digital-dollar, stablecoin, wallet and settlement infrastructure.

Circle may provide explicitly certified wallet/address infrastructure, supported stablecoin capabilities, provider-side transfer/settlement rails, provider transaction lookup and signed event evidence.

Circle does not own Neptlium balances, authorization, approval policy, canonical ledger or reconciliation. Circle execution must remain separately gated from Circle configuration and capability verification.

## Alchemy

**Role:** multi-chain blockchain connectivity, observation and intelligence infrastructure.

Alchemy may provide independently certified per-chain RPC, activity, receipts, confirmations, webhooks, simulation and other reviewed chain intelligence. The architecture target is a canonical Neptlium chain registry rather than product code coupled to a single RPC/network.

Alchemy does not authorize financial movement, sign on behalf of users merely because a network is configured, determine canonical balances, or convert chain observations directly into ledger truth.

## Stripe

**Role:** fiat, card, bank-payment and billing infrastructure.

Stripe may provide explicitly certified payment collection, Checkout, supported card/bank rails, billing, refunds and signed payment-event evidence.

Stripe does not own Neptlium account models, business transaction semantics, canonical balances, authorization or reconciliation. Current subscription webhook support must not be represented as certified capital funding.

## Orchestration

All privileged provider operations originate behind `apps/api`. Browser surfaces consume Neptlium commands and projections. Provider-native SDK objects and secrets must not become product contracts.

The required conceptual lifecycle is:

`request -> authenticate -> resolve principal/owner -> authorize -> policy/risk/approval -> create durable intent -> reserve if applicable -> select certified capability -> submit provider operation -> durably ingest evidence -> determine settlement -> reconcile -> post canonical financial state -> publish audited projection/events`

Each transition must preserve idempotency, correlation, timestamps and provider references sufficient for audit and ambiguous-timeout recovery.

## Multi-chain doctrine

Alchemy support is platform-wide and multi-chain by architecture, but network activation is granular. A canonical chain registry must identify chain/network, environment, RPC/observer configuration, finality/confirmation policy, supported assets and enabled operations.

A chain can be observable while deposits, withdrawals, signing or settlement remain disabled. Circle settlement support and Alchemy observation support are independent facts. Product capability exists only when the complete Neptlium capability contract is certified.

## Capability states

The platform must preserve at least these distinctions:

- configured;
- connectivity verified;
- capability certified;
- eligible for the principal/organization;
- authorized for the specific intent;
- submitted;
- observed/confirmed;
- settled;
- reconciled.

No earlier state implies a later state.

## Security doctrine

Provider credentials, webhook signing secrets, Circle entity secrets, private/signing material and Supabase service-role credentials are server-only. No browser-visible environment variable may contain privileged provider authority.

Webhook ingress must verify official signatures, reject replay/invalid evidence, preserve a durable inbox where applicable and process idempotently. Provider errors must be normalized without exposing secrets.

## Engineering migration

**CURRENT:** Circle, Alchemy and Stripe exist at different depths; Alchemy production runtime still contains a Base-specific single-RPC constraint; Stripe funding is not established by subscription webhook support.

**TRANSITION:** replace single-network Alchemy assumptions with a typed chain registry/per-network configuration; align provider boundaries and capability registry; retain all existing execution gates; certify provider webhooks, observation, health, idempotency and reconciliation independently.

**TARGET:** Circle is Neptlium's stablecoin/digital-money settlement adapter, Alchemy its multi-chain observation/intelligence adapter, Stripe its fiat/payment adapter, and Platform Core remains the sole financial authority.

## Non-goals

This doctrine does not itself enable mainnet, deposits, withdrawals, wallet provisioning, fiat funding, conversion, signing, provider execution or production database mutation. Those remain separately reviewed capabilities and operational actions.
