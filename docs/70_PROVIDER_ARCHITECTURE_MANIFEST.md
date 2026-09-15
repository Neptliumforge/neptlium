# Provider Architecture Manifest

Neptlium's provider layer exists to make external capabilities composable, replaceable and governable.

Circle provides certified digital-money rails. Alchemy provides certified chain intelligence. Stripe provides certified fiat/payment rails. Neptlium provides the control plane.

Every implementation decision should reinforce four properties: provider-neutral domain ownership, granular capability certification, deterministic financial lifecycle/reconciliation, and server-side security/auditability.

If a proposed provider shortcut weakens one of those properties, reject the shortcut.
