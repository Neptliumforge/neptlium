# Provider Invariants

These invariants are non-negotiable unless superseded by an explicit reviewed architecture decision.

1. Provider observation is not canonical ledger state.
2. Provider configuration is not live capability.
3. Capability certification is not execution authorization.
4. Provider submission is not settlement.
5. Settlement is not reconciliation.
6. Circle does not own Neptlium authorization, balances, ledger or reconciliation.
7. Alchemy does not own financial authorization, balances, ledger or reconciliation.
8. Stripe does not own Neptlium account models, balances, ledger or reconciliation.
9. Alchemy chain support is granular; provider support never silently enables a Neptlium financial network.
10. Privileged provider secrets and SDK authority remain server-side.
11. Externally mutating provider operations require Neptlium authorization and idempotency.
12. Ambiguous provider outcomes require controlled lookup before unsafe retry.
13. Canonical financial corrections preserve append-only history through reversals/compensating entries.
14. Product surfaces consume Neptlium contracts rather than provider-native authority.
15. Production provider/environment mutation and financial execution remain separately authorized operational actions.
