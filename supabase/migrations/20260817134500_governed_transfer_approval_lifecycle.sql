-- Governed transfer approval lifecycle layered forward-only over the existing transfer foundation.
-- REVIEW ONLY. Do not apply remotely without an explicit production migration gate.
-- This migration does not enable provider execution or any live-money capability.

create table public.transfer_execution_events (
  id uuid primary key default gen_random_uuid(),
  transfer_execution_id uuid not null references public.transfer_executions(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete restrict,
  actor_type text not null check (actor_type in ('user','system')),
  operation text not null,
  from_state public.transfer_execution_state not null,
  to_state public.transfer_execution_state not null,
  request_id text not null,
  idempotency_key text,
  created_at timestamptz not null default now()
);

create index transfer_execution_events_transfer_created_idx
  on public.transfer_execution_events(transfer_execution_id, created_at);
create unique index transfer_execution_events_idempotency_unique
  on public.transfer_execution_events(transfer_execution_id, operation, idempotency_key)
  where idempotency_key is not null;

alter table public.transfer_execution_events enable row level security;
revoke all on public.transfer_execution_events from public, anon, authenticated, service_role;
grant select on public.transfer_execution_events to service_role;

create or replace function public.reject_transfer_execution_event_mutation() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'transfer execution history is append-only';
end;
$$;

create trigger transfer_execution_events_no_update_delete
  before update or delete on public.transfer_execution_events
  for each row execute function public.reject_transfer_execution_event_mutation();

create or replace function public.record_transfer_execution_event(
  p_transfer_execution_id uuid,
  p_owner_id uuid,
  p_actor_id uuid,
  p_actor_type text,
  p_operation text,
  p_from_state public.transfer_execution_state,
  p_to_state public.transfer_execution_state,
  p_request_id text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_event_id uuid;
begin
  if p_actor_type not in ('user','system') then raise exception 'invalid transfer event actor type'; end if;
  if p_actor_type = 'user' and p_actor_id is null then raise exception 'user transfer event requires actor'; end if;
  if p_request_id is null or length(trim(p_request_id)) = 0 then raise exception 'transfer event request id required'; end if;

  insert into public.transfer_execution_events(
    transfer_execution_id, owner_id, actor_id, actor_type, operation,
    from_state, to_state, request_id, idempotency_key
  ) values (
    p_transfer_execution_id, p_owner_id, p_actor_id, p_actor_type, p_operation,
    p_from_state, p_to_state, p_request_id, p_idempotency_key
  )
  returning id into v_event_id;
  return v_event_id;
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
  v_from_state public.transfer_execution_state;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  if v_transfer.id is null then raise exception 'transfer not found'; end if;

  select * into v_existing from public.capital_reservations where transfer_execution_id = v_transfer.id;
  if v_existing.id is not null then
    if v_existing.idempotency_key is distinct from p_idempotency_key then
      raise exception 'transfer reservation idempotency conflict';
    end if;
    return v_existing.id;
  end if;

  -- AUTHORIZED is accepted only for migration compatibility with already-persisted rows.
  -- New transfers move directly from REQUESTED into a durable reservation.
  if v_transfer.state not in ('requested','authorized') then
    raise exception 'transfer must be requested before reservation';
  end if;
  v_from_state := v_transfer.state;

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
  perform public.record_transfer_execution_event(
    v_transfer.id, v_transfer.owner_id, null, 'system', 'transfer.reserved',
    v_from_state, 'reserved', p_request_id, p_idempotency_key
  );
  return v_reservation;
end;
$$;

create or replace function public.mark_transfer_pending_approval(
  p_transfer_execution_id uuid,
  p_request_id text
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_reservation public.capital_reservations%rowtype;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  if v_transfer.id is null then raise exception 'transfer not found'; end if;
  if v_transfer.state in ('pending_approval','approved','submitted','settled','reconciled') then return; end if;
  if v_transfer.state <> 'reserved' then raise exception 'durable reservation required before approval review'; end if;

  select * into v_reservation from public.capital_reservations where transfer_execution_id = v_transfer.id;
  if v_reservation.id is null or v_reservation.state <> 'active' then
    raise exception 'active reservation required before approval review';
  end if;

  update public.transfer_executions set state = 'pending_approval', updated_at = now() where id = v_transfer.id;
  perform public.record_transfer_execution_event(
    v_transfer.id, v_transfer.owner_id, null, 'system', 'transfer.pending_approval',
    'reserved', 'pending_approval', p_request_id, null
  );
end;
$$;

create or replace function public.approve_transfer_execution(
  p_transfer_execution_id uuid,
  p_actor_id uuid,
  p_request_id text,
  p_idempotency_key text
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_reservation public.capital_reservations%rowtype;
  v_role text;
  v_role_count integer;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  if v_transfer.id is null then raise exception 'governed transfer not found'; end if;

  if exists (
    select 1 from public.transfer_execution_events
    where transfer_execution_id = v_transfer.id
      and operation = 'transfer.approved'
      and idempotency_key = p_idempotency_key
  ) then
    return;
  end if;

  select count(*), max(role::text) into v_role_count, v_role
  from public.user_roles where user_id = p_actor_id;
  if v_role_count <> 1 or v_role is distinct from 'super_admin' then
    raise exception 'super_admin approval authority required';
  end if;
  if p_actor_id = v_transfer.owner_id then
    raise exception 'transfer owner cannot self-approve';
  end if;
  if v_transfer.state <> 'pending_approval' then
    raise exception 'transfer must be pending approval';
  end if;

  select * into v_reservation from public.capital_reservations where transfer_execution_id = v_transfer.id;
  if v_reservation.id is null or v_reservation.state <> 'active' then
    raise exception 'active reservation required for approval';
  end if;

  update public.transfer_executions set state = 'approved', updated_at = now() where id = v_transfer.id;
  perform public.record_transfer_execution_event(
    v_transfer.id, v_transfer.owner_id, p_actor_id, 'user', 'transfer.approved',
    'pending_approval', 'approved', p_request_id, p_idempotency_key
  );
end;
$$;

create or replace function public.mark_transfer_submitted(
  p_transfer_execution_id uuid,
  p_provider_reference_id uuid
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_reservation public.capital_reservations%rowtype;
  v_reference public.provider_references%rowtype;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  if v_transfer.id is null then raise exception 'transfer not found'; end if;
  if v_transfer.state = 'submitted' then return; end if;
  if v_transfer.state <> 'approved' then raise exception 'explicit transfer approval required before provider submission'; end if;

  select * into v_reservation from public.capital_reservations where transfer_execution_id = v_transfer.id;
  if v_reservation.id is null or v_reservation.state <> 'active' then
    raise exception 'active reservation required before provider submission';
  end if;

  select * into v_reference from public.provider_references where id = p_provider_reference_id;
  if v_reference.id is null
     or v_reference.transfer_execution_id is distinct from v_transfer.id
     or v_reference.environment is distinct from v_transfer.environment
     or v_reference.provider = 'alchemy' then
    raise exception 'matching execution-provider reference required';
  end if;

  update public.transfer_executions set state = 'submitted', updated_at = now() where id = v_transfer.id;
  perform public.record_transfer_execution_event(
    v_transfer.id, v_transfer.owner_id, null, 'system', 'transfer.submitted',
    'approved', 'submitted', 'provider-reference:' || p_provider_reference_id::text, null
  );
end;
$$;

create or replace function public.mark_transfer_provider_settled(
  p_transfer_execution_id uuid,
  p_settlement_evidence_id uuid
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_reservation public.capital_reservations%rowtype;
  v_evidence public.settlement_evidence%rowtype;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  if v_transfer.id is null then raise exception 'transfer not found'; end if;
  if v_transfer.state = 'settled' then return; end if;
  if v_transfer.state <> 'submitted' then raise exception 'provider submission required before settlement'; end if;

  select * into v_reservation from public.capital_reservations where transfer_execution_id = v_transfer.id;
  if v_reservation.id is null or v_reservation.state <> 'active' then
    raise exception 'active reservation required before settlement';
  end if;

  select * into v_evidence from public.settlement_evidence where id = p_settlement_evidence_id;
  if v_evidence.id is null
     or v_evidence.transfer_execution_id is distinct from v_transfer.id
     or v_evidence.environment is distinct from v_transfer.environment
     or v_evidence.asset is distinct from v_transfer.asset
     or v_evidence.amount_atomic is distinct from v_transfer.amount_atomic
     or coalesce(v_evidence.network, '') is distinct from coalesce(v_transfer.network, '')
     or v_evidence.source = 'alchemy'
     or lower(v_evidence.evidence_state) not in ('confirmed','succeeded','settled','finalized') then
    raise exception 'matching provider settlement evidence required';
  end if;

  update public.transfer_executions set state = 'settled', updated_at = now() where id = v_transfer.id;
  perform public.record_transfer_execution_event(
    v_transfer.id, v_transfer.owner_id, null, 'system', 'transfer.provider_settled',
    'submitted', 'settled', 'settlement-evidence:' || p_settlement_evidence_id::text, null
  );
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
  v_from_state public.transfer_execution_state;
begin
  if p_terminal_state not in ('failed','cancelled') then raise exception 'invalid release terminal state'; end if;
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  select * into v_reservation from public.capital_reservations where transfer_execution_id = p_transfer_execution_id for update;
  if v_transfer.id is null or v_reservation.id is null then raise exception 'reserved transfer not found'; end if;
  if v_reservation.state = 'released' then
    select id into v_journal from public.ledger_journals
      where source_type = 'transfer_reservation_release' and source_id = v_transfer.id;
    return v_journal;
  end if;
  if v_reservation.state <> 'active' or v_transfer.state not in ('reserved','pending_approval','approved','submitted') then
    raise exception 'active reservation required';
  end if;
  if v_transfer.state = 'submitted' and p_terminal_state = 'cancelled' then
    raise exception 'submitted transfer cannot be locally cancelled; provider failure or reversal evidence is required';
  end if;
  v_from_state := v_transfer.state;

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
  perform public.record_transfer_execution_event(
    v_transfer.id, v_transfer.owner_id, null, 'system', 'transfer.reservation_released',
    v_from_state, p_terminal_state, p_request_id, null
  );
  return v_journal;
end;
$$;

create or replace function public.mark_transfer_reconciled(
  p_transfer_execution_id uuid,
  p_reconciliation_item_id uuid
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_transfer public.transfer_executions%rowtype;
  v_reservation public.capital_reservations%rowtype;
  v_item public.reconciliation_items%rowtype;
begin
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  if v_transfer.id is null then raise exception 'transfer not found'; end if;
  if v_transfer.state = 'reconciled' then return; end if;
  if v_transfer.state <> 'settled' then raise exception 'transfer settlement required before reconciliation'; end if;

  select * into v_reservation from public.capital_reservations where transfer_execution_id = p_transfer_execution_id;
  if v_reservation.id is null or v_reservation.state <> 'settled' then
    raise exception 'settled durable reservation required before reconciliation';
  end if;

  select * into v_item from public.reconciliation_items
    where id = p_reconciliation_item_id and transfer_execution_id = p_transfer_execution_id;
  if v_item.id is null or v_item.state <> 'matched' or cardinality(v_item.discrepancy_codes) <> 0 then
    raise exception 'matched reconciliation evidence required';
  end if;

  update public.transfer_executions set state = 'reconciled', updated_at = now() where id = p_transfer_execution_id;
  perform public.record_transfer_execution_event(
    v_transfer.id, v_transfer.owner_id, null, 'system', 'transfer.reconciled',
    'settled', 'reconciled', 'reconciliation-item:' || p_reconciliation_item_id::text, null
  );
end;
$$;

revoke all on function public.record_transfer_execution_event(uuid,uuid,uuid,text,text,public.transfer_execution_state,public.transfer_execution_state,text,text) from public, anon, authenticated, service_role;
revoke all on function public.reserve_transfer_capital(uuid,text,text) from public, anon, authenticated;
revoke all on function public.mark_transfer_pending_approval(uuid,text) from public, anon, authenticated;
revoke all on function public.approve_transfer_execution(uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function public.mark_transfer_submitted(uuid,uuid) from public, anon, authenticated;
revoke all on function public.mark_transfer_provider_settled(uuid,uuid) from public, anon, authenticated;
revoke all on function public.release_transfer_reservation(uuid,text,public.transfer_execution_state) from public, anon, authenticated;
revoke all on function public.mark_transfer_reconciled(uuid,uuid) from public, anon, authenticated;

grant execute on function public.reserve_transfer_capital(uuid,text,text) to service_role;
grant execute on function public.mark_transfer_pending_approval(uuid,text) to service_role;
grant execute on function public.approve_transfer_execution(uuid,uuid,text,text) to service_role;
grant execute on function public.mark_transfer_submitted(uuid,uuid) to service_role;
grant execute on function public.mark_transfer_provider_settled(uuid,uuid) to service_role;
grant execute on function public.release_transfer_reservation(uuid,text,public.transfer_execution_state) to service_role;
grant execute on function public.mark_transfer_reconciled(uuid,uuid) to service_role;

-- Keep canonical state mutation behind governed security-definer operations.
revoke update, delete on public.transfer_executions from service_role;
revoke insert, update, delete on public.capital_reservations from service_role;
