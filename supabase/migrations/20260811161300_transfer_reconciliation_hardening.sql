-- Transfer lifecycle hardening layered forward-only over the governed operations migration.
-- REVIEW ONLY. Do not apply remotely without the explicit production migration gate.

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
  if p_terminal_state not in ('failed','cancelled') then
    raise exception 'invalid release terminal state';
  end if;
  select * into v_transfer from public.transfer_executions where id = p_transfer_execution_id for update;
  select * into v_reservation from public.capital_reservations where transfer_execution_id = p_transfer_execution_id for update;
  if v_transfer.id is null or v_reservation.id is null then
    raise exception 'reserved transfer not found';
  end if;
  if v_reservation.state = 'released' then
    select id into v_journal from public.ledger_journals
      where source_type = 'transfer_reservation_release' and source_id = v_transfer.id;
    return v_journal;
  end if;
  if v_reservation.state <> 'active' or v_transfer.state not in ('reserved','submitted') then
    raise exception 'active reservation required';
  end if;
  if v_transfer.state = 'submitted' and p_terminal_state = 'cancelled' then
    raise exception 'submitted transfer cannot be locally cancelled; provider failure or reversal evidence is required';
  end if;

  v_available := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:available', v_transfer.asset, v_transfer.network, 'liability');
  v_reserved := public.ensure_canonical_ledger_account(v_transfer.owner_id, 'capital:reserved', v_transfer.asset, v_transfer.network, 'liability');
  v_journal := public.post_balanced_journal(
    v_transfer.owner_id,
    'transfer_reservation_release',
    v_transfer.id,
    p_request_id,
    null,
    jsonb_build_array(
      jsonb_build_object('account_id', v_reserved, 'direction', 'debit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network),
      jsonb_build_object('account_id', v_available, 'direction', 'credit', 'amount_atomic', v_transfer.amount_atomic::text, 'asset', v_transfer.asset, 'network', v_transfer.network)
    )
  );
  update public.capital_reservations
    set state = 'released', released_at = now()
    where id = v_reservation.id;
  update public.transfer_executions
    set state = p_terminal_state, updated_at = now()
    where id = v_transfer.id;
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
  select * into v_transfer
    from public.transfer_executions
    where id = p_transfer_execution_id
    for update;
  if v_transfer.id is null then raise exception 'transfer not found'; end if;
  if v_transfer.state = 'reconciled' then return; end if;
  if v_transfer.state <> 'settled' then
    raise exception 'transfer settlement required before reconciliation';
  end if;

  select * into v_reservation
    from public.capital_reservations
    where transfer_execution_id = p_transfer_execution_id;
  if v_reservation.id is null or v_reservation.state <> 'settled' then
    raise exception 'settled durable reservation required before reconciliation';
  end if;

  select * into v_item
    from public.reconciliation_items
    where id = p_reconciliation_item_id
      and transfer_execution_id = p_transfer_execution_id;
  if v_item.id is null or v_item.state <> 'matched' or cardinality(v_item.discrepancy_codes) <> 0 then
    raise exception 'matched reconciliation evidence required';
  end if;

  update public.transfer_executions
    set state = 'reconciled', updated_at = now()
    where id = p_transfer_execution_id;
end;
$$;

-- Provider-neutral funding lifecycle advancement. Provider confirmation is
-- intentionally excluded and must use settlement evidence below.
create or replace function public.advance_funding_operational_state(
  p_funding_intent_id uuid,
  p_next_state public.funding_state
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_intent public.funding_intents%rowtype;
  v_allowed boolean := false;
begin
  select * into v_intent from public.funding_intents where id = p_funding_intent_id for update;
  if v_intent.id is null then raise exception 'funding intent not found'; end if;
  if v_intent.state = p_next_state then return; end if;

  v_allowed := case v_intent.state
    when 'created' then p_next_state in ('authorized','cancelled')
    when 'authorized' then p_next_state in ('provider_submitted','failed','cancelled')
    when 'provider_submitted' then p_next_state in ('pending','failed','cancelled')
    when 'pending' then p_next_state in ('failed','returned','cancelled')
    when 'provider_confirmed' then p_next_state in ('failed','returned','reversed')
    when 'ledger_posted' then p_next_state in ('returned','reversed')
    when 'reconciled' then p_next_state in ('returned','reversed')
    when 'available' then p_next_state in ('returned','reversed')
    when 'returned' then p_next_state = 'reversed'
    else false
  end;

  if not v_allowed then
    raise exception 'invalid governed funding transition from % to %', v_intent.state, p_next_state;
  end if;

  update public.funding_intents
    set state = p_next_state, updated_at = now()
    where id = v_intent.id;
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

  update public.funding_intents
    set state = 'provider_confirmed', updated_at = now()
    where id = v_intent.id;
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
  if v_transfer.state <> 'reserved' then raise exception 'durable reservation required before provider submission'; end if;

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

  update public.transfer_executions
    set state = 'submitted', updated_at = now()
    where id = v_transfer.id;
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

  update public.transfer_executions
    set state = 'settled', updated_at = now()
    where id = v_transfer.id;
end;
$$;

revoke all on function public.release_transfer_reservation(uuid,text,public.transfer_execution_state) from public, anon, authenticated;
revoke all on function public.mark_transfer_reconciled(uuid,uuid) from public, anon, authenticated;
revoke all on function public.advance_funding_operational_state(uuid,public.funding_state) from public, anon, authenticated;
revoke all on function public.mark_funding_provider_confirmed(uuid,uuid) from public, anon, authenticated;
revoke all on function public.mark_transfer_submitted(uuid,uuid) from public, anon, authenticated;
revoke all on function public.mark_transfer_provider_settled(uuid,uuid) from public, anon, authenticated;

grant execute on function public.release_transfer_reservation(uuid,text,public.transfer_execution_state) to service_role;
grant execute on function public.mark_transfer_reconciled(uuid,uuid) to service_role;
grant execute on function public.advance_funding_operational_state(uuid,public.funding_state) to service_role;
grant execute on function public.mark_funding_provider_confirmed(uuid,uuid) to service_role;
grant execute on function public.mark_transfer_submitted(uuid,uuid) to service_role;
grant execute on function public.mark_transfer_provider_settled(uuid,uuid) to service_role;

-- Canonical financial state and ledger history are mutated only through the
-- security-definer governed operations above and in the preceding migration.
-- apps/api may create/read request and evidence records directly, but it must
-- not bypass lifecycle, reservation, ledger, or reconciliation functions.
revoke update, delete on public.funding_intents from service_role;
revoke update, delete on public.transfer_executions from service_role;
revoke insert, update, delete on public.capital_reservations from service_role;
revoke insert, update, delete on public.ledger_accounts from service_role;
revoke insert, update, delete on public.ledger_journals from service_role;
revoke insert, update, delete on public.ledger_postings from service_role;

-- Provider observations and destination identities are append-oriented at this
-- stage. Future processors may gain narrowly scoped mutation functions rather
-- than reopening broad table writes.
revoke update, delete on public.provider_references from service_role;
revoke update, delete on public.settlement_evidence from service_role;
revoke update, delete on public.transfer_aliases_v2 from service_role;
revoke delete on public.provider_webhook_inbox from service_role;
revoke delete on public.reconciliation_runs from service_role;
revoke delete on public.reconciliation_items from service_role;

-- Preserve exactly the access currently used by apps/api.
grant select, insert on public.funding_intents to service_role;
grant select, insert on public.transfer_executions to service_role;
grant select on public.capital_reservations, public.ledger_accounts,
  public.ledger_journals, public.ledger_postings to service_role;
grant select, insert on public.provider_references, public.settlement_evidence,
  public.transfer_aliases_v2, public.provider_webhook_inbox to service_role;
grant select, insert, update on public.reconciliation_runs, public.reconciliation_items to service_role;
