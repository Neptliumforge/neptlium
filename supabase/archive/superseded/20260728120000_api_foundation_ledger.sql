-- Neptlium API Foundation: private wallet, immutable ledger, webhook and audit persistence.
create type public.wallet_deposit_state as enum ('detected','confirming','confirmed','credited','reorged','failed','ignored');
create type public.wallet_withdrawal_state as enum ('requested','validating','held','approved','signing','submitted','confirming','settled','cancelled','failed','reversed');

create table public.wallet_accounts (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id), status text not null default 'active' check (status in ('active','held','closed')),
  created_at timestamptz not null default now(), unique(owner_id)
);
create table public.wallet_addresses (
  id uuid primary key default gen_random_uuid(), wallet_id uuid not null references public.wallet_accounts(id), provider text not null,
  asset text not null check (asset in ('USDC','ETH','BTC')), network text not null check (network in ('base-sepolia','bitcoin-testnet')),
  constraint wallet_addresses_supported_pair check ((asset in ('USDC','ETH') and network = 'base-sepolia') or (asset = 'BTC' and network = 'bitcoin-testnet')),
  address text not null, provider_reference text not null, status text not null default 'active', created_at timestamptz not null default now(),
  unique(provider, provider_reference), unique(network, address)
);
create table public.ledger_accounts (
  id uuid primary key default gen_random_uuid(), wallet_id uuid references public.wallet_accounts(id),
  account_type text not null check (account_type in ('user_asset','platform_custody','pending_deposit','pending_withdrawal','settlement','fees','adjustment','reserve','suspense')),
  asset text not null check (asset in ('USDC','ETH','BTC')), network text not null check (network in ('base-sepolia','bitcoin-testnet')),
  constraint ledger_accounts_supported_pair check ((asset in ('USDC','ETH') and network = 'base-sepolia') or (asset = 'BTC' and network = 'bitcoin-testnet')),
  status text not null default 'active', created_at timestamptz not null default now()
);
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(), event_type text not null, reference_type text not null, reference_id uuid not null,
  actor_id uuid references auth.users(id), request_id text not null, created_at timestamptz not null default now(), unique(reference_type, reference_id, event_type)
);
create table public.ledger_postings (
  id uuid primary key default gen_random_uuid(), entry_id uuid not null references public.ledger_entries(id), account_id uuid not null references public.ledger_accounts(id),
  side text not null check (side in ('debit','credit')), amount numeric(78,0) not null check (amount > 0),
  asset text not null check (asset in ('USDC','ETH','BTC')), network text not null check (network in ('base-sepolia','bitcoin-testnet')), constraint ledger_postings_supported_pair check ((asset in ('USDC','ETH') and network = 'base-sepolia') or (asset = 'BTC' and network = 'bitcoin-testnet')), created_at timestamptz not null default now()
);
create table public.wallet_deposits (
  id uuid primary key default gen_random_uuid(), wallet_id uuid not null references public.wallet_accounts(id), address_id uuid not null references public.wallet_addresses(id),
  provider text not null, provider_transaction_id text not null, asset text not null check (asset in ('USDC','ETH','BTC')), network text not null check (network in ('base-sepolia','bitcoin-testnet')), constraint wallet_deposits_supported_pair check ((asset in ('USDC','ETH') and network = 'base-sepolia') or (asset = 'BTC' and network = 'bitcoin-testnet')), amount numeric(78,0) not null check(amount > 0),
  confirmations integer not null default 0 check(confirmations >= 0), state public.wallet_deposit_state not null default 'detected', ledger_entry_id uuid references public.ledger_entries(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider, provider_transaction_id)
);
create table public.wallet_withdrawals (
  id uuid primary key default gen_random_uuid(), wallet_id uuid not null references public.wallet_accounts(id), asset text not null check (asset in ('USDC','ETH','BTC')), network text not null check (network in ('base-sepolia','bitcoin-testnet')), constraint wallet_withdrawals_supported_pair check ((asset in ('USDC','ETH') and network = 'base-sepolia') or (asset = 'BTC' and network = 'bitcoin-testnet')),
  amount numeric(78,0) not null check(amount > 0), destination text not null, state public.wallet_withdrawal_state not null default 'requested',
  provider_reference text unique, ledger_entry_id uuid references public.ledger_entries(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.provider_webhook_events (
  id uuid primary key default gen_random_uuid(), provider text not null, provider_event_id text not null, payload_digest text not null,
  safe_headers jsonb not null default '{}', state text not null check(state in ('received','verified','processing','processed','failed','dead_letter')),
  received_at timestamptz not null default now(), processed_at timestamptz, unique(provider, provider_event_id)
);
create table public.api_idempotency_keys (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id), operation text not null, idempotency_key text not null,
  request_digest text not null, response_status integer, response_body jsonb, created_at timestamptz not null default now(), expires_at timestamptz not null,
  unique(owner_id, operation, idempotency_key)
);
create table public.api_audit_events (
  id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id), actor_type text not null, operation text not null,
  resource_type text not null, resource_id text not null, old_state text, new_state text, request_id text not null, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.reconciliation_runs (id uuid primary key default gen_random_uuid(), provider text not null, state text not null, started_at timestamptz not null default now(), completed_at timestamptz);
create table public.reconciliation_items (id uuid primary key default gen_random_uuid(), run_id uuid not null references public.reconciliation_runs(id), classification text not null, resource_id text, details jsonb not null default '{}', created_at timestamptz not null default now());

create unique index ledger_accounts_wallet_scope_uq on public.ledger_accounts(wallet_id, account_type, asset, network) where wallet_id is not null;
create unique index ledger_accounts_platform_scope_uq on public.ledger_accounts(account_type, asset, network) where wallet_id is null;
create index ledger_postings_account_idx on public.ledger_postings(account_id, created_at);
create index wallet_deposits_wallet_idx on public.wallet_deposits(wallet_id, created_at desc);
create index wallet_withdrawals_wallet_idx on public.wallet_withdrawals(wallet_id, created_at desc);
create index audit_resource_idx on public.api_audit_events(resource_type, resource_id, created_at);

-- A deferred constraint allows all postings in a transaction to be inserted before
-- enforcing that every entry balances independently for each asset and network.
create or replace function public.enforce_balanced_ledger_entry() returns trigger language plpgsql set search_path = '' as $$
declare unbalanced boolean;
begin
  select exists (
    select 1 from public.ledger_postings
    where entry_id = coalesce(new.entry_id, old.entry_id)
    group by asset, network
    having sum(case when side = 'debit' then amount else -amount end) <> 0
  ) into unbalanced;
  if unbalanced then raise exception 'ledger entry must balance by asset and network'; end if;
  return null;
end $$;
create constraint trigger ledger_postings_balanced
after insert on public.ledger_postings deferrable initially deferred
for each row execute function public.enforce_balanced_ledger_entry();

create or replace function public.enforce_ledger_entry_has_postings() returns trigger language plpgsql set search_path = '' as $$
declare posting_count bigint;
begin
  select count(*) into posting_count from public.ledger_postings where entry_id = new.id;
  if posting_count < 2 then raise exception 'ledger entry requires at least two postings'; end if;
  return null;
end $$;
create constraint trigger ledger_entry_has_postings
after insert on public.ledger_entries deferrable initially deferred
for each row execute function public.enforce_ledger_entry_has_postings();

create or replace function public.validate_ledger_posting_account() returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from public.ledger_accounts
    where id = new.account_id and asset = new.asset and network = new.network
  ) then raise exception 'posting asset and network must match its ledger account'; end if;
  return new;
