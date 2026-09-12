# NEPTLIUM Repository Execution Constitution

## Current operating mode

NEPTLIUM is in **PRODUCTION REMEDIATION MODE**.

Until every gate in `docs/15_PRODUCTION_READINESS_AUDIT.md` is closed with evidence, agents and engineers must optimize for remediation completion rather than feature expansion, architectural churn, visual polish, or speculative provider work.

The canonical repository is `Neptliumforge/neptlium`.

## Surface authority

| Boundary | Authority |
| --- | --- |
| `apps/web` | Public information, brand, editorial, SEO. No operational or financial authority. |
| `apps/app` | Authenticated customer interaction. Browser state is never financial authority. |
| `apps/admin` | Governed operator client. It must call API-backed commands for privileged financial work. |
| `apps/api` | Authentication enforcement, authorization, durability, provider isolation, ledger, settlement, and reconciliation. |
| Supabase | Canonical persistent data-plane behind the API. Client access must remain least-privilege and fail closed. |

## Source-of-truth order

Before changing or describing any production-sensitive subsystem:

1. Read this file.
2. Read `docs/15_PRODUCTION_READINESS_AUDIT.md` and identify the next applicable open gate.
3. Read the relevant domain document under `docs/`.
4. Inspect current `origin/main` implementation, tests, configuration, migrations, and deployment entrypoints.
5. Inspect live production state when the task concerns production and authorized access is available.
6. Inspect overlapping open pull requests.
7. Distinguish `CURRENT`, `TRANSITION`, and `TARGET` explicitly.
8. Change only what is needed to close the gate.
9. Record evidence before marking the gate complete.

Documentation, source, deployed schema, provider configuration, and UI state can disagree. Runtime evidence and durable state determine what is live.

## Mandatory remediation sequence

The execution order is authoritative unless a prerequisite must be completed first:

1. Disable production `process-withdraw`.
2. Disable production placeholder `crypto-webhook`.
3. Retire or explicitly contain legacy `process-deposit`.
4. Replace the legacy Stripe webhook with verified provider-inbox/canonical-ledger ingestion.
5. Remove remaining legacy money mutation paths from Edge Functions.
6. Remove client-side financial transaction creation/mutation authority.
7. Complete Circle outbound orchestration: approved -> provider submission -> durable provider reference -> submitted.
8. Implement Circle/Alchemy authenticated webhook ingress through `provider_webhook_inbox`.
9. Prove a complete funding lifecycle.
10. Prove a complete withdrawal lifecycle.
11. Verify settlement evidence.
12. Verify balanced/only-once canonical journals.
13. Verify reconciliation.
14. Verify omnibus backing.
15. Complete Supabase -> Clerk identity cutover.
16. Restore Vercel project visibility and audit production environment-variable presence/scope/runtime wiring.

Do not skip forward simply because later code already exists.

## Completion rule

A remediation gate is `COMPLETE` only when all of the following are true where applicable:

- implementation is merged to canonical `main`;
- required migrations/configuration are applied to the intended environment;
- required legacy path is disabled or removed;
- automated tests pass;
- runtime behavior is exercised;
- durable database evidence exists;
- idempotency/replay/failure behavior is tested;
- no unresolved security or reconciliation discrepancy remains;
- the evidence is recorded in `docs/15_PRODUCTION_READINESS_AUDIT.md`.

Allowed gate states:

- `OPEN`
- `IN PROGRESS`
- `BLOCKED`
- `COMPLETE`

Never infer `COMPLETE` from code presence, a PR description, green CI alone, or a deployment status alone.

## Financial truth invariants

Always preserve:

- `UNKNOWN != ZERO`
- `CONFIGURED != LIVE`
- `APPROVED != SUBMITTED`
- `SUBMITTED != SETTLED`
- `SETTLED != RECONCILED`
- `PROVIDER OBSERVATION != CANONICAL LEDGER`
- `UI REPRESENTATION != DOMAIN TRUTH`
- `MODELED != EXECUTED`

For money movement:

