-- Atomic canonical funding and transfer accounting operations.
-- REVIEW ONLY. Do not apply remotely without the explicit production migration gate.

create or replace function public.ensure_canonical_ledger_account(
  p_owner_id uuid,
  p_account_code text,
  p_asset text,
  p_network text,
  p_account_class text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  if p_account_class not in ('asset','liability','equity','income','expense','contra') then
    raise exception 'invalid account class';
  end if;
  select id into v_id
  from public.ledger_accounts
  where owner_id is not distinct from p_owner_id
    and account_code = p_account_code
    and asset = p_asset
    and coalesce(network, '') = coalesce(p_network, '')
  for update;
  if v_id is null then
    insert into public.ledger_accounts(owner_id, account_code, asset, network, account_class)
    values (p_owner_id, p_account_code, p_asset, p_network, p_account_class)
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

create or replace function public.canonical_liability_balance(
  p_owner_id uuid,
  p_account_code text,
  p_asset text,
  p_network text
) returns numeric
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select coalesce(sum(case when p.direction = 'credit' then p.amount_atomic else -p.amount_atomic end), 0)
  from public.ledger_postings p
  join public.ledger_accounts a on a.id = p.account_id
  where a.owner_id = p_owner_id
    and a.account_code = p_account_code
    and a.account_class = 'liability'
    and a.asset = p_asset
    and coalesce(a.network, '') = coalesce(p_network, '');
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
  v_provider_asset uuid;
  v_pending uuid;
  v_journal uuid;
  v_amount numeric;
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
  v_amount := v_intent.amount_atomic;

  v_provider_asset := public.ensure_canonical_ledger_account(v_intent.owner_id, 'provider:settlement', v_intent.asset, v_intent.network, 'asset');
  v_pending := public.ensure_canonical_ledger_account(v_intent.owner_id, 'capital:pending', v_intent.asset, v_intent.network, 'liability');

  v_journal := public.post_balanced_journal(
    v_intent.owner_id,
    'funding_provider_confirmation',
    v_intent.id,
    p_request_id,
    null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_provider_asset, 'direction', 'debit', 'amount_atomic', v_amount::text, 'asset', v_intent.asset, 'network', v_intent.network),
      jsonb_build_object('account_id', v_pending, 'direction', 'credit', 'amount_atomic', v_amount::text, 'asset', v_intent.asset, 'network', v_intent.network)
    )
  );
  update public.funding_intents set state = 'ledger_posted', updated_at = now() where id = v_intent.id;
  return v_journal;
end;
$$;

create or replace function public.mark_funding_reconciled(
  p_funding_intent_id uuid,
  p_reconciliation_item_id uuid
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_intent public.funding_intents%rowtype;
  v_item public.reconciliation_items%rowtype;
begin
  select * into v_intent from public.funding_intents where id = p_funding_intent_id for update;
  if v_intent.id is null then raise exception 'funding intent not found'; end if;
  if v_intent.state = 'reconciled' or v_intent.state = 'available' then return; end if;
  if v_intent.state <> 'ledger_posted' then raise exception 'funding ledger posting required before reconciliation'; end if;
  select * into v_item from public.reconciliation_items where id = p_reconciliation_item_id and funding_intent_id = p_funding_intent_id;
  if v_item.id is null or v_item.state <> 'matched' or cardinality(v_item.discrepancy_codes) <> 0 then
    raise exception 'matched reconciliation evidence required';
  end if;
  update public.funding_intents set state = 'reconciled', updated_at = now() where id = p_funding_intent_id;
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
  v_pending uuid;
  v_available uuid;
  v_journal uuid;
begin
  select * into v_intent from public.funding_intents where id = p_funding_intent_id for update;
  if v_intent.id is null then raise exception 'funding intent not found'; end if;
  if v_intent.state = 'available' then
    select id into v_journal from public.ledger_journals where source_type = 'funding_available' and source_id = v_intent.id;
    return v_journal;
  end if;
  if v_intent.state <> 'reconciled' then raise exception 'funding must reconcile before availability'; end if;
  v_pending := public.ensure_canonical_ledger_account(v_intent.owner_id, 'capital:pending', v_intent.asset, v_intent.network, 'liability');
  v_available := public.ensure_canonical_ledger_account(v_intent.owner_id, 'capital:available', v_intent.asset, v_intent.network, 'liability');
  v_journal := public.post_balanced_journal(
    v_intent.owner_id,
    'funding_available',
    v_intent.id,
    p_request_id,
    null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_pending, 'direction', 'debit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network),
      jsonb_build_object('account_id', v_available, 'direction', 'credit', 'amount_atomic', v_intent.amount_atomic::text, 'asset', v_intent.asset, 'network', v_intent.network)
    )
  );
  update public.funding_intents set state = 'available', updated_at = now() where id = v_intent.id;
  return v_journal;
end;
$$;

