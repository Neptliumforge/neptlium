-- Issue #109: contain browser write authority on public.profiles.
--
-- profiles carries server-owned account authority (compliance_status,
-- provisioned_at, organization_id) that API authorization and the treasury
-- actor check read. The historical owner UPDATE/INSERT policies together with
-- the table-wide grants let a customer rewrite those columns directly through
-- the Data API, including reinstating a suspended or revoked account.
--
-- Profile writes are owned by the service-role API and by the security-definer
-- provisioning functions (handle_new_user, provision_account,
-- complete_account_onboarding), none of which depend on browser-role grants.
-- Browser roles keep an owner-scoped read projection only.

drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

revoke all privileges on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