- persist durable intent before irreversible provider effects;
- use deterministic/idempotent provider submission;
- persist provider references durably;
- authenticate provider callbacks cryptographically or through the provider's official authenticated contract;
- deduplicate provider events;
- persist settlement evidence;
- post balanced journals only once;
- reconcile provider evidence, treasury assets, and customer liabilities;
- never treat a legacy `transactions.status` or `portfolios.total_value` mutation as canonical accounting truth.

## Legacy production containment

During remediation, treat these as untrusted/legacy authority until removed or replaced:

- `process-withdraw` Supabase Edge Function;
- placeholder `crypto-webhook`;
- legacy `process-deposit` direct mutation path;
- legacy Stripe webhook writes directly to `transactions`/`portfolios`;
- browser/client creation of financial transaction truth;
- direct Admin workflow mutations that bypass governed API commands;
- any remaining Supabase Auth path once Clerk-only cutover is certified.

Do not extend legacy paths. Migration work should reduce their authority.

## Identity authority

Current production is transitional. Clerk is the target browser/session authority, while canonical Neptlium principal UUIDs remain the ownership identity inside the platform. Supabase Auth remains present for legacy identities and must not be described as fully retired until gate 15 is complete.

Authorization must come from canonical server-side role/compliance/principal state, not user-editable JWT metadata or UI claims.

## Security and secrets

- Never expose secret values in documentation, logs, PRs, tests, chat, or client bundles.
- Secret audits verify presence, environment scope, rotation expectations, and runtime use—not values.
- `service_role`, provider secrets, signing material, private keys, Circle entity secrets, webhook secrets, and privileged Clerk credentials remain server-only.
- Public/publishable Supabase keys are not secret but should still be intentionally scoped and old unused keys retired.
- Missing auth, policy, durable storage, provider verification, settlement evidence, or reconciliation fails closed.
- Do not weaken RLS, grants, separation of duties, idempotency, or audit controls to make a gate pass.

## Database authority

Canonical financial tables are server-side authority and should remain unavailable directly to `anon`/`authenticated` unless a reviewed use case explicitly requires access.

Prefer API/service execution over browser-accessible `SECURITY DEFINER` RPCs for privileged financial commands. Existing exposed treasury RPCs must retain authenticated-principal matching and super-admin enforcement until they can be further contained.

Applied migrations are immutable. Use forward migrations only.

## Validation reporting

For commands/checks use:

- `PASS` — actually executed and succeeded;
- `FAIL` — executed and exposed a verified defect;
- `BLOCKED` — external prerequisite prevented execution;
- `NOT RUN` — not executed.

For execution gates use the four gate states defined above.

When validating financial flows, capture identifiers and state transitions without exposing secrets or sensitive payloads. Evidence should make it possible to prove:

- exactly one intent/execution;
- exactly one provider submission/reference;
- authenticated provider event receipt;
- matching settlement evidence;
- balanced journal posting;
- matched reconciliation;
- correct final availability/reservation/backing state.

## Git discipline

- Work from current canonical `main`.
- Use a focused branch.
- Preserve unrelated work.
- Do not bypass checks or force-push protected history.
- The standing repository authorization permits commit/push/PR/merge when required validation passes.
- That authorization does **not** automatically authorize production data mutation, provider money movement, secret rotation, environment mutation, or capability enablement; those require task-specific authorization and safety gates.
- A gate is not complete while its implementation exists only on a branch.

## Documentation lifecycle

All current docs are temporarily execution-oriented. Do not rewrite them into celebratory/final production documentation while any remediation gate remains open.

When gate 16 is complete and the production evidence set is coherent, perform a second repository-wide documentation rewrite that:

1. removes temporary remediation language;
2. documents the final production architecture exactly as deployed;
3. records retired legacy paths as historical only;
4. documents the final Clerk identity model;
5. documents actual provider/webhook/environment contracts;
6. converts `docs/15_PRODUCTION_READINESS_AUDIT.md` from active execution ledger into a completed release evidence record.

Until then, the execution ledger wins over optimistic prose anywhere else in the repository.
