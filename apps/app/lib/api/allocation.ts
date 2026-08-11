import 'server-only';
import { apiRequest } from './client';

export type AllocationClassification = 'RESERVE' | 'CORE' | 'GROWTH' | 'OPPORTUNITY' | 'RESTRICTED';
export type AllocationLifecycleState = 'OBSERVED' | 'MODELED' | 'AUTHORIZED' | 'EXECUTION_PENDING' | 'EXECUTING' | 'EXECUTED' | 'RECONCILING' | 'RECONCILED' | 'CANCELLED' | 'FAILED' | 'PARTIALLY_EXECUTED' | 'DISCREPANCY';
export type DriftStatus = 'WITHIN_POLICY' | 'REVIEW' | 'OUTSIDE_POLICY' | 'RESTRICTED' | 'VALUATION_UNAVAILABLE';

export interface AllocationTarget {
  readonly key: string;
  readonly basis: 'CLASSIFICATION' | 'ASSET';
  readonly classification?: AllocationClassification;
  readonly asset?: string;
  readonly network?: string;
  readonly targetBps: number;
  readonly minimumBps?: number;
  readonly maximumBps?: number;
}
export interface AllocationPolicyInput {
  readonly name: string;
  readonly objective: string;
  readonly reviewFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'MANUAL';
  readonly reserveRequirementBps: number;
  readonly driftToleranceBps: number;
  readonly allowedAssets: ReadonlyArray<{ asset: string; network: string }>;
  readonly restrictedAssets: ReadonlyArray<{ asset: string; network: string }>;
  readonly liquidityConstraints?: Record<string, unknown>;
  readonly targets: readonly AllocationTarget[];
}
export interface AllocationPolicy extends AllocationPolicyInput {
  readonly id: string; readonly ownerId: string; readonly status: 'DRAFT' | 'AUTHORIZED' | 'RETIRED'; readonly version: number;
  readonly createdBy: string; readonly authorizedBy: string | null; readonly createdAt: string; readonly updatedAt: string; readonly authorizedAt: string | null;
}
export interface ObservedPosition { readonly asset: string; readonly network: string | null; readonly totalAtomic: string; readonly availableAtomic: string; readonly reservedAtomic: string; readonly pendingAtomic: string; readonly restrictedAtomic: string; }
export interface DriftRow { readonly key: string; readonly basis: 'CLASSIFICATION' | 'ASSET'; readonly classification?: AllocationClassification; readonly asset?: string; readonly network?: string; readonly currentBps: number | null; readonly targetBps: number; readonly differenceBps: number | null; readonly status: DriftStatus; readonly currentAtomic: string | null; }
export interface AllocationMovement { readonly id: string; readonly type: 'INTERNAL_RECLASSIFICATION' | 'TRANSFER' | 'CONVERSION_REQUIRED' | 'UNEXECUTABLE'; readonly state: string; readonly asset: string | null; readonly network: string | null; readonly fromClassification: AllocationClassification | null; readonly toClassification: AllocationClassification | null; readonly amountAtomic: string | null; readonly executable: boolean; readonly reason: string | null; }
export interface AllocationPlan { readonly id: string; readonly ownerId: string; readonly modelId: string; readonly policyId: string; readonly policyVersion: number; readonly state: AllocationLifecycleState; readonly observedAt: string; readonly observed: readonly ObservedPosition[]; readonly targets: readonly AllocationTarget[]; readonly drift: readonly DriftRow[]; readonly movements: readonly AllocationMovement[]; readonly constraints: Record<string, unknown>; readonly createdBy: string; readonly authorizedBy: string | null; readonly createdAt: string; readonly authorizedAt: string | null; }
export interface AllocationEvent { readonly id: string; readonly action: string; readonly policyId: string | null; readonly policyVersion: number | null; readonly modelId: string | null; readonly planId: string | null; readonly previousState: string | null; readonly newState: string | null; readonly context: Record<string, unknown>; readonly createdAt: string; }
export interface AllocationWorkspace {
  readonly capabilities: { readonly canModel: boolean; readonly canAuthorize: boolean; readonly canReserve: boolean; readonly canExecute: boolean; readonly canReconcile: boolean; readonly executionState: 'UNAVAILABLE'; readonly reason: string };
  readonly observed: { readonly asOf: string; readonly source: 'NEPTLIUM_CANONICAL_LEDGER'; readonly positions: readonly ObservedPosition[]; readonly portfolioValue: null; readonly valuationState: 'UNAVAILABLE' };
  readonly activePolicy: AllocationPolicy | null;
  readonly policies: readonly AllocationPolicy[];
  readonly drift: null | { readonly rows: readonly DriftRow[]; readonly valuationState: 'NOT_REQUIRED' | 'REQUIRED_UNAVAILABLE' };
  readonly plans: readonly AllocationPlan[];
  readonly activity: readonly AllocationEvent[];
}