end $$;
create trigger ledger_posting_account_match before insert on public.ledger_postings
for each row execute function public.validate_ledger_posting_account();

alter table public.wallet_accounts enable row level security; alter table public.wallet_addresses enable row level security;
alter table public.ledger_accounts enable row level security; alter table public.ledger_entries enable row level security; alter table public.ledger_postings enable row level security;
alter table public.wallet_deposits enable row level security; alter table public.wallet_withdrawals enable row level security;
alter table public.provider_webhook_events enable row level security; alter table public.api_idempotency_keys enable row level security;
alter table public.api_audit_events enable row level security; alter table public.reconciliation_runs enable row level security; alter table public.reconciliation_items enable row level security;

-- No policies are intentionally granted: all access is through the server-side API role.
create or replace function public.reject_financial_history_mutation() returns trigger language plpgsql set search_path = '' as $$ begin raise exception 'financial history is append-only'; end $$;
create trigger ledger_entries_append_only before update or delete on public.ledger_entries for each row execute function public.reject_financial_history_mutation();
create trigger ledger_postings_append_only before update or delete on public.ledger_postings for each row execute function public.reject_financial_history_mutation();
create trigger audit_events_append_only before update or delete on public.api_audit_events for each row execute function public.reject_financial_history_mutation();

revoke all on public.wallet_accounts, public.wallet_addresses, public.ledger_accounts,
  public.ledger_entries, public.ledger_postings, public.wallet_deposits,
  public.wallet_withdrawals, public.provider_webhook_events,
  public.api_idempotency_keys, public.api_audit_events,
  public.reconciliation_runs, public.reconciliation_items from anon, authenticated;
