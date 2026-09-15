# Provider Architecture Acceptance Criteria

The provider doctrine architecture is acceptable when:

- the canonical three provider roles are explicit and non-overlapping;
- Platform Core financial authority is preserved;
- Alchemy is represented as multi-chain through canonical Neptlium chain identity;
- provider configuration/certification/execution states are distinct;
- provider evidence and outcomes cannot claim canonical settlement/reconciliation;
- operation ownership and provider selection fail closed;
- execution requires Neptlium authorization/policy/approval;
- server-only secret boundaries are documented and guarded;
- activation/reconciliation/security/failure/rollback/observability standards are documented;
- tests/build/lint/typecheck and relevant existing gates pass before merge;
- current Base-only runtime behavior and production activation status are represented truthfully.
