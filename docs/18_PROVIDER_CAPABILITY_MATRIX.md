# Provider Capability Matrix

This matrix describes architectural ownership, not a claim that every capability is currently live.

| Capability | Circle | Alchemy | Stripe | Neptlium authority |
| --- | --- | --- | --- | --- |
| Stablecoin wallet/address infrastructure | Primary adapter where certified | Observation only | No | Identity, ownership, eligibility, policy |
| Stablecoin deposit/withdrawal rail | Primary adapter where certified | Chain observation/evidence | No | Intent, authorization, ledger, reconciliation |
| Multi-chain RPC/activity/receipts | No | Primary adapter | No | Chain registry, capability policy, interpretation |
| Confirmation/finality evidence | Provider transaction evidence where applicable | Primary chain evidence | Payment evidence only | Settlement policy and reconciliation |
| Transaction simulation | No | Primary adapter where certified | No | Policy/risk decision |
| Fiat/card/bank payment | No | No | Primary adapter where certified | Eligibility, intent, policy, ledger, reconciliation |
| Billing/subscriptions | No | No | Primary adapter where certified | Product entitlement/domain state |
| Refund provider operation | Stablecoin reversal/new transfer where applicable | Observation only | Primary for Stripe payment refunds | Governed intent, accounting correction, reconciliation |
| Canonical balance | Never | Never | Never | **Neptlium Platform Core** |
| Canonical ledger | Never | Never | Never | **Neptlium Platform Core** |
| Authorization/approvals | Never | Never | Never | **Neptlium Platform Core** |
| Reconciliation | Evidence source only | Evidence source only | Evidence source only | **Neptlium Platform Core** |

## Activation rule

A provider capability is not product-available merely because the provider supports it. Neptlium must verify the exact environment, network/rail, asset/currency, operation, provider evidence contract, policy path and reconciliation path before marking the capability certified. Execution-capable operations require an additional explicit execution authorization/gate.
