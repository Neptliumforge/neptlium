-- Gate 01C FORWARD-ONLY PROPOSAL. Do not apply remotely or move into migrations without approval.
-- Requires PR #134 cc1967079690b74ee41bcbf98786314f44022ecb and
-- PR #137 4d35629ce766ba21315c7ef3d2d08b6e78138245 first.
-- Validated only with synthetic data in disposable PostgreSQL. No production activation.
begin;
-- Issue #109: onboarding must not change account standing.
--
-- complete_account_onboarding (last defined in
-- migration version 20260825053749) unconditionally set
-- compliance_status = 'pending' and provisioned_at = now(). The customer can
-- call it through POST /v1/account/onboarding at any time, so a suspended or
-- revoked customer could resubmit onboarding and reset their own standing.
--
-- Onboarding is now a one-time transition: an already provisioned profile is
-- returned unchanged (an idempotent replay), and onboarding never writes
-- compliance_status except to fill a missing value with the column default.
-- Operator status changes remain the only path that changes account standing.

create or replace function public.complete_account_onboarding(
  target_user_id uuid,
  onboarding_payload jsonb
)
returns table (profile_id uuid)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_organization_id uuid;
  v_provisioned_at timestamptz;
  given_name text := trim(onboarding_payload ->> 'firstName');
  family_name text := trim(onboarding_payload ->> 'lastName');
  country_name text := trim(onboarding_payload ->> 'country');
  investor_kind text := onboarding_payload ->> 'investorType';
  organization_name text := nullif(trim(onboarding_payload ->> 'organizationName'), '');
begin
  if target_user_id is null or not exists (
    select 1 from public.identity_principals p
    join public.profiles profile on profile.id = p.id
    where p.id = target_user_id and p.status = 'ACTIVE'
  ) then
    raise exception 'invalid authenticated principal';
  end if;
  if coalesce(length(given_name), 0) not between 1 and 100
     or coalesce(length(family_name), 0) not between 1 and 100
     or coalesce(length(country_name), 0) not between 1 and 100
     or investor_kind is null
     or investor_kind not in ('individual','business','family_office','treasury_team','investment_firm')
     or onboarding_payload -> 'acceptedTerms' is distinct from 'true'::jsonb then
    raise exception 'invalid onboarding payload';
  end if;

  select p.organization_id, p.provisioned_at into v_organization_id, v_provisioned_at
  from public.profiles p where p.id = target_user_id for update;

  if v_provisioned_at is not null then
    return query select target_user_id;
    return;
  end if;

  if organization_name is not null and v_organization_id is null then
    insert into public.organizations (owner_id, name, role, website, country)
    values (
      target_user_id,
      left(organization_name, 200),
      nullif(left(trim(onboarding_payload ->> 'companyRole'), 120), ''),
      nullif(left(trim(onboarding_payload ->> 'website'), 2048), ''),
      country_name
    ) returning id into v_organization_id;
  end if;

  update public.profiles p set
    first_name = given_name,
    last_name = family_name,
    full_name = given_name || ' ' || family_name,
    country = country_name,
    investor_type = investor_kind,
    purpose = replace(investor_kind, '_', ' '),
    organization_id = v_organization_id,
    compliance_status = coalesce(p.compliance_status, 'pending'),
    compliance_acknowledged_at = now(),
    provisioned_at = now()
  where p.id = target_user_id;

  delete from public.onboarding_drafts d where d.user_id = target_user_id;
  return query select target_user_id;
end
$$;

revoke all on function public.complete_account_onboarding(uuid, jsonb)
from public, anon, authenticated;
grant execute on function public.complete_account_onboarding(uuid, jsonb)
to service_role;

-- A read-only initialization projection must not inherit REFERENCES/TRIGGER from default grants.
revoke all on public.capital_ledger_initializations from public,anon,authenticated,service_role;
grant select on public.capital_ledger_initializations to service_role;
revoke all on function public.initialize_capital_ledger_on_provisioning() from public,anon,authenticated,service_role;
alter function public.complete_account_onboarding(uuid,jsonb) owner to postgres;
alter function public.initialize_capital_ledger(uuid,text) owner to postgres;
alter function public.initialize_capital_ledger_on_provisioning() owner to postgres;
alter function public.canonical_capital_balance_summary(uuid) owner to postgres;
commit;
