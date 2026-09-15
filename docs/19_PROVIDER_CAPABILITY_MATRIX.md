# Provider Capability Matrix

This matrix describes architectural ownership and current activation doctrine. It is not a claim that every target capability is live.

| Domain capability | Neptlium Core | Circle | Alchemy | Stripe |
| --- | --- | --- | --- | --- |
| Principal identity / ownership | AUTHORITATIVE | — | — | — |
| Authorization / policy / approvals | AUTHORITATIVE | — | — | — |
| Transaction intent | AUTHORITATIVE | provider reference only | evidence reference only | provider reference only |
| Canonical ledger / available balance | AUTHORITATIVE | observation only | observation only | observation only |
| Reconciliation decision | AUTHORITATIVE | evidence | evidence | evidence |
| Stablecoin wallet/address infrastructure | governs eligibility/ownership | PRIMARY ADAPTER | chain observation where applicable | — |
| Stablecoin transfer/settlement submission | authorizes/governs | PRIMARY ADAPTER where certified | observes chain where applicable | — |
| Multi-chain RPC | governs network capability | — | PRIMARY ADAPTER | — |
| Chain activity / receipts / confirmations | interprets/reconciles | provider evidence where applicable | PRIMARY ADAPTER | — |
| Chain simulation / gas intelligence | governs use | — | PRIMARY ADAPTER where certified | — |
| Card/Checkout payments | governs intent/accounting | — | — | PRIMARY ADAPTER where certified |
| Bank/fiat payment methods | governs intent/accounting | — | — | PRIMARY ADAPTER where certified |
| Billing/subscriptions | governs product entitlement/accounting | — | — | PRIMARY ADAPTER |
| Refund/dispute provider processing | governs canonical lifecycle | — | — | PRIMARY ADAPTER where certified |
| Audit | AUTHORITATIVE | reference/evidence | reference/evidence | reference/evidence |

## Meaning of PRIMARY ADAPTER

`PRIMARY ADAPTER` means the strategic provider for that external capability in the current architecture. It does not mean the provider owns Neptlium domain truth, and it does not mean the capability is currently live.

## Cross-provider rule

Provider roles may overlap as evidence without overlapping as authority. For example, Circle may report a stablecoin transfer state while Alchemy reports the corresponding on-chain transaction. Neptlium correlates both to its own intent and reconciliation record.

## UI rule

Capital, Treasury, Pay, Admin and Forge consume normalized Neptlium capability/domain contracts. Provider names may be shown when operationally or legally useful, but product state must not depend on provider-specific response models.
