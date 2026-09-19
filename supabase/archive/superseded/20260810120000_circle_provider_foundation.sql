-- Safe linkage between a Neptlium Capital Account and an external capital provider.
-- Provider credentials, entity secrets, recovery material and private keys never belong here.
create table public.capital_provider_wallets (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallet_accounts(id),
  provider text not null check (provider = 'circle'),
  provider_wallet_id text not null,
  provider_wallet_set_id text,
  provider_account_type text not null check (provider_account_type = 'EOA'),
  blockchain text not null check (blockchain = 'BASE-SEPOLIA'),
  address text not null,
  environment text not null check (environment = 'testnet'),
  status text not null check (status in ('live', 'pending', 'disabled')),
  last_provider_observation timestamptz,
  reconciliation_state text not null default 'unreconciled'
    check (reconciliation_state in ('unreconciled', 'matched', 'mismatch', 'review_required')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wallet_id, provider),
  unique (provider, provider_wallet_id),
  unique (blockchain, address)
);

alter table public.capital_provider_wallets enable row level security;
revoke all on public.capital_provider_wallets from anon, authenticated;
create index capital_provider_wallets_reconciliation_idx
  on public.capital_provider_wallets (provider, reconciliation_state, last_provider_observation);

alter table public.wallet_deposits add column provider_observed_at timestamptz;
alter table public.wallet_deposits add column reconciliation_state text not null default 'unreconciled'
  check (reconciliation_state in ('unreconciled', 'matched', 'mismatch', 'review_required'));
alter table public.wallet_withdrawals add column provider_observed_at timestamptz;
alter table public.wallet_withdrawals add column reconciliation_state text not null default 'unreconciled'
  check (reconciliation_state in ('unreconciled', 'matched', 'mismatch', 'review_required'));