create or replace function public.reserve_transfer_capital(
  p_transfer_execution_id uuid,
  p_request_id text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_existing public.capital_reservations%rowtype;
  v_available_account uuid;
  v_reserved_account uuid;
  v_available numeric;
  v_journal uuid;
  v_reservation uuid;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  if v_transfer.id is null then raise exception 'transfer not found'; end if;
  select * into v_existing from public.capital_reservations where transfer_execution_id = v_transfer.id;
  if v_existing.id is not null then return v_existing.id; end if;
  if v_transfer.state <> 'authorized' then raise exception 'transfer must be authorized before reservation'; end if;

  v_available := public.canonical_liability_balance(v_transfer.owner_id, 'capital:available', v_transfer.asset, v_transfer.network);
  if v_available < v_transfer.amount_atomic then raise exception 'insufficient available capital'; end if;

  v_available_account := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:available', v_transfer.asset, v_transfer.network, 'liability');
  v_reserved_account := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:reserved', v_transfer.asset, v_transfer.network, 'liability');
  v_journal := public.post_balanced_journal(
    v_transfer.owner_id,
    'transfer_reservation',
    v_transfer.id,
    p_request_id,
    null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_available_account, 'direction', 'debit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network),
      jsonb_build_object('account_id', v_reserved_account, 'direction', 'credit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network)
    )
  );

  insert into public.capital_reservations(owner_id, transfer_execution_id, asset, network, amount_atomic, idempotency_key)
  values (v_transfer.owner_id, v_transfer.id, v_transfer.asset, v_transfer.network, v_transfer.amount_atomic, p_idempotency_key)
  returning id into v_reservation;
  update public.transfer_executions set state = 'reserved', updated_at = now() where id = v_transfer.id;
  return v_reservation;
end;
$$;

create or replace function public.release_transfer_reservation(
  p_transfer_execution_id uuid,
  p_request_id text,
  p_terminal_state public.transfer_execution_state
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_reservation public.capital_reservations%rowtype;
  v_available uuid;
  v_reserved uuid;
  v_journal uuid;
begin
  if p_terminal_state not in ('failed','cancelled') then raise exception 'invalid release terminal state'; end if;
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  select * into v_reservation from public.capital_reservations where transfer_execution_id = p_transfer_execution_id for update;
  if v_transfer.id is null or v_reservation.id is null then raise exception 'reserved transfer not found'; end if;
  if v_reservation.state = 'released' then
    select id into v_journal from public.ledger_journals where source_type = 'transfer_reservation_release' and source_id = v_transfer.id;
    return v_journal;
  end if;
  if v_reservation.state <> 'active' or v_transfer.state not in ('reserved','submitted') then raise exception 'active reservation required'; end if;
  v_available := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:available', v_transfer.asset, v_transfer.network, 'liability');
  v_reserved := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:reserved', v_transfer.asset, v_transfer.network, 'liability');
  v_journal := public.post_balanced_journal(
    v_transfer.owner_id, 'transfer_reservation_release', v_transfer.id, p_request_id, null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_reserved, 'direction', 'debit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network),
      jsonb_build_object('account_id', v_available, 'direction', 'credit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network)
    )
  );
  update public.capital_reservations set state = 'released', released_at = now() where id = v_reservation.id;
  update public.transfer_executions set state = p_terminal_state, updated_at = now() where id = v_transfer.id;
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
  v_reserved uuid;
  v_provider_asset uuid;
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
  v_reserved := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:reserved', v_transfer.asset, v_transfer.network, 'liability');
  v_provider_asset := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'provider:settlement', v_transfer.asset, v_transfer.network, 'asset');
  v_journal := public.post_balanced_journal(
    v_transfer.owner_id, 'transfer_settlement', v_transfer.id, p_request_id, null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_reserved, 'direction', 'debit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network),
      jsonb_build_object('account_id', v_provider_asset, 'direction', 'credit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network)
    )
  );
  update public.capital_reservations set state = 'settled', settled_at = now() where id = v_reservation.id;
  return v_journal;
end;
$$;

create or replace function public.post_ledger_reversal(
  p_original_journal_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_request_id text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_original public.ledger_journals%rowtype;
  v_postings jsonb;
begin
  select * into v_original from public.ledger_journals where id = p_original_journal_id;
  if v_original.id is null then raise exception 'journal not found'; end if;
  select jsonb_agg(jsonb_build_object(
    'account_id', p.account_id,
    'direction', case when p.direction = 'debit' then 'credit' else 'debit' end,
    'amount_atomic', p.amount_atomic::text,
    'asset', p.asset,
    'network', a.network
  ) order by p.id)
  into v_postings
  from public.ledger_postings p join public.ledger_accounts a on a.id = p.account_id
  where p.journal_id = v_original.id;
  return public.post_balanced_journal(v_original.owner_id, p_source_type, p_source_id, p_request_id, v_original.id, v_postings);
end;
$$;

revoke all on function public.ensure_canonical_ledger_account(uuid,text,text,text,text) from public, anon, authenticated;
revoke all on function public.canonical_liability_balance(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.post_confirmed_funding_to_pending(uuid,text) from public, anon, authenticated;
revoke all on function public.mark_funding_reconciled(uuid,uuid) from public, anon, authenticated;
revoke all on function public.make_reconciled_funding_available(uuid,text) from public, anon, authenticated;
revoke all on function public.reserve_transfer_capital(uuid,text,text) from public, anon, authenticated;
revoke all on function public.release_transfer_reservation(uuid,text,public.transfer_execution_state) from public, anon, authenticated;
revoke all on function public.settle_reserved_transfer(uuid,text) from public, anon, authenticated;
revoke all on function public.post_ledger_reversal(uuid,text,uuid,text) from public, anon, authenticated;

grant execute on function public.ensure_canonical_ledger_account(uuid,text,text,text,text) to service_role;
grant execute on function public.canonical_liability_balance(uuid,text,text,text) to service_role;
grant execute on function public.post_confirmed_funding_to_pending(uuid,text) to service_role;
grant execute on function public.mark_funding_reconciled(uuid,uuid) to service_role;
grant execute on function public.make_reconciled_funding_available(uuid,text) to service_role;
grant execute on function public.reserve_transfer_capital(uuid,text,text) to service_role;
grant execute on function public.release_transfer_reservation(uuid,text,public.transfer_execution_state) to service_role;
grant execute on function public.settle_reserved_transfer(uuid,text) to service_role;
grant execute on function public.post_ledger_reversal(uuid,text,uuid,text) to service_role;
