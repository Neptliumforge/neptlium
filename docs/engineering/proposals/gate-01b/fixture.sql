-- DISPOSABLE DATABASE FIXTURE ONLY. Contains synthetic identities; never target a remote database.
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon noinherit; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated noinherit; end if;
  if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role noinherit bypassrls; end if;
end $$;
alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
alter default privileges in schema public grant all on functions to anon,authenticated,service_role;
create schema auth;
create table auth.users(id uuid primary key);
create type public.provider_environment as enum('test','live');
create type public.subscription_plan as enum('free','pro','elite');
create type public.subscription_status as enum('active','canceled','past_due','trialing','incomplete');
create table public.subscriptions(
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  plan public.subscription_plan not null default 'free', status public.subscription_status not null default 'active',
  stripe_customer_id text, stripe_subscription_id text, updated_at timestamptz not null default now()
);
create table public.provider_webhook_inbox(
  id uuid primary key default gen_random_uuid(), provider text not null,
  environment public.provider_environment not null, provider_event_id text not null,
  payload jsonb not null, payload_digest text not null, signature_verified_at timestamptz not null,
  processing_state text not null default 'received', attempts integer not null default 0,
  lease_expires_at timestamptz, last_attempt_at timestamptz, next_attempt_at timestamptz,
  dead_lettered_at timestamptz, processed_at timestamptz, received_at timestamptz not null default now(),
  last_error_code text, disposition_action text, disposition_reason text,
  unique(provider,environment,provider_event_id)
);
create table public.deposit_routes(
  id uuid primary key, funding_intent_id uuid not null, treasury_destination_id uuid not null,
  environment public.provider_environment not null, asset text not null, network text not null,
  deposit_address text not null, status text not null default 'active'
);
create table public.ledger_accounts(
  id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id), account_code text not null,
  asset text not null, network text, account_class text not null
);
create table public.ledger_journals(
  id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id),
  source_type text not null, source_id uuid not null, request_id text not null,
  reversal_of uuid references public.ledger_journals(id), unique(source_type,source_id)
);
create table public.ledger_postings(
  id uuid primary key default gen_random_uuid(), journal_id uuid not null references public.ledger_journals(id),
  account_id uuid not null references public.ledger_accounts(id), direction text not null check(direction in ('debit','credit')),
  amount_atomic numeric(78,0) not null check(amount_atomic>0), asset text not null
);
create function public.reject_ledger_mutation() returns trigger language plpgsql as $$
begin raise exception 'canonical ledger is append-only'; end $$;
-- Legacy signatures exist only to check explicit execution revocation by the proposal.
create function public.claim_provider_webhook(text,public.provider_environment,text,integer) returns void language sql as $$ select $$;
create function public.complete_provider_webhook(text,public.provider_environment,text) returns void language sql as $$ select $$;
create function public.complete_provider_webhook(text,public.provider_environment,text,text,text) returns void language sql as $$ select $$;
create function public.fail_provider_webhook(text,public.provider_environment,text,text,integer) returns void language sql as $$ select $$;
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111');

revoke all on function public.claim_provider_webhook(text,public.provider_environment,text,integer) from public,anon,authenticated;
revoke all on function public.complete_provider_webhook(text,public.provider_environment,text) from public,anon,authenticated;
revoke all on function public.complete_provider_webhook(text,public.provider_environment,text,text,text) from public,anon,authenticated;
revoke all on function public.fail_provider_webhook(text,public.provider_environment,text,text,integer) from public,anon,authenticated;
revoke all on public.provider_webhook_inbox from public,anon,authenticated;
revoke update,delete on public.provider_webhook_inbox from service_role;
