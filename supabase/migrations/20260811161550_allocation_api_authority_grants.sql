-- Allocation API authority hardening.
-- apps/api may read owner-scoped Allocation state and invoke governed RPCs.
-- It does not receive direct INSERT/UPDATE/DELETE authority over Allocation tables.

revoke all on table
  public.allocation_policies,
  public.allocation_policy_versions,
  public.allocation_targets,
  public.allocation_models,
  public.allocation_plans,
  public.allocation_plan_movements,
  public.allocation_events,
  public.allocation_idempotency
from public, anon, authenticated, service_role;

revoke all on table
  public.allocation_policy_current,
  public.allocation_plan_projection
from public, anon, authenticated, service_role;

grant select on table
  public.allocation_policies,
  public.allocation_policy_versions,
  public.allocation_targets,
  public.allocation_models,
  public.allocation_plans,
  public.allocation_plan_movements,
  public.allocation_events,
  public.allocation_idempotency,
  public.allocation_policy_current,
  public.allocation_plan_projection
to service_role;

revoke execute on function
  public.allocation_assert_target_total(jsonb),
  public.allocation_policy_json(uuid),
  public.allocation_plan_json(uuid),
  public.allocation_create_policy(uuid,uuid,jsonb,text,text),
  public.allocation_update_policy(uuid,uuid,uuid,integer,jsonb,text,text),
  public.allocation_authorize_policy(uuid,uuid,uuid,integer,text,text),
  public.allocation_create_model(uuid,uuid,uuid,integer,timestamptz,jsonb,jsonb,jsonb,text,text,text),
  public.allocation_create_plan(uuid,uuid,uuid,uuid,integer,timestamptz,jsonb,jsonb,jsonb,jsonb,jsonb,text,text),
  public.allocation_authorize_plan(uuid,uuid,uuid,text,text),
  public.allocation_cancel_plan(uuid,uuid,uuid,text,text,text),
  public.allocation_record_decision(uuid,uuid,text,uuid,uuid,uuid,jsonb)
from public, anon, authenticated, service_role;

grant execute on function
  public.allocation_assert_target_total(jsonb),
  public.allocation_policy_json(uuid),
  public.allocation_plan_json(uuid),
  public.allocation_create_policy(uuid,uuid,jsonb,text,text),
  public.allocation_update_policy(uuid,uuid,uuid,integer,jsonb,text,text),
  public.allocation_authorize_policy(uuid,uuid,uuid,integer,text,text),
  public.allocation_create_model(uuid,uuid,uuid,integer,timestamptz,jsonb,jsonb,jsonb,text,text,text),
  public.allocation_create_plan(uuid,uuid,uuid,uuid,integer,timestamptz,jsonb,jsonb,jsonb,jsonb,jsonb,text,text),
  public.allocation_authorize_plan(uuid,uuid,uuid,text,text),
  public.allocation_cancel_plan(uuid,uuid,uuid,text,text,text),
  public.allocation_record_decision(uuid,uuid,text,uuid,uuid,uuid,jsonb)
to service_role;
