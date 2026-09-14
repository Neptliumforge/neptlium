begin;

-- Supabase Auth creates identity/profile state only. Authentication must never
-- manufacture portfolio, subscription, balance, ledger, or transaction truth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.identity_principals (id, status)
  values (new.id, 'ACTIVE')
  on conflict (id) do nothing;

  insert into public.identity_provider_subjects (
    principal_id,
    provider,
    provider_subject,
    status
  )
  values (new.id, 'SUPABASE_AUTH', new.id::text, 'ACTIVE')
  on conflict (provider, provider_subject) do update
    set principal_id = excluded.principal_id,
        status = 'ACTIVE',
        revoked_at = null;

  insert into public.profiles (id, email, full_name, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (id) do update
    set email = coalesce(excluded.email, profiles.email),
        first_name = coalesce(excluded.first_name, profiles.first_name),
        last_name = coalesce(excluded.last_name, profiles.last_name),
        full_name = case
          when profiles.full_name is null or profiles.full_name = '' then excluded.full_name
          else profiles.full_name
        end;

  return new;
end
$$;

create or replace function public.current_authenticated_principal_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select ips.principal_id
  from public.identity_provider_subjects ips
  join public.identity_principals p on p.id = ips.principal_id
  where ips.provider = 'SUPABASE_AUTH'
    and ips.provider_subject = (select auth.uid())::text
    and ips.status = 'ACTIVE'
    and p.status = 'ACTIVE'
  limit 1
$$;

revoke all on function public.current_authenticated_principal_id() from public, anon;
grant execute on function public.current_authenticated_principal_id() to authenticated, service_role;

create or replace function public.assert_treasury_super_admin(p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_principal_id uuid := public.current_authenticated_principal_id();
begin
  if v_principal_id is null or v_principal_id is distinct from p_actor_id then
    raise exception 'treasury command actor does not match authenticated principal';
  end if;

  if not exists (
    select 1
    from public.user_roles r
    where r.user_id = v_principal_id
      and r.role = 'super_admin'
  ) then
    raise exception 'treasury command requires super_admin';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.id = v_principal_id
      and p.compliance_status in ('suspended', 'revoked')
  ) then
    raise exception 'treasury command actor is inactive';
  end if;
end
$$;

-- Preserve external-identity rows as historical evidence, but remove them from
-- active runtime authority.
update public.identity_provider_subjects
set status = 'REVOKED',
    revoked_at = coalesce(revoked_at, now())
where provider = 'CLERK'
  and status = 'ACTIVE';

drop function if exists public.bootstrap_clerk_identity_principal(text, text, text);
drop function if exists public.link_clerk_identity_subject(text, text, text);
drop function if exists public.link_clerk_identity_subject_service(text, text, text, text);
drop function if exists public.sync_clerk_identity_lifecycle(text, text, text, text);
drop function if exists public.current_clerk_principal_id();

commit;
