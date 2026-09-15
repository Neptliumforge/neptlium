# Provider API Principles

- Public/product APIs expose Neptlium resource identities and lifecycle semantics, not provider SDK objects.
- Provider references may be retained for audit/support but are not primary product identities.
- Commands are idempotent and authorization is evaluated server-side.
- Provider selection is an internal capability/policy concern unless an explicit product contract requires user choice.
- Provider-specific failures are normalized into stable safe Neptlium error semantics.
- Asynchronous provider evidence updates lifecycle through governed event/reconciliation paths.
- API responses must preserve unknown/pending/ambiguous states instead of fabricating zero, failure or settlement.
- Provider replacement should not force ordinary API consumers to redesign their integration.
