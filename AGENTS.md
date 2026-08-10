# Repository Guidance

- Inspect live code, migrations, tests, and configuration before describing or changing behavior.
- The numbered documents `docs/00_*` through `docs/14_*` are authoritative. Resolve conflicts in their favor.
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

## Safety

- Never expose tokens, cookies, service-role keys, provider secrets, private keys, recovery material, or sensitive webhook payloads.
- Do not edit or delete applied migrations; use new reviewed forward migrations when instructed.
- Do not install providers, change remote environments, apply migrations, commit, push, or deploy unless explicitly instructed.
- Preserve unrelated work in a dirty worktree.
