# Canonical Provider Architecture Summary

**One company. One platform. One financial authority. Multiple specialized infrastructure adapters.**

```text
Neptlium Products
Capital | Treasury | Pay | Forge | Admin
                 |
                 v
          Neptlium API / Core
 Identity | Ownership | Authorization
 Policy | Risk | Approvals | Intents
 Ledger | Reconciliation | Audit
                 |
                 v
        Provider Orchestration
          /       |       \
     Circle    Alchemy    Stripe
       |          |          |
 Stablecoin   Multi-chain   Fiat
 Wallets      RPC/Events    Cards
 Settlement   Simulation    Bank/Billing
          \       |       /
                 v
          External Evidence
                 |
                 v
      Neptlium Reconciliation
                 |
                 v
          Canonical Ledger
```

Circle moves/settles reviewed digital money capabilities. Alchemy connects Neptlium to reviewed blockchain networks and supplies observations/intelligence. Stripe processes reviewed fiat/payment capabilities. Neptlium alone decides what is authorized and what becomes canonical financial state.
