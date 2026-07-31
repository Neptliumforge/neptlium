-- Durable operational layer: restart-safe jobs, treasury policy, approvals and resolution workflows.
create table public.api_jobs (
  id uuid primary key default gen_random_uuid(), job_type text not null, idempotency_key text not null,
  payload jsonb not null, state text not null default 'queued' check (state in ('queued','leased','completed','dead_letter')),
  attempts integer not null default 0 check (attempts >= 0), available_at timestamptz not null default now(),
  lease_owner text, lease_expires_at timestamptz, last_error_code text,
  created_at timestamptz not null default now(), completed_at timestamptz,
  unique(job_type, idempotency_key),
  check ((state = 'leased') = (lease_owner is not null and lease_expires_at is not null))
);
create index api_jobs_claim_idx on public.api_jobs(state, available_at, lease_expires_at)
  where state in ('queued','leased');

create table public.treasury_destination_allowlist (
  id uuid primary key default gen_random_uuid(), wallet_id uuid not null references public.wallet_accounts(id),
  asset text not null, network text not null, destination text not null, label text not null,
  status text not null default 'pending' check (status in ('pending','active','revoked')),
  activated_at timestamptz, created_at timestamptz not null default now(), unique(wallet_id, network, destination)
);
create table public.withdrawal_approvals (
  id uuid primary key default gen_random_uuid(), withdrawal_id uuid not null references public.wallet_withdrawals(id),
  actor_id uuid not null references auth.users(id), decision text not null check (decision in ('approved','rejected')),
  policy_version text not null, created_at timestamptz not null default now(), unique(withdrawal_id, actor_id)
);
create table public.treasury_policies (
  id uuid primary key default gen_random_uuid(), asset text not null, network text not null,
  single_approval_limit numeric(78,0) not null check(single_approval_limit > 0),
  dual_approval_threshold numeric(78,0) not null check(dual_approval_threshold >= single_approval_limit),
  maximum_amount numeric(78,0) not null check(maximum_amount >= dual_approval_threshold),
  require_allowlist boolean not null default true, version text not null unique, active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.reconciliation_items add column status text not null default 'open' check(status in ('open','acknowledged','resolved'));
alter table public.reconciliation_items add column resolved_by uuid references auth.users(id);
alter table public.reconciliation_items add column resolved_at timestamptz;
alter table public.reconciliation_items add column resolution_note text;

alter table public.api_jobs enable row level security;
alter table public.treasury_destination_allowlist enable row level security;
alter table public.withdrawal_approvals enable row level security;
alter table public.treasury_policies enable row level security;
revoke all on public.api_jobs, public.treasury_destination_allowlist, public.withdrawal_approvals, public.treasury_policies from anon, authenticated;

create or replace function public.reject_approval_mutation() returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'withdrawal approvals are append-only'; end $$;
create trigger withdrawal_approvals_append_only before update or delete on public.withdrawal_approvals
for each row execute function public.reject_approval_mutation();

-- Durable repository adapters should claim work in a transaction using this SKIP LOCKED function.
create or replace function public.claim_api_job(p_worker_id text, p_lease_seconds integer)
returns setof public.api_jobs language sql security invoker set search_path = '' as $$
  update public.api_jobs set state='leased', lease_owner=p_worker_id,
    lease_expires_at=now()+make_interval(secs => p_lease_seconds), attempts=attempts+1
  where id=(select id from public.api_jobs
    where (state='queued' and available_at<=now()) or (state='leased' and lease_expires_at<=now())
    order by available_at for update skip locked limit 1)
  returning *;
$$;
