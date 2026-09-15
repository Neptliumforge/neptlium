# Provider Decision Record

## Decision

Neptlium standardizes its current strategic external financial/chain provider architecture around:

1. **Circle** for reviewed stablecoin, digital-money, wallet and settlement infrastructure.
2. **Alchemy** for reviewed multi-chain blockchain RPC, observation, webhook, simulation and intelligence infrastructure.
3. **Stripe** for reviewed fiat, card, bank-payment and billing infrastructure.

Supabase Auth remains the active authentication provider and Supabase remains persistence infrastructure where configured; neither changes the strategic financial/chain provider division above.

## Authority

Neptlium Platform Core remains authoritative for principal identity resolution, ownership, authorization, policy, risk, approvals, transaction intents, canonical ledger, reconciliation and audit.

## Consequences

- Provider SDK models do not become product domain models.
- Provider balances do not become canonical balances.
- Alchemy is engineered as multi-chain infrastructure rather than Base-only product architecture.
- Circle and Alchemy may provide complementary evidence for one stablecoin/on-chain lifecycle.
- Stripe billing capability is distinct from customer capital funding capability.
- Provider configuration is separated from certification and execution authorization.
- Future providers require explicit review and must fit the same adapter/capability model rather than creating a parallel financial authority.

## Supersession

Historical documentation or open work that implies an active strategic provider outside Circle, Alchemy and Stripe must be reconciled before merge. This does not prohibit future providers; it prevents accidental architecture drift.

A future provider decision should update this record and the canonical provider architecture deliberately.
