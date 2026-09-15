# Provider Engineering Roadmap

## Canonical target

Neptlium operates one provider-neutral financial control plane with Circle, Alchemy and Stripe as strategic infrastructure adapters.

## Phase A — doctrine and contracts

- Canonical provider role doctrine.
- Provider capability matrix.
- Multi-chain registry architecture.
- Explicit configured/certified/eligible/authorized/execution-enabled/settled/reconciled states.
- No provider-specific domain authority in product surfaces.

## Phase B — dependency reconciliation

Resolve the current Platform Core and Treasury stacked work in dependency order before merging execution-sensitive provider orchestration.

Provider foundation changes must be reconciled with the strategic provider set. Zengo-specific active assumptions in open Treasury foundation work must not become canonical by accident; any future signer integration is separately reviewed and scoped.

## Phase C — Alchemy multi-chain foundation

- Introduce canonical network registry in shared/server domain code.
- Replace Base-only production validation with registry-backed per-network validation.
- Preserve legacy compatibility during migration only where safe.
- Add per-network RPC configuration.
- Add per-network observation/webhook capability.
- Add deterministic provider routing.
- Tests for mixed environment/network configuration and fail-closed behavior.
- Activate read-only production networks independently from financial execution.

## Phase D — Circle capability foundation

- Explicit Circle capability registry.
- Connectivity/identity validation.
- Wallet/address observation.
- Signed event ingress.
- Provisioning idempotency and ownership binding.
- Deposit evidence correlation with chain observations where applicable.
- Transfer submission adapter only after approval/idempotency/recovery/reconciliation certification.

## Phase E — Stripe payment foundation

- Preserve existing governed billing ingress.
- Define separate fiat-funding/payment intent contract.
- Signed webhook/event inbox.
- Idempotent payment creation.
- Failure/refund/dispute lifecycle.
- Ledger posting contract.
- Reconciliation.
- Customer funding only after eligibility and operational certification.

## Phase F — unified provider orchestration

- Capability-driven provider resolution.
- Provider health/degradation model.
- Stable Neptlium intent identifiers.
- Durable evidence references.
- Ambiguous timeout recovery.
- Cross-provider evidence correlation.
- Observability and audit.
- Explicit kill switches and operation-level feature gates.

## Phase G — product exposure

Capital, Treasury, Pay and Forge consume one normalized capability API. Customer UI exposes only capabilities certified and eligible for the current principal.

Admin receives operational visibility into configuration state, capability state, provider health, intent lifecycle and reconciliation exceptions without receiving authority merely because it can view them.

## Merge/deployment rule

Each phase should land as the smallest coherent reviewed change with tests and documentation. Do not combine architecture cleanup, production database mutation and live financial execution into one opaque release.

Production provider activation must remain reversible and capability-scoped.
