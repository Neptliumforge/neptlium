import { ApiError } from './errors.js';
import type { FinancialRepository } from './financial-repository.js';
import {
  allocationCapabilities,
  calculateAllocationDrift,
  modelMovements,
  observedFromCanonical,
  validateAllocationPolicy,
  type AllocationClassification,
  type AllocationPolicyInput,
  type AllocationTargetInput,
} from './allocation-domain.js';
import { allocationRequestDigest, type AllocationRepository } from './allocation-repository.js';

type AllocationContext = {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: Record<string, string | undefined>;
  body: unknown;
};
type RouteResult = { status?: number; data: unknown };

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError(422, 'validation_failed', 'Request body must be an object');
}
function idem(context: AllocationContext) {
  const value = context.headers['idempotency-key'];
  if (!value || value.length < 8 || value.length > 128) throw new ApiError(400, 'idempotency_key_required', 'A valid Idempotency-Key header is required');
  return value;
}
function text(value: unknown, field: string) {
  if (typeof value !== 'string') throw new ApiError(422, 'validation_failed', `${field} must be a string`);
  return value;
}
function integer(value: unknown, field: string) {
  if (typeof value !== 'number' || !Number.isInteger(value)) throw new ApiError(422, 'validation_failed', `${field} must be an integer`);
  return value;
}
function assets(value: unknown) {
  if (!Array.isArray(value)) throw new ApiError(422, 'validation_failed', 'Asset constraints must be arrays');
  return value.map((item) => { assertObject(item); return { asset: text(item.asset, 'asset').toUpperCase(), network: text(item.network, 'network').toUpperCase() }; });
}
function targets(value: unknown): AllocationTargetInput[] {
  if (!Array.isArray(value)) throw new ApiError(422, 'validation_failed', 'targets must be an array');
  return value.map((item) => {
    assertObject(item);
    const basis = text(item.basis, 'basis');
    if (basis !== 'ASSET' && basis !== 'CLASSIFICATION') throw new ApiError(422, 'validation_failed', 'Target basis is invalid');
    return {
      key: text(item.key, 'key'),
      basis,
      ...(item.classification === undefined ? {} : { classification: text(item.classification, 'classification').toUpperCase() as AllocationClassification }),
      ...(item.asset === undefined ? {} : { asset: text(item.asset, 'asset').toUpperCase() }),
      ...(item.network === undefined ? {} : { network: text(item.network, 'network').toUpperCase() }),
      targetBps: integer(item.targetBps, 'targetBps'),
      ...(item.minimumBps === undefined ? {} : { minimumBps: integer(item.minimumBps, 'minimumBps') }),
      ...(item.maximumBps === undefined ? {} : { maximumBps: integer(item.maximumBps, 'maximumBps') }),
    };
  });
}
function policyInput(value: unknown): AllocationPolicyInput {
  assertObject(value);
  const reviewFrequency = text(value.reviewFrequency, 'reviewFrequency') as AllocationPolicyInput['reviewFrequency'];
  if (!['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'MANUAL'].includes(reviewFrequency)) throw new ApiError(422, 'validation_failed', 'Review frequency is invalid');
  const liquidityConstraints = value.liquidityConstraints;
  if (liquidityConstraints !== undefined && (!liquidityConstraints || typeof liquidityConstraints !== 'object' || Array.isArray(liquidityConstraints))) throw new ApiError(422, 'validation_failed', 'Liquidity constraints must be an object');
  return validateAllocationPolicy({
    name: text(value.name, 'name'), objective: text(value.objective, 'objective'), reviewFrequency,
    reserveRequirementBps: integer(value.reserveRequirementBps, 'reserveRequirementBps'), driftToleranceBps: integer(value.driftToleranceBps, 'driftToleranceBps'),
    allowedAssets: assets(value.allowedAssets), restrictedAssets: assets(value.restrictedAssets), targets: targets(value.targets),
    ...(liquidityConstraints ? { liquidityConstraints: liquidityConstraints as Record<string, unknown> } : {}),
  });
}

export async function handleAllocationRoute(
  context: AllocationContext,
  deps: { repository: AllocationRepository; financialRepository: FinancialRepository; principal: () => Promise<{ id: string; role?: string }> },
): Promise<RouteResult | null> {
  if (!context.path.startsWith('/v1/allocation/')) return null;
  const principal = await deps.principal();
  const ownerId = principal.id;
  const actorId = principal.id;
  const { method, path } = context;

  if (method === 'GET' && path === '/v1/allocation/capabilities') return { data: allocationCapabilities };
  if (method === 'GET' && path === '/v1/allocation/workspace') {
    const [balances, policies, plans, activity] = await Promise.all([
      deps.financialRepository.getCanonicalBalances(ownerId), deps.repository.listPolicies(ownerId), deps.repository.listPlans(ownerId), deps.repository.listActivity(ownerId, 25),
    ]);
    const observed = observedFromCanonical(balances);
    const activePolicy = policies.find((policy) => policy.status === 'AUTHORIZED') ?? policies[0] ?? null;
    const drift = activePolicy ? calculateAllocationDrift(observed, activePolicy) : null;
    return { data: { capabilities: allocationCapabilities, observed: { asOf: new Date().toISOString(), source: 'NEPTLIUM_CANONICAL_LEDGER', positions: observed, portfolioValue: null, valuationState: 'UNAVAILABLE' }, activePolicy, policies, drift, plans, activity } };
  }
  if (method === 'GET' && path === '/v1/allocation/policies') return { data: { policies: await deps.repository.listPolicies(ownerId) } };
  if (method === 'POST' && path === '/v1/allocation/policies') {
    const input = policyInput(context.body); const key = idem(context); const digest = allocationRequestDigest(input);
    const result = await deps.repository.createPolicy({ ownerId, actorId, policy: input, idempotencyKey: key, requestDigest: digest });
    return { status: result.replayed ? 200 : 201, data: { policy: result.value, replayed: result.replayed } };
  }
  const policyMatch = path.match(/^\/v1\/allocation\/policies\/([^/]+)$/);
  if (method === 'GET' && policyMatch?.[1]) return { data: { policy: await deps.repository.getPolicy(ownerId, policyMatch[1]) } };
  if (method === 'PATCH' && policyMatch?.[1]) {
    assertObject(context.body); const expectedVersion = integer(context.body.expectedVersion, 'expectedVersion'); const input = policyInput(context.body.policy); const key = idem(context); const digest = allocationRequestDigest({ expectedVersion, input });
    const result = await deps.repository.updatePolicy({ ownerId, actorId, policyId: policyMatch[1], expectedVersion, policy: input, idempotencyKey: key, requestDigest: digest });
    return { data: { policy: result.value, replayed: result.replayed } };
  }
  const policyAuthorize = path.match(/^\/v1\/allocation\/policies\/([^/]+)\/authorize$/);
  if (method === 'POST' && policyAuthorize?.[1]) {
    assertObject(context.body); const expectedVersion = integer(context.body.expectedVersion, 'expectedVersion'); const policy = await deps.repository.getPolicy(ownerId, policyAuthorize[1]); validateAllocationPolicy(policy); const key = idem(context); const digest = allocationRequestDigest({ policyId: policy.id, expectedVersion });
    const result = await deps.repository.authorizePolicy({ ownerId, actorId, policyId: policy.id, expectedVersion, idempotencyKey: key, requestDigest: digest });
    return { data: { policy: result.value, replayed: result.replayed } };
  }

  if (method === 'POST' && path === '/v1/allocation/models') {
    assertObject(context.body); const policyId = text(context.body.policyId, 'policyId'); const policy = await deps.repository.getPolicy(ownerId, policyId); validateAllocationPolicy(policy);
    const key = idem(context);
    const digest = allocationRequestDigest({ policyId: policy.id, policyVersion: policy.version });
    const balances = await deps.financialRepository.getCanonicalBalances(ownerId); const observedAt = new Date().toISOString(); const observed = observedFromCanonical(balances); const drift = calculateAllocationDrift(observed, policy);
    const result = await deps.repository.createModel({ ownerId, actorId, policy, observedAt, observed, drift: drift.rows, valuationState: drift.valuationState, idempotencyKey: key, requestDigest: digest });
    return { status: result.replayed ? 200 : 201, data: { model: result.value, replayed: result.replayed } };
  }
  const modelMatch = path.match(/^\/v1\/allocation\/models\/([^/]+)$/);
  if (method === 'GET' && modelMatch?.[1]) return { data: { model: await deps.repository.getModel(ownerId, modelMatch[1]) } };

  if (method === 'GET' && path === '/v1/allocation/plans') return { data: { plans: await deps.repository.listPlans(ownerId) } };
  if (method === 'POST' && path === '/v1/allocation/plans') {
    assertObject(context.body); const modelId = text(context.body.modelId, 'modelId'); const model = await deps.repository.getModel(ownerId, modelId); const policy = await deps.repository.getPolicy(ownerId, model.policyId);
    if (policy.version !== model.policyVersion) throw new ApiError(409, 'stale_policy_version', 'Model was created against an older policy version');
    const movements = modelMovements(model, policy); const key = idem(context); const digest = allocationRequestDigest({ modelId, policyVersion: policy.version, movements });
    const result = await deps.repository.createPlan({ ownerId, actorId, model, policy, movements, idempotencyKey: key, requestDigest: digest });
    return { status: result.replayed ? 200 : 201, data: { plan: result.value, replayed: result.replayed } };
  }
  const planMatch = path.match(/^\/v1\/allocation\/plans\/([^/]+)$/);
  if (method === 'GET' && planMatch?.[1]) return { data: { plan: await deps.repository.getPlan(ownerId, planMatch[1]) } };
  const planAuthorize = path.match(/^\/v1\/allocation\/plans\/([^/]+)\/authorize$/);
  if (method === 'POST' && planAuthorize?.[1]) {
    const plan = await deps.repository.getPlan(ownerId, planAuthorize[1]); const policy = await deps.repository.getPolicy(ownerId, plan.policyId); validateAllocationPolicy(policy);
    if (policy.status !== 'AUTHORIZED' || policy.version !== plan.policyVersion) throw new ApiError(409, 'allocation_policy_not_authorized', 'The exact plan policy version must be authorized');
    const key = idem(context); const digest = allocationRequestDigest({ planId: plan.id, policyVersion: plan.policyVersion, observedAt: plan.observedAt });
    const result = await deps.repository.authorizePlan({ ownerId, actorId, planId: plan.id, idempotencyKey: key, requestDigest: digest });
    return { data: { plan: result.value, replayed: result.replayed, execution: allocationCapabilities.executionState } };
  }
  const planCancel = path.match(/^\/v1\/allocation\/plans\/([^/]+)\/cancel$/);
  if (method === 'POST' && planCancel?.[1]) {
    assertObject(context.body); const reason = context.body.reason === undefined ? undefined : text(context.body.reason, 'reason'); const key = idem(context); const digest = allocationRequestDigest({ planId: planCancel[1], reason: reason ?? null });
    const result = await deps.repository.cancelPlan({ ownerId, actorId, planId: planCancel[1], ...(reason ? { reason } : {}), idempotencyKey: key, requestDigest: digest });
    return { data: { plan: result.value, replayed: result.replayed } };
  }
  if (method === 'POST' && path === '/v1/allocation/drift-decisions') {
    assertObject(context.body); const action = text(context.body.action, 'action');
    if (!['LEAVE_UNCHANGED', 'REVIEW_REBALANCE', 'UPDATE_POLICY'].includes(action)) throw new ApiError(422, 'validation_failed', 'Drift decision is invalid');
    const value = await deps.repository.recordDecision({ ownerId, actorId, action: action as 'LEAVE_UNCHANGED' | 'REVIEW_REBALANCE' | 'UPDATE_POLICY', ...(typeof context.body.policyId === 'string' ? { policyId: context.body.policyId } : {}), ...(typeof context.body.modelId === 'string' ? { modelId: context.body.modelId } : {}), ...(typeof context.body.planId === 'string' ? { planId: context.body.planId } : {}) });
    return { status: 201, data: { event: value } };
  }
  if (method === 'GET' && path === '/v1/allocation/activity') {
    const limit = Math.min(100, Math.max(1, Number(context.query.get('limit') ?? 25) || 25));
    return { data: { events: await deps.repository.listActivity(ownerId, limit) } };
  }
  throw new ApiError(404, 'not_found', 'Allocation route not found');
}
