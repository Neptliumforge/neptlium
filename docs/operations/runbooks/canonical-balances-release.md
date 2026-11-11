# Runbook: canonical balances release and backfill (PR #137)

Releases the canonical balances contract ([CANONICAL_BALANCES.md](../../financial/CANONICAL_BALANCES.md)) to production project `ayrgojoiprxyijeshika`, then optionally backfills ledger initialization for existing accounts.

**Authorization:** three separate owner approvals: (1) production migration, (2) merging PR #137 (which deploys API and app), (3) the backfill. None is implied by another.

## Verified facts (2026-10-21, read-only)

- Every merge to `main` triggers production deployments of `neptlium-app`, `neptlium-api` and `neptlium-web`; each project's `ignoreCommand` skips the build when its paths did not change. PR #137 changes `apps/api` and `apps/app`, so **merging deploys both to production immediately**.
- Production has 19 profiles, 11 provisioned, **0 ledger postings and 0 capital ledger accounts**. Every provisioned account is therefore genuinely zero today.
- The migration applied cleanly to the full chain on Supabase preview `knbezrhecjhqyojyippj`; on that real stack, onboarding wrote exactly one `ONBOARDING` initialization, replays and backfill were idempotent, aggregation of `1000000000000000000000000000001` was exact, and browser roles were denied.
- Compatible with PR #134: #134 redefines `complete_account_onboarding` (an already provisioned profile returns without updating, so the initialization trigger does not fire again); this migration only adds a trigger on the first `provisioned_at` transition. Version order: `20261021190000`, `20261021191000`, `20261021200000`.

## Sequence

1. **Migration first** (approval 1). Apply `20261021200000_canonical_capital_ledger_initialization.sql` under its tracked version. Verify (below). Until the API is deployed, nothing reads the new objects; onboarding starts recording initializations immediately.
2. **Merge #137** (approval 2). Vercel deploys API and app together. The API reads balances through `canonical_capital_balance_summary`; its readiness probe requires `capital_ledger_initializations`.
3. **Verify** the deployed API and app (below).
4. **Backfill** (approval 3), only after 1–3 succeed.

If #137 were merged before the migration, balance reads would return `503` and customers would see "—" (unavailable), never `$0.00`. Avoid it anyway: apply first.

## Migration checks

```sql
-- Before: version not recorded; objects absent.
select version from supabase_migrations.schema_migrations where version = '20261021200000';
select to_regclass('public.capital_ledger_initializations');

-- After: objects present, browser roles have no access.
select version, name from supabase_migrations.schema_migrations where version = '20261021200000';
select grantee, string_agg(privilege_type, ',' order by privilege_type)
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'capital_ledger_initializations'
group by grantee;  -- expect service_role SELECT only
select proname, has_function_privilege('authenticated', oid, 'execute') as browser_exec
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('initialize_capital_ledger', 'canonical_capital_balance_summary');  -- expect false
select tgname from pg_trigger where tgname = 'profiles_initialize_capital_ledger';
```

## Post-deploy verification

- API `GET /v1/health` reports governed financial storage ready (it probes `capital_ledger_initializations`).
- With a disposable test account: complete onboarding → `GET /v1/capital-account/balances` returns `contract_version: 2`, `state: "ZERO"`, `reporting.total_minor: "0"`; Overview and Capital show `$0.00`.
- With an existing provisioned account (pre-backfill): `state: "NOT_INITIALIZED"`; the app shows "No balance recorded yet", not `$0.00`.
- Vercel runtime errors for `neptlium-api` and `neptlium-app`: none new.

## Backfill plan

**Scope.** Provisioned profiles without an initialization row. Accounts with capital ledger accounts are already reported from ledger evidence; including them is harmless (idempotent) and keeps the rule simple.

**1. Dry run (read-only).**

```sql
select count(*) as to_initialize
from public.profiles p
where p.provisioned_at is not null
  and not exists (select 1 from public.capital_ledger_initializations i where i.owner_id = p.id);

-- Confirm the zero claim the backfill will enable: expect 0 for the batch.
select count(*) as postings_for_candidates
from public.ledger_postings lp
join public.ledger_accounts a on a.id = lp.account_id
join public.profiles p on p.id = a.owner_id
where p.provisioned_at is not null;
```

Record both numbers. On 2026-10-21 they were 11 and 0.

**2. Execute in bounded batches**, one transaction per batch, as the database owner role through an approved channel:

```sql
begin;
select public.initialize_capital_ledger(p.id, 'BACKFILL')
from public.profiles p
where p.provisioned_at is not null
  and not exists (select 1 from public.capital_ledger_initializations i where i.owner_id = p.id)
order by p.id
limit 500;
-- Verify inside the transaction before committing:
select count(*) from public.capital_ledger_initializations where source = 'BACKFILL';
commit;
```

Repeat until the dry-run count is 0. At the current size this is a single batch.

**3. Reconcile.**

```sql
-- Every provisioned profile is initialized.
select count(*) as uninitialized_provisioned
from public.profiles p
where p.provisioned_at is not null
  and not exists (select 1 from public.capital_ledger_initializations i where i.owner_id = p.id);  -- expect 0

-- Initialization never precedes onboarding, and sources are as expected.
select source, count(*) from public.capital_ledger_initializations group by 1;

-- Balance states now visible to customers (expect ZERO for every provisioned account today).
select count(*) filter (where (public.canonical_capital_balance_summary(p.id) -> 'balances') = '[]'::jsonb) as zero_without_postings
from public.profiles p where p.provisioned_at is not null;
```

**Failure recovery.**

- A failed batch rolls back as a unit; re-running is safe because initialization is idempotent.
- Initialization rows are append-only facts; the service role cannot delete them. If a backfill must be withdrawn (for example, a candidate later proves to have unrecorded ledger history), remove the specific `BACKFILL` rows as the database owner under a recorded, approved incident change. Customers then return to "No balance recorded yet" — never to a fabricated amount.
- Never backfill an account whose ledger evidence is incomplete or under reconciliation; exclude it explicitly and record why.

## Rollback

- App/API: redeploy the previous production deployment from Vercel. A version 1 app given a version 2 response remains safe; a version 2 app given a version 1 response treats `EMPTY` as not initialized.
- Database: objects are additive. Dropping the trigger stops new initializations; the table and functions can remain unused. Do not delete initialization rows outside the recovery procedure above.
