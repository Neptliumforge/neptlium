-- Omnibus treasury/custody accounting model.
-- REVIEW ONLY. Do not apply to production without the explicit migration gate.
-- Real provider/custody assets remain Neptlium-controlled treasury assets.
-- Customer-visible balances remain owner-scoped canonical ledger liabilities.

create table public.treasury_destinations (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe','circle')),
  environment public.provider_environment not null,
  provider_treasury_id text not null,
  asset text not null,
  network text,
  destination_type text not null check (destination_type in ('financial_account','custody_wallet')),
  status text not null default 'inactive' check (status in ('inactive','active','suspended','revoked')),
  created_at timestamptz not null default now(),
  unique(provider, environment, provider_treasury_id, asset, network)
);

create table public.deposit_routes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  funding_intent_id uuid not null references public.funding_intents(id) on delete restrict,
  treasury_destination_id uuid not null references public.treasury_destinations(id) on delete restrict,
  provider text not null check (provider in ('circle')),
  environment public.provider_environment not null,
  asset text not null,
  network text not null,
  deposit_address text not null,
  memo_or_tag text,
  status text not null default 'pending' check (status in ('pending','active','suspended','revoked')),
  created_at timestamptz not null default now(),
  unique(funding_intent_id)
);
create unique index deposit_routes_destination_unique
  on public.deposit_routes(provider, environment, network, deposit_address, coalesce(memo_or_tag, ''));
create index deposit_routes_owner_created_idx on public.deposit_routes(owner_id, created_at desc);

