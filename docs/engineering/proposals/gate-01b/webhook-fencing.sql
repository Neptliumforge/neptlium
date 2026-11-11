-- PROPOSAL ONLY. Not in supabase/migrations. Never run without the migration gate.
-- Dependency: canonical main provider inbox/control-plane migrations.
-- No data backfill, provider configuration, scheduler, ledger posting or financial activation.
begin;

alter table public.provider_webhook_inbox add column lease_token uuid;
alter table public.subscriptions add column stripe_last_event_created bigint,
  add column stripe_last_event_id text, add column stripe_provider_status text;

-- Populating bindings requires a separately reviewed billing provisioning workflow.
-- An unbound event fails closed. No existing customer IDs or environments are guessed.
create table public.stripe_subscription_bindings (
  subscription_row_id uuid primary key references public.subscriptions(id) on delete restrict,
  environment public.provider_environment not null,
  customer_id text not null,
  subscription_id text not null,
  plan text not null check (plan in ('pro','elite')),
  unique(environment, customer_id),
  unique(environment, subscription_id)
);
alter table public.stripe_subscription_bindings enable row level security;
revoke all on public.stripe_subscription_bindings from public, anon, authenticated, service_role;
grant select on public.stripe_subscription_bindings to service_role;

-- Evidence remains separate from settlement_evidence and every canonical ledger table.
create table public.provider_observation_evidence_v2 (
  id uuid primary key default gen_random_uuid(),
  inbox_id uuid not null references public.provider_webhook_inbox(id) on delete restrict,
  environment public.provider_environment not null,
  tx_hash text not null,
  log_index integer not null check (log_index >= 0),
  evidence jsonb not null check ((evidence->'canonical' = 'false'::jsonb) is true),
  created_at timestamptz not null default now(),
  unique(inbox_id, tx_hash, log_index)
);
alter table public.provider_observation_evidence_v2 enable row level security;
revoke all on public.provider_observation_evidence_v2 from public, anon, authenticated, service_role;
grant select on public.provider_observation_evidence_v2 to service_role;
create trigger provider_observations_no_update_delete before update or delete
  on public.provider_observation_evidence_v2 for each row execute function public.reject_ledger_mutation();

