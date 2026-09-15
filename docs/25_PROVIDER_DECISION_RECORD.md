# Provider Architecture Decision Record

**Decision:** Neptlium standardizes the current primary external provider roles as Circle for supported stablecoin/digital-money wallet and settlement infrastructure, Alchemy for multi-chain blockchain connectivity/observation/intelligence, and Stripe for supported fiat/payment/billing infrastructure.

**Authority retained by Neptlium:** identity resolution, ownership, authorization, policy/risk/approvals, transaction intents, reservations, canonical ledger, lifecycle, audit and reconciliation.

**Consequences:** provider integrations are replaceable adapters; product surfaces consume Neptlium contracts; provider observations remain evidence; configuration does not imply capability; capability does not imply execution; Alchemy is multi-chain by architecture with granular network certification; Circle and Stripe economic execution remain separately gated.

**Current migration constraint:** existing API runtime still contains a Base-specific legacy Alchemy RPC validation path. New chain-registry/per-network configuration establishes the target boundary without falsely claiming that the legacy runtime has already been retired.

**Operational consequence:** provider/environment mutations and financial execution remain separately authorized actions under repository `AGENTS.md`; this decision record does not enable them.
