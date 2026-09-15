# Neptlium API Engineering Authority

This file specializes the root `AGENTS.md` for `apps/api` and cannot weaken repository-wide rules.

## Provider authority

`apps/api` is the privileged provider boundary. Circle, Alchemy and Stripe are infrastructure/capability adapters; they are not domain authorities.

- **Circle:** supported stablecoin/digital-money wallet and settlement infrastructure.
- **Alchemy:** multi-chain blockchain connectivity, observation and intelligence infrastructure.
- **Stripe:** supported fiat/card/bank-payment and billing infrastructure.

Neptlium Platform Core owns authorization, policy, approvals, intents, canonical ledger, audit and reconciliation.

## Required engineering behavior

- Keep provider SDKs, credentials, entity secrets and webhook signing material server-side.
- Normalize provider data into Neptlium domain contracts before product consumption.
- Treat provider observations and provider success as evidence, not canonical financial truth.
- Preserve idempotency, durable event ingestion, correlation and ambiguous-timeout lookup.
- Select providers through explicit capability/policy decisions, never UI hard-coding.
- Keep configuration, connectivity verification, capability certification and execution authorization distinct.
- Fail closed for unsupported provider/network/asset/operation combinations.
- Never silently enable mainnet, execution, a new chain, a new asset or a new rail.

## Alchemy multi-chain rule

Alchemy is architecturally multi-chain. Canonical chain identity belongs to Neptlium and must be represented through the chain registry. Each network endpoint and capability is independently configured/certified. Observation support does not imply deposit, withdrawal, signing, Circle settlement or product availability.

## Financial truth

The authoritative lifecycle remains Neptlium-owned:

`intent -> authorization/policy -> provider submission -> provider evidence -> settlement determination -> reconciliation -> canonical ledger`

No provider may skip a stage or mutate canonical product-facing financial truth outside the governed domain path.
