-- Governed Allocation Engine persistence. Forward-only. NOT applied by this change.
-- Customer browser roles receive no direct mutation authority; apps/api service-role owns this domain.

create table if not exists public.allocation_policies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  status text not null check (status in ('DRAFT','AUTHORIZED','RETIRED')) default 'DRAFT',
  current_version integer not null check (current_version > 0) default 1,
  created_by uuid not null references auth.users(id) on delete restrict,
  authorized_by uuid references auth.users(id) on delete restrict,
  authorized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.allocation_policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.allocation_policies(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  version integer not null check (version > 0),
  name text not null check (char_length(name) between 2 and 120),
  objective text not null check (char_length(objective) between 2 and 500),
  review_frequency text not null check (review_frequency in ('WEEKLY','MONTHLY','QUARTERLY','ANNUALLY','MANUAL')),
  reserve_requirement_bps integer not null check (reserve_requirement_bps between 0 and 10000),
  drift_tolerance_bps integer not null check (drift_tolerance_bps between 0 and 10000),
  allowed_assets jsonb not null default '[]'::jsonb,
  restricted_assets jsonb not null default '[]'::jsonb,
  liquidity_constraints jsonb not null default '{}'::jsonb,
  targets jsonb not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  authorized_by uuid references auth.users(id) on delete restrict,
  authorized_at timestamptz,
  created_at timestamptz not null default now(),
  unique(policy_id, version)
);

create table if not exists public.allocation_targets (
  id uuid primary key default gen_random_uuid(),
  policy_version_id uuid not null references public.allocation_policy_versions(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  target_key text not null,
  basis text not null check (basis in ('CLASSIFICATION','ASSET')),
  classification text check (classification in ('RESERVE','CORE','GROWTH','OPPORTUNITY','RESTRICTED')),
  asset text,
  network text,
  target_bps integer not null check (target_bps between 0 and 10000),
  minimum_bps integer check (minimum_bps between 0 and 10000),
  maximum_bps integer check (maximum_bps between 0 and 10000),
  created_at timestamptz not null default now(),
  unique(policy_version_id, target_key),
  check (coalesce(minimum_bps,0) <= target_bps),
  check (target_bps <= coalesce(maximum_bps,10000)),
  check ((basis = 'CLASSIFICATION' and classification is not null) or (basis = 'ASSET' and asset is not null and network is not null))
);

create table if not exists public.allocation_models (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  policy_id uuid not null references public.allocation_policies(id) on delete restrict,
  policy_version integer not null,
  state text not null check (state = 'MODELED') default 'MODELED',
  observed_at timestamptz not null,
  observed_snapshot jsonb not null,
  target_snapshot jsonb not null,
  drift_snapshot jsonb not null,
  valuation_state text not null check (valuation_state in ('NOT_REQUIRED','REQUIRED_UNAVAILABLE')),
  created_by uuid not null references auth.users(id) on delete restrict,
  idempotency_key text not null,
  request_digest text not null,
  created_at timestamptz not null default now(),
  unique(owner_id, idempotency_key)
);

create table if not exists public.allocation_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  model_id uuid not null references public.allocation_models(id) on delete restrict,
  policy_id uuid not null references public.allocation_policies(id) on delete restrict,
  policy_version integer not null,
  state text not null check (state in ('MODELED','AUTHORIZED','EXECUTION_PENDING','EXECUTING','EXECUTED','RECONCILING','RECONCILED','CANCELLED','FAILED','PARTIALLY_EXECUTED','DISCREPANCY')) default 'MODELED',
  observed_at timestamptz not null,
  observed_snapshot jsonb not null,
  target_snapshot jsonb not null,
  drift_snapshot jsonb not null,
  movements jsonb not null default '[]'::jsonb,
  constraints_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  authorized_by uuid references auth.users(id) on delete restrict,
  authorized_at timestamptz,
  idempotency_key text not null,
  request_digest text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, idempotency_key)
);

