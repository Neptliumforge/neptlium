-- Neptlium Platform Core v0.2 — canonical ownership/control plane.
-- Additive only. This does not move money, post ledger journals, or rewrite historical financial rows.
-- Browser roles receive no direct access; application access is mediated by api.neptlium.com.

create table public.platform_owners (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('individual','organization')),
  individual_user_id uuid references auth.users(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete restrict,
  status text not null default 'active' check (status in ('active','suspended','retired')),
  created_at timestamptz not null default now(),
  suspended_at timestamptz,
  retired_at timestamptz,
  constraint platform_owners_subject_exactly_one check (
    (owner_type = 'individual' and individual_user_id is not null and organization_id is null)
    or (owner_type = 'organization' and organization_id is not null and individual_user_id is null)
  ),
  constraint platform_owners_status_timestamps check (
    (status = 'active' and retired_at is null)
    or (status = 'suspended' and suspended_at is not null and retired_at is null)
    or (status = 'retired' and retired_at is not null)
  )
);

create unique index platform_owners_individual_unique on public.platform_owners(individual_user_id) where individual_user_id is not null;
create unique index platform_owners_organization_unique on public.platform_owners(organization_id) where organization_id is not null;

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  role text not null check (role in ('owner','admin','approver','operator','viewer','auditor')),
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  created_at timestamptz not null default now(),
  suspended_at timestamptz,
  revoked_at timestamptz,
  constraint organization_memberships_state_consistent check (
    (status = 'active' and revoked_at is null)
    or (status = 'suspended' and suspended_at is not null and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  ),
  unique (organization_id, user_id)
);
create index organization_memberships_user_status_idx on public.organization_memberships(user_id, status, organization_id);

create table public.canonical_assets (
  asset_key text primary key,
  symbol text not null check (symbol ~ '^[A-Z0-9._-]{1,32}$'),
  display_name text not null check (length(trim(display_name)) > 0),
  network_identifier text not null check (network_identifier ~ '^[a-z0-9._:-]{2,64}$'),
  contract_address text,
  decimals integer not null check (decimals between 0 and 36),
  asset_kind text not null check (asset_kind in ('native','token','fiat','security','fund','other')),
  status text not null default 'active' check (status in ('active','disabled','retired')),
  created_at timestamptz not null default now(),
  constraint canonical_assets_contract_normalized check (contract_address is null or contract_address ~ '^0x[0-9a-f]{40}$'),
  constraint canonical_assets_kind_contract_consistent check (
    (asset_kind = 'token' and contract_address is not null)
    or (asset_kind in ('native','fiat') and contract_address is null)
    or asset_kind in ('security','fund','other')
  ),
  constraint canonical_assets_key_consistent check (asset_key = network_identifier || ':' || symbol || ':' || coalesce(contract_address, 'native'))
);
create unique index canonical_assets_network_symbol_contract_unique on public.canonical_assets(network_identifier, symbol, contract_address) nulls not distinct;

alter table public.ledger_accounts add column if not exists platform_owner_id uuid references public.platform_owners(id) on delete restrict;
alter table public.ledger_journals add column if not exists platform_owner_id uuid references public.platform_owners(id) on delete restrict;
create index if not exists ledger_accounts_platform_owner_idx on public.ledger_accounts(platform_owner_id, asset, network);
create index if not exists ledger_journals_platform_owner_idx on public.ledger_journals(platform_owner_id, posted_at desc);

create table public.platform_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete restrict,
  platform_owner_id uuid references public.platform_owners(id) on delete restrict,
  event_type text not null check (length(trim(event_type)) > 0),
  resource_type text not null check (length(trim(resource_type)) > 0),
  resource_id text not null check (length(trim(resource_id)) > 0),
  request_id text not null check (length(trim(request_id)) > 0),
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index platform_audit_events_owner_created_idx on public.platform_audit_events(platform_owner_id, created_at desc);
create unique index platform_audit_events_idempotency_unique on public.platform_audit_events(platform_owner_id, event_type, idempotency_key) where idempotency_key is not null;

alter table public.platform_owners enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.canonical_assets enable row level security;
alter table public.platform_audit_events enable row level security;
revoke all on public.platform_owners, public.organization_memberships, public.canonical_assets, public.platform_audit_events from public, anon, authenticated;
grant select on public.platform_owners, public.organization_memberships, public.canonical_assets, public.platform_audit_events to service_role;
grant insert, update on public.platform_owners, public.organization_memberships, public.canonical_assets to service_role;
grant insert on public.platform_audit_events to service_role;

create or replace function public.reject_platform_audit_event_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'platform audit history is append-only';
end;
$$;
revoke all on function public.reject_platform_audit_event_mutation() from public, anon, authenticated;
create trigger platform_audit_events_append_only before update or delete on public.platform_audit_events for each row execute function public.reject_platform_audit_event_mutation();

create or replace function public.enforce_platform_owner_identity() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.owner_type is distinct from new.owner_type
     or old.individual_user_id is distinct from new.individual_user_id
     or old.organization_id is distinct from new.organization_id then
    raise exception 'platform owner identity is immutable';
  end if;
  if old.status = 'retired' and new.status <> 'retired' then
    raise exception 'retired platform owner cannot be reactivated';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_platform_owner_identity() from public, anon, authenticated;
create trigger platform_owners_identity_guard before update on public.platform_owners for each row execute function public.enforce_platform_owner_identity();
