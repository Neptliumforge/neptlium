# Provider Audit Model

Provider lifecycle changes should produce safe, immutable audit evidence with stable event identity, provider, action, timestamp and actor/system identity, plus correlation/intent/provider references when applicable.

Auditable actions include configuration validation, connectivity verification, capability certification, execution authorization, operation submission, evidence receipt, settlement determination, reconciliation and capability disablement.

Audit events record what the Neptlium control plane did or observed; they do not substitute for canonical ledger entries or provider evidence. Sensitive credentials and raw secret-bearing payloads never belong in audit events.