create function public.claim_provider_webhook_v2(p_provider text,
  p_environment public.provider_environment, p_provider_event_id text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare e public.provider_webhook_inbox%rowtype;
begin
  select * into strict e from public.provider_webhook_inbox
    where provider=p_provider and environment=p_environment and provider_event_id=p_provider_event_id for update;
  if e.signature_verified_at is null then raise exception 'unverified inbox'; end if;
  if e.processing_state in ('processed','dead_letter') then
    return jsonb_build_object('acquired',false,'state',e.processing_state);
  end if;
  if (e.processing_state='processing' and e.lease_expires_at > clock_timestamp())
     or e.next_attempt_at > clock_timestamp() then
    return jsonb_build_object('acquired',false,'state',e.processing_state);
  end if;
  if e.attempts >= 8 then
    update public.provider_webhook_inbox set processing_state='dead_letter', dead_lettered_at=clock_timestamp(),
      lease_token=null, lease_expires_at=null where id=e.id;
    return jsonb_build_object('acquired',false,'state','dead_letter');
  end if;
  update public.provider_webhook_inbox set processing_state='processing', attempts=attempts+1,
    lease_token=gen_random_uuid(), lease_expires_at=clock_timestamp()+interval '60 seconds',
    last_attempt_at=clock_timestamp(), next_attempt_at=null, last_error_code=null
    where id=e.id returning * into e;
  return jsonb_build_object('acquired',true,'state','processing','token',e.lease_token,'payload',e.payload);
end $$;

create function public.renew_provider_webhook_v2(p_provider text,
  p_environment public.provider_environment, p_provider_event_id text, p_token uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
  update public.provider_webhook_inbox set lease_expires_at=clock_timestamp()+interval '60 seconds'
    where provider=p_provider and environment=p_environment and provider_event_id=p_provider_event_id
      and lease_token=p_token and processing_state='processing' and lease_expires_at > clock_timestamp();
  if not found then raise exception 'webhook fence lost'; end if;
  return jsonb_build_object('state','processing');
end $$;
revoke all on function public.renew_provider_webhook_v2(text,public.provider_environment,text,uuid) from public,anon,authenticated;
grant execute on function public.renew_provider_webhook_v2(text,public.provider_environment,text,uuid) to service_role;
alter function public.renew_provider_webhook_v2(text,public.provider_environment,text,uuid) owner to postgres;

create function public.finish_provider_webhook_v2(p_provider text,
  p_environment public.provider_environment, p_provider_event_id text, p_token uuid, p_disposition jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  e public.provider_webhook_inbox%rowtype;
  b public.stripe_subscription_bindings%rowtype;
  s public.subscriptions%rowtype;
  c jsonb := p_disposition->'command';
  observed jsonb;
  previous jsonb;
  status_value text;
  event_object jsonb;
  event_customer text;
  event_subscription text;
  event_user text;
  action_value text := p_disposition->>'action';
begin
  select * into strict e from public.provider_webhook_inbox
    where provider=p_provider and environment=p_environment and provider_event_id=p_provider_event_id for update;
  if p_token is null or e.lease_token is distinct from p_token or e.processing_state <> 'processing'
     or e.lease_expires_at is null or e.lease_expires_at <= clock_timestamp() then raise exception 'webhook fence lost'; end if;
  if action_value is null or action_value not in ('subscription_update','ignored','evidence_recorded') then
    raise exception 'invalid disposition';
  end if;
  if action_value='subscription_update' then
    if p_provider <> 'stripe' or c is null or c->>'environment' is distinct from p_environment::text
       or c->>'eventId' is distinct from e.provider_event_id or e.payload->>'id' is distinct from e.provider_event_id
       or e.payload->>'livemode' is distinct from (p_environment='live')::text
       or c->>'eventCreated' is distinct from e.payload->>'created'
       or coalesce(c->>'eventCreated','') !~ '^[0-9]{1,16}$' then raise exception 'invalid subscription scope'; end if;
    event_object := e.payload#>'{data,object}';
    if jsonb_typeof(event_object) is distinct from 'object' then raise exception 'invalid Stripe payload object'; end if;
    event_customer := case jsonb_typeof(event_object->'customer')
      when 'string' then event_object->>'customer' when 'object' then event_object#>>'{customer,id}' else null end;
    event_subscription := case when c->>'kind'='activate_checkout' then
      case jsonb_typeof(event_object->'subscription') when 'string' then event_object->>'subscription'
        when 'object' then event_object#>>'{subscription,id}' else null end
      else event_object->>'id' end;
    event_user := event_object#>>'{metadata,user_id}';
    if event_customer is null or event_subscription is null
       or c->>'customerId' is distinct from event_customer or c->>'subscriptionId' is distinct from event_subscription
       or (c ? 'userId' and c->>'userId' is distinct from event_user) then raise exception 'Stripe payload binding mismatch'; end if;
    if c->>'kind'='activate_checkout' then
      if e.payload->>'type' is distinct from 'checkout.session.completed'
         or event_object->>'mode' is distinct from 'subscription'
         or event_object->>'payment_status' is distinct from 'paid'
         or nullif(event_user,'') is null then raise exception 'checkout payload is not paid subscription evidence'; end if;
      status_value := 'active';
    elsif c->>'kind'='sync_subscription' then
      if e.payload->>'type' is null or e.payload->>'type' not in ('customer.subscription.updated','customer.subscription.deleted') then
        raise exception 'invalid subscription payload type'; end if;
      status_value := case when e.payload->>'type'='customer.subscription.deleted' then 'canceled' else event_object->>'status' end;
      if c->>'status' is distinct from status_value then raise exception 'Stripe payload status mismatch'; end if;
    else raise exception 'unsupported subscription payload command'; end if;
    select * into strict b from public.stripe_subscription_bindings
      where environment=p_environment and customer_id=c->>'customerId' and subscription_id=c->>'subscriptionId';
    select * into strict s from public.subscriptions where id=b.subscription_row_id for update;
    if s.stripe_customer_id is distinct from b.customer_id or s.stripe_subscription_id is distinct from b.subscription_id
       or (c ? 'userId' and c->>'userId' is distinct from s.user_id::text)
       or (c->>'kind'='activate_checkout' and event_user is distinct from s.user_id::text) then raise exception 'subscription binding mismatch'; end if;
    -- Equal timestamps across different events are ambiguous, never resolved by arbitrary event-ID order.
    if s.stripe_last_event_created = (c->>'eventCreated')::bigint and s.stripe_last_event_id is distinct from e.provider_event_id then
      raise exception 'ambiguous subscription event order; reconcile current provider state';
    end if;
    if s.stripe_last_event_created is null or s.stripe_last_event_created < (c->>'eventCreated')::bigint then
      if status_value is null or status_value not in ('active','canceled','past_due','trialing','incomplete','incomplete_expired','unpaid','paused') then
        raise exception 'unsupported subscription status';
      end if;
      update public.subscriptions set stripe_provider_status=status_value,
        status=(case when status_value in ('unpaid','paused','incomplete_expired') then 'canceled' else status_value end)::public.subscription_status,
        plan=(case when status_value in ('canceled','incomplete_expired','unpaid','paused') then 'free' else b.plan end)::public.subscription_plan,
        stripe_last_event_created=(c->>'eventCreated')::bigint, stripe_last_event_id=e.provider_event_id,
        updated_at=clock_timestamp() where id=s.id;
    end if;
  elsif p_provider='alchemy' then
    if e.payload->>'id' is distinct from p_provider_event_id or e.payload->>'type' is distinct from 'ADDRESS_ACTIVITY'
       or e.payload#>>'{event,network}' is distinct from 'BASE_MAINNET'
       or jsonb_typeof(e.payload#>'{event,activity}') is distinct from 'array' then raise exception 'invalid Alchemy payload'; end if;
    if action_value <> 'evidence_recorded' or jsonb_typeof(p_disposition->'observations') is distinct from 'array'
       or jsonb_array_length(p_disposition->'observations') > 100 then raise exception 'invalid observations'; end if;
    for observed in select value from jsonb_array_elements(p_disposition->'observations') loop
      if p_environment <> 'live' or observed->'canonical' is distinct from 'false'::jsonb
         or observed->>'source' is distinct from 'ALCHEMY' or observed->>'environment' is distinct from 'LIVE' or observed->>'network' is distinct from 'BASE'
         or observed->>'chainId' is distinct from '8453' or observed->>'asset' is distinct from 'USDC'
         or observed->>'receiptStatus' is distinct from 'SUCCESS'
         or observed->>'state' is distinct from 'observed' or observed->>'transferType' is distinct from 'ERC20'
         or observed->'tokenDecimals' is distinct from '6'::jsonb
         or coalesce(observed->>'transactionHash','') !~ '^0x[0-9a-f]{64}$'
         or observed->>'txHash' is distinct from observed->>'transactionHash'
         or coalesce(observed->>'blockHash','') !~ '^0x[0-9a-f]{64}$'
         or coalesce(observed->>'blockNumber','') !~ '^0x[0-9a-fA-F]+$'
         or coalesce(observed->>'sender','') !~ '^0x[0-9a-f]{40}$'
         or coalesce(observed->>'recipient','') !~ '^0x[0-9a-f]{40}$'
         or observed->>'address' is distinct from observed->>'recipient'
         or jsonb_typeof(observed->'rawAtomicAmount') is distinct from 'string'
         or jsonb_typeof(observed->'amountAtomic') is distinct from 'string'
         or coalesce(observed->>'rawAtomicAmount','') !~ '^[1-9][0-9]{0,77}$'
         or observed->>'amountAtomic' is distinct from observed->>'rawAtomicAmount'
         or jsonb_typeof(observed->'logIndex') is distinct from 'number'
         or coalesce(observed->>'logIndex','') !~ '^[0-9]{1,9}$'
         or jsonb_typeof(observed->'confirmations') is distinct from 'number'
         or coalesce(observed->>'confirmations','') !~ '^[0-9]{1,15}$'
         or coalesce(observed->>'observedAt','') = ''
         or observed->>'observedAt' is distinct from e.payload->>'createdAt'
         or observed->>'finalityState' is null or observed->>'finalityState' not in ('UNCONFIRMED','CONFIRMING')
         or not exists(select 1 from jsonb_array_elements(e.payload#>'{event,activity}') activity
           where lower(activity->>'hash')=observed->>'transactionHash')
         or observed->>'tokenContract' is distinct from '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
         or not exists (select 1 from public.deposit_routes r where r.id::text=observed->>'depositRouteId'
           and r.funding_intent_id::text=observed->>'fundingIntentId' and r.treasury_destination_id::text=observed->>'treasuryDestinationId'
           and lower(r.deposit_address)=observed->>'recipient' and r.environment=p_environment and r.asset='USDC' and r.network='BASE' and r.status='active')
         then raise exception 'observation binding mismatch'; end if;
      if not isfinite((observed->>'observedAt')::timestamptz) then raise exception 'invalid observation timestamp'; end if;
      select evidence into previous from public.provider_observation_evidence_v2
        where inbox_id=e.id and tx_hash=observed->>'transactionHash' and log_index=(observed->>'logIndex')::integer;
      if found and previous is distinct from observed then raise exception 'observation conflict'; end if;
      insert into public.provider_observation_evidence_v2(inbox_id,environment,tx_hash,log_index,evidence)
        values(e.id,p_environment,observed->>'transactionHash',(observed->>'logIndex')::integer,observed)
        on conflict(inbox_id,tx_hash,log_index) do nothing;
    end loop;
  end if;
  update public.provider_webhook_inbox set processing_state='processed', processed_at=clock_timestamp(),
    lease_token=null, lease_expires_at=null, next_attempt_at=null, last_error_code=null,
    disposition_action=action_value, disposition_reason=p_disposition->>'reason' where id=e.id;
  return jsonb_build_object('state','processed');
end $$;

create function public.fail_provider_webhook_v2(p_provider text,
  p_environment public.provider_environment, p_provider_event_id text, p_token uuid, p_error_code text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare e public.provider_webhook_inbox%rowtype;
begin
  select * into strict e from public.provider_webhook_inbox where provider=p_provider
    and environment=p_environment and provider_event_id=p_provider_event_id for update;
  if p_token is null or e.lease_token is distinct from p_token or e.processing_state <> 'processing'
     or e.lease_expires_at is null or e.lease_expires_at <= clock_timestamp() then raise exception 'webhook fence lost'; end if;
  if p_error_code is null or p_error_code !~ '^[a-z0-9_]{1,120}$' then raise exception 'invalid error code'; end if;
  update public.provider_webhook_inbox set
    processing_state=case when attempts >= 8 then 'dead_letter' else 'failed' end,
    dead_lettered_at=case when attempts >= 8 then clock_timestamp() else null end,
    next_attempt_at=case when attempts < 8 then clock_timestamp()+make_interval(secs => least(3600,5*power(2,attempts-1)::integer)) else null end,
    lease_token=null, lease_expires_at=null, last_error_code=p_error_code where id=e.id;
  return jsonb_build_object('state','recorded');
end $$;

create function public.due_provider_webhooks_v2(p_limit integer)
returns table(provider text, environment public.provider_environment, provider_event_id text)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 100 then raise exception 'invalid batch size'; end if;
  return query select e.provider,e.environment,e.provider_event_id from public.provider_webhook_inbox e
    where e.processing_state in ('received','failed','processing') and e.signature_verified_at is not null
      and (e.next_attempt_at is null or e.next_attempt_at <= clock_timestamp())
      and (e.processing_state <> 'processing' or e.lease_expires_at is null or e.lease_expires_at <= clock_timestamp())
    order by e.received_at limit p_limit;
end $$;

revoke all on function public.claim_provider_webhook_v2(text,public.provider_environment,text) from public,anon,authenticated;
revoke all on function public.finish_provider_webhook_v2(text,public.provider_environment,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.fail_provider_webhook_v2(text,public.provider_environment,text,uuid,text) from public,anon,authenticated;
revoke all on function public.due_provider_webhooks_v2(integer) from public,anon,authenticated;
grant execute on function public.claim_provider_webhook_v2(text,public.provider_environment,text) to service_role;
grant execute on function public.finish_provider_webhook_v2(text,public.provider_environment,text,uuid,jsonb) to service_role;
grant execute on function public.fail_provider_webhook_v2(text,public.provider_environment,text,uuid,text) to service_role;
grant execute on function public.due_provider_webhooks_v2(integer) to service_role;
alter function public.claim_provider_webhook_v2(text,public.provider_environment,text) owner to postgres;
alter function public.finish_provider_webhook_v2(text,public.provider_environment,text,uuid,jsonb) owner to postgres;
alter function public.fail_provider_webhook_v2(text,public.provider_environment,text,uuid,text) owner to postgres;
alter function public.due_provider_webhooks_v2(integer) owner to postgres;
-- Retire bypasses when every deployed caller has moved to v2. Required release prerequisite.
revoke all on function public.claim_provider_webhook(text,public.provider_environment,text,integer) from service_role;
revoke all on function public.complete_provider_webhook(text,public.provider_environment,text) from service_role;
revoke all on function public.complete_provider_webhook(text,public.provider_environment,text,text,text) from service_role;
revoke all on function public.fail_provider_webhook(text,public.provider_environment,text,text,integer) from service_role;
commit;
