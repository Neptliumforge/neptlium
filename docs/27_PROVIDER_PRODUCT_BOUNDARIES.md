# Provider Product Boundaries

Neptlium is one platform with specialized surfaces. Provider architecture remains below product boundaries.

## Capital

Capital consumes normalized balances, funding capabilities, transaction lifecycle and reconciled financial history from Neptlium APIs. It does not call Circle, Alchemy or Stripe to establish financial truth.

## Treasury

Treasury creates organization-scoped financial intents, policies and approvals through Neptlium domain APIs. Provider orchestration remains server-side and capability-driven.

## Pay

Pay is the money-movement experience/infrastructure layer, not the canonical ledger. Pay creates and presents governed payment/transfer intents; Platform Core and provider orchestration perform authoritative lifecycle work.

## Forge

Forge exposes stable Neptlium developer contracts, API keys, sandbox behavior, events/webhooks and observability. It must not expose provider secrets or require developers to model Neptlium as Circle/Alchemy/Stripe wrappers.

## Admin

Admin observes and operates governed workflows, provider health, capability state, risk/approval queues and reconciliation exceptions. UI access does not create financial authority; consequential admin actions require explicit server-side authorization and audit.

## API / Platform Core

API/Platform Core owns provider adapters and the control plane: verified principal resolution, ownership, authorization, policy, intents, provider orchestration, ledger, reconciliation, audit and normalized capability state.

## Web / Docs / Status

Public surfaces may describe capabilities only when their live status is supported by current production evidence. Configured, planned or source-supported capabilities must not be marketed as live.
