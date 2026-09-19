-- Forward-only production funding, treasury and transfer foundation.
-- REVIEWED MIGRATION ONLY: do not apply to production without an explicit release gate.
-- Existing legacy financial tables/history are intentionally preserved. These governed
-- tables are additive and apps/api-only until the explicit production migration gate.

create type public.funding_state as enum (
  'created','authorized','provider_submitted','pending','provider_confirmed',
  'ledger_posted','reconciled','available','failed','returned','reversed','cancelled'
);
create type public.provider_environment as enum ('test','live');
create type public.reconciliation_state as enum ('pending','matched','discrepancy','resolved');
create type public.transfer_execution_state as enum (
  'requested','authorized','reserved','submitted','settled','reconciled','failed','reversed','cancelled'
);

create table public.funding_intents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  asset text not null,
  network text,
  rail text not null,
  amount_atomic numeric(78,0) check (amount_atomic is null or amount_atomic > 0),
  state public.funding_state not null default 'created',
  environment public.provider_environment not null,
  idempotency_key text not null,
  request_digest text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, environment, idempotency_key)
);

create table public.transfer_aliases_v2 (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  alias text not null,
  destination_type text not null,
  destination_reference text not null,
  verification_state text not null default 'unverified' check (verification_state in ('unverified','pending','verified','failed')),
  activation_state text not null default 'inactive' check (activation_state in ('inactive','active','suspended','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, alias)
);

create table public.transfer_executions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  alias_id uuid not null references public.transfer_aliases_v2(id) on delete restrict,
  asset text not null,
  network text,
  rail text not null,
  amount_atomic numeric(78,0) not null check (amount_atomic > 0),
  state public.transfer_execution_state not null default 'requested',
  environment public.provider_environment not null,
  idempotency_key text not null,
  request_digest text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, environment, idempotency_key)
);

create table public.provider_references (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe','circle','alchemy')),
  environment public.provider_environment not null,
  provider_object_type text not null,
  provider_object_id text not null,
  funding_intent_id uuid references public.funding_intents(id) on delete restrict,
  transfer_execution_id uuid references public.transfer_executions(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint provider_reference_one_internal_owner check (
    (funding_intent_id is not null)::integer + (transfer_execution_id is not null)::integer = 1
  ),
  unique(provider, environment, provider_object_type, provider_object_id)
);

create table public.provider_webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe','circle','alchemy')),
  environment public.provider_environment not null,
  provider_event_id text not null,
  payload_digest text not null,
  payload jsonb not null,
  signature_verified_at timestamptz not null,
  processing_state text not null default 'received' check (processing_state in ('received','processing','processed','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, environment, provider_event_id)
);

create table public.settlement_evidence (
  id uuid primary key default gen_random_uuid(),
  funding_intent_id uuid references public.funding_intents(id) on delete restrict,
  transfer_execution_id uuid references public.transfer_executions(id) on delete restrict,
  source text not null check (source in ('stripe','circle','alchemy','chain')),
  environment public.provider_environment not null,
  source_event_id text,
  tx_hash text,
  network text,
  asset text not null,
  address text,
  amount_atomic numeric(78,0) not null check (amount_atomic > 0),
  block_number numeric(78,0),
  confirmations integer check (confirmations is null or confirmations >= 0),
  evidence_state text not null,
  observed_at timestamptz not null,
  raw_reference jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint settlement_evidence_one_internal_owner check (
    (funding_intent_id is not null)::integer + (transfer_execution_id is not null)::integer = 1
  )
);
create unique index settlement_evidence_provider_event_unique
  on public.settlement_evidence(source, environment, source_event_id)
  where source_event_id is not null;
create unique index settlement_evidence_chain_tx_unique
  on public.settlement_evidence(environment, network, tx_hash, asset, address, amount_atomic)
  where tx_hash is not null;

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

create table public.capital_reservations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  transfer_execution_id uuid not null references public.transfer_executions(id) on delete restrict,
  asset text not null,
  network text,
  amount_atomic numeric(78,0) not null check (amount_atomic > 0),
  state text not null default 'active' check (state in ('active','released','settled')),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  released_at timestamptz,
  settled_at timestamptz,
  unique(transfer_execution_id),
  unique(owner_id, idempotency_key),
  constraint reservation_terminal_timestamps check (
    (state = 'active' and released_at is null and settled_at is null) or
    (state = 'released' and released_at is not null and settled_at is null) or
    (state = 'settled' and settled_at is not null and released_at is null)
  )
);

create table public.reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  environment public.provider_environment not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  state text not null default 'running' check (state in ('running','completed','failed'))
);

