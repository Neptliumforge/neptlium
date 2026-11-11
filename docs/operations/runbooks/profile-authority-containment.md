# Runbook: profile authority containment (issue #109, PR #134)

Applies `20261021190000_contain_profile_browser_write_authority.sql` and `20261021191000_onboarding_preserves_account_standing.sql` to production project `ayrgojoiprxyijeshika`.

**Authorization:** this runbook is executed only with explicit owner approval for the production migration and for merging PR #134. Nothing in it is authorized by the PR itself.

## What changes

| Object | Before | After |
| --- | --- | --- |
| `public.profiles` grants | `anon`, `authenticated`: ALL | `authenticated`: SELECT only; `anon`: none |
| `public.profiles` policies | 3 SELECT/UPDATE/INSERT owner policies + 2 SELECT | 2 owner SELECT policies |
| `complete_account_onboarding` | always sets `compliance_status = 'pending'`, `provisioned_at = now()` | already provisioned → unchanged (idempotent); fills a missing status only |

No data is changed. No application deploy is required: the application, API and admin never write `profiles` with a browser role.

## Verified state (2026-10-21, read-only)

- Production grants/policies match the tracked pre-containment state; no schema drift (47/47 migrations).
- Production `complete_account_onboarding` source hash `056422d25541e0386c37731d17922a2f` equals the tracked definition the migration replaces.
- Both reinstatement paths reproduce on an unpatched Supabase preview (`knbezrhecjhqyojyippj`) and are closed on the patched preview (`fpahwpfwncxqssnyaasa`); signup, first onboarding and service-role operator updates still work there.
- 19 profiles; 0 suspended or revoked; 3 `active` (none with a staff role). `api_audit_events` (the admin audit sink) does not exist, so how the 3 accounts became `active` cannot be reconstructed from audit data.

## Release mechanism

The production Supabase branch is linked to git `main`. Whether the GitHub integration applies migrations on merge is **not verifiable through the connected tools**; recent production migrations show both owner-applied (`created_by` set) and tool-applied (`created_by` null) records. To remove that uncertainty:

1. Apply the two migrations to production first, as an owner-approved operation, recording them under their tracked versions (Supabase CLI `supabase db push` from the merged-equivalent branch head, or the dashboard/MCP `apply_migration` with the exact version names).
2. Then merge PR #134. If the integration deploys on merge, it finds both versions already recorded and applies nothing.

Merging #134 changes only `supabase/`, `.github/workflows/ci.yml`, tests and docs. Per the projects' `ignoreCommand` settings it does not rebuild `neptlium-app`, `neptlium-api` or `neptlium-admin`.

## Pre-deployment checks (read-only)

```sql
-- 1. Exact pre-state: expect anon/authenticated ALL, five policies.
select grantee, string_agg(privilege_type, ',' order by privilege_type)
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'profiles' and grantee in ('anon', 'authenticated')
group by grantee;
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'profiles' order by 1;

-- 2. Function to be replaced is the tracked one.
select md5(prosrc) from pg_proc
where proname = 'complete_account_onboarding' and pronamespace = 'public'::regnamespace;
-- expect 056422d25541e0386c37731d17922a2f

-- 3. Neither version is already recorded.
select version from supabase_migrations.schema_migrations
where version in ('20261021190000', '20261021191000');

-- 4. Account standing snapshot (counts only) for post-deploy comparison.
select compliance_status, count(*) from public.profiles group by 1 order by 1;
```

Stop if any result differs from expectation.

## Post-deployment verification (read-only)

```sql
-- Browser roles: authenticated SELECT only, anon nothing.
select grantee, string_agg(privilege_type, ',' order by privilege_type)
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'profiles' and grantee in ('anon', 'authenticated')
group by grantee;
-- Only owner SELECT policies remain.
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'profiles' order by 1;
-- Onboarding guard present.
select prosrc ~ 'if v_provisioned_at is not null then' from pg_proc
where proname = 'complete_account_onboarding' and pronamespace = 'public'::regnamespace;
-- Both versions recorded.
select version, name from supabase_migrations.schema_migrations
where version in ('20261021190000', '20261021191000');
-- Standing unchanged versus the pre-deployment snapshot.
select compliance_status, count(*) from public.profiles group by 1 order by 1;
```

Then a functional smoke test with a disposable test account: sign up, complete onboarding, open the dashboard and Settings → Profile (reads must work), and confirm the profile edit path through the API still saves.

Run `get_advisors` (security) and confirm no new findings for `profiles`.

## Rollback and compensation

- The migrations change grants, policies and one function; they do not change rows. There is nothing to restore.
- Restoring the previous grants or policies would reintroduce the vulnerability. If a legitimate path breaks, prefer a targeted forward fix (for example a narrowly scoped `security definer` command) over re-granting.
- If an emergency revert of the onboarding function is unavoidable, re-apply the tracked definition from migration version `20260825053749` in a new forward migration and record why. Do not edit applied migrations.

## Follow-ups outside this release

- `api_audit_events` is written by the API for every admin action but no migration creates it; admin status changes are applied before the audit write. Needs a reviewed migration and an ordering fix.
- Review the 3 `active` accounts with the account owner/operator and record the outcome.
- Schema-wide default privileges grant browser roles ALL (including `TRUNCATE`, which bypasses RLS) on new tables; tighten with a reviewed migration.
