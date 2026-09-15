# Provider Doctrine Validation Plan

Before merge, execute the repository-appropriate checks for this slice:

- `git diff --check` equivalent via CI/review tooling;
- API TypeScript typecheck;
- API lint;
- API tests, including new provider doctrine tests;
- API production/Vercel build;
- relevant existing provider/financial retirement gates;
- PR overlap review against Platform Core/Treasury provider branches;
- preview deployment status where applicable.

Report each executed check as PASS/FAIL/BLOCKED/NOT RUN. Do not merge if required validation fails or is blocked.

This validation does not certify live Circle/Alchemy/Stripe production capability; live provider certification remains a separate operational gate.
