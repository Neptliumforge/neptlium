create table if not exists public.transaction_observation_inbox (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  wallet_address text not null,
  network text not null,
  tx_hash text not null,
  source text not null,
  source_event_id text not null,
  reconciliation_key text not null,
  payload_digest text not null,
  observed_at timestamptz not null,
  received_at timestamptz not null default now(),
  constraint transaction_observation_inbox_wallet_address_check check (wallet_address ~ '^0x[0-9a-f]{40}$'),
  constraint transaction_observation_inbox_tx_hash_check check (tx_hash ~ '^0x[0-9a-f]{64}$'),
  constraint transaction_observation_inbox_source_event_unique unique (owner_id, source, source_event_id),
  constraint transaction_observation_inbox_reconciliation_unique unique (owner_id, reconciliation_key)
);

create index if not exists transaction_observation_inbox_owner_observed_idx
  on public.transaction_observation_inbox (owner_id, observed_at desc);

create table if not exists public.transaction_semantic_events (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.transaction_observation_inbox(id) on delete restrict,
  owner_id uuid not null,
  wallet_address text not null,
  network text not null,
  tx_hash text not null,
  semantic_kind text not null check (semantic_kind in ('deposit', 'withdrawal', 'swap', 'self_transfer', 'contract_interaction', 'unclassified')),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  canonical boolean not null default false check (canonical = false),
  summary text not null,
  reconciliation_state text not null default 'classified' check (reconciliation_state in ('observed', 'classified', 'matched', 'dismissed')),
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transaction_semantic_events_observation_unique unique (observation_id),
  constraint transaction_semantic_events_wallet_address_check check (wallet_address ~ '^0x[0-9a-f]{40}$'),
  constraint transaction_semantic_events_tx_hash_check check (tx_hash ~ '^0x[0-9a-f]{64}$')
);

create index if not exists transaction_semantic_events_owner_observed_idx
  on public.transaction_semantic_events (owner_id, observed_at desc);

alter table public.transaction_observation_inbox enable row level security;
alter table public.transaction_semantic_events enable row level security;

revoke all on table public.transaction_observation_inbox from anon, authenticated;
revoke all on table public.transaction_semantic_events from anon, authenticated;

grant all on table public.transaction_observation_inbox to service_role;
grant all on table public.transaction_semantic_events to service_role;

comment on table public.transaction_observation_inbox is
  'Observation-only blockchain evidence inbox. It is not canonical financial state and cannot settle or authorize funds.';
comment on table public.transaction_semantic_events is
  'Read-side semantic interpretations of observed blockchain activity. canonical is permanently false in this table.';
