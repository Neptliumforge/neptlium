# Provider Dependency Notes

The existing Treasury provider-orchestration PR is stacked on Platform Core work and contains Zengo-specific modeling. Do not merge that provider foundation unchanged after this doctrine becomes canonical.

Required reconciliation:

- retain provider-neutral intent/policy/preflight concepts that align with Platform Core;
- replace strategic Zengo-specific account/provider assumptions with the canonical Circle + Alchemy + Stripe provider model unless a future explicit provider decision retains an external signer;
- preserve `executionAuthorized: false` semantics until execution gates are certified;
- preserve exact-money and organization-scoped controls;
- avoid duplicating the chain registry introduced by the canonical provider architecture.
