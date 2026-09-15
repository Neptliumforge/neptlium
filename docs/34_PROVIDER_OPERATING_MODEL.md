# Provider Operating Model

## Circle

Primary operational questions: Are wallet/stablecoin capabilities configured? Is observation healthy? Is provisioning separately certified? Is transfer execution separately certified? Are provider events reconciled to Neptlium intents and ledger state?

## Alchemy

Primary operational questions: Which Neptlium networks are configured? Which are observation-certified? What is RPC/webhook health per network? Are confirmation/finality observations current? No chain is execution-enabled merely because RPC is healthy.

## Stripe

Primary operational questions: Is signed billing/payment event ingress healthy? Which payment capabilities are certified? Are refunds/disputes reconciled? Billing support and capital funding remain distinct capabilities.

## Platform Core

Primary operational questions: Are identity/ownership resolution, authorization, policy, intent lifecycle, canonical posting and reconciliation healthy? Provider health cannot compensate for a failed control-plane gate.

## Incident priority

1. Preserve canonical ledger integrity.
2. Stop unsafe new execution through capability-scoped gates.
3. Preserve in-flight intent/provider evidence.
4. Recover ambiguous outcomes through lookup/reconciliation.
5. Restore provider capability only after evidence supports it.
6. Never manufacture a successful financial state to clear an incident.
