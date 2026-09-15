# Provider Doctrine Validation Plan

For this doctrine/foundation branch run:

1. `git diff --check`
2. API typecheck
3. API lint
4. API tests, including provider doctrine/capability/evidence/chain registry regression tests
5. API production build / Vercel build
6. existing financial-authority retirement gates
7. preview deployment checks

Expected result before merge: all required repository gates PASS.

Production provider execution validation is outside this branch and remains NOT RUN.
