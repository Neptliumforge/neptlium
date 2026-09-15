# Provider Pull Request Review Guide

Review provider changes in this order:

1. Does the change preserve Circle/Alchemy/Stripe role separation and Platform Core financial authority?
2. Does it touch an overlapping Platform Core/Treasury/provider PR? Resolve stack/supersession first.
3. Are provider SDK types/secrets contained server-side?
4. Is capability scope explicit and fail-closed?
5. Are configuration, connectivity, certification and execution distinct?
6. Are provider evidence and submission outcomes non-canonical until reconciliation?
7. Are idempotency, replay and ambiguous timeout recovery covered?
8. Are chain/rail/asset identities canonical and provider-neutral?
9. Are security/observability/docs/tests updated proportionately?
10. Do required checks actually PASS before merge?

Never approve a provider change because it makes a UI look functional while weakening financial truth or execution gates.
