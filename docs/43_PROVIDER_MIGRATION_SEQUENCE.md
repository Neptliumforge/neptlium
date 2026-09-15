# Provider Migration Sequence

The provider doctrine must be integrated without bypassing the repository's existing Platform Core/Treasury dependency stack.

1. Merge/resolve database-history hygiene and canonical Platform Core ownership work that provider orchestration depends on.
2. Reconcile overlapping Treasury provider-orchestration branches with the canonical Circle/Alchemy/Stripe doctrine; remove or reclassify provider assumptions that conflict with the current primary-provider decision.
3. Integrate chain registry/per-network Alchemy configuration into current runtime while preserving compatibility until replacement tests pass.
4. Validate API typecheck/lint/test/build and provider-specific gates.
5. Merge architecture/runtime work only when required checks pass and canonical main is verified.
6. Configure/certify provider environments under separate operational authorization.
7. Enable economic capabilities only after their exact release gates and reconciliation contracts pass.

Do not merge overlapping provider branches merely because each is independently mergeable. Resolve authority and duplicate contracts first.
