-- Database-level test for the canonical balances contract
-- (docs/financial/CANONICAL_BALANCES.md). Disposable database only:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/test/canonical-balances/run.sql

\set ON_ERROR_STOP on

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end
$$;

create schema auth;
create table auth.users (id uuid primary key);
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

-- profiles reduced to the columns the trigger reads.
create table public.profiles (id uuid primary key references auth.users(id), provisioned_at timestamptz);

-- Ledger tables verbatim from 20260811161123_production_funding_treasury_transfer_foundation.sql.
create table public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete restrict,
  account_code text not null,
  asset text not null,
  network text,
  account_class text not null check (account_class in ('asset','liability','equity','income','expense','contra')),
  created_at timestamptz not null default now()
);
create unique index ledger_accounts_identity_unique
  on public.ledger_accounts(owner_id, account_code, asset, coalesce(network, '')) nulls not distinct;
create table public.ledger_journals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete restrict,
  source_type text not null,
  source_id uuid not null,
  reversal_of uuid references public.ledger_journals(id) on delete restrict,
  posted_at timestamptz not null default now(),
  request_id text not null,
  unique(source_type, source_id)
);
create table public.ledger_postings (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.ledger_journals(id) on delete restrict,
  account_id uuid not null references public.ledger_accounts(id) on delete restrict,
  direction text not null check (direction in ('debit','credit')),
  amount_atomic numeric(78,0) not null check (amount_atomic > 0),
  asset text not null,
  created_at timestamptz not null default now()
);

-- Production default privileges in schema public (verified read-only): new
-- tables and functions are granted to browser roles unless revoked.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

\ir ../../migrations/20261021200000_canonical_capital_ledger_initialization.sql

