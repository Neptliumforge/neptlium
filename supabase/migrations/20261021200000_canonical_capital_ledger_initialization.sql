-- Canonical balances contract (docs/financial/CANONICAL_BALANCES.md).
--
-- 1. capital_ledger_initializations records, once per owner, that Neptlium
--    opened the owner's Capital ledger. Absence of capital postings after
--    initialization means zero; absence of initialization means unknown.
-- 2. Initialization is written atomically when profiles.provisioned_at first
--    becomes set (account onboarding), and idempotently by an owner-approved
--    BACKFILL for existing accounts. It creates no ledger accounts or postings.
-- 3. canonical_capital_balance_summary aggregates capital liability balances in
--    the database with numeric arithmetic and returns decimal strings, so the
--    API never sums postings itself, never loses precision to JSON numbers and
--    is never truncated by Data API row limits.

create table public.capital_ledger_initializations (
  owner_id uuid primary key references auth.users(id) on delete restrict,
  initialized_at timestamptz not null default now(),
  source text not null check (source in ('ONBOARDING', 'BACKFILL'))
);

alter table public.capital_ledger_initializations enable row level security;
revoke all privileges on table public.capital_ledger_initializations from public, anon, authenticated;
revoke insert, update, delete, truncate on table public.capital_ledger_initializations from service_role;
grant select on table public.capital_ledger_initializations to service_role;

create or replace function public.initialize_capital_ledger(p_owner_id uuid, p_source text)
returns timestamptz
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_initialized_at timestamptz;
begin
  if p_owner_id is null or not exists (select 1 from auth.users where id = p_owner_id) then
    raise exception 'invalid capital ledger owner';
  end if;
  if p_source not in ('ONBOARDING', 'BACKFILL') then
    raise exception 'invalid capital ledger initialization source';
  end if;

  insert into public.capital_ledger_initializations (owner_id, source)
  values (p_owner_id, p_source)
  on conflict (owner_id) do nothing;

  select i.initialized_at into v_initialized_at
  from public.capital_ledger_initializations i where i.owner_id = p_owner_id;
  return v_initialized_at;
end;
$$;

revoke all on function public.initialize_capital_ledger(uuid, text) from public, anon, authenticated;
grant execute on function public.initialize_capital_ledger(uuid, text) to service_role;

create or replace function public.initialize_capital_ledger_on_provisioning()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.provisioned_at is not null
     and (tg_op = 'INSERT' or old.provisioned_at is null) then
    perform public.initialize_capital_ledger(new.id, 'ONBOARDING');
  end if;
  return new;
end;
$$;

revoke all on function public.initialize_capital_ledger_on_provisioning() from public, anon, authenticated;

create trigger profiles_initialize_capital_ledger
after insert or update of provisioned_at on public.profiles
for each row execute function public.initialize_capital_ledger_on_provisioning();

create or replace function public.canonical_capital_balance_summary(p_owner_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = pg_catalog, public
as $$
declare
  v_result jsonb;
begin
  if p_owner_id is null then
    raise exception 'invalid capital ledger owner';
  end if;

  if exists (
    select 1
    from public.ledger_postings p
    join public.ledger_accounts a on a.id = p.account_id
    where a.owner_id = p_owner_id
      and a.account_code in ('capital:available', 'capital:reserved', 'capital:pending', 'capital:restricted')
      and p.asset <> a.asset
  ) then
    raise exception 'canonical capital posting asset does not match its ledger account';
  end if;

  with sums as (
    select
      a.asset,
      a.network,
      coalesce(sum(case when p.direction = 'credit' then p.amount_atomic else -p.amount_atomic end)
        filter (where a.account_code = 'capital:available'), 0) as available,
      coalesce(sum(case when p.direction = 'credit' then p.amount_atomic else -p.amount_atomic end)
        filter (where a.account_code = 'capital:reserved'), 0) as reserved,
      coalesce(sum(case when p.direction = 'credit' then p.amount_atomic else -p.amount_atomic end)
        filter (where a.account_code = 'capital:pending'), 0) as pending,
      coalesce(sum(case when p.direction = 'credit' then p.amount_atomic else -p.amount_atomic end)
        filter (where a.account_code = 'capital:restricted'), 0) as restricted
    from public.ledger_accounts a
    left join public.ledger_postings p on p.account_id = a.id
    where a.owner_id = p_owner_id
      and a.account_class = 'liability'
      and a.account_code in ('capital:available', 'capital:reserved', 'capital:pending', 'capital:restricted')
    group by a.asset, a.network
  )
  select jsonb_build_object(
    'initialized_at', (
      select i.initialized_at from public.capital_ledger_initializations i where i.owner_id = p_owner_id
    ),
    'balances', coalesce((
      select jsonb_agg(jsonb_build_object(
        'asset', s.asset,
        'network', s.network,
        'available_atomic', s.available::text,
        'reserved_atomic', s.reserved::text,
        'pending_atomic', s.pending::text,
        'restricted_atomic', s.restricted::text
      ) order by s.asset, s.network)
      from sums s
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.canonical_capital_balance_summary(uuid) from public, anon, authenticated;
grant execute on function public.canonical_capital_balance_summary(uuid) to service_role;
