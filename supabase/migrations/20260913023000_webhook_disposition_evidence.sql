-- Gate 04: make successful provider webhook disposition durably observable.
-- Provider callbacks remain evidence-only at this boundary. These fields do not
-- authorize settlement, ledger posting, balance mutation, or capital availability.

alter table public.provider_webhook_inbox
  add column if not exists disposition_action text,
  add column if not exists disposition_reason text;

alter table public.provider_webhook_inbox
  drop constraint if exists provider_webhook_inbox_disposition_action_check,
  drop constraint if exists provider_webhook_inbox_disposition_reason_check,
  drop constraint if exists provider_webhook_inbox_disposition_pair_check;

alter table public.provider_webhook_inbox
  add constraint provider_webhook_inbox_disposition_action_check
  check (
    disposition_action is null
    or (length(trim(disposition_action)) between 1 and 120)
  ),
  add constraint provider_webhook_inbox_disposition_reason_check
  check (
    disposition_reason is null
    or (length(trim(disposition_reason)) between 1 and 120)
  ),
  add constraint provider_webhook_inbox_disposition_pair_check
  check (disposition_reason is null or disposition_action is not null);

-- Classified completion overload. Existing three-argument callers keep the
-- established function below; Stripe Gate 04 uses this overload to persist the
-- disposition that justified completion.
create or replace function public.complete_provider_webhook(
  p_provider text,
  p_environment public.provider_environment,
  p_provider_event_id text,
  p_disposition_action text,
  p_disposition_reason text
)
returns public.provider_webhook_inbox
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event public.provider_webhook_inbox%rowtype;
begin
  if p_disposition_action is null
     or length(trim(p_disposition_action)) = 0
     or length(p_disposition_action) > 120 then
    raise exception 'invalid webhook disposition action';
  end if;

  if p_disposition_reason is not null
     and (length(trim(p_disposition_reason)) = 0 or length(p_disposition_reason) > 120) then
    raise exception 'invalid webhook disposition reason';
  end if;

  update public.provider_webhook_inbox
     set processing_state = 'processed',
         processed_at = coalesce(processed_at, now()),
         lease_expires_at = null,
         next_attempt_at = null,
         last_error_code = null,
         disposition_action = p_disposition_action,
         disposition_reason = p_disposition_reason
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

-- Preserve the established unclassified completion contract for existing
-- provider control-plane callers.
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

revoke all on function public.complete_provider_webhook(
  text, public.provider_environment, text, text, text
) from public, anon, authenticated;

grant execute on function public.complete_provider_webhook(
  text, public.provider_environment, text, text, text
) to service_role;

alter function public.complete_provider_webhook(
  text, public.provider_environment, text, text, text
) owner to postgres;

-- Reassert the existing completion function permissions after replacement.
revoke all on function public.complete_provider_webhook(
  text, public.provider_environment, text
) from public, anon, authenticated;

grant execute on function public.complete_provider_webhook(
  text, public.provider_environment, text
) to service_role;

alter function public.complete_provider_webhook(
  text, public.provider_environment, text
) owner to postgres;