function mutationHeaders(idempotencyKey: string) { return { 'idempotency-key': idempotencyKey }; }
export function getAllocationWorkspace() { return apiRequest<AllocationWorkspace>('/v1/allocation/workspace'); }
export function createAllocationPolicy(input: AllocationPolicyInput, idempotencyKey: string) { return apiRequest<{ policy: AllocationPolicy; replayed: boolean }>('/v1/allocation/policies', { method: 'POST', headers: mutationHeaders(idempotencyKey), body: JSON.stringify(input) }); }
export function updateAllocationPolicy(policyId: string, expectedVersion: number, policy: AllocationPolicyInput, idempotencyKey: string) { return apiRequest<{ policy: AllocationPolicy; replayed: boolean }>(`/v1/allocation/policies/${encodeURIComponent(policyId)}`, { method: 'PATCH', headers: mutationHeaders(idempotencyKey), body: JSON.stringify({ expectedVersion, policy }) }); }
export function authorizeAllocationPolicy(policyId: string, expectedVersion: number, idempotencyKey: string) { return apiRequest<{ policy: AllocationPolicy; replayed: boolean }>(`/v1/allocation/policies/${encodeURIComponent(policyId)}/authorize`, { method: 'POST', headers: mutationHeaders(idempotencyKey), body: JSON.stringify({ expectedVersion }) }); }
export function createAllocationModel(policyId: string, idempotencyKey: string) { return apiRequest<{ model: { id: string }; replayed: boolean }>('/v1/allocation/models', { method: 'POST', headers: mutationHeaders(idempotencyKey), body: JSON.stringify({ policyId }) }); }
export function createAllocationPlan(modelId: string, idempotencyKey: string) { return apiRequest<{ plan: AllocationPlan; replayed: boolean }>('/v1/allocation/plans', { method: 'POST', headers: mutationHeaders(idempotencyKey), body: JSON.stringify({ modelId }) }); }
export function authorizeAllocationPlan(planId: string, idempotencyKey: string) { return apiRequest<{ plan: AllocationPlan; replayed: boolean; execution: 'UNAVAILABLE' }>(`/v1/allocation/plans/${encodeURIComponent(planId)}/authorize`, { method: 'POST', headers: mutationHeaders(idempotencyKey), body: JSON.stringify({}) }); }
export function cancelAllocationPlan(planId: string, reason: string, idempotencyKey: string) { return apiRequest<{ plan: AllocationPlan; replayed: boolean }>(`/v1/allocation/plans/${encodeURIComponent(planId)}/cancel`, { method: 'POST', headers: mutationHeaders(idempotencyKey), body: JSON.stringify({ reason }) }); }
export function recordAllocationDecision(input: { action: 'LEAVE_UNCHANGED' | 'REVIEW_REBALANCE' | 'UPDATE_POLICY'; policyId?: string; modelId?: string; planId?: string }) { return apiRequest<{ event: AllocationEvent }>('/v1/allocation/drift-decisions', { method: 'POST', body: JSON.stringify(input) }); }
