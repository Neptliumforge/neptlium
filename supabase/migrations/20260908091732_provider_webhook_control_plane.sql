-- Production provider webhook control plane.
-- Provider callbacks are evidence only. These functions cannot post ledger journals,
-- settle funding, change balances, or execute provider movement.

alter table public.provider_webhook_inbox
  drop constraint if exists provider_webhook_inbox_processing_state_check;

alter table public.provider_webhook_inbox
  add constraint provider_webhook_inbox_processing_state_check
  check (
    processing_state in (
      'received',
      'processing',
      'processed',
      'failed',
      'dead_letter'
    )
  );

alter table public.provider_webhook_inbox
  add column if not exists lease_expires_at timestamptz,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists next_attempt_at timestamptz,
  add column if not exists dead_lettered_at timestamptz;

create index if not exists provider_webhook_inbox_claim_idx
  on public.provider_webhook_inbox(processing_state, next_attempt_at, received_at);

create or replace function public.claim_provider_webhook(
  p_provider text,
  p_environment public.provider_environment,
  p_provider_event_id text,
  p_lease_seconds integer default 60
)
returns public.provider_webhook_inbox
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event public.provider_webhook_inbox%rowtype;
begin
  if p_provider not in ('stripe','circle','alchemy') then
    raise exception 'unsupported provider';
  end if;

  if p_lease_seconds < 5 or p_lease_seconds > 300 then
    raise exception 'invalid webhook lease duration';
  end if;

  select *
    into v_event
    from public.provider_webhook_inbox
   where provider = p_provider
     and environment = p_environment
     and provider_event_id = p_provider_event_id
   for update;

  if not found then
    raise exception 'provider webhook not found';
  end if;

  if v_event.processing_state in ('processed','dead_letter') then
    return v_event;
  end if;

  if v_event.processing_state = 'processing'
     and v_event.lease_expires_at is not null
     and v_event.lease_expires_at > now() then
    return v_event;
  end if;

  if v_event.next_attempt_at is not null and v_event.next_attempt_at > now() then
    return v_event;
  end if;

  update public.provider_webhook_inbox
     set processing_state = 'processing',
         attempts = attempts + 1,
         last_attempt_at = now(),
         lease_expires_at = now() + make_interval(secs => p_lease_seconds),
         last_error_code = null
   where id = v_event.id
   returning * into v_event;

  return v_event;
end;
$$;

create or replace function public.complete_provider_webhook(
  p_provider text,
  p_environment public.provider_environment,
  p_provider_event_id text
)
returns public.provider_webhook_inbox
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event public.provider_webhook_inbox%rowtype;
begin
  update public.provider_webhook_inbox
     set processing_state = 'processed',
         processed_at = coalesce(processed_at, now()),
         lease_expires_at = null,
         next_attempt_at = null,
         last_error_code = null
   where provider = p_provider
     and environment = p_environment
     and provider_event_id = p_provider_event_id
     and processing_state = 'processing'
   returning * into v_event;

  if not found then
    select *
      into v_event
      from public.provider_webhook_inbox
     where provider = p_provider
       and environment = p_environment
       and provider_event_id = p_provider_event_id;
  end if;

  if not found then raise exception 'provider webhook not found'; end if;

  return v_event;
end;
$$;

create or replace function public.fail_provider_webhook(
  p_provider text,
  p_environment public.provider_environment,
  p_provider_event_id text,
  p_error_code text,
  p_max_attempts integer default 8
)
returns public.provider_webhook_inbox
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event public.provider_webhook_inbox%rowtype;
  v_dead boolean;
  v_delay_seconds integer;
begin
  if p_error_code is null
     or length(trim(p_error_code)) = 0
     or length(p_error_code) > 120 then
    raise exception 'invalid webhook error code';
  end if;

  if p_max_attempts < 1 or p_max_attempts > 20 then
    raise exception 'invalid webhook maximum attempts';
  end if;

  select *
    into v_event
    from public.provider_webhook_inbox
   where provider = p_provider
     and environment = p_environment
     and provider_event_id = p_provider_event_id
   for update;

  if not found then raise exception 'provider webhook not found'; end if;

  if v_event.processing_state in ('processed','dead_letter') then
    return v_event;
  end if;

  if v_event.processing_state <> 'processing' then
    return v_event;
  end if;

  v_dead := v_event.attempts >= p_max_attempts;
  v_delay_seconds := least(
    3600,
    greatest(5, (power(2, greatest(v_event.attempts - 1, 0)) * 5)::integer)
  );

  update public.provider_webhook_inbox
     set processing_state = case when v_dead then 'dead_letter' else 'failed' end,
         last_error_code = p_error_code,
         lease_expires_at = null,
         next_attempt_at = case
           when v_dead then null
           else now() + make_interval(secs => v_delay_seconds)
         end,
         dead_lettered_at = case
           when v_dead then coalesce(dead_lettered_at, now())
           else dead_lettered_at
         end
   where id = v_event.id
   returning * into v_event;

  return v_event;
end;
$$;

revoke all on function public.claim_provider_webhook(
  text, public.provider_environment, text, integer
) from public, anon, authenticated;

revoke all on function public.complete_provider_webhook(
  text, public.provider_environment, text
) from public, anon, authenticated;

revoke all on function public.fail_provider_webhook(
  text, public.provider_environment, text, text, integer
) from public, anon, authenticated;

grant execute on function public.claim_provider_webhook(
  text, public.provider_environment, text, integer
) to service_role;

grant execute on function public.complete_provider_webhook(
  text, public.provider_environment, text
) to service_role;

grant execute on function public.fail_provider_webhook(
  text, public.provider_environment, text, text, integer
) to service_role;

alter function public.claim_provider_webhook(
  text, public.provider_environment, text, integer
) owner to postgres;

alter function public.complete_provider_webhook(
  text, public.provider_environment, text
) owner to postgres;

alter function public.fail_provider_webhook(
  text, public.provider_environment, text, text, integer
) owner to postgres;

-- Keep browser roles and direct table mutation shut out.
revoke all on public.provider_webhook_inbox from public, anon, authenticated;
revoke update, delete on public.provider_webhook_inbox from service_role;
grant select, insert on public.provider_webhook_inbox to service_role;
