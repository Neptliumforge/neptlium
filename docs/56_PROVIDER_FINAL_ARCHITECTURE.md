# Final Provider Architecture

Neptlium's provider architecture is a control-plane architecture, not a collection of direct third-party integrations.

The canonical provider roles are:

- Circle — supported stablecoin/digital-money wallet and settlement infrastructure.
- Alchemy — multi-chain blockchain connectivity, observation and intelligence infrastructure.
- Stripe — supported fiat/card/bank-payment and billing infrastructure.

All three sit below Neptlium API/Platform Core. Platform Core owns identity/ownership resolution, authorization, policy/risk/approvals, intents, canonical ledger, reconciliation and audit.

Provider integration follows ports/adapters, capability certification, evidence normalization, idempotent commands, signed/durable ingress, explicit lifecycle distinctions, safe failure recovery and deterministic reconciliation. Provider health, configuration and successful calls never become financial truth by themselves.

Alchemy is multi-chain by architecture through canonical Neptlium chain identities and per-network configuration/certification. Circle and Stripe externally mutating capabilities remain operation-specific and separately execution-gated.

This architecture is designed so Neptlium can replace providers without replacing its financial domain.
