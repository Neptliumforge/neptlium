-- Service-role-only, idempotent minimum account provisioning. This migration is
-- committed for review and must not be applied to production without approval.
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