create function pg_temp.expect(label text, actual text, expected text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL %: expected %, got %', label, expected, actual;
  end if;
  raise notice 'PASS %', label;
end;
$$;

create function pg_temp.summary(p_owner uuid) returns jsonb language sql as $$
  select public.canonical_capital_balance_summary(p_owner)
$$;

create function pg_temp.post(p_owner uuid, p_code text, p_asset text, p_network text, p_direction text, p_amount numeric)
returns void language plpgsql as $$
declare
  v_account uuid;
  v_journal uuid;
begin
  insert into public.ledger_accounts (owner_id, account_code, asset, network, account_class)
  values (p_owner, p_code, p_asset, p_network, 'liability')
  on conflict do nothing;
  select id into v_account from public.ledger_accounts
  where owner_id = p_owner and account_code = p_code and asset = p_asset and coalesce(network, '') = coalesce(p_network, '');
  insert into public.ledger_journals (owner_id, source_type, source_id, request_id)
  values (p_owner, 'test', gen_random_uuid(), 'test') returning id into v_journal;
  insert into public.ledger_postings (journal_id, account_id, direction, amount_atomic, asset)
  values (v_journal, v_account, p_direction, p_amount, p_asset);
end;
$$;

insert into auth.users values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd');

-- Initialization semantics.
insert into public.profiles (id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
select pg_temp.expect('unprovisioned account is not initialized',
  pg_temp.summary('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')::text,
  '{"balances": [], "initialized_at": null}');

update public.profiles set provisioned_at = now() where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select pg_temp.expect('provisioning initializes the capital ledger once, from onboarding',
  (select count(*) || ':' || min(source) from public.capital_ledger_initializations
     where owner_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  '1:ONBOARDING');
select pg_temp.expect('initialized account with no postings has an empty, initialized summary',
  (pg_temp.summary('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') ->> 'initialized_at') is not null
    || ':' || (pg_temp.summary('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') -> 'balances')::text,
  'true:[]');

create temp table first_init as
  select initialized_at from public.capital_ledger_initializations where owner_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
update public.profiles set provisioned_at = now() + interval '1 day' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select public.initialize_capital_ledger('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'BACKFILL');
select pg_temp.expect('re-provisioning and backfill are idempotent and keep the original initialization',
  (select count(*) || ':' || min(source) || ':' || bool_and(i.initialized_at = f.initialized_at)
     from public.capital_ledger_initializations i, first_init f
     where i.owner_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  '1:ONBOARDING:true');

insert into public.profiles (id, provisioned_at) values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', now());
select pg_temp.expect('a profile inserted already provisioned is initialized',
  (select count(*)::text from public.capital_ledger_initializations where owner_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
  '1');

-- Exact aggregation.
select pg_temp.post('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'capital:available', 'ETH', 'ETHEREUM', 'credit', 1000000000000000000000000000000);
select pg_temp.post('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'capital:available', 'ETH', 'ETHEREUM', 'credit', 1);
select pg_temp.expect('amounts beyond 2^53 and 10^21 are exact decimal strings',
  pg_temp.summary('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') -> 'balances' -> 0 ->> 'available_atomic',
  '1000000000000000000000000000001');

select pg_temp.post('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'capital:available', 'USDC', 'BASE', 'credit', 1000);
select pg_temp.post('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'capital:available', 'USDC', 'BASE', 'debit', 400);
select pg_temp.post('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'capital:reserved', 'USDC', 'BASE', 'credit', 400);
select pg_temp.expect('components are separated by capital account and netted by direction',
  (select string_agg(b ->> 'asset' || '/' || (b ->> 'available_atomic') || '/' || (b ->> 'reserved_atomic')
     || '/' || (b ->> 'pending_atomic') || '/' || (b ->> 'restricted_atomic'), ',')
   from jsonb_array_elements(pg_temp.summary('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') -> 'balances') b),
  'ETH/1000000000000000000000000000001/0/0/0,USDC/600/400/0/0');
select pg_temp.expect('ledger activity without an initialization row is still reported from the ledger',
  (pg_temp.summary('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') ->> 'initialized_at') is null
    || ':' || jsonb_array_length(pg_temp.summary('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') -> 'balances'),
  'true:2');

do $$
begin
  for i in 1..3000 loop
    perform pg_temp.post('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'capital:pending', 'USDC', 'BASE', 'credit', 3);
  end loop;
end
$$;
select pg_temp.post('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'capital:pending', 'USDC', 'BASE', 'debit', 9000);
select pg_temp.expect('thousands of postings aggregate completely and net to an exact zero',
  pg_temp.summary('cccccccc-cccc-4ccc-8ccc-cccccccccccc') -> 'balances' -> 0 ->> 'pending_atomic',
  '0');

-- Integrity and access.
insert into public.ledger_journals (id, owner_id, source_type, source_id, request_id)
values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'test', gen_random_uuid(), 'test');
insert into public.ledger_postings (journal_id, account_id, direction, amount_atomic, asset)
select 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', id, 'credit', 1, 'USDT'
from public.ledger_accounts where owner_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' and account_code = 'capital:pending';
do $$
begin
  perform public.canonical_capital_balance_summary('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
  raise exception 'FAIL a posting whose asset differs from its account must fail the summary';
exception
  when raise_exception then
    if sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS a posting whose asset differs from its account fails the summary';
end
$$;

do $$
declare
  role_name text;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    begin
      perform set_config('role', role_name, true);
      perform public.canonical_capital_balance_summary('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
      raise exception 'FAIL % executed the balance summary', role_name;
    exception when insufficient_privilege then
      perform set_config('role', 'none', true);
      raise notice 'PASS % cannot execute the balance summary', role_name;
    end;
    begin
      perform set_config('role', role_name, true);
      perform 1 from public.capital_ledger_initializations;
      raise exception 'FAIL % read capital ledger initializations', role_name;
    exception when insufficient_privilege then
      perform set_config('role', 'none', true);
      raise notice 'PASS % cannot read capital ledger initializations', role_name;
    end;
    begin
      perform set_config('role', role_name, true);
      perform public.initialize_capital_ledger('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'BACKFILL');
      raise exception 'FAIL % initialized a capital ledger', role_name;
    exception when insufficient_privilege then
      perform set_config('role', 'none', true);
      raise notice 'PASS % cannot initialize a capital ledger', role_name;
    end;
  end loop;
end
$$;

do $$
begin
  perform set_config('role', 'service_role', true);
  perform public.canonical_capital_balance_summary('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  begin
    insert into public.capital_ledger_initializations (owner_id, source)
    values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'BACKFILL');
    raise exception 'FAIL service role wrote initializations directly';
  exception when insufficient_privilege then
    raise notice 'PASS service role writes initializations only through initialize_capital_ledger';
  end;
  perform set_config('role', 'none', true);
  raise notice 'PASS service role can execute the balance summary';
end
$$;
