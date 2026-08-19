-- Governed self-custody treasury destination foundation.
-- REVIEW ONLY. Do not apply remotely without the explicit production migration gate.
-- This migration creates no destination rows and enables no provider or money movement.

-- Existing active provider destinations predate ownership verification evidence. Refuse
-- to fabricate verification during migration; they require a separately reviewed data gate.
do $$
begin
  if exists (select 1 from public.treasury_destinations where status = 'active') then
    raise exception 'active treasury destinations require reviewed verification evidence before migration';
  end if;
end;
$$;

alter table public.treasury_destinations
  alter column provider drop not null,
  alter column provider_treasury_id drop not null,
  add column controller_type text not null default 'provider',
  add column custody_model text not null default 'provider_custody',
  add column address text,
  add column normalized_address text,
  add column address_format text,
  add column network_identifier text,
  add column verification_state text not null default 'pending_verification',
  add column verification_method text,
  add column verification_evidence_digest text,
  add column verified_at timestamptz,
  add column activated_at timestamptz,
  add column suspended_at timestamptz,
  add column retired_at timestamptz,
  add column updated_at timestamptz not null default now();

alter table public.treasury_destinations
  drop constraint treasury_destinations_status_check;

update public.treasury_destinations
set status = 'retired', retired_at = coalesce(retired_at, now()), updated_at = now()
where status = 'revoked';

alter table public.treasury_destinations
  add constraint treasury_destinations_controller_type_check
    check (controller_type in ('neptlium','provider')),
  add constraint treasury_destinations_custody_model_check
    check (custody_model in ('self_custody','provider_custody')),
  add constraint treasury_destinations_address_format_check
    check (address_format is null or address_format in ('evm','bitcoin','solana','xrpl','bank_provider_reference')),
  add constraint treasury_destinations_verification_state_check
    check (verification_state in ('pending_verification','verified','failed')),
  add constraint treasury_destinations_status_check
    check (status in ('inactive','active','suspended','retired')),
  add constraint treasury_destinations_custody_consistency
    check (
      (custody_model = 'self_custody'
        and controller_type = 'neptlium'
        and provider is null
        and provider_treasury_id is null
        and address is not null
        and normalized_address is not null
        and address_format is not null)
      or
      (custody_model = 'provider_custody'
        and controller_type = 'provider'
        and provider is not null
        and provider_treasury_id is not null)
    ),
  add constraint treasury_destinations_address_representation_consistent
    check (
      (address is null and normalized_address is null and address_format is null)
      or
      (address is not null and normalized_address is not null and address_format is not null)
    ),
  add constraint treasury_destinations_evm_address_valid
    check (
      address_format <> 'evm'
      or (
        address ~* '^0x[0-9a-f]{40}$'
        and normalized_address = lower(address)
        and normalized_address ~ '^0x[0-9a-f]{40}$'
      )
    ),
  add constraint treasury_destinations_verification_consistent
    check (
      (verification_state = 'verified'
        and verified_at is not null
        and verification_method is not null
        and length(trim(verification_method)) > 0
        and verification_evidence_digest is not null
        and length(trim(verification_evidence_digest)) > 0)
      or
      (verification_state <> 'verified' and verified_at is null)
    ),
  add constraint treasury_destinations_active_consistent
    check (
      status <> 'active'
      or (verification_state = 'verified' and verified_at is not null and activated_at is not null)
    ),
  add constraint treasury_destinations_suspended_consistent
    check (status <> 'suspended' or suspended_at is not null),
  add constraint treasury_destinations_retired_consistent
    check (status <> 'retired' or retired_at is not null);

-- Address identity is asset-, network-, and environment-aware. The same EVM bytes on
-- Base and Ethereum remain distinct, and multi-asset destinations on one network are valid.
create unique index treasury_destinations_address_identity_unique
  on public.treasury_destinations(environment, asset, network, normalized_address)
  nulls not distinct
  where normalized_address is not null;

create unique index treasury_destinations_provider_identity_unique
  on public.treasury_destinations(provider, environment, provider_treasury_id, asset, network)
  where custody_model = 'provider_custody' and provider_treasury_id is not null;

