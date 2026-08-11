import { createHash, randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import type {
  AllocationEventRecord,
  AllocationModelRecord,
  AllocationMovement,
  AllocationPlanRecord,
  AllocationPolicyInput,
  AllocationPolicyRecord,
  AllocationLifecycleState,
} from './allocation-domain.js';

type Fetch = typeof fetch;

export interface AllocationRepository {
  ready(): Promise<boolean>;
  listPolicies(ownerId: string): Promise<AllocationPolicyRecord[]>;
  getPolicy(ownerId: string, policyId: string): Promise<AllocationPolicyRecord>;
  createPolicy(input: { ownerId: string; actorId: string; policy: AllocationPolicyInput; idempotencyKey: string; requestDigest: string }): Promise<{ value: AllocationPolicyRecord; replayed: boolean }>;
  updatePolicy(input: { ownerId: string; actorId: string; policyId: string; expectedVersion: number; policy: AllocationPolicyInput; idempotencyKey: string; requestDigest: string }): Promise<{ value: AllocationPolicyRecord; replayed: boolean }>;
  authorizePolicy(input: { ownerId: string; actorId: string; policyId: string; expectedVersion: number; idempotencyKey: string; requestDigest: string }): Promise<{ value: AllocationPolicyRecord; replayed: boolean }>;
  createModel(input: { ownerId: string; actorId: string; policy: AllocationPolicyRecord; observedAt: string; observed: AllocationModelRecord['observed']; drift: AllocationModelRecord['drift']; valuationState: AllocationModelRecord['valuationState']; idempotencyKey: string; requestDigest: string }): Promise<{ value: AllocationModelRecord; replayed: boolean }>;
  getModel(ownerId: string, modelId: string): Promise<AllocationModelRecord>;
  createPlan(input: { ownerId: string; actorId: string; model: AllocationModelRecord; policy: AllocationPolicyRecord; movements: readonly Omit<AllocationMovement, 'id'>[]; idempotencyKey: string; requestDigest: string }): Promise<{ value: AllocationPlanRecord; replayed: boolean }>;
  listPlans(ownerId: string): Promise<AllocationPlanRecord[]>;
  getPlan(ownerId: string, planId: string): Promise<AllocationPlanRecord>;
  authorizePlan(input: { ownerId: string; actorId: string; planId: string; idempotencyKey: string; requestDigest: string }): Promise<{ value: AllocationPlanRecord; replayed: boolean }>;
  cancelPlan(input: { ownerId: string; actorId: string; planId: string; reason?: string; idempotencyKey: string; requestDigest: string }): Promise<{ value: AllocationPlanRecord; replayed: boolean }>;
  recordDecision(input: { ownerId: string; actorId: string; action: 'LEAVE_UNCHANGED' | 'REVIEW_REBALANCE' | 'UPDATE_POLICY'; policyId?: string; modelId?: string; planId?: string; context?: Record<string, unknown> }): Promise<AllocationEventRecord>;
  listActivity(ownerId: string, limit: number): Promise<AllocationEventRecord[]>;
}

export function allocationRequestDigest(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

type PolicyRow = {
  id: string; owner_id: string; name: string; status: string; current_version: number; objective: string; review_frequency: string;
  reserve_requirement_bps: number; drift_tolerance_bps: number; allowed_assets: AllocationPolicyInput['allowedAssets']; restricted_assets: AllocationPolicyInput['restrictedAssets'];
  liquidity_constraints: Record<string, unknown>; targets: AllocationPolicyInput['targets']; created_by: string; authorized_by: string | null; created_at: string; updated_at: string; authorized_at: string | null;
};
type ModelRow = {
  id: string; owner_id: string; policy_id: string; policy_version: number; state: 'MODELED'; observed_at: string;
  observed_snapshot: AllocationModelRecord['observed']; target_snapshot: AllocationModelRecord['targets']; drift_snapshot: AllocationModelRecord['drift']; valuation_state: AllocationModelRecord['valuationState']; created_by: string; created_at: string;
};
type PlanRow = {
  id: string; owner_id: string; model_id: string; policy_id: string; policy_version: number; state: AllocationLifecycleState; observed_at: string;
  observed_snapshot: AllocationPlanRecord['observed']; target_snapshot: AllocationPlanRecord['targets']; drift_snapshot: AllocationPlanRecord['drift']; movements: AllocationPlanRecord['movements'];
  constraints_snapshot: Record<string, unknown>; created_by: string; authorized_by: string | null; created_at: string; authorized_at: string | null;
};
type EventRow = {
  id: string; owner_id: string; actor_id: string; action: string; policy_id: string | null; policy_version: number | null; model_id: string | null; plan_id: string | null;
  previous_state: string | null; new_state: string | null; context: Record<string, unknown>; created_at: string;
};

function policy(row: PolicyRow): AllocationPolicyRecord {
  return {
    id: row.id, ownerId: row.owner_id, name: row.name, status: row.status as AllocationPolicyRecord['status'], version: Number(row.current_version),
    objective: row.objective, reviewFrequency: row.review_frequency as AllocationPolicyRecord['reviewFrequency'], reserveRequirementBps: Number(row.reserve_requirement_bps),
    driftToleranceBps: Number(row.drift_tolerance_bps), allowedAssets: row.allowed_assets ?? [], restrictedAssets: row.restricted_assets ?? [],
    liquidityConstraints: row.liquidity_constraints ?? {}, targets: row.targets ?? [], createdBy: row.created_by, authorizedBy: row.authorized_by,
    createdAt: row.created_at, updatedAt: row.updated_at, authorizedAt: row.authorized_at,
  };
}
function model(row: ModelRow): AllocationModelRecord {
  return { id: row.id, ownerId: row.owner_id, policyId: row.policy_id, policyVersion: Number(row.policy_version), state: 'MODELED', observedAt: row.observed_at,
    observed: row.observed_snapshot ?? [], targets: row.target_snapshot ?? [], drift: row.drift_snapshot ?? [], valuationState: row.valuation_state,
    createdBy: row.created_by, createdAt: row.created_at };
}
function plan(row: PlanRow): AllocationPlanRecord {
  return { id: row.id, ownerId: row.owner_id, modelId: row.model_id, policyId: row.policy_id, policyVersion: Number(row.policy_version), state: row.state,
    observedAt: row.observed_at, observed: row.observed_snapshot ?? [], targets: row.target_snapshot ?? [], drift: row.drift_snapshot ?? [], movements: row.movements ?? [],
    constraints: row.constraints_snapshot ?? {}, createdBy: row.created_by, authorizedBy: row.authorized_by, createdAt: row.created_at, authorizedAt: row.authorized_at };
}
function event(row: EventRow): AllocationEventRecord {
  return { id: row.id, ownerId: row.owner_id, actorId: row.actor_id, action: row.action, policyId: row.policy_id, policyVersion: row.policy_version,
    modelId: row.model_id, planId: row.plan_id, previousState: row.previous_state, newState: row.new_state, context: row.context ?? {}, createdAt: row.created_at };
}

export class SupabaseAllocationRepository implements AllocationRepository {
  constructor(private readonly url: string, private readonly serviceRoleKey: string, private readonly request: Fetch = fetch) {}
  private headers(extra: HeadersInit = {}): HeadersInit { return { authorization: `Bearer ${this.serviceRoleKey}`, apikey: this.serviceRoleKey, 'content-type': 'application/json', ...extra }; }
  private async rest(path: string, init: RequestInit = {}) { return this.request(`${this.url}/rest/v1/${path}`, { ...init, headers: this.headers(init.headers), signal: AbortSignal.timeout(8_000) }); }
  private async rows<T>(path: string, message: string): Promise<T[]> { const response = await this.rest(path); if (!response.ok) throw new ApiError(503, 'allocation_storage_unavailable', message); return await response.json() as T[]; }
  private async rpc<T>(name: string, body: Record<string, unknown>, message: string): Promise<T> {
    const response = await this.rest(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
    if (response.status === 409) throw new ApiError(409, 'allocation_conflict', message);
    if (response.status === 422 || response.status === 400) throw new ApiError(422, 'allocation_validation_failed', message);
    if (!response.ok) throw new ApiError(503, 'allocation_storage_unavailable', message);
    return await response.json() as T;
  }
  async ready() { try { return (await this.rest('allocation_policies?select=id&limit=1')).ok; } catch { return false; } }
  async listPolicies(ownerId: string) { return (await this.rows<PolicyRow>(`allocation_policy_current?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=updated_at.desc`, 'Allocation policies are unavailable')).map(policy); }
  async getPolicy(ownerId: string, policyId: string) { const row = (await this.rows<PolicyRow>(`allocation_policy_current?id=eq.${encodeURIComponent(policyId)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=*&limit=1`, 'Allocation policy is unavailable'))[0]; if (!row) throw new ApiError(404, 'not_found', 'Allocation policy not found'); return policy(row); }
  async createPolicy(input: Parameters<AllocationRepository['createPolicy']>[0]) { const row = await this.rpc<PolicyRow>('allocation_create_policy', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_policy: input.policy, p_idempotency_key: input.idempotencyKey, p_request_digest: input.requestDigest }, 'Allocation policy could not be created'); return { value: policy(row), replayed: Boolean((row as PolicyRow & { replayed?: boolean }).replayed) }; }
  async updatePolicy(input: Parameters<AllocationRepository['updatePolicy']>[0]) { const row = await this.rpc<PolicyRow>('allocation_update_policy', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_policy_id: input.policyId, p_expected_version: input.expectedVersion, p_policy: input.policy, p_idempotency_key: input.idempotencyKey, p_request_digest: input.requestDigest }, 'Allocation policy could not be updated'); return { value: policy(row), replayed: Boolean((row as PolicyRow & { replayed?: boolean }).replayed) }; }
  async authorizePolicy(input: Parameters<AllocationRepository['authorizePolicy']>[0]) { const row = await this.rpc<PolicyRow>('allocation_authorize_policy', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_policy_id: input.policyId, p_expected_version: input.expectedVersion, p_idempotency_key: input.idempotencyKey, p_request_digest: input.requestDigest }, 'Allocation policy could not be authorized'); return { value: policy(row), replayed: Boolean((row as PolicyRow & { replayed?: boolean }).replayed) }; }
  async createModel(input: Parameters<AllocationRepository['createModel']>[0]) { const row = await this.rpc<ModelRow>('allocation_create_model', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_policy_id: input.policy.id, p_policy_version: input.policy.version, p_observed_at: input.observedAt, p_observed: input.observed, p_targets: input.policy.targets, p_drift: input.drift, p_valuation_state: input.valuationState, p_idempotency_key: input.idempotencyKey, p_request_digest: input.requestDigest }, 'Allocation model could not be created'); return { value: model(row), replayed: Boolean((row as ModelRow & { replayed?: boolean }).replayed) }; }
  async getModel(ownerId: string, modelId: string) { const row = (await this.rows<ModelRow>(`allocation_models?id=eq.${encodeURIComponent(modelId)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=*&limit=1`, 'Allocation model is unavailable'))[0]; if (!row) throw new ApiError(404, 'not_found', 'Allocation model not found'); return model(row); }
  async createPlan(input: Parameters<AllocationRepository['createPlan']>[0]) { const row = await this.rpc<PlanRow>('allocation_create_plan', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_model_id: input.model.id, p_policy_id: input.policy.id, p_policy_version: input.policy.version, p_observed_at: input.model.observedAt, p_observed: input.model.observed, p_targets: input.model.targets, p_drift: input.model.drift, p_movements: input.movements, p_constraints: input.policy.liquidityConstraints ?? {}, p_idempotency_key: input.idempotencyKey, p_request_digest: input.requestDigest }, 'Allocation plan could not be created'); return { value: plan(row), replayed: Boolean((row as PlanRow & { replayed?: boolean }).replayed) }; }
  async listPlans(ownerId: string) { return (await this.rows<PlanRow>(`allocation_plan_projection?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=created_at.desc`, 'Allocation plans are unavailable')).map(plan); }
  async getPlan(ownerId: string, planId: string) { const row = (await this.rows<PlanRow>(`allocation_plan_projection?id=eq.${encodeURIComponent(planId)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=*&limit=1`, 'Allocation plan is unavailable'))[0]; if (!row) throw new ApiError(404, 'not_found', 'Allocation plan not found'); return plan(row); }
  async authorizePlan(input: Parameters<AllocationRepository['authorizePlan']>[0]) { const row = await this.rpc<PlanRow>('allocation_authorize_plan', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_plan_id: input.planId, p_idempotency_key: input.idempotencyKey, p_request_digest: input.requestDigest }, 'Allocation plan could not be authorized'); return { value: plan(row), replayed: Boolean((row as PlanRow & { replayed?: boolean }).replayed) }; }
  async cancelPlan(input: Parameters<AllocationRepository['cancelPlan']>[0]) { const row = await this.rpc<PlanRow>('allocation_cancel_plan', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_plan_id: input.planId, p_reason: input.reason ?? null, p_idempotency_key: input.idempotencyKey, p_request_digest: input.requestDigest }, 'Allocation plan could not be cancelled'); return { value: plan(row), replayed: Boolean((row as PlanRow & { replayed?: boolean }).replayed) }; }
  async recordDecision(input: Parameters<AllocationRepository['recordDecision']>[0]) { const row = await this.rpc<EventRow>('allocation_record_decision', { p_owner_id: input.ownerId, p_actor_id: input.actorId, p_action: input.action, p_policy_id: input.policyId ?? null, p_model_id: input.modelId ?? null, p_plan_id: input.planId ?? null, p_context: input.context ?? {} }, 'Allocation decision could not be recorded'); return event(row); }
  async listActivity(ownerId: string, limit: number) { return (await this.rows<EventRow>(`allocation_events?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=created_at.desc&limit=${limit}`, 'Allocation activity is unavailable')).map(event); }
}

