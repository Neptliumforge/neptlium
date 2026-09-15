# Provider Integration Definition of Done

A provider integration or capability is complete only when all applicable conditions are evidenced:

- responsibility fits the canonical Circle/Alchemy/Stripe doctrine;
- domain code depends on Neptlium contracts rather than provider SDK objects;
- server-only configuration validation fails closed;
- exact environment/network/rail/asset/operation capability is represented;
- connectivity is verified independently of capability certification;
- official webhook/observation verification is implemented where applicable;
- replay/idempotency behavior is covered;
- ambiguous provider timeouts have controlled lookup/recovery behavior;
- provider evidence remains non-canonical until settlement/reconciliation;
- execution cannot occur from configuration or capability presence alone;
- financial execution passes Neptlium identity/ownership/authorization/policy/approval requirements;
- reconciliation and correction behavior is deterministic and auditable;
- safe telemetry exists without secret leakage;
- tests/build/lint/typecheck and applicable repository gates pass;
- overlapping PRs and current documentation are reconciled;
- production configuration/deployment/execution is separately authorized and verified when in scope.

No integration is `PASS` merely because a provider dashboard says connected or an SDK call returns successfully.
