# Next Provider Execution

After this doctrine slice validates, the next implementation should be a focused runtime-integration change:

- inspect/reconcile open Platform Core/Treasury provider PRs;
- make Circle/Alchemy/Stripe the only current primary provider roles in overlapping orchestration contracts;
- wire canonical chain registry/per-network Alchemy endpoint configuration into actual runtime observation paths;
- retain compatibility until replacement tests pass, then retire the Base-only Alchemy production constraint;
- keep Alchemy non-executing;
- preserve Circle and Stripe execution gates;
- validate API typecheck/lint/test/build and existing financial gates;
- merge only after required checks pass.

Provider credential entry/certification follows separately under the activation runbook; production money movement remains a later explicit gate.
