-- Clerk-only application identity cutover foundation.
--
-- Supabase remains the database authority. This migration does not create an
-- auth.users row, a wallet, a balance, a treasury destination, or any provider
-- resource. Existing internal UUID ownership is preserved. New Clerk subjects
-- receive a stable internal UUID through a service-only, idempotent command.

do $$
declare
  v_constraint record;
  v_definition text;
begin
  if to_regclass('public.identity_principals') is null
     or to_regclass('public.identity_provider_subjects') is null
     or to_regclass('public.identity_events') is null then
    raise exception 'Clerk cutover requires the provider-independent identity foundation';
  end if;

  -- Re-parent existing public ownership/actor foreign keys without changing
  -- their UUID values or delete actions. This removes auth.users as a required
  -- parent for new Clerk-only principals while retaining the canonical UUID.
  for v_constraint in
    select
      c.conrelid::regclass as relation_name,
      c.conname,
      pg_get_constraintdef(c.oid, true) as definition
    from pg_constraint c
    where c.contype = 'f'
      and c.confrelid = 'auth.users'::regclass
      and c.connamespace = 'public'::regnamespace
  loop
    v_definition := replace(
      v_constraint.definition,
      'REFERENCES auth.users(id)',
      'REFERENCES identity_principals(id)'
    );
    if v_definition = v_constraint.definition then
      raise exception 'Unrecognized auth.users foreign key definition: %.%',
        v_constraint.relation_name, v_constraint.conname;
    end if;
    execute format(
      'alter table %s drop constraint %I, add constraint %I %s',
      v_constraint.relation_name,
      v_constraint.conname,
      v_constraint.conname,
      v_definition
    );
  end loop;
end
$$;

create or replace function public.bootstrap_clerk_identity_principal(
  p_clerk_subject text,
  p_verified_email text,
  p_request_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_principal_id uuid;
  v_subject_id uuid;
  v_email text := lower(btrim(p_verified_email));
begin
  if p_clerk_subject is null
     or p_clerk_subject <> btrim(p_clerk_subject)
     or length(p_clerk_subject) not between 1 and 255 then
    raise exception 'invalid Clerk subject';
  end if;
  if v_email is null
     or length(v_email) not between 3 and 320
     or position('@' in v_email) < 2 then
    raise exception 'a verified primary email is required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('clerk-bootstrap:' || p_clerk_subject, 0));

  select s.principal_id, s.id
  into v_principal_id, v_subject_id
  from public.identity_provider_subjects s
  join public.identity_principals p on p.id = s.principal_id
  where s.provider = 'CLERK'
    and s.provider_subject = p_clerk_subject
    and s.status = 'ACTIVE'
    and p.status = 'ACTIVE';

  if v_principal_id is not null then
    return jsonb_build_object(
      'status', 'existing',
      'profile_id', v_principal_id,
      'provider_subject_id', v_subject_id
    );
  end if;

  v_principal_id := gen_random_uuid();
  insert into public.identity_principals (id) values (v_principal_id);

  insert into public.identity_provider_subjects (
    principal_id, provider, provider_subject
  ) values (
    v_principal_id, 'CLERK', p_clerk_subject
  ) returning id into v_subject_id;

  insert into public.profiles (id, user_id, email)
  values (v_principal_id, v_principal_id, v_email);

  insert into public.user_roles (user_id, role)
  values (v_principal_id, 'user')
  on conflict do nothing;

  insert into public.identity_events (
    principal_id, operation, request_id, idempotency_key, metadata
  ) values (
    v_principal_id,
    'principal.created',
    nullif(btrim(p_request_id), ''),
    'clerk-bootstrap:principal:' || p_clerk_subject,
    jsonb_build_object('source', 'clerk_authenticated_bootstrap')
  );

  insert into public.identity_events (
    principal_id, provider_subject_id, operation, request_id,
    idempotency_key, metadata
  ) values (
    v_principal_id,
    v_subject_id,
    'provider_subject.linked',
    nullif(btrim(p_request_id), ''),
    'clerk-bootstrap:subject:' || p_clerk_subject,
    jsonb_build_object('provider', 'CLERK', 'source', 'clerk_authenticated_bootstrap')
  );

  return jsonb_build_object(
    'status', 'created',
    'profile_id', v_principal_id,
    'provider_subject_id', v_subject_id
  );
end
$$;

revoke all on function public.bootstrap_clerk_identity_principal(text, text, text)
from public, anon, authenticated;
grant execute on function public.bootstrap_clerk_identity_principal(text, text, text)
to service_role;

-- Resolve the current Clerk JWT subject to its internal UUID before privileged
-- treasury authorization. Caller-provided UUIDs are never identity authority.
create or replace function public.current_clerk_principal_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select s.principal_id
  from public.identity_provider_subjects s
  join public.identity_principals p on p.id = s.principal_id
  where s.provider = 'CLERK'
    and s.provider_subject = auth.jwt() ->> 'sub'
    and s.status = 'ACTIVE'
    and p.status = 'ACTIVE'
  limit 1
$$;

revoke all on function public.current_clerk_principal_id()
from public, anon, authenticated, service_role;
grant execute on function public.current_clerk_principal_id() to authenticated;

create or replace function public.assert_treasury_super_admin(p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_principal_id uuid := public.current_clerk_principal_id();
begin
  if v_principal_id is null or v_principal_id is distinct from p_actor_id then
    raise exception 'treasury command actor does not match authenticated principal';
  end if;
  if not exists (
    select 1 from public.user_roles r
    where r.user_id = v_principal_id and r.role = 'super_admin'
  ) then
    raise exception 'treasury command requires super_admin';
  end if;
  if exists (
    select 1 from public.profiles p
    where p.id = v_principal_id and p.compliance_status in ('suspended','revoked')
  ) then
    raise exception 'treasury command actor is inactive';
  end if;
end
$$;

revoke all on function public.assert_treasury_super_admin(uuid)
from public, anon, service_role;
grant execute on function public.assert_treasury_super_admin(uuid) to authenticated;

-- The dual-session linking command belongs to the preceding controlled bridge.
-- Once this cutover migration lands, customer Supabase sessions can no longer
-- invoke it; lifecycle synchronization remains server-controlled.
revoke execute on function public.link_clerk_identity_subject(text, text, text)
from authenticated;

-- Onboarding now accepts only an existing active internal principal/profile.
-- It intentionally does not create the superseded per-customer wallet model.
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
     or investor_kind not in ('individual','business','family_office','treasury_team','investment_firm')
     or onboarding_payload ->> 'acceptedTerms' <> 'true' then
    raise exception 'invalid onboarding payload';
  end if;

  select p.organization_id into v_organization_id
  from public.profiles p where p.id = target_user_id for update;

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
    compliance_status = 'pending',
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
