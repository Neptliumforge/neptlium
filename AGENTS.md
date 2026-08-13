# Repository Guidance

- Inspect live code, migrations, tests, and configuration before describing or changing behavior.
- The numbered documents `docs/00_*` through `docs/14_*` are authoritative when present.
- `docs/03_DESIGN_SYSTEM.md` is the authoritative unified Neptlium design direction for marketing and authenticated product.
- `docs/03_MARKETING_DESIGN_DOCTRINE.md` is retained as implementation history and marketing composition reference only. Where it conflicts with `docs/03_DESIGN_SYSTEM.md` on palette, typography, motion, surface behavior or cross-product identity, `docs/03_DESIGN_SYSTEM.md` wins.
- `docs/archive` is historical context only, never current architecture.

## Application boundaries

- `apps/web`: public website; no privileged or canonical financial authority.
- `apps/app`: authenticated customer interaction surface; browser/UI checks are not authorization.
- `apps/admin`: internal operations; database status changes do not prove financial execution.
- `apps/api`: privileged API/provider/ledger/reconciliation boundary.

## Financial correctness

- Provider observation is evidence, not canonical ledger truth.
- Modeling, approval, submission, or status does not prove execution or settlement.
- Require server authentication, authorization, ownership, idempotency, policy, audit, balanced posting, and reconciliation as applicable.
- Preserve append-only financial history; correct with reversals or compensating entries.
- Fail closed when capability, durable storage, verification, or configuration is missing.
- Never fabricate financial or provider state.

## Git workflow authority

- Git operations are environment-neutral. No repository rule may reserve branch creation, commits, pushes, pull-request creation, review, or merging exclusively to Termux or any other single client or machine.
- Authorized development environments may include Termux, Codex/ChatGPT-connected GitHub tooling, GitHub CLI, GitHub web UI, Codespaces, or another explicitly authorized environment.
- Agents may inspect code and create local commits when the current user directive authorizes implementation work.
- Creating or updating remote branches, pushing commits, or opening pull requests requires explicit user authorization unless the current task expressly requests that remote Git operation.
- Merging a pull request always requires explicit user instruction for that merge. Environment identity is not merge authorization.
- Repository branch protections, required checks, review requirements, and ownership/authorization controls remain authoritative and must not be bypassed merely because an environment is authorized to perform Git operations.
- Never force-push protected history, bypass required reviews/checks, or use an alternate environment to evade repository governance unless the user explicitly changes that governance and doing so remains safe.

## Safety

- Never expose tokens, cookies, service-role keys, provider secrets, private keys, recovery material, or sensitive webhook payloads.
- Do not edit or delete applied migrations; use new reviewed forward migrations when instructed.
- Do not install providers, change remote environments, apply migrations, commit, push, open or merge pull requests, or deploy unless explicitly instructed or the current task expressly authorizes that operation.
- Preserve unrelated work in a dirty worktree.
