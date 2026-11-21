\set ON_ERROR_STOP on
begin;
set local statement_timeout = '15s';
do $$
begin
  if exists (select 1 from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r','p','v','m')) then
    raise exception 'Gate 02E requires an empty isolated database';
  end if;
end $$;
create table public.profiles (id uuid primary key, created_at timestamptz);
create table public.organizations (id uuid primary key);
create table public.ledger_accounts (id uuid primary key, asset text, network text);
create table public.ledger_journals (id uuid primary key, posted_at timestamptz);
insert into auth.users (id) values ('00000000-0000-4000-8000-000000000021');
insert into public.profiles (id) values ('00000000-0000-4000-8000-000000000021');
\ir ../migrations/20260825051902_identity_principal_provider_subject_foundation.sql
\ir ../migrations/20260914174500_platform_core_owner_control_plane.sql
do $$
declare
  principal constant uuid := '00000000-0000-4000-8000-000000000021';
  tenant constant uuid := '00000000-0000-4000-8000-000000000022';
  other_tenant constant uuid := '00000000-0000-4000-8000-000000000023';
begin
  if not exists (select from public.identity_principals where id = principal and status = 'ACTIVE') then
    raise exception 'principal backfill changed the preserved UUID';
  end if;
  insert into public.organizations (id) values (tenant), (other_tenant);
  insert into public.identity_provider_subjects (principal_id, provider, provider_subject)
    values (principal, 'CLERK', 'user_gate02e_fixture') on conflict (provider, provider_subject) do nothing;
  insert into public.identity_provider_subjects (principal_id, provider, provider_subject)
    values (principal, 'CLERK', 'user_gate02e_fixture') on conflict (provider, provider_subject) do nothing;
  if (select count(*) from public.identity_provider_subjects where principal_id = principal and provider = 'CLERK') <> 1 then
    raise exception 'subject replay is not unique';
  end if;

  insert into public.organization_memberships (organization_id, user_id, role) values (tenant, principal, 'viewer');
  if exists (select from public.organization_memberships where organization_id = other_tenant and user_id = principal) then
    raise exception 'fixture gained unexpected tenant membership';
  end if;
  begin
    insert into public.organization_memberships (organization_id, user_id, role, status)
      values (other_tenant, principal, 'viewer', 'revoked');
    raise exception 'membership constraint allowed revocation without a timestamp';
  exception when check_violation then null;
  end;

  if exists (
    select from pg_class where oid in ('public.identity_principals'::regclass, 'public.identity_provider_subjects'::regclass, 'public.organization_memberships'::regclass, 'public.platform_audit_events'::regclass)
      and not relrowsecurity
  ) or has_table_privilege('anon','public.identity_provider_subjects','SELECT')
    or has_table_privilege('authenticated','public.organization_memberships','SELECT')
    or not has_table_privilege('service_role','public.organization_memberships','SELECT') then
    raise exception 'unexpected RLS or role grants';
  end if;

  insert into public.platform_owners (id, owner_type, individual_user_id)
    values (principal, 'individual', principal);
  insert into public.ledger_accounts (id, platform_owner_id) values (principal, principal);
  begin
    insert into public.ledger_accounts (id, platform_owner_id) values (gen_random_uuid(), other_tenant);
    raise exception 'ledger account accepted orphan owner';
  exception when foreign_key_violation then null;
  end;

  if not exists (select from public.ledger_accounts where id = principal and platform_owner_id = principal) then
    raise exception 'ledger owner changed';
  end if;
end $$;
rollback;
select to_regclass('public.identity_principals') is null
   and not exists (select from auth.users where id = '00000000-0000-4000-8000-000000000021') as fixture_rolled_back;