create table public.reconciliation_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.reconciliation_runs(id) on delete restrict,
  owner_id uuid references auth.users(id) on delete restrict,
  funding_intent_id uuid references public.funding_intents(id) on delete restrict,
  transfer_execution_id uuid references public.transfer_executions(id) on delete restrict,
  state public.reconciliation_state not null default 'pending',
  discrepancy_codes text[] not null default '{}',
  provider_expectation jsonb not null default '{}'::jsonb,
  provider_observation jsonb not null default '{}'::jsonb,
  canonical_observation jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reconciliation_item_one_internal_owner check (
    (funding_intent_id is not null)::integer + (transfer_execution_id is not null)::integer = 1
  ),
  constraint reconciliation_resolution_consistent check (
    (state = 'resolved' and resolved_at is not null) or (state <> 'resolved' and resolved_at is null)
  )
);

create index funding_intents_owner_created_idx on public.funding_intents(owner_id, created_at desc);
create index provider_references_funding_idx on public.provider_references(funding_intent_id) where funding_intent_id is not null;
create index provider_references_transfer_idx on public.provider_references(transfer_execution_id) where transfer_execution_id is not null;
create index provider_webhook_inbox_processing_idx on public.provider_webhook_inbox(processing_state, received_at);
create index settlement_evidence_funding_idx on public.settlement_evidence(funding_intent_id, observed_at);
create index settlement_evidence_transfer_idx on public.settlement_evidence(transfer_execution_id, observed_at);
create index ledger_postings_journal_idx on public.ledger_postings(journal_id);
create index ledger_postings_account_idx on public.ledger_postings(account_id, created_at);
create index transfer_executions_owner_created_idx on public.transfer_executions(owner_id, created_at desc);
create index capital_reservations_owner_state_idx on public.capital_reservations(owner_id, state);
create index reconciliation_items_state_idx on public.reconciliation_items(state, created_at);

-- Financial tables are backend-only. apps/api uses the service role after authenticating,
-- authorizing and owner-scoping the caller. No authenticated client table policy is granted.
alter table public.funding_intents enable row level security;
alter table public.provider_references enable row level security;
alter table public.provider_webhook_inbox enable row level security;
alter table public.settlement_evidence enable row level security;
alter table public.ledger_accounts enable row level security;
alter table public.ledger_journals enable row level security;
alter table public.ledger_postings enable row level security;
alter table public.transfer_aliases_v2 enable row level security;
alter table public.transfer_executions enable row level security;
alter table public.capital_reservations enable row level security;
alter table public.reconciliation_runs enable row level security;
alter table public.reconciliation_items enable row level security;

revoke all on public.funding_intents, public.provider_references, public.provider_webhook_inbox,
  public.settlement_evidence, public.ledger_accounts, public.ledger_journals, public.ledger_postings,
  public.transfer_aliases_v2, public.transfer_executions, public.capital_reservations,
  public.reconciliation_runs, public.reconciliation_items from public, anon, authenticated;

-- Ledger history is immutable. Corrections create a new compensating journal with reversal_of.
create or replace function public.reject_ledger_mutation() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$ begin raise exception 'canonical ledger is append-only'; end; $$;
create trigger ledger_journals_no_update_delete before update or delete on public.ledger_journals
  for each row execute function public.reject_ledger_mutation();
create trigger ledger_postings_no_update_delete before update or delete on public.ledger_postings
  for each row execute function public.reject_ledger_mutation();

-- Balanced posting is enforced at the transaction boundary through this backend-only function.
-- Account ownership, asset and network are checked before any journal is inserted.
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
     or a.owner_id is distinct from p_owner_id
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
    if v_debits <> v_credits then
      raise exception 'unbalanced journal for asset %', v_asset;
    end if;
  end loop;

  if p_reversal_of is not null and not exists (
    select 1 from public.ledger_journals where id = p_reversal_of and owner_id = p_owner_id
  ) then
    raise exception 'reversal journal does not belong to owner';
  end if;

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
revoke all on function public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.post_balanced_journal(uuid,text,uuid,text,uuid,jsonb) to service_role;

-- Prevent TEST provider objects from being attached to LIVE canonical objects and vice versa.
create or replace function public.enforce_financial_environment_match() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare v_expected public.provider_environment;
begin
  if new.funding_intent_id is not null then
    select environment into v_expected from public.funding_intents where id = new.funding_intent_id;
  elsif new.transfer_execution_id is not null then
    select environment into v_expected from public.transfer_executions where id = new.transfer_execution_id;
  end if;
  if v_expected is null or new.environment is distinct from v_expected then
    raise exception 'provider evidence environment does not match canonical object';
  end if;
  return new;
end;
$$;
create trigger provider_references_environment_guard before insert or update on public.provider_references
  for each row execute function public.enforce_financial_environment_match();
create trigger settlement_evidence_environment_guard before insert or update on public.settlement_evidence
  for each row execute function public.enforce_financial_environment_match();

revoke all on function public.reject_ledger_mutation() from public, anon, authenticated;
revoke all on function public.enforce_financial_environment_match() from public, anon, authenticated;
