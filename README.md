# NEPTLIUM

NEPTLIUM is the capital operating platform monorepo for Web, App, Admin, API, shared packages, Supabase data-plane, provider integrations, ledger, and reconciliation.

> **Repository state: PRODUCTION REMEDIATION IN PROGRESS**
>
> The repository is not authorized to describe the financial platform as production-complete until every gate in `docs/15_PRODUCTION_READINESS_AUDIT.md` is completed with evidence. Source presence, green builds, deployed schema, configured providers, or UI availability do not by themselves prove safe financial execution.

## Canonical surfaces

| Workspace | Domain | Authority |
| --- | --- | --- |
| `apps/web` | `neptlium.com` | Public information and product narrative only. |
| `apps/app` | `app.neptlium.com` | Authenticated customer interaction. No financial authority in the browser. |
| `apps/admin` | `admin.neptlium.com` | Governed operator interface. No direct financial-table mutation authority. |
| `apps/api` | `api.neptlium.com` | Authentication, authorization, durable financial commands, provider isolation, ledger, settlement, and reconciliation. |

## Current production truth

The September 12, 2026 repository + live data-plane audit established the following execution state:

- the production Supabase project is healthy and contains the newer governed financial schema;
- canonical financial tables such as `funding_intents`, `transfer_executions`, `provider_references`, `settlement_evidence`, `ledger_journals`, `ledger_postings`, and reconciliation tables have not yet processed a production lifecycle;
- legacy Supabase Edge Functions remain deployed, including a withdrawal path that can mark a withdrawal complete without executing an external payout;
- the deployed Stripe webhook configuration and implementation do not yet represent the canonical provider-inbox/ledger path;
- the deployed `crypto-webhook` is a placeholder and is not a production crypto settlement ingress;
- Supabase-to-Clerk identity migration is incomplete;
- the connected Vercel integration does not currently expose the Neptlium projects, so production Vercel environment variables have not yet been independently certified.

Accordingly, **real-money launch remains closed**.

## Mandatory execution order

No feature expansion takes precedence over this sequence:

1. Disable `process-withdraw` in production.
2. Disable the placeholder `crypto-webhook`.
3. Retire or explicitly contain the legacy `process-deposit` path.
4. Replace the legacy Stripe webhook path with verified ingress into `provider_webhook_inbox` and the canonical funding/ledger lifecycle.
5. Remove remaining legacy money mutation paths from Supabase Edge Functions.
6. Remove client-side authority to create or mutate financial transaction truth.
7. Complete Circle outbound orchestration from approved transfer through durable provider-reference persistence and `submitted` transition.
8. Wire Circle and Alchemy signed/authenticated webhook ingestion into `provider_webhook_inbox`.
9. Execute and evidence one complete funding lifecycle in a production-equivalent environment.
10. Execute and evidence one complete withdrawal lifecycle in a production-equivalent environment.
11. Verify settlement evidence durability and transaction linkage.
12. Verify every canonical journal is balanced and only-once.
13. Verify reconciliation reaches a matched state with no unresolved discrepancy codes.
14. Verify omnibus backing invariants.
15. Finish the Supabase-to-Clerk identity cutover and close legacy authentication authority.
16. Restore Vercel project visibility and audit production environment-variable presence, scope, and runtime wiring without exposing secret values.

The authoritative gate definitions, required evidence, and completion rules are in [`docs/15_PRODUCTION_READINESS_AUDIT.md`](docs/15_PRODUCTION_READINESS_AUDIT.md).

## Financial authority chain

The target production chain is:

```text
Authenticated customer/admin command
  -> Neptlium API authorization and policy
  -> durable intent/execution record
  -> ledger reservation where applicable
  -> governed approval
  -> provider submission
  -> durable provider reference
  -> signed/authenticated provider event
  -> durable settlement evidence
  -> canonical ledger posting
  -> reconciliation
  -> user-visible settled state
```

The following is not an acceptable financial authority chain:

```text
browser or legacy Edge Function
  -> mutate transactions/portfolio totals
  -> mark completed
```

## Non-negotiable truth rules

- `CONFIGURED != LIVE`
- `APPROVED != SUBMITTED`
- `SUBMITTED != SETTLED`
- `SETTLED != RECONCILED`
- `PROVIDER OBSERVATION != CANONICAL LEDGER`
- `UNKNOWN != ZERO`
- `UI STATE != DOMAIN TRUTH`
- no irreversible provider action may occur without a durable idempotent recovery path;
- no financial completion may be reported without durable evidence and reconciliation.

## Documentation mode

All current documentation is intentionally written in **execution mode** until remediation completes. During this phase documents describe:

- current verified state;
- prohibited legacy authority;
- target authority;
- ordered execution gates;
- evidence required to close each gate.

After every gate in `docs/15_PRODUCTION_READINESS_AUDIT.md` is proven complete, README, `AGENTS.md`, and all current documentation must be rewritten again from execution-mode documentation into final production-operating documentation. Do not perform that final rewrite early.

`docs/archive/**` remains historical and non-authoritative.

## Development

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
```

Passing repository checks does not close a production-remediation gate unless that gate explicitly requires and records those checks.

## Start here

1. Read [`AGENTS.md`](AGENTS.md).
2. Read [`docs/15_PRODUCTION_READINESS_AUDIT.md`](docs/15_PRODUCTION_READINESS_AUDIT.md).
3. Read the domain document relevant to the execution being changed.
4. Inspect current `main`, live environment evidence where authorized, and overlapping pull requests.
5. Execute only the next open remediation gate unless the task explicitly addresses a prerequisite needed to close it.