create table if not exists public.allocation_plan_movements (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.allocation_plans(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  sequence integer not null check (sequence > 0),
  movement_type text not null check (movement_type in ('INTERNAL_RECLASSIFICATION','TRANSFER','CONVERSION_REQUIRED','UNEXECUTABLE')),
  state text not null check (state in ('PROPOSED','RESERVATION_PENDING','RESERVED','SUBMITTED','SETTLED','FAILED','CANCELLED','RECONCILED','DISCREPANCY')) default 'PROPOSED',
  asset text,
  network text,
  from_classification text check (from_classification in ('RESERVE','CORE','GROWTH','OPPORTUNITY','RESTRICTED')),
  to_classification text check (to_classification in ('RESERVE','CORE','GROWTH','OPPORTUNITY','RESTRICTED')),
  amount_atomic numeric(78,0) check (amount_atomic is null or amount_atomic >= 0),
  executable boolean not null default false,
  reason text,
  reservation_id uuid,
  transfer_execution_id uuid,
  settlement_evidence_id uuid,
  reconciliation_item_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(plan_id, sequence)
);

create table if not exists public.allocation_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  policy_id uuid references public.allocation_policies(id) on delete restrict,
  policy_version integer,
  model_id uuid references public.allocation_models(id) on delete restrict,
  plan_id uuid references public.allocation_plans(id) on delete restrict,
  previous_state text,
  new_state text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.allocation_idempotency (
  owner_id uuid not null references auth.users(id) on delete restrict,
  operation text not null,
  idempotency_key text not null,
  request_digest text not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  primary key(owner_id, operation, idempotency_key)
);

create index if not exists allocation_policies_owner_idx on public.allocation_policies(owner_id, updated_at desc);
create index if not exists allocation_models_owner_idx on public.allocation_models(owner_id, created_at desc);
create index if not exists allocation_plans_owner_idx on public.allocation_plans(owner_id, created_at desc);
create index if not exists allocation_events_owner_idx on public.allocation_events(owner_id, created_at desc);
create index if not exists allocation_movements_plan_idx on public.allocation_plan_movements(plan_id, sequence);

create or replace view public.allocation_policy_current as
select p.id, p.owner_id, v.name, p.status, p.current_version, v.objective, v.review_frequency,
       v.reserve_requirement_bps, v.drift_tolerance_bps, v.allowed_assets, v.restricted_assets,
       v.liquidity_constraints, v.targets, p.created_by, p.authorized_by, p.created_at, p.updated_at, p.authorized_at
from public.allocation_policies p
join public.allocation_policy_versions v on v.policy_id = p.id and v.version = p.current_version;

create or replace view public.allocation_plan_projection as
select id, owner_id, model_id, policy_id, policy_version, state, observed_at, observed_snapshot,
       target_snapshot, drift_snapshot, movements, constraints_snapshot, created_by, authorized_by,
       created_at, authorized_at
from public.allocation_plans;

create or replace function public.allocation_assert_target_total(p_targets jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_total integer;
begin
  if jsonb_typeof(p_targets) <> 'array' or jsonb_array_length(p_targets) = 0 then
    raise exception 'allocation targets required' using errcode = '22023';
  end if;
  select coalesce(sum((x->>'targetBps')::integer),0) into v_total from jsonb_array_elements(p_targets) x;
  if v_total <> 10000 then raise exception 'allocation target total must equal 10000 basis points' using errcode = '22023'; end if;
  if exists(select 1 from jsonb_array_elements(p_targets) x where (x->>'targetBps')::integer < 0 or (x->>'targetBps')::integer > 10000) then
    raise exception 'invalid target basis points' using errcode = '22023';
  end if;
end $$;

create or replace function public.allocation_policy_json(p_policy_id uuid) returns jsonb
language sql security definer set search_path = public as $$
  select to_jsonb(v) from public.allocation_policy_current v where v.id = p_policy_id;
$$;

create or replace function public.allocation_plan_json(p_plan_id uuid) returns jsonb
language sql security definer set search_path = public as $$
  select to_jsonb(v) from public.allocation_plan_projection v where v.id = p_plan_id;
$$;

create or replace function public.allocation_create_policy(
  p_owner_id uuid, p_actor_id uuid, p_policy jsonb, p_idempotency_key text, p_request_digest text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_policy_id uuid; v_version_id uuid; v_response jsonb; v_previous record; v_target jsonb; v_seq integer := 0;
begin
  select * into v_previous from public.allocation_idempotency where owner_id=p_owner_id and operation='policy:create' and idempotency_key=p_idempotency_key;
  if found then
    if v_previous.request_digest <> p_request_digest then raise exception 'idempotency conflict' using errcode='23505'; end if;
    return v_previous.response || jsonb_build_object('replayed',true);
  end if;
  perform public.allocation_assert_target_total(p_policy->'targets');
  insert into public.allocation_policies(owner_id,status,current_version,created_by) values(p_owner_id,'DRAFT',1,p_actor_id) returning id into v_policy_id;
  insert into public.allocation_policy_versions(policy_id,owner_id,version,name,objective,review_frequency,reserve_requirement_bps,drift_tolerance_bps,allowed_assets,restricted_assets,liquidity_constraints,targets,created_by)
  values(v_policy_id,p_owner_id,1,p_policy->>'name',p_policy->>'objective',p_policy->>'reviewFrequency',(p_policy->>'reserveRequirementBps')::integer,(p_policy->>'driftToleranceBps')::integer,coalesce(p_policy->'allowedAssets','[]'),coalesce(p_policy->'restrictedAssets','[]'),coalesce(p_policy->'liquidityConstraints','{}'),p_policy->'targets',p_actor_id)
  returning id into v_version_id;
  for v_target in select value from jsonb_array_elements(p_policy->'targets') loop
    insert into public.allocation_targets(policy_version_id,owner_id,target_key,basis,classification,asset,network,target_bps,minimum_bps,maximum_bps)
    values(v_version_id,p_owner_id,v_target->>'key',v_target->>'basis',v_target->>'classification',v_target->>'asset',v_target->>'network',(v_target->>'targetBps')::integer,nullif(v_target->>'minimumBps','')::integer,nullif(v_target->>'maximumBps','')::integer);
  end loop;
  insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,new_state) values(p_owner_id,p_actor_id,'POLICY_CREATED',v_policy_id,1,'DRAFT');
  v_response := public.allocation_policy_json(v_policy_id);
  insert into public.allocation_idempotency values(p_owner_id,'policy:create',p_idempotency_key,p_request_digest,v_response,now());
  return v_response;
end $$;

create or replace function public.allocation_update_policy(
  p_owner_id uuid, p_actor_id uuid, p_policy_id uuid, p_expected_version integer, p_policy jsonb, p_idempotency_key text, p_request_digest text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_policy public.allocation_policies%rowtype; v_version_id uuid; v_response jsonb; v_previous record; v_target jsonb; v_next integer;
begin
  select * into v_previous from public.allocation_idempotency where owner_id=p_owner_id and operation='policy:update:'||p_policy_id::text and idempotency_key=p_idempotency_key;
  if found then if v_previous.request_digest<>p_request_digest then raise exception 'idempotency conflict' using errcode='23505'; end if; return v_previous.response || jsonb_build_object('replayed',true); end if;
  select * into v_policy from public.allocation_policies where id=p_policy_id and owner_id=p_owner_id for update;
  if not found then raise exception 'policy not found' using errcode='P0002'; end if;
  if v_policy.current_version<>p_expected_version then raise exception 'stale policy version' using errcode='40001'; end if;
  perform public.allocation_assert_target_total(p_policy->'targets');
  v_next := v_policy.current_version + 1;
  insert into public.allocation_policy_versions(policy_id,owner_id,version,name,objective,review_frequency,reserve_requirement_bps,drift_tolerance_bps,allowed_assets,restricted_assets,liquidity_constraints,targets,created_by)
  values(p_policy_id,p_owner_id,v_next,p_policy->>'name',p_policy->>'objective',p_policy->>'reviewFrequency',(p_policy->>'reserveRequirementBps')::integer,(p_policy->>'driftToleranceBps')::integer,coalesce(p_policy->'allowedAssets','[]'),coalesce(p_policy->'restrictedAssets','[]'),coalesce(p_policy->'liquidityConstraints','{}'),p_policy->'targets',p_actor_id)
  returning id into v_version_id;
  for v_target in select value from jsonb_array_elements(p_policy->'targets') loop
    insert into public.allocation_targets(policy_version_id,owner_id,target_key,basis,classification,asset,network,target_bps,minimum_bps,maximum_bps)
    values(v_version_id,p_owner_id,v_target->>'key',v_target->>'basis',v_target->>'classification',v_target->>'asset',v_target->>'network',(v_target->>'targetBps')::integer,nullif(v_target->>'minimumBps','')::integer,nullif(v_target->>'maximumBps','')::integer);
  end loop;
  update public.allocation_policies set current_version=v_next,status='DRAFT',authorized_by=null,authorized_at=null,updated_at=now() where id=p_policy_id;
  insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,previous_state,new_state,context) values(p_owner_id,p_actor_id,'POLICY_UPDATED',p_policy_id,v_next,v_policy.status,'DRAFT',jsonb_build_object('previous_version',p_expected_version));
  v_response := public.allocation_policy_json(p_policy_id);
  insert into public.allocation_idempotency values(p_owner_id,'policy:update:'||p_policy_id::text,p_idempotency_key,p_request_digest,v_response,now());
  return v_response;
end $$;

create or replace function public.allocation_authorize_policy(
  p_owner_id uuid, p_actor_id uuid, p_policy_id uuid, p_expected_version integer, p_idempotency_key text, p_request_digest text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_policy public.allocation_policies%rowtype; v_response jsonb; v_previous record;
begin
  select * into v_previous from public.allocation_idempotency where owner_id=p_owner_id and operation='policy:authorize:'||p_policy_id::text and idempotency_key=p_idempotency_key;
  if found then if v_previous.request_digest<>p_request_digest then raise exception 'idempotency conflict' using errcode='23505'; end if; return v_previous.response || jsonb_build_object('replayed',true); end if;
  select * into v_policy from public.allocation_policies where id=p_policy_id and owner_id=p_owner_id for update;
  if not found then raise exception 'policy not found' using errcode='P0002'; end if;
  if v_policy.current_version<>p_expected_version then raise exception 'stale policy version' using errcode='40001'; end if;
  if v_policy.status<>'AUTHORIZED' then
    update public.allocation_policies set status='AUTHORIZED',authorized_by=p_actor_id,authorized_at=now(),updated_at=now() where id=p_policy_id;
    update public.allocation_policy_versions set authorized_by=p_actor_id,authorized_at=now() where policy_id=p_policy_id and version=p_expected_version and authorized_at is null;
    insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,previous_state,new_state) values(p_owner_id,p_actor_id,'POLICY_AUTHORIZED',p_policy_id,p_expected_version,v_policy.status,'AUTHORIZED');
  end if;
  v_response := public.allocation_policy_json(p_policy_id);
  insert into public.allocation_idempotency values(p_owner_id,'policy:authorize:'||p_policy_id::text,p_idempotency_key,p_request_digest,v_response,now());
  return v_response;
end $$;

create or replace function public.allocation_create_model(
  p_owner_id uuid,p_actor_id uuid,p_policy_id uuid,p_policy_version integer,p_observed_at timestamptz,p_observed jsonb,p_targets jsonb,p_drift jsonb,p_valuation_state text,p_idempotency_key text,p_request_digest text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_response jsonb; v_previous record; v_current integer;
begin
  select * into v_previous from public.allocation_idempotency where owner_id=p_owner_id and operation='model:create:'||p_policy_id::text||':'||p_policy_version::text and idempotency_key=p_idempotency_key;
  if found then if v_previous.request_digest<>p_request_digest then raise exception 'idempotency conflict' using errcode='23505'; end if; return v_previous.response || jsonb_build_object('replayed',true); end if;
  select current_version into v_current from public.allocation_policies where id=p_policy_id and owner_id=p_owner_id;
  if v_current is null then raise exception 'policy not found' using errcode='P0002'; end if;
  if v_current<>p_policy_version then raise exception 'stale policy version' using errcode='40001'; end if;
  insert into public.allocation_models(owner_id,policy_id,policy_version,observed_at,observed_snapshot,target_snapshot,drift_snapshot,valuation_state,created_by,idempotency_key,request_digest)
  values(p_owner_id,p_policy_id,p_policy_version,p_observed_at,p_observed,p_targets,p_drift,p_valuation_state,p_actor_id,p_idempotency_key,p_request_digest) returning id into v_id;
  insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,model_id,previous_state,new_state,context) values(p_owner_id,p_actor_id,'MODEL_CREATED',p_policy_id,p_policy_version,v_id,'OBSERVED','MODELED',jsonb_build_object('valuation_state',p_valuation_state));
  select to_jsonb(m) into v_response from public.allocation_models m where id=v_id;
  insert into public.allocation_idempotency values(p_owner_id,'model:create:'||p_policy_id::text||':'||p_policy_version::text,p_idempotency_key,p_request_digest,v_response,now());
  return v_response;
end $$;

create or replace function public.allocation_create_plan(
  p_owner_id uuid,p_actor_id uuid,p_model_id uuid,p_policy_id uuid,p_policy_version integer,p_observed_at timestamptz,p_observed jsonb,p_targets jsonb,p_drift jsonb,p_movements jsonb,p_constraints jsonb,p_idempotency_key text,p_request_digest text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_response jsonb; v_previous record; v_current integer; v_movement jsonb; v_sequence integer:=0;
begin
  select * into v_previous from public.allocation_idempotency where owner_id=p_owner_id and operation='plan:create:'||p_model_id::text and idempotency_key=p_idempotency_key;
  if found then if v_previous.request_digest<>p_request_digest then raise exception 'idempotency conflict' using errcode='23505'; end if; return v_previous.response || jsonb_build_object('replayed',true); end if;
  select current_version into v_current from public.allocation_policies where id=p_policy_id and owner_id=p_owner_id;
  if v_current is null or v_current<>p_policy_version then raise exception 'stale policy version' using errcode='40001'; end if;
  if not exists(select 1 from public.allocation_models where id=p_model_id and owner_id=p_owner_id and policy_id=p_policy_id and policy_version=p_policy_version) then raise exception 'model not found' using errcode='P0002'; end if;
  insert into public.allocation_plans(owner_id,model_id,policy_id,policy_version,observed_at,observed_snapshot,target_snapshot,drift_snapshot,movements,constraints_snapshot,created_by,idempotency_key,request_digest)
  values(p_owner_id,p_model_id,p_policy_id,p_policy_version,p_observed_at,p_observed,p_targets,p_drift,p_movements,coalesce(p_constraints,'{}'),p_actor_id,p_idempotency_key,p_request_digest) returning id into v_id;
  for v_movement in select value from jsonb_array_elements(p_movements) loop
    v_sequence:=v_sequence+1;
    insert into public.allocation_plan_movements(id,plan_id,owner_id,sequence,movement_type,state,asset,network,from_classification,to_classification,amount_atomic,executable,reason)
    values(gen_random_uuid(),v_id,p_owner_id,v_sequence,v_movement->>'type',coalesce(v_movement->>'state','PROPOSED'),v_movement->>'asset',v_movement->>'network',v_movement->>'fromClassification',v_movement->>'toClassification',nullif(v_movement->>'amountAtomic','')::numeric,coalesce((v_movement->>'executable')::boolean,false),v_movement->>'reason');
  end loop;
  insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,model_id,plan_id,new_state,context) values(p_owner_id,p_actor_id,'PLAN_CREATED',p_policy_id,p_policy_version,p_model_id,v_id,'MODELED',jsonb_build_object('movement_count',v_sequence));
  v_response:=public.allocation_plan_json(v_id);
  insert into public.allocation_idempotency values(p_owner_id,'plan:create:'||p_model_id::text,p_idempotency_key,p_request_digest,v_response,now());
  return v_response;
end $$;

create or replace function public.allocation_authorize_plan(
  p_owner_id uuid,p_actor_id uuid,p_plan_id uuid,p_idempotency_key text,p_request_digest text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_plan public.allocation_plans%rowtype; v_policy public.allocation_policies%rowtype; v_response jsonb; v_previous record;
begin
  select * into v_previous from public.allocation_idempotency where owner_id=p_owner_id and operation='plan:authorize:'||p_plan_id::text and idempotency_key=p_idempotency_key;
  if found then if v_previous.request_digest<>p_request_digest then raise exception 'idempotency conflict' using errcode='23505'; end if; return v_previous.response || jsonb_build_object('replayed',true); end if;
  select * into v_plan from public.allocation_plans where id=p_plan_id and owner_id=p_owner_id for update;
  if not found then raise exception 'plan not found' using errcode='P0002'; end if;
  select * into v_policy from public.allocation_policies where id=v_plan.policy_id and owner_id=p_owner_id;
  if v_policy.status<>'AUTHORIZED' or v_policy.current_version<>v_plan.policy_version then raise exception 'policy version not authorized' using errcode='22023'; end if;
  if v_plan.state not in ('MODELED','AUTHORIZED') then raise exception 'invalid plan transition' using errcode='22023'; end if;
  if v_plan.state='MODELED' then
    update public.allocation_plans set state='AUTHORIZED',authorized_by=p_actor_id,authorized_at=now(),updated_at=now() where id=p_plan_id;
    insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,model_id,plan_id,previous_state,new_state,context) values(p_owner_id,p_actor_id,'PLAN_AUTHORIZED',v_plan.policy_id,v_plan.policy_version,v_plan.model_id,p_plan_id,'MODELED','AUTHORIZED',jsonb_build_object('execution_available',false));
  end if;
  v_response:=public.allocation_plan_json(p_plan_id);
  insert into public.allocation_idempotency values(p_owner_id,'plan:authorize:'||p_plan_id::text,p_idempotency_key,p_request_digest,v_response,now());
  return v_response;
end $$;

create or replace function public.allocation_cancel_plan(
  p_owner_id uuid,p_actor_id uuid,p_plan_id uuid,p_reason text,p_idempotency_key text,p_request_digest text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_plan public.allocation_plans%rowtype; v_response jsonb; v_previous record;
begin
  select * into v_previous from public.allocation_idempotency where owner_id=p_owner_id and operation='plan:cancel:'||p_plan_id::text and idempotency_key=p_idempotency_key;
  if found then if v_previous.request_digest<>p_request_digest then raise exception 'idempotency conflict' using errcode='23505'; end if; return v_previous.response || jsonb_build_object('replayed',true); end if;
  select * into v_plan from public.allocation_plans where id=p_plan_id and owner_id=p_owner_id for update;
  if not found then raise exception 'plan not found' using errcode='P0002'; end if;
  if v_plan.state not in ('MODELED','AUTHORIZED','CANCELLED') then raise exception 'invalid plan transition' using errcode='22023'; end if;
  if v_plan.state<>'CANCELLED' then
    update public.allocation_plans set state='CANCELLED',updated_at=now() where id=p_plan_id;
    update public.allocation_plan_movements set state='CANCELLED',updated_at=now() where plan_id=p_plan_id and state='PROPOSED';
    insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,model_id,plan_id,previous_state,new_state,context) values(p_owner_id,p_actor_id,'PLAN_CANCELLED',v_plan.policy_id,v_plan.policy_version,v_plan.model_id,p_plan_id,v_plan.state,'CANCELLED',jsonb_build_object('reason',p_reason));
  end if;
  v_response:=public.allocation_plan_json(p_plan_id);
  insert into public.allocation_idempotency values(p_owner_id,'plan:cancel:'||p_plan_id::text,p_idempotency_key,p_request_digest,v_response,now());
  return v_response;
end $$;

create or replace function public.allocation_record_decision(
  p_owner_id uuid,p_actor_id uuid,p_action text,p_policy_id uuid,p_model_id uuid,p_plan_id uuid,p_context jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_version integer; v_response jsonb;
begin
  if p_action not in ('LEAVE_UNCHANGED','REVIEW_REBALANCE','UPDATE_POLICY') then raise exception 'invalid decision' using errcode='22023'; end if;
  if p_policy_id is not null then select current_version into v_version from public.allocation_policies where id=p_policy_id and owner_id=p_owner_id; if not found then raise exception 'policy not found' using errcode='P0002'; end if; end if;
  insert into public.allocation_events(owner_id,actor_id,action,policy_id,policy_version,model_id,plan_id,context) values(p_owner_id,p_actor_id,p_action,p_policy_id,v_version,p_model_id,p_plan_id,coalesce(p_context,'{}')) returning id into v_id;
  select to_jsonb(e) into v_response from public.allocation_events e where id=v_id;
  return v_response;
end $$;

-- Append-only history records. Authorized policy versions are never edited by customer APIs;
-- later edits create a new version and reset the policy to DRAFT.
create or replace function public.prevent_allocation_history_mutation() returns trigger language plpgsql as $$
begin raise exception 'allocation history is append-only'; end $$;

drop trigger if exists allocation_events_append_only on public.allocation_events;
create trigger allocation_events_append_only before update or delete on public.allocation_events for each row execute function public.prevent_allocation_history_mutation();
drop trigger if exists allocation_targets_append_only on public.allocation_targets;
create trigger allocation_targets_append_only before update or delete on public.allocation_targets for each row execute function public.prevent_allocation_history_mutation();

alter table public.allocation_policies enable row level security;
alter table public.allocation_policy_versions enable row level security;
alter table public.allocation_targets enable row level security;
alter table public.allocation_models enable row level security;
alter table public.allocation_plans enable row level security;
alter table public.allocation_plan_movements enable row level security;
alter table public.allocation_events enable row level security;
alter table public.allocation_idempotency enable row level security;

revoke all on public.allocation_policies, public.allocation_policy_versions, public.allocation_targets, public.allocation_models, public.allocation_plans, public.allocation_plan_movements, public.allocation_events, public.allocation_idempotency from anon, authenticated;
revoke all on public.allocation_policy_current, public.allocation_plan_projection from anon, authenticated;
revoke execute on function public.allocation_assert_target_total(jsonb), public.allocation_policy_json(uuid), public.allocation_plan_json(uuid),
  public.allocation_create_policy(uuid,uuid,jsonb,text,text), public.allocation_update_policy(uuid,uuid,uuid,integer,jsonb,text,text),
  public.allocation_authorize_policy(uuid,uuid,uuid,integer,text,text), public.allocation_create_model(uuid,uuid,uuid,integer,timestamptz,jsonb,jsonb,jsonb,text,text,text),
  public.allocation_create_plan(uuid,uuid,uuid,uuid,integer,timestamptz,jsonb,jsonb,jsonb,jsonb,jsonb,text,text),
  public.allocation_authorize_plan(uuid,uuid,uuid,text,text), public.allocation_cancel_plan(uuid,uuid,uuid,text,text,text),
  public.allocation_record_decision(uuid,uuid,text,uuid,uuid,uuid,jsonb) from public, anon, authenticated;
