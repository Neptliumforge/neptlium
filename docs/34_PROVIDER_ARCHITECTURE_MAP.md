# Provider Architecture Map

```text
Customer / Business / Developer / Operator
                    |
      Capital / Treasury / Pay / Forge
                    |
              Neptlium API
                    |
             Platform Core
 identity | ownership | authorization | policy/risk
 intents | approvals | reservations | ledger | audit
                 reconciliation
                    |
          Provider Orchestration
          /         |          \
       Circle     Alchemy      Stripe
       |            |            |
 stablecoin     multi-chain    fiat/card/
 wallet +       observation    bank/billing
 settlement     intelligence   payments
       \            |            /
        provider evidence/events
                    |
        settlement determination
                    |
             reconciliation
                    |
             canonical ledger
```

The provider layer is subordinate to Platform Core. Provider evidence may inform settlement/reconciliation but cannot bypass Neptlium authorization or directly establish canonical financial truth.
