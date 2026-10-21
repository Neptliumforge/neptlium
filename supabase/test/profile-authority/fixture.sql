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
