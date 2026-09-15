# Provider Product Boundaries

Provider doctrine is platform-wide; individual products do not own provider authority.

## Capital

Capital consumes authorized Neptlium financial projections and commands. It must not derive portfolio/cash truth directly from Circle balances, Alchemy RPC results or Stripe payment state.

## Treasury

Treasury creates organization-scoped intents, policy/approval workflows and operational views. Provider selection/execution remains server-owned and capability-driven. Treasury does not become a provider dashboard.

## Pay

Pay is the money-movement product/infrastructure surface. It orchestrates Neptlium payment intents but is not the canonical ledger. Circle and Stripe rails remain adapters behind API authority; Alchemy supplies chain evidence where relevant.

## App

The authenticated App is an interaction surface. Browser state does not authorize provider execution and privileged provider credentials never enter the client.

## Admin

Admin exposes governed operator comprehension and controls. Provider health/evidence may be visible, but an operator status mutation cannot fabricate provider execution, settlement or reconciliation.

## Forge

Forge exposes stable Neptlium APIs, SDKs, events, sandbox and developer tooling. Developers integrate with Neptlium contracts rather than provider-native secrets or SDK authority. Provider replacement should not require downstream product consumers to redesign their domain model.

## API / Platform Core

API is the privileged provider boundary. Platform Core owns identity resolution, authorization, policy, intents, canonical ledger, audit and reconciliation. This is the only layer allowed to translate provider evidence into governed canonical financial state.
