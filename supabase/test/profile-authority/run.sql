-- Database-level authorization test for issue #109.
-- Usage (disposable database only):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/test/profile-authority/run.sql
-- Proves the exposure on the pre-containment state, applies the tracked
-- forward migration, then proves containment and preserved legitimate paths.

\set ON_ERROR_STOP on
\ir fixture.sql

-- Runs one statement as a browser or service role inside a subtransaction that
-- is always rolled back. Returns 'denied' or 'ok:<rows>'.
create function pg_temp.attempt(p_role text, p_subject text, p_sql text)
returns text
language plpgsql
as $$
declare
  affected bigint;
begin
  begin
    perform set_config('request.jwt.claim.sub', coalesce(p_subject, ''), true);
    perform set_config('role', p_role, true);
    execute p_sql;
    get diagnostics affected = row_count;
    raise exception using errcode = 'P0001', message = 'attempt:ok:' || affected;
  exception
    when insufficient_privilege then
      return 'denied';
    when raise_exception then
      if sqlerrm like 'attempt:ok:%' then
        return substr(sqlerrm, 9);
      end if;
      raise;
  end;
end;
$$;

create function pg_temp.expect(label text, actual text, expected text)
returns void
language plpgsql
as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL %: expected %, got %', label, expected, actual;
  end if;
  raise notice 'PASS %', label;
end;
$$;

-- Pre-containment: the historical grants and policies permit the exposure.
select pg_temp.expect('before: suspended customer can self-reinstate',
  pg_temp.attempt('authenticated', '11111111-1111-4111-8111-111111111111',
    $q$update public.profiles set compliance_status = 'active' where id = auth.uid()$q$),
  'ok:1');

\ir ../../migrations/20261021190000_contain_profile_browser_write_authority.sql

-- Suspended-account self-reinstatement and other authority rewrites.
select pg_temp.expect('suspended customer cannot self-reinstate',
  pg_temp.attempt('authenticated', '11111111-1111-4111-8111-111111111111',
    $q$update public.profiles set compliance_status = 'active' where id = auth.uid()$q$),
  'denied');
select pg_temp.expect('customer cannot rewrite provisioned_at',
  pg_temp.attempt('authenticated', '22222222-2222-4222-8222-222222222222',
    $q$update public.profiles set provisioned_at = now() where id = auth.uid()$q$),
  'denied');
select pg_temp.expect('customer cannot rewrite organization_id',
  pg_temp.attempt('authenticated', '22222222-2222-4222-8222-222222222222',
    $q$update public.profiles set organization_id = gen_random_uuid() where id = auth.uid()$q$),
  'denied');
select pg_temp.expect('customer cannot edit profile fields directly (API owns edits)',
  pg_temp.attempt('authenticated', '22222222-2222-4222-8222-222222222222',
    $q$update public.profiles set first_name = 'X' where id = auth.uid()$q$),
  'denied');
select pg_temp.expect('customer cannot insert a self-chosen compliance state',
  pg_temp.attempt('authenticated', '33333333-3333-4333-8333-333333333333',
    $q$insert into public.profiles (id, email, user_id, compliance_status)
       values (auth.uid(), 'new@example.test', auth.uid(), 'active')$q$),
  'denied');
select pg_temp.expect('customer cannot delete own profile',
  pg_temp.attempt('authenticated', '22222222-2222-4222-8222-222222222222',
    $q$delete from public.profiles where id = auth.uid()$q$),
  'denied');
select pg_temp.expect('authenticated cannot truncate profiles',
  pg_temp.attempt('authenticated', '22222222-2222-4222-8222-222222222222',
    $q$truncate public.profiles$q$),
  'denied');
select pg_temp.expect('anon cannot update profiles',
  pg_temp.attempt('anon', null,
    $q$update public.profiles set compliance_status = 'active'$q$),
  'denied');

-- Authorized reads are preserved and remain owner-scoped.
select pg_temp.expect('owner reads own profile',
  pg_temp.attempt('authenticated', '11111111-1111-4111-8111-111111111111',
    $q$select 1 from public.profiles where id = auth.uid()$q$),
  'ok:1');
select pg_temp.expect('owner cannot read another profile',
  pg_temp.attempt('authenticated', '11111111-1111-4111-8111-111111111111',
    $q$select 1 from public.profiles where id = '22222222-2222-4222-8222-222222222222'$q$),
  'ok:0');
select pg_temp.expect('anon has no profile read',
  pg_temp.attempt('anon', null, $q$select 1 from public.profiles$q$),
  'denied');

-- Legitimate server paths are preserved.
select pg_temp.expect('service role operator can change compliance status',
  pg_temp.attempt('service_role', null,
    $q$update public.profiles set compliance_status = 'active'
       where id = '11111111-1111-4111-8111-111111111111'$q$),
  'ok:1');
select pg_temp.expect('service role API can edit profile fields',
  pg_temp.attempt('service_role', null,
    $q$update public.profiles set first_name = 'Ada'
       where id = '22222222-2222-4222-8222-222222222222'$q$),
  'ok:1');
select pg_temp.expect('security-definer provisioning still creates profiles',
  pg_temp.attempt('service_role', null,
    $q$select * from public.provision_account('33333333-3333-4333-8333-333333333333')$q$),
  'ok:1');

-- Durable state was never changed by the denied attempts.
select pg_temp.expect('suspended status unchanged',
  (select compliance_status from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'suspended');
select pg_temp.expect('only owner SELECT policies remain',
  (select string_agg(policyname || ':' || cmd, ',' order by policyname)
     from pg_policies where schemaname = 'public' and tablename = 'profiles'),
  'Users can view own profile:SELECT,profiles_select_own:SELECT');
select pg_temp.expect('browser roles hold no profile write privilege',
  (select count(*)::text from information_schema.role_table_grants
     where table_schema = 'public' and table_name = 'profiles'
       and grantee in ('anon', 'authenticated') and privilege_type <> 'SELECT'),
  '0');
