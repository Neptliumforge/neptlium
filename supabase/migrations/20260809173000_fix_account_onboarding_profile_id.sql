-- Resolve profile_id ambiguity caused by the RETURNS TABLE output variable.
-- Preserve the existing service-role-only onboarding security boundary.

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
  v_portfolio_id uuid;
  given_name text := trim(onboarding_payload ->> 'firstName');
  family_name text := trim(onboarding_payload ->> 'lastName');
  country_name text := trim(onboarding_payload ->> 'country');
  investor_kind text := onboarding_payload ->> 'investorType';
  organization_name text := nullif(trim(onboarding_payload ->> 'organizationName'), '');
begin
  if target_user_id is null
     or not exists (
       select 1
       from auth.users
       where id = target_user_id
     ) then
    raise exception 'invalid authenticated user';
  end if;

  if coalesce(length(given_name), 0) not between 1 and 100
     or coalesce(length(family_name), 0) not between 1 and 100
     or coalesce(length(country_name), 0) not between 1 and 100
     or investor_kind not in (
       'individual',
       'business',
       'family_office',
       'treasury_team',
       'investment_firm'
     )
     or onboarding_payload ->> 'acceptedTerms' <> 'true' then
    raise exception 'invalid onboarding payload';
  end if;

  insert into public.profiles (id, email)
  select u.id, u.email
  from auth.users as u
  where u.id = target_user_id
  on conflict (id) do nothing;

  select p.organization_id
  into v_organization_id
  from public.profiles as p
  where p.id = target_user_id
  for update;

  if organization_name is not null
     and v_organization_id is null then
    insert into public.organizations (
      owner_id,
      name,
      role,
      website,
      country
    )
    values (
      target_user_id,
      left(organization_name, 200),
      nullif(left(trim(onboarding_payload ->> 'companyRole'), 120), ''),
      nullif(left(trim(onboarding_payload ->> 'website'), 2048), ''),
      country_name
    )
    returning organizations.id into v_organization_id;
  end if;

  update public.profiles as p
  set
    first_name = given_name,
    last_name = family_name,
    full_name = given_name || ' ' || family_name,
    country = country_name,
    investor_type = investor_kind,
    purpose = replace(investor_kind, '_', ' '),
    organization_id = v_organization_id,
    compliance_status = 'pending',
    compliance_acknowledged_at = now(),
    provisioned_at = now()
  where p.id = target_user_id;

  insert into public.user_roles (user_id, role)
  values (target_user_id, 'user')
  on conflict do nothing;

  insert into public.investment_portfolios (profile_id)
  values (target_user_id)
  on conflict on constraint investment_portfolios_profile_id_key
  do update
    set profile_id = excluded.profile_id
  returning investment_portfolios.id into v_portfolio_id;

  if not exists (
    select 1
    from public.wallets as w
    where w.profile_id = target_user_id
  ) then
    insert into public.wallets (
      portfolio_id,
      profile_id,
      provider
    )
    values (
      v_portfolio_id,
      target_user_id,
      'internal'
    );
  end if;

  delete from public.onboarding_drafts as d
  where d.user_id = target_user_id;

  return query
  select target_user_id;
end;
$$;

revoke all on function public.complete_account_onboarding(uuid, jsonb)
from public, anon, authenticated;

grant execute on function public.complete_account_onboarding(uuid, jsonb)
to service_role;
