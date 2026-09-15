# Provider Doctrine Changeset Summary

This branch establishes the provider doctrine requested for Neptlium:

- Circle owns supported stablecoin/digital-money infrastructure capabilities, never Neptlium financial authority.
- Alchemy owns multi-chain blockchain observation/intelligence capabilities, never financial execution authority.
- Stripe owns supported fiat/payment/billing infrastructure capabilities, never Neptlium financial authority.
- Platform Core owns authorization, policy, intents, canonical ledger, reconciliation and audit.
- API is the privileged provider boundary.
- A canonical EVM chain registry and per-network Alchemy target configuration support Ethereum, Base, Arbitrum, Optimism and Polygon.
- Capability state, scope, selection, readiness, execution policy, provider evidence, outcomes, health, errors, audit and release gates are represented as typed primitives.
- Documentation defines activation, reconciliation, security, observability, failure, rollback, governance, testing and production-readiness standards.
- Existing Base-only runtime behavior is explicitly preserved as CURRENT until the runtime migration is validated.
- No production provider/environment mutation or financial execution is performed by this changeset.