create table public.treasury_destination_events (
  id uuid primary key default gen_random_uuid(),
  treasury_destination_id uuid not null references public.treasury_destinations(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete restrict,
  actor_type text not null check (actor_type in ('administrator','system')),
  operation text not null check (length(trim(operation)) > 0),
  previous_status text check (previous_status is null or previous_status in ('inactive','active','suspended','retired')),
  new_status text not null check (new_status in ('inactive','active','suspended','retired')),
  previous_verification_state text check (
    previous_verification_state is null
    or previous_verification_state in ('pending_verification','verified','failed')
  ),
  new_verification_state text not null check (
    new_verification_state in ('pending_verification','verified','failed')
  ),
  request_id text not null check (length(trim(request_id)) > 0),
  idempotency_key text,
  created_at timestamptz not null default now()
);

create index treasury_destination_events_destination_created_idx
  on public.treasury_destination_events(treasury_destination_id, created_at);
create unique index treasury_destination_events_idempotency_unique
  on public.treasury_destination_events(treasury_destination_id, operation, idempotency_key)
  where idempotency_key is not null;

alter table public.treasury_destination_events enable row level security;
revoke all on public.treasury_destination_events from public, anon, authenticated, service_role;
grant select on public.treasury_destination_events to service_role;

create or replace function public.reject_treasury_destination_event_mutation() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'treasury destination history is append-only';
end;
$$;

create trigger treasury_destination_events_no_update_delete
  before update or delete on public.treasury_destination_events
  for each row execute function public.reject_treasury_destination_event_mutation();

create or replace function public.enforce_treasury_destination_history() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.controller_type is distinct from new.controller_type
     or old.custody_model is distinct from new.custody_model
     or old.provider is distinct from new.provider
     or old.provider_treasury_id is distinct from new.provider_treasury_id
     or old.environment is distinct from new.environment
     or old.asset is distinct from new.asset
     or old.network is distinct from new.network
     or old.network_identifier is distinct from new.network_identifier
     or old.destination_type is distinct from new.destination_type
     or old.address is distinct from new.address
     or old.normalized_address is distinct from new.normalized_address
     or old.address_format is distinct from new.address_format then
    raise exception 'treasury destination identity is immutable';
  end if;
  if old.status = 'retired' and new.status <> 'retired' then
    raise exception 'retired treasury destination cannot be reactivated';
  end if;
  if old.verification_state = 'verified' and new.verification_state <> 'verified' then
    raise exception 'treasury destination verification history cannot be erased';
  end if;
  if old.verification_state = 'verified'
     and (old.verification_method is distinct from new.verification_method
       or old.verification_evidence_digest is distinct from new.verification_evidence_digest
       or old.verified_at is distinct from new.verified_at) then
    raise exception 'treasury destination verification evidence is immutable';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.reject_treasury_destination_event_mutation() from public, anon, authenticated;
revoke all on function public.enforce_treasury_destination_history() from public, anon, authenticated;

-- Destination mutations remain unavailable to browsers and ordinary authenticated users.
-- A later pass must add narrowly scoped, authorized verification and activation functions
-- that atomically append treasury_destination_events; broad service-role update stays denied.
revoke insert, update, delete on public.treasury_destinations from service_role;

alter table public.treasury_destinations
  alter column network_identifier drop default;

update public.treasury_destinations
set network_identifier = lower(network)
where network is not null and network_identifier is null;

alter table public.treasury_destinations
  add constraint treasury_destinations_network_identifier_consistent check (
    (network is null and network_identifier is null)
    or (network is not null and network_identifier is not null and length(trim(network_identifier)) > 0)
  );

create trigger treasury_destinations_history_guard
  before update on public.treasury_destinations
  for each row execute function public.enforce_treasury_destination_history();

alter table public.deposit_routes
  alter column provider drop not null,
  drop constraint deposit_routes_provider_check,
  add constraint deposit_routes_provider_check check (provider is null or provider in ('circle'));

create or replace function public.enforce_deposit_route_identity() returns trigger
language plpgsql set search_path = public, pg_temp
as $$
declare v_intent public.funding_intents%rowtype; v_destination public.treasury_destinations%rowtype;
begin
  select * into v_intent from public.funding_intents where id = new.funding_intent_id;
  select * into v_destination from public.treasury_destinations where id = new.treasury_destination_id;
  if v_intent.id is null or v_destination.id is null then raise exception 'deposit route funding intent or treasury destination is missing'; end if;
  if new.owner_id is distinct from v_intent.owner_id
     or new.asset is distinct from v_intent.asset
     or new.network is distinct from v_intent.network
     or new.environment is distinct from v_intent.environment
     or new.environment is distinct from v_destination.environment
     or new.asset is distinct from v_destination.asset
     or new.network is distinct from v_destination.network
     or v_destination.destination_type <> 'custody_wallet'
     or v_destination.status <> 'active'
     or (v_destination.custody_model = 'provider_custody' and new.provider is distinct from v_destination.provider)
     or (v_destination.custody_model = 'self_custody' and (
       new.provider is not null or v_destination.controller_type <> 'neptlium'
       or v_destination.verification_state <> 'verified'
       or new.deposit_address is distinct from v_destination.normalized_address
     )) then raise exception 'deposit route does not match governed funding intent and active treasury destination'; end if;
  return new;
end $$;

alter table public.treasury_destination_events
  add column metadata jsonb not null default '{}'::jsonb;

create table public.treasury_destination_challenges (
  id uuid primary key default gen_random_uuid(),
  treasury_destination_id uuid not null references public.treasury_destinations(id) on delete restrict,
  purpose text not null check (purpose = 'NEPTLIUM_TREASURY_OWNERSHIP_VERIFICATION'),
  nonce_digest text not null check (nonce_digest ~ '^[0-9a-f]{64}$'),
  message_digest text not null check (message_digest ~ '^[0-9a-f]{64}$'),
  issued_at timestamptz not null,
  expires_at timestamptz not null check (expires_at > issued_at and expires_at <= issued_at + interval '10 minutes'),
  consumed_at timestamptz,
  verification_attempts integer not null default 0 check (verification_attempts between 0 and 5),
  created_by uuid not null references auth.users(id) on delete restrict,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  check (consumed_at is null or consumed_at >= issued_at),
  unique (treasury_destination_id, purpose, idempotency_key)
);

create unique index treasury_destination_challenges_one_live
  on public.treasury_destination_challenges(treasury_destination_id, purpose)
  where consumed_at is null;

alter table public.treasury_destination_challenges enable row level security;
revoke all on public.treasury_destination_challenges from public, anon, authenticated, service_role;
grant select on public.treasury_destination_challenges to service_role;

create or replace function public.create_treasury_destination_candidate(
  p_actor_id uuid, p_request_id text, p_idempotency_key text, p_request_digest text,
  p_asset text, p_network text, p_network_identifier text, p_environment text,
  p_address text, p_normalized_address text, p_address_format text
) returns public.treasury_destinations
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_destination public.treasury_destinations%rowtype; v_event public.treasury_destination_events%rowtype;
begin
  select * into v_event from public.treasury_destination_events
   where operation = 'destination.created' and idempotency_key = p_idempotency_key limit 1;
  if found then
    if v_event.metadata->>'request_digest' <> p_request_digest then raise exception 'idempotency conflict'; end if;
    select * into strict v_destination from public.treasury_destinations where id = v_event.treasury_destination_id;
    return v_destination;
  end if;
  insert into public.treasury_destinations(
    provider, provider_treasury_id, environment, asset, network, network_identifier,
    destination_type, status, controller_type, custody_model, address,
    normalized_address, address_format, verification_state
  ) values (
    null, null, p_environment::public.provider_environment, p_asset, p_network, p_network_identifier,
    'custody_wallet', 'inactive', 'neptlium', 'self_custody', p_address,
    p_normalized_address, p_address_format, 'pending_verification'
  ) returning * into v_destination;
  insert into public.treasury_destination_events(
    treasury_destination_id, actor_id, actor_type, operation, previous_status, new_status,
    previous_verification_state, new_verification_state, request_id, idempotency_key, metadata
  ) values (
    v_destination.id, p_actor_id, 'administrator', 'destination.created', null, 'inactive',
    null, 'pending_verification', p_request_id, p_idempotency_key,
    jsonb_build_object('request_digest', p_request_digest)
  );
  return v_destination;
end $$;

create or replace function public.issue_treasury_destination_challenge(
  p_destination_id uuid, p_actor_id uuid, p_request_id text, p_idempotency_key text,
  p_nonce_digest text, p_message_digest text, p_issued_at timestamptz, p_expires_at timestamptz
) returns public.treasury_destination_challenges
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_destination public.treasury_destinations%rowtype; v_challenge public.treasury_destination_challenges%rowtype;
begin
  select * into strict v_destination from public.treasury_destinations where id = p_destination_id for update;
  if v_destination.custody_model <> 'self_custody' or v_destination.status = 'retired' then raise exception 'challenge unavailable'; end if;
  select * into v_challenge from public.treasury_destination_challenges
   where treasury_destination_id = p_destination_id and purpose = 'NEPTLIUM_TREASURY_OWNERSHIP_VERIFICATION'
     and idempotency_key = p_idempotency_key;
  if found then
    if v_challenge.message_digest <> p_message_digest or v_challenge.nonce_digest <> p_nonce_digest then raise exception 'idempotency conflict'; end if;
    return v_challenge;
  end if;
  update public.treasury_destination_challenges set consumed_at = now()
   where treasury_destination_id = p_destination_id and purpose = 'NEPTLIUM_TREASURY_OWNERSHIP_VERIFICATION'
     and consumed_at is null and expires_at <= now();
  insert into public.treasury_destination_challenges(
    treasury_destination_id, purpose, nonce_digest, message_digest, issued_at, expires_at, created_by, idempotency_key
  ) values (
    p_destination_id, 'NEPTLIUM_TREASURY_OWNERSHIP_VERIFICATION', p_nonce_digest, p_message_digest,
    p_issued_at, p_expires_at, p_actor_id, p_idempotency_key
  ) returning * into v_challenge;
  insert into public.treasury_destination_events(
    treasury_destination_id, actor_id, actor_type, operation, previous_status, new_status,
    previous_verification_state, new_verification_state, request_id, idempotency_key, metadata
  ) values (
    p_destination_id, p_actor_id, 'administrator', 'destination.challenge_issued', v_destination.status,
    v_destination.status, v_destination.verification_state, v_destination.verification_state,
    p_request_id, p_idempotency_key, jsonb_build_object('challenge_id', v_challenge.id, 'expires_at', p_expires_at)
  );
  return v_challenge;
end $$;

create or replace function public.consume_treasury_destination_challenge(
  p_challenge_id uuid, p_destination_id uuid, p_actor_id uuid, p_request_id text,
  p_idempotency_key text, p_nonce_digest text, p_message_digest text,
  p_verification_method text, p_evidence_digest text
) returns public.treasury_destinations
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_destination public.treasury_destinations%rowtype; v_count integer;
begin
  update public.treasury_destination_challenges set consumed_at = now(), verification_attempts = verification_attempts + 1
   where id = p_challenge_id and treasury_destination_id = p_destination_id and consumed_at is null
     and expires_at > now() and verification_attempts < 5
     and nonce_digest = p_nonce_digest and message_digest = p_message_digest;
  get diagnostics v_count = row_count;
  if v_count <> 1 then raise exception 'challenge unavailable, expired, consumed, or mismatched'; end if;
  update public.treasury_destinations set
    verification_state = 'verified', verification_method = p_verification_method,
    verification_evidence_digest = p_evidence_digest, verified_at = now(), status = 'inactive'
   where id = p_destination_id and custody_model = 'self_custody' and status <> 'retired'
   returning * into strict v_destination;
  insert into public.treasury_destination_events(
    treasury_destination_id, actor_id, actor_type, operation, previous_status, new_status,
    previous_verification_state, new_verification_state, request_id, idempotency_key, metadata
  ) values (
    p_destination_id, p_actor_id, 'administrator', 'destination.verification_succeeded',
    v_destination.status, 'inactive', 'pending_verification', 'verified', p_request_id,
    p_idempotency_key, jsonb_build_object('challenge_id', p_challenge_id, 'evidence_digest', p_evidence_digest)
  ) on conflict (treasury_destination_id, operation, idempotency_key) where idempotency_key is not null do nothing;
  return v_destination;
end $$;

create or replace function public.transition_treasury_destination(
  p_destination_id uuid, p_actor_id uuid, p_request_id text, p_idempotency_key text, p_operation text
) returns public.treasury_destinations
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_before public.treasury_destinations%rowtype; v_after public.treasury_destinations%rowtype; v_next text;
begin
  select * into strict v_before from public.treasury_destinations where id = p_destination_id for update;
  v_next := case p_operation when 'activate' then 'active' when 'suspend' then 'suspended' when 'retire' then 'retired' else null end;
  if v_next is null then raise exception 'invalid transition'; end if;
  if p_operation = 'activate' and (v_before.status <> 'inactive' or v_before.verification_state <> 'verified') then raise exception 'activation gate failed'; end if;
  if v_before.status = 'retired' and v_next <> 'retired' then raise exception 'retired destination is terminal'; end if;
  update public.treasury_destinations set status = v_next,
    activated_at = case when v_next = 'active' then coalesce(activated_at, now()) else activated_at end,
    suspended_at = case when v_next = 'suspended' then coalesce(suspended_at, now()) else suspended_at end,
    retired_at = case when v_next = 'retired' then coalesce(retired_at, now()) else retired_at end
   where id = p_destination_id returning * into v_after;
  insert into public.treasury_destination_events(
    treasury_destination_id, actor_id, actor_type, operation, previous_status, new_status,
    previous_verification_state, new_verification_state, request_id, idempotency_key
  ) values (
    p_destination_id, p_actor_id, 'administrator', 'destination.' || p_operation,
    v_before.status, v_after.status, v_before.verification_state, v_after.verification_state,
    p_request_id, p_idempotency_key
  ) on conflict (treasury_destination_id, operation, idempotency_key) where idempotency_key is not null do nothing;
  return v_after;
end $$;

create or replace function public.record_treasury_destination_verification_failure(
  p_challenge_id uuid, p_destination_id uuid, p_actor_id uuid, p_request_id text,
  p_idempotency_key text, p_failure_code text
) returns public.treasury_destination_challenges
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_challenge public.treasury_destination_challenges%rowtype; v_destination public.treasury_destinations%rowtype;
begin
  select * into strict v_destination from public.treasury_destinations where id = p_destination_id for update;
  update public.treasury_destination_challenges
    set verification_attempts = verification_attempts + 1,
        consumed_at = case when verification_attempts + 1 >= 5 then now() else consumed_at end
   where id = p_challenge_id and treasury_destination_id = p_destination_id
     and consumed_at is null and expires_at > now() and verification_attempts < 5
   returning * into strict v_challenge;
  insert into public.treasury_destination_events(
    treasury_destination_id, actor_id, actor_type, operation, previous_status, new_status,
    previous_verification_state, new_verification_state, request_id, idempotency_key, metadata
  ) values (
    p_destination_id, p_actor_id, 'administrator', 'destination.verification_failed',
    v_destination.status, v_destination.status, v_destination.verification_state,
    v_destination.verification_state, p_request_id, p_idempotency_key,
    jsonb_build_object('challenge_id', p_challenge_id, 'failure_code', p_failure_code,
      'attempt', v_challenge.verification_attempts)
  ) on conflict (treasury_destination_id, operation, idempotency_key) where idempotency_key is not null do nothing;
  return v_challenge;
end $$;

revoke all on function public.create_treasury_destination_candidate(uuid,text,text,text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.issue_treasury_destination_challenge(uuid,uuid,text,text,text,text,timestamptz,timestamptz) from public, anon, authenticated;
revoke all on function public.consume_treasury_destination_challenge(uuid,uuid,uuid,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.transition_treasury_destination(uuid,uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.record_treasury_destination_verification_failure(uuid,uuid,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.create_treasury_destination_candidate(uuid,text,text,text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.issue_treasury_destination_challenge(uuid,uuid,text,text,text,text,timestamptz,timestamptz) to service_role;
grant execute on function public.consume_treasury_destination_challenge(uuid,uuid,uuid,text,text,text,text,text,text) to service_role;
grant execute on function public.transition_treasury_destination(uuid,uuid,text,text,text) to service_role;
grant execute on function public.record_treasury_destination_verification_failure(uuid,uuid,uuid,text,text,text) to service_role;