type Idem = { digest: string; value: unknown };
export class MemoryAllocationRepository implements AllocationRepository {
  readonly policies = new Map<string, AllocationPolicyRecord>();
  readonly models = new Map<string, AllocationModelRecord>();
  readonly plans = new Map<string, AllocationPlanRecord>();
  readonly events: AllocationEventRecord[] = [];
  private readonly idem = new Map<string, Idem>();
  async ready() { return true; }
  private replay<T>(ownerId: string, operation: string, key: string, digest: string): { value: T; replayed: true } | null { const previous = this.idem.get(`${ownerId}:${operation}:${key}`); if (!previous) return null; if (previous.digest !== digest) throw new ApiError(409, 'idempotency_conflict', 'Idempotency key was reused with different allocation input'); return { value: structuredClone(previous.value) as T, replayed: true }; }
  private remember(ownerId: string, operation: string, key: string, digest: string, value: unknown) { this.idem.set(`${ownerId}:${operation}:${key}`, { digest, value: structuredClone(value) }); }
  private emit(input: Omit<AllocationEventRecord, 'id' | 'createdAt'>) { const value: AllocationEventRecord = { id: randomUUID(), createdAt: new Date().toISOString(), ...input }; this.events.unshift(value); return value; }
  async listPolicies(ownerId: string) { return [...this.policies.values()].filter((x) => x.ownerId === ownerId).map((x) => structuredClone(x)); }
  async getPolicy(ownerId: string, policyId: string) { const value = this.policies.get(policyId); if (!value || value.ownerId !== ownerId) throw new ApiError(404, 'not_found', 'Allocation policy not found'); return structuredClone(value); }
  async createPolicy(input: Parameters<AllocationRepository['createPolicy']>[0]) { const replay = this.replay<AllocationPolicyRecord>(input.ownerId, 'policy:create', input.idempotencyKey, input.requestDigest); if (replay) return replay; const now = new Date().toISOString(); const value: AllocationPolicyRecord = { id: randomUUID(), ownerId: input.ownerId, status: 'DRAFT', version: 1, createdBy: input.actorId, authorizedBy: null, createdAt: now, updatedAt: now, authorizedAt: null, ...structuredClone(input.policy) }; this.policies.set(value.id, value); this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: 'POLICY_CREATED', policyId: value.id, policyVersion: 1, modelId: null, planId: null, previousState: null, newState: 'DRAFT', context: {} }); this.remember(input.ownerId, 'policy:create', input.idempotencyKey, input.requestDigest, value); return { value: structuredClone(value), replayed: false }; }
  async updatePolicy(input: Parameters<AllocationRepository['updatePolicy']>[0]) { const replay = this.replay<AllocationPolicyRecord>(input.ownerId, `policy:update:${input.policyId}`, input.idempotencyKey, input.requestDigest); if (replay) return replay; const previous = await this.getPolicy(input.ownerId, input.policyId); if (previous.version !== input.expectedVersion) throw new ApiError(409, 'stale_policy_version', 'Policy version is stale'); const value: AllocationPolicyRecord = { ...previous, ...structuredClone(input.policy), status: 'DRAFT', version: previous.version + 1, authorizedBy: null, authorizedAt: null, updatedAt: new Date().toISOString() }; this.policies.set(value.id, value); this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: 'POLICY_UPDATED', policyId: value.id, policyVersion: value.version, modelId: null, planId: null, previousState: previous.status, newState: 'DRAFT', context: { previous_version: previous.version } }); this.remember(input.ownerId, `policy:update:${input.policyId}`, input.idempotencyKey, input.requestDigest, value); return { value: structuredClone(value), replayed: false }; }
  async authorizePolicy(input: Parameters<AllocationRepository['authorizePolicy']>[0]) { const replay = this.replay<AllocationPolicyRecord>(input.ownerId, `policy:authorize:${input.policyId}`, input.idempotencyKey, input.requestDigest); if (replay) return replay; const previous = await this.getPolicy(input.ownerId, input.policyId); if (previous.version !== input.expectedVersion) throw new ApiError(409, 'stale_policy_version', 'Policy version is stale'); if (previous.status === 'AUTHORIZED') { this.remember(input.ownerId, `policy:authorize:${input.policyId}`, input.idempotencyKey, input.requestDigest, previous); return { value: previous, replayed: true }; } const now = new Date().toISOString(); const value = { ...previous, status: 'AUTHORIZED' as const, authorizedBy: input.actorId, authorizedAt: now, updatedAt: now }; this.policies.set(value.id, value); this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: 'POLICY_AUTHORIZED', policyId: value.id, policyVersion: value.version, modelId: null, planId: null, previousState: previous.status, newState: 'AUTHORIZED', context: {} }); this.remember(input.ownerId, `policy:authorize:${input.policyId}`, input.idempotencyKey, input.requestDigest, value); return { value: structuredClone(value), replayed: false }; }
  async createModel(input: Parameters<AllocationRepository['createModel']>[0]) { const replay = this.replay<AllocationModelRecord>(input.ownerId, `model:create:${input.policy.id}:${input.policy.version}`, input.idempotencyKey, input.requestDigest); if (replay) return replay; const value: AllocationModelRecord = { id: randomUUID(), ownerId: input.ownerId, policyId: input.policy.id, policyVersion: input.policy.version, state: 'MODELED', observedAt: input.observedAt, observed: structuredClone(input.observed), targets: structuredClone(input.policy.targets), drift: structuredClone(input.drift), valuationState: input.valuationState, createdBy: input.actorId, createdAt: new Date().toISOString() }; this.models.set(value.id, value); this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: 'MODEL_CREATED', policyId: value.policyId, policyVersion: value.policyVersion, modelId: value.id, planId: null, previousState: 'OBSERVED', newState: 'MODELED', context: { valuation_state: value.valuationState } }); this.remember(input.ownerId, `model:create:${input.policy.id}:${input.policy.version}`, input.idempotencyKey, input.requestDigest, value); return { value: structuredClone(value), replayed: false }; }
  async getModel(ownerId: string, modelId: string) { const value = this.models.get(modelId); if (!value || value.ownerId !== ownerId) throw new ApiError(404, 'not_found', 'Allocation model not found'); return structuredClone(value); }
  async createPlan(input: Parameters<AllocationRepository['createPlan']>[0]) { const replay = this.replay<AllocationPlanRecord>(input.ownerId, `plan:create:${input.model.id}`, input.idempotencyKey, input.requestDigest); if (replay) return replay; if (input.model.ownerId !== input.ownerId || input.policy.ownerId !== input.ownerId) throw new ApiError(404, 'not_found', 'Allocation model not found'); if (input.model.policyVersion !== input.policy.version) throw new ApiError(409, 'stale_policy_version', 'Model policy version is stale'); const now = new Date().toISOString(); const movements = input.movements.map((movement) => ({ id: randomUUID(), ...movement })); const value: AllocationPlanRecord = { id: randomUUID(), ownerId: input.ownerId, modelId: input.model.id, policyId: input.policy.id, policyVersion: input.policy.version, state: 'MODELED', observedAt: input.model.observedAt, observed: structuredClone(input.model.observed), targets: structuredClone(input.model.targets), drift: structuredClone(input.model.drift), movements, constraints: structuredClone(input.policy.liquidityConstraints ?? {}), createdBy: input.actorId, authorizedBy: null, createdAt: now, authorizedAt: null }; this.plans.set(value.id, value); this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: 'PLAN_CREATED', policyId: value.policyId, policyVersion: value.policyVersion, modelId: value.modelId, planId: value.id, previousState: null, newState: 'MODELED', context: { movement_count: movements.length } }); this.remember(input.ownerId, `plan:create:${input.model.id}`, input.idempotencyKey, input.requestDigest, value); return { value: structuredClone(value), replayed: false }; }
  async listPlans(ownerId: string) { return [...this.plans.values()].filter((x) => x.ownerId === ownerId).map((x) => structuredClone(x)); }
  async getPlan(ownerId: string, planId: string) { const value = this.plans.get(planId); if (!value || value.ownerId !== ownerId) throw new ApiError(404, 'not_found', 'Allocation plan not found'); return structuredClone(value); }
  async authorizePlan(input: Parameters<AllocationRepository['authorizePlan']>[0]) { const replay = this.replay<AllocationPlanRecord>(input.ownerId, `plan:authorize:${input.planId}`, input.idempotencyKey, input.requestDigest); if (replay) return replay; const previous = await this.getPlan(input.ownerId, input.planId); if (previous.state === 'AUTHORIZED') { this.remember(input.ownerId, `plan:authorize:${input.planId}`, input.idempotencyKey, input.requestDigest, previous); return { value: previous, replayed: true }; } if (previous.state !== 'MODELED') throw new ApiError(409, 'invalid_allocation_transition', 'Only a modeled plan may be authorized'); const policyValue = await this.getPolicy(input.ownerId, previous.policyId); if (policyValue.status !== 'AUTHORIZED' || policyValue.version !== previous.policyVersion) throw new ApiError(409, 'allocation_policy_not_authorized', 'Plan policy version is not authorized'); if (previous.movements.some((movement) => movement.executable && movement.reason === 'restricted_capital')) throw new ApiError(409, 'restricted_asset', 'Restricted capital cannot be authorized for execution'); const now = new Date().toISOString(); const value = { ...previous, state: 'AUTHORIZED' as const, authorizedBy: input.actorId, authorizedAt: now }; this.plans.set(value.id, value); this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: 'PLAN_AUTHORIZED', policyId: value.policyId, policyVersion: value.policyVersion, modelId: value.modelId, planId: value.id, previousState: previous.state, newState: 'AUTHORIZED', context: { execution_available: false } }); this.remember(input.ownerId, `plan:authorize:${input.planId}`, input.idempotencyKey, input.requestDigest, value); return { value: structuredClone(value), replayed: false }; }
  async cancelPlan(input: Parameters<AllocationRepository['cancelPlan']>[0]) { const replay = this.replay<AllocationPlanRecord>(input.ownerId, `plan:cancel:${input.planId}`, input.idempotencyKey, input.requestDigest); if (replay) return replay; const previous = await this.getPlan(input.ownerId, input.planId); if (!['MODELED', 'AUTHORIZED'].includes(previous.state)) throw new ApiError(409, 'invalid_allocation_transition', 'Plan cannot be cancelled from its current state'); const value = { ...previous, state: 'CANCELLED' as const }; this.plans.set(value.id, value); this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: 'PLAN_CANCELLED', policyId: value.policyId, policyVersion: value.policyVersion, modelId: value.modelId, planId: value.id, previousState: previous.state, newState: 'CANCELLED', context: { reason: input.reason ?? null } }); this.remember(input.ownerId, `plan:cancel:${input.planId}`, input.idempotencyKey, input.requestDigest, value); return { value: structuredClone(value), replayed: false }; }
  async recordDecision(input: Parameters<AllocationRepository['recordDecision']>[0]) { return this.emit({ ownerId: input.ownerId, actorId: input.actorId, action: input.action, policyId: input.policyId ?? null, policyVersion: input.policyId ? (this.policies.get(input.policyId)?.version ?? null) : null, modelId: input.modelId ?? null, planId: input.planId ?? null, previousState: null, newState: null, context: input.context ?? {} }); }
  async listActivity(ownerId: string, limit: number) { return this.events.filter((x) => x.ownerId === ownerId).slice(0, limit).map((x) => structuredClone(x)); }
}
