# Provider Doctrine Implementation Plan

## Completed in this architecture slice

- Canonical Circle/Alchemy/Stripe responsibility doctrine.
- API-local engineering authority.
- Provider authority invariants and operation ownership.
- Provider evidence/outcome contracts that begin non-canonical/unreconciled.
- Capability certification model and deterministic fail-closed selection.
- Canonical initial EVM chain registry.
- Per-network Alchemy endpoint configuration model for Ethereum, Base, Arbitrum, Optimism and Polygon.
- Provider health/status/correlation contracts.
- Ordered provider release gates.
- Activation, reconciliation, security, observability, environment and product-boundary documentation.
- Tests that guard the new doctrine and contracts.

## Remaining transition work

1. Integrate the new chain registry and per-network Alchemy configuration into the existing runtime/provider adapter paths, retiring the Base-only production validation only when replacement coverage is complete.
2. Reconcile this doctrine with stacked Treasury/Platform Core PRs before merging overlapping provider orchestration code.
3. Certify real provider connectivity and signed ingress using environment-specific resources without exposing secrets.
4. Build/verify durable capability persistence if runtime certification state must survive deployment independently of environment flags.
5. Complete separately reviewed Stripe fiat funding contracts before advertising capital funding.
6. Complete Circle operation-specific execution/reconciliation certification before enabling wallet provisioning or withdrawals.
7. Keep production database/provider/environment mutations and economic execution under separate operational authorization.

## Merge discipline

This slice must not claim provider activation merely because architecture code/docs merge. Validation must run, overlapping open PRs must be reconciled, and production capability remains gated according to `docs/24_PROVIDER_RELEASE_GATES.md`.
