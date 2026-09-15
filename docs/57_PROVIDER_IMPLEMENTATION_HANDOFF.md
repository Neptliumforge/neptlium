# Provider Implementation Handoff

Canonical strategic provider decision: Circle + Alchemy + Stripe.

Code foundation added in `apps/api/src/provider-doctrine.ts`, `chain-registry.ts`, `provider-capability.ts` and `provider-evidence.ts`, with regression tests.

Next engineer must not interpret this foundation as production activation. The immediate code task is the compatibility-safe Alchemy multi-chain runtime migration described in `36_PROVIDER_NEXT_IMPLEMENTATION.md`.

Before touching execution, reconcile the Platform Core/Treasury PR dependency stack and remove conflicting active provider assumptions.
