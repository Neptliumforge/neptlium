-- Pre-containment public.profiles authority, reproduced from tracked history:
-- table, constraints, policies and grants from 20260710104755_remote_schema.sql,
-- authority columns from 20260710120000/20260712010000/20260712030000, and the
-- provision_account body from 20260809040703. Production grants and policies
-- were verified read-only to match this state on 2026-10-21.
--
-- Run against a disposable PostgreSQL database only.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end
$$;

create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text,
  created_at timestamptz default now() not null,
  user_id uuid,
  display_name text,
  avatar_url text,
  tier text default 'private'
);
alter table only public.profiles add constraint profiles_pkey primary key (id);
alter table only public.profiles add constraint profiles_user_id_key unique (user_id);
alter table only public.profiles add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;

create policy "Users can insert own profile" on public.profiles for insert with check ((auth.uid() = user_id));
create policy "Users can update own profile" on public.profiles for update using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));
create policy "Users can view own profile" on public.profiles for select using ((auth.uid() = user_id));
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using ((auth.uid() = id));
create policy "profiles_update_own" on public.profiles for update using ((auth.uid() = id));

grant all on table public.profiles to anon;
grant all on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

alter table public.profiles
  add column if not exists investor_type text,
  add column if not exists purpose text,
  add column if not exists compliance_status text default 'pending',
  add column if not exists provisioned_at timestamptz,
  add column if not exists organization_id uuid,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists country text;

create or replace function public.provision_account(target_user_id uuid)
returns table (profile_id uuid)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if target_user_id is null or not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'invalid authenticated user';
  end if;

  insert into public.profiles (id, email, full_name)
  select u.id, u.email, nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), '')
  from auth.users as u where u.id = target_user_id
  on conflict (id) do nothing;

  return query select p.id from public.profiles as p where p.id = target_user_id;
end;
$$;

revoke all on function public.provision_account(uuid) from public, anon, authenticated;
grant execute on function public.provision_account(uuid) to service_role;

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'suspended@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'other@example.test'),
  ('33333333-3333-4333-8333-333333333333', 'new@example.test');
insert into public.profiles (id, email, user_id, compliance_status, provisioned_at) values
  ('11111111-1111-4111-8111-111111111111', 'suspended@example.test', '11111111-1111-4111-8111-111111111111', 'suspended', now()),
  ('22222222-2222-4222-8222-222222222222', 'other@example.test', '22222222-2222-4222-8222-222222222222', 'pending', null);

-- Onboarding dependencies (20260712010000, 20260716030000, 20260825051902,
-- 20260712000000) reduced to the columns complete_account_onboarding uses.
alter table public.profiles add column if not exists compliance_acknowledged_at timestamptz;
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text,
  website text,
  country text
);
create table public.onboarding_drafts (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.identity_principals (id uuid primary key, status text not null default 'ACTIVE');

-- complete_account_onboarding as last defined in tracked history
-- (20260825053749_clerk_application_identity_cutover.sql), verbatim.
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

insert into auth.users (id, email) values ('44444444-4444-4444-8444-444444444444', 'onboarding@example.test');
insert into public.profiles (id, email, user_id) values
  ('44444444-4444-4444-8444-444444444444', 'onboarding@example.test', '44444444-4444-4444-8444-444444444444');
insert into public.identity_principals (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222'),
  ('44444444-4444-4444-8444-444444444444');