create table public.deposit_attribution_discrepancies (
  id uuid primary key default gen_random_uuid(),
  webhook_inbox_id uuid references public.provider_webhook_inbox(id) on delete restrict,
  provider text not null check (provider in ('stripe','circle','alchemy')),
  environment public.provider_environment not null,
  asset text,
  network text,
  deposit_address text,
  memo_or_tag text,
  amount_atomic numeric(78,0) check (amount_atomic is null or amount_atomic > 0),
  discrepancy_code text not null,
  state text not null default 'manual_review' check (state in ('manual_review','resolved')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint deposit_discrepancy_resolution_consistent check (
    (state = 'resolved' and resolved_at is not null) or
    (state = 'manual_review' and resolved_at is null)
  )
);
create index deposit_attribution_discrepancies_state_idx
  on public.deposit_attribution_discrepancies(state, created_at);

alter table public.settlement_evidence add column memo_or_tag text;

alter table public.treasury_destinations enable row level security;
alter table public.deposit_routes enable row level security;
alter table public.deposit_attribution_discrepancies enable row level security;
revoke all on public.treasury_destinations, public.deposit_routes,
  public.deposit_attribution_discrepancies from public, anon, authenticated;

create or replace function public.enforce_deposit_route_identity() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_intent public.funding_intents%rowtype;
  v_destination public.treasury_destinations%rowtype;
begin
  select * into v_intent from public.funding_intents where id = new.funding_intent_id;
  select * into v_destination from public.treasury_destinations where id = new.treasury_destination_id;
  if v_intent.id is null or v_destination.id is null then
    raise exception 'deposit route funding intent or treasury destination is missing';
  end if;
  if new.owner_id is distinct from v_intent.owner_id
     or new.asset is distinct from v_intent.asset
     or new.network is distinct from v_intent.network
     or new.environment is distinct from v_intent.environment
     or new.provider is distinct from v_destination.provider
     or new.environment is distinct from v_destination.environment
     or new.asset is distinct from v_destination.asset
     or new.network is distinct from v_destination.network
     or v_destination.destination_type <> 'custody_wallet' then
    raise exception 'deposit route does not match customer funding intent and treasury destination';
  end if;
  return new;
end;
$$;
create trigger deposit_routes_identity_guard before insert or update on public.deposit_routes
  for each row execute function public.enforce_deposit_route_identity();

create or replace function public.post_balanced_journal(
  p_owner_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_request_id text,
  p_reversal_of uuid,
  p_postings jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_journal_id uuid;
  v_asset text;
  v_debits numeric;
  v_credits numeric;
  v_invalid_count integer;
begin
  if p_owner_id is null or p_source_type is null or length(trim(p_source_type)) = 0 or p_request_id is null then
    raise exception 'journal identity is incomplete';
  end if;
  if jsonb_typeof(p_postings) <> 'array' or jsonb_array_length(p_postings) < 2 then
    raise exception 'balanced journal requires at least two postings';
  end if;
  select count(*) into v_invalid_count
  from jsonb_array_elements(p_postings) p
  left join public.ledger_accounts a on a.id = (p.value->>'account_id')::uuid
  where a.id is null
     or (a.owner_id is distinct from p_owner_id
         and not (a.owner_id is null and a.account_class = 'asset' and a.account_code like 'treasury:%'))
     or a.asset is distinct from p.value->>'asset'
     or coalesce(a.network, '') is distinct from coalesce(p.value->>'network', '')
     or p.value->>'direction' not in ('debit','credit')
     or (p.value->>'amount_atomic')::numeric <= 0;
  if v_invalid_count <> 0 then
    raise exception 'invalid ledger account, ownership, asset, network, direction or amount';
  end if;
  for v_asset in select distinct value->>'asset' from jsonb_array_elements(p_postings)
  loop
    select
      coalesce(sum(case when value->>'direction' = 'debit' then (value->>'amount_atomic')::numeric else 0 end),0),
      coalesce(sum(case when value->>'direction' = 'credit' then (value->>'amount_atomic')::numeric else 0 end),0)
    into v_debits, v_credits
    from jsonb_array_elements(p_postings)
    where value->>'asset' = v_asset;
    if v_debits <> v_credits then raise exception 'unbalanced journal for asset %', v_asset; end if;
  end loop;
  if p_reversal_of is not null and not exists (
    select 1 from public.ledger_journals where id = p_reversal_of and owner_id = p_owner_id
  ) then raise exception 'reversal journal does not belong to owner'; end if;
  insert into public.ledger_journals(owner_id, source_type, source_id, reversal_of, request_id)
  values (p_owner_id, p_source_type, p_source_id, p_reversal_of, p_request_id)
  returning id into v_journal_id;
  insert into public.ledger_postings(journal_id, account_id, direction, amount_atomic, asset)
  select v_journal_id, (value->>'account_id')::uuid, value->>'direction',
         (value->>'amount_atomic')::numeric, value->>'asset'
  from jsonb_array_elements(p_postings);
  return v_journal_id;
end;
$$;

create or replace function public.ensure_treasury_ledger_account(
  p_account_code text,
  p_asset text,
  p_network text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_account_code not in ('treasury:pending','treasury:reconciled') then
    raise exception 'invalid treasury account code';
  end if;
  return public.ensure_canonical_ledger_account(null, p_account_code, p_asset, p_network, 'asset');
end;
$$;

create or replace function public.omnibus_backing_snapshot(
  p_asset text,
  p_network text
) returns table(
  reconciled_treasury_atomic numeric,
  pending_treasury_atomic numeric,
  customer_settled_claims_atomic numeric,
  customer_pending_claims_atomic numeric
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  with account_balances as (
    select a.owner_id, a.account_code, a.account_class,
      coalesce(sum(case
        when a.account_class = 'asset' and p.direction = 'debit' then p.amount_atomic
        when a.account_class = 'asset' and p.direction = 'credit' then -p.amount_atomic
        when a.account_class = 'liability' and p.direction = 'credit' then p.amount_atomic
        when a.account_class = 'liability' and p.direction = 'debit' then -p.amount_atomic
        else 0 end), 0) as balance
    from public.ledger_accounts a
    left join public.ledger_postings p on p.account_id = a.id
    where a.asset = p_asset and coalesce(a.network, '') = coalesce(p_network, '')
    group by a.id, a.owner_id, a.account_code, a.account_class
  )
  select
    coalesce(sum(balance) filter (where owner_id is null and account_code = 'treasury:reconciled'), 0),
    coalesce(sum(balance) filter (where owner_id is null and account_code = 'treasury:pending'), 0),
    coalesce(sum(balance) filter (where owner_id is not null and account_code in ('capital:available','capital:reserved','capital:restricted')), 0),
    coalesce(sum(balance) filter (where owner_id is not null and account_code = 'capital:pending'), 0)
  from account_balances;
$$;

create or replace function public.assert_omnibus_backing(p_asset text, p_network text) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v record;
begin
  select * into v from public.omnibus_backing_snapshot(p_asset, p_network);
  if v.customer_settled_claims_atomic > v.reconciled_treasury_atomic then
    raise exception 'customer settled claims exceed reconciled treasury assets';
  end if;
  if v.customer_pending_claims_atomic > v.pending_treasury_atomic then
    raise exception 'customer pending claims exceed provider-confirmed treasury pending assets';
  end if;
end;
$$;

create or replace function public.post_confirmed_funding_to_pending(
  p_funding_intent_id uuid,
  p_request_id text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_intent public.funding_intents%rowtype;
  v_treasury_pending uuid;
  v_customer_pending uuid;
  v_journal uuid;
begin
  select * into v_intent from public.funding_intents where id = p_funding_intent_id for update;
  if v_intent.id is null then raise exception 'funding intent not found'; end if;
  if v_intent.state = 'ledger_posted' then
    select id into v_journal from public.ledger_journals
      where source_type = 'funding_provider_confirmation' and source_id = v_intent.id;
    return v_journal;
  end if;
  if v_intent.state <> 'provider_confirmed' then raise exception 'funding is not provider confirmed'; end if;
  if v_intent.amount_atomic is null or v_intent.amount_atomic <= 0 then raise exception 'funding amount unavailable'; end if;
  v_treasury_pending := public.ensure_treasury_ledger_account('treasury:pending', v_intent.asset, v_intent.network);
  v_customer_pending := public.ensure_canonical_ledger_account(v_intent.owner_id, 'capital:pending', v_intent.asset, v_intent.network, 'liability');
  v_journal := public.post_balanced_journal(
    v_intent.owner_id, 'funding_provider_confirmation', v_intent.id, p_request_id, null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_treasury_pending, 'direction', 'debit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network),
      jsonb_build_object('account_id', v_customer_pending, 'direction', 'credit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network)
    )
  );
  update public.funding_intents set state = 'ledger_posted', updated_at = now() where id = v_intent.id;
  return v_journal;
end;
$$;

create or replace function public.make_reconciled_funding_available(
  p_funding_intent_id uuid,
  p_request_id text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_intent public.funding_intents%rowtype;
  v_treasury_pending uuid;
  v_treasury_reconciled uuid;
  v_customer_pending uuid;
  v_customer_available uuid;
  v_journal uuid;
begin
  select * into v_intent from public.funding_intents where id = p_funding_intent_id for update;
  if v_intent.id is null then raise exception 'funding intent not found'; end if;
  if v_intent.state = 'available' then
    select id into v_journal from public.ledger_journals where source_type = 'funding_available' and source_id = v_intent.id;
    return v_journal;
  end if;
  if v_intent.state <> 'reconciled' then raise exception 'funding must reconcile before availability'; end if;
  v_treasury_pending := public.ensure_treasury_ledger_account('treasury:pending', v_intent.asset, v_intent.network);
  v_treasury_reconciled := public.ensure_treasury_ledger_account('treasury:reconciled', v_intent.asset, v_intent.network);
  v_customer_pending := public.ensure_canonical_ledger_account(v_intent.owner_id, 'capital:pending', v_intent.asset, v_intent.network, 'liability');
  v_customer_available := public.ensure_canonical_ledger_account(v_intent.owner_id, 'capital:available', v_intent.asset, v_intent.network, 'liability');
  v_journal := public.post_balanced_journal(
    v_intent.owner_id, 'funding_available', v_intent.id, p_request_id, null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_treasury_pending, 'direction', 'credit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network),
      jsonb_build_object('account_id', v_treasury_reconciled, 'direction', 'debit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network),
      jsonb_build_object('account_id', v_customer_pending, 'direction', 'debit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network),
      jsonb_build_object('account_id', v_customer_available, 'direction', 'credit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network)
    )
  );
  update public.funding_intents set state = 'available', updated_at = now() where id = v_intent.id;
  perform public.assert_omnibus_backing(v_intent.asset, v_intent.network);
  return v_journal;
end;
$$;

create or replace function public.settle_reserved_transfer(
  p_transfer_execution_id uuid,
  p_request_id text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_reservation public.capital_reservations%rowtype;
  v_customer_reserved uuid;
  v_treasury_reconciled uuid;
  v_journal uuid;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  select * into v_reservation from public.capital_reservations where transfer_execution_id = p_transfer_execution_id for update;
  if v_transfer.id is null or v_reservation.id is null then raise exception 'reserved transfer not found'; end if;
  if v_reservation.state = 'settled' then
    select id into v_journal from public.ledger_journals where source_type = 'transfer_settlement' and source_id = v_transfer.id;
    return v_journal;
  end if;
  if v_transfer.state <> 'settled' or v_reservation.state <> 'active' then
    raise exception 'provider settlement evidence must establish settled transfer before canonical settlement';
  end if;
  v_customer_reserved := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:reserved', v_transfer.asset, v_transfer.network, 'liability');
  v_treasury_reconciled := public.ensure_treasury_ledger_account('treasury:reconciled', v_transfer.asset, v_transfer.network);
  v_journal := public.post_balanced_journal(
    v_transfer.owner_id, 'transfer_settlement', v_transfer.id, p_request_id, null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_customer_reserved, 'direction', 'debit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network),
      jsonb_build_object('account_id', v_treasury_reconciled, 'direction', 'credit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network)
    )
  );
  update public.capital_reservations set state = 'settled', settled_at = now() where id = v_reservation.id;
  perform public.assert_omnibus_backing(v_transfer.asset, v_transfer.network);
  return v_journal;
end;
$$;

create or replace function public.mark_funding_provider_confirmed(
  p_funding_intent_id uuid,
  p_settlement_evidence_id uuid
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_intent public.funding_intents%rowtype;
  v_evidence public.settlement_evidence%rowtype;
  v_route public.deposit_routes%rowtype;
begin
  select * into v_intent from public.funding_intents where id = p_funding_intent_id for update;
  if v_intent.id is null then raise exception 'funding intent not found'; end if;
  if v_intent.state = 'provider_confirmed' then return; end if;
  if v_intent.state not in ('provider_submitted','pending') then
    raise exception 'funding must be provider submitted or pending before provider confirmation';
  end if;
  select * into v_evidence from public.settlement_evidence where id = p_settlement_evidence_id;
  if v_evidence.id is null
     or v_evidence.funding_intent_id is distinct from v_intent.id
     or v_evidence.environment is distinct from v_intent.environment
     or v_evidence.asset is distinct from v_intent.asset
     or v_evidence.amount_atomic is distinct from v_intent.amount_atomic
     or coalesce(v_evidence.network, '') is distinct from coalesce(v_intent.network, '')
     or lower(v_evidence.evidence_state) not in ('confirmed','succeeded','settled','finalized') then
    raise exception 'matching provider settlement evidence required';
  end if;
  if v_intent.asset <> 'USD' then
    select * into v_route from public.deposit_routes
      where funding_intent_id = v_intent.id and owner_id = v_intent.owner_id and status = 'active';
    if v_route.id is null
       or v_evidence.address is distinct from v_route.deposit_address
       or coalesce(v_evidence.memo_or_tag, '') is distinct from coalesce(v_route.memo_or_tag, '') then
      raise exception 'provider evidence does not match the customer deposit route';
    end if;
  end if;
  update public.funding_intents set state = 'provider_confirmed', updated_at = now() where id = v_intent.id;
end;
$$;

create or replace function public.resolve_deposit_route(
  p_provider text,
  p_environment public.provider_environment,
  p_asset text,
  p_network text,
  p_deposit_address text,
  p_memo_or_tag text
) returns table(
  deposit_route_id uuid,
  owner_id uuid,
  funding_intent_id uuid,
  treasury_destination_id uuid
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select r.id, r.owner_id, r.funding_intent_id, r.treasury_destination_id
  from public.deposit_routes r
  where r.provider = p_provider
    and r.environment = p_environment
    and r.asset = p_asset
    and r.network = p_network
    and r.deposit_address = p_deposit_address
    and coalesce(r.memo_or_tag, '') = coalesce(p_memo_or_tag, '')
    and r.status = 'active'
  limit 1;
$$;

revoke all on function public.enforce_deposit_route_identity() from public, anon, authenticated;
revoke all on function public.ensure_treasury_ledger_account(text,text,text) from public, anon, authenticated;
revoke all on function public.omnibus_backing_snapshot(text,text) from public, anon, authenticated;
revoke all on function public.assert_omnibus_backing(text,text) from public, anon, authenticated;
revoke all on function public.resolve_deposit_route(text,public.provider_environment,text,text,text,text) from public, anon, authenticated;
revoke all on function public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.post_confirmed_funding_to_pending(uuid,text) from public, anon, authenticated;
revoke all on function public.make_reconciled_funding_available(uuid,text) from public, anon, authenticated;
revoke all on function public.settle_reserved_transfer(uuid,text) from public, anon, authenticated;
revoke all on function public.mark_funding_provider_confirmed(uuid,uuid) from public, anon, authenticated;

grant execute on function public.ensure_treasury_ledger_account(text,text,text) to service_role;
grant execute on function public.omnibus_backing_snapshot(text,text) to service_role;
grant execute on function public.assert_omnibus_backing(text,text) to service_role;
grant execute on function public.resolve_deposit_route(text,public.provider_environment,text,text,text,text) to service_role;
grant execute on function public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb) to service_role;
grant execute on function public.post_confirmed_funding_to_pending(uuid,text) to service_role;
grant execute on function public.make_reconciled_funding_available(uuid,text) to service_role;
grant execute on function public.settle_reserved_transfer(uuid,text) to service_role;
grant execute on function public.mark_funding_provider_confirmed(uuid,uuid) to service_role;

revoke all on public.treasury_destinations, public.deposit_routes,
  public.deposit_attribution_discrepancies from service_role;
grant select, insert on public.treasury_destinations, public.deposit_routes,
  public.deposit_attribution_discrepancies to service_role;
