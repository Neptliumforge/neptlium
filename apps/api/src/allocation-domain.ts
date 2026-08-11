import { ApiError } from './errors.js';
import { governedAssetRegistry } from './asset-registry.js';
import type { CanonicalBalance } from './financial-repository.js';

export const allocationClassifications = ['RESERVE', 'CORE', 'GROWTH', 'OPPORTUNITY', 'RESTRICTED'] as const;
export type AllocationClassification = (typeof allocationClassifications)[number];
export const allocationLifecycle = ['OBSERVED', 'MODELED', 'AUTHORIZED', 'EXECUTION_PENDING', 'EXECUTING', 'EXECUTED', 'RECONCILING', 'RECONCILED'] as const;
export type AllocationLifecycleState = (typeof allocationLifecycle)[number] | 'CANCELLED' | 'FAILED' | 'PARTIALLY_EXECUTED' | 'DISCREPANCY';
export type AllocationMovementType = 'INTERNAL_RECLASSIFICATION' | 'TRANSFER' | 'CONVERSION_REQUIRED' | 'UNEXECUTABLE';
export type AllocationMovementState = 'PROPOSED' | 'RESERVATION_PENDING' | 'RESERVED' | 'SUBMITTED' | 'SETTLED' | 'FAILED' | 'CANCELLED' | 'RECONCILED' | 'DISCREPANCY';
export type DriftStatus = 'WITHIN_POLICY' | 'REVIEW' | 'OUTSIDE_POLICY' | 'RESTRICTED' | 'VALUATION_UNAVAILABLE';

export interface AllocationTargetInput {
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
  readonly targets: readonly AllocationTargetInput[];
}

export interface AllocationPolicyRecord extends AllocationPolicyInput {
  readonly id: string;
  readonly ownerId: string;
  readonly status: 'DRAFT' | 'AUTHORIZED' | 'RETIRED';
  readonly version: number;
  readonly createdBy: string;
  readonly authorizedBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly authorizedAt: string | null;
}

export interface AllocationObservedPosition {
  readonly asset: string;
  readonly network: string | null;
  readonly totalAtomic: string;
  readonly availableAtomic: string;
  readonly reservedAtomic: string;
  readonly pendingAtomic: string;
  readonly restrictedAtomic: string;
}

export interface AllocationDriftRow {
  readonly key: string;
  readonly basis: 'CLASSIFICATION' | 'ASSET';
  readonly asset?: string;
  readonly network?: string;
  readonly classification?: AllocationClassification;
  readonly currentBps: number | null;
  readonly targetBps: number;
  readonly differenceBps: number | null;
  readonly status: DriftStatus;
  readonly currentAtomic: string | null;
}

export interface AllocationModelRecord {
  readonly id: string;
  readonly ownerId: string;
  readonly policyId: string;
  readonly policyVersion: number;
  readonly state: 'MODELED';
  readonly observedAt: string;
  readonly observed: readonly AllocationObservedPosition[];
  readonly targets: readonly AllocationTargetInput[];
  readonly drift: readonly AllocationDriftRow[];
  readonly valuationState: 'NOT_REQUIRED' | 'REQUIRED_UNAVAILABLE';
  readonly createdBy: string;
  readonly createdAt: string;
}

export interface AllocationMovement {
  readonly id: string;
  readonly type: AllocationMovementType;
  readonly state: AllocationMovementState;
  readonly asset: string | null;
  readonly network: string | null;
  readonly fromClassification: AllocationClassification | null;
  readonly toClassification: AllocationClassification | null;
  readonly amountAtomic: string | null;
  readonly executable: boolean;
  readonly reason: string | null;
}

export interface AllocationPlanRecord {
  readonly id: string;
  readonly ownerId: string;
  readonly modelId: string;
  readonly policyId: string;
  readonly policyVersion: number;
  readonly state: AllocationLifecycleState;
  readonly observedAt: string;
  readonly observed: readonly AllocationObservedPosition[];
  readonly targets: readonly AllocationTargetInput[];
  readonly drift: readonly AllocationDriftRow[];
  readonly movements: readonly AllocationMovement[];
  readonly constraints: Record<string, unknown>;
  readonly createdBy: string;
  readonly authorizedBy: string | null;
  readonly createdAt: string;
  readonly authorizedAt: string | null;
}

export interface AllocationEventRecord {
  readonly id: string;
  readonly ownerId: string;
  readonly actorId: string;
  readonly action: string;
  readonly policyId: string | null;
  readonly policyVersion: number | null;
  readonly modelId: string | null;
  readonly planId: string | null;
  readonly previousState: string | null;
  readonly newState: string | null;
  readonly context: Record<string, unknown>;
  readonly createdAt: string;
}

export const allocationCapabilities = Object.freeze({
  canModel: true,
  canAuthorize: true,
  canReserve: false,
  canExecute: false,
  canReconcile: false,
  executionState: 'UNAVAILABLE' as const,
  reason: 'governed_execution_capability_inactive',
});

const supported = new Set(
  governedAssetRegistry
    .filter((definition) => definition.environment === 'LIVE' && definition.publiclyAddressable)
    .map((definition) => `${definition.asset}:${definition.network}`),
);

function integerBps(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0 || value > 10_000)
    throw new ApiError(422, 'allocation_policy_invalid', `${label} must be an integer from 0 to 10000 basis points`);
}

function assetKey(asset: string, network: string) {
  return `${asset.trim().toUpperCase()}:${network.trim().toUpperCase()}`;
}

export function validateAllocationPolicy(input: AllocationPolicyInput): AllocationPolicyInput {
  const name = input.name.trim();
  const objective = input.objective.trim();
  if (name.length < 2 || name.length > 120) throw new ApiError(422, 'allocation_policy_invalid', 'Policy name is invalid');
  if (objective.length < 2 || objective.length > 500) throw new ApiError(422, 'allocation_policy_invalid', 'Policy objective is invalid');
  integerBps(input.reserveRequirementBps, 'Reserve requirement');
  integerBps(input.driftToleranceBps, 'Drift tolerance');
  if (input.targets.length === 0 || input.targets.length > 50) throw new ApiError(422, 'allocation_policy_invalid', 'At least one target is required');

  const allowed = new Set<string>();
  for (const item of input.allowedAssets) {
    const key = assetKey(item.asset, item.network);
    if (!supported.has(key)) throw new ApiError(422, 'unsupported_asset', `Unsupported allocation asset ${key}`);
    if (allowed.has(key)) throw new ApiError(422, 'allocation_policy_invalid', `Duplicate allowed asset ${key}`);
    allowed.add(key);
  }
  const restricted = new Set<string>();
  for (const item of input.restrictedAssets) {
    const key = assetKey(item.asset, item.network);
    if (!supported.has(key)) throw new ApiError(422, 'unsupported_asset', `Unsupported restricted asset ${key}`);
    if (restricted.has(key)) throw new ApiError(422, 'allocation_policy_invalid', `Duplicate restricted asset ${key}`);
    restricted.add(key);
  }

  const targetKeys = new Set<string>();
  let total = 0;
  for (const target of input.targets) {
    if (!target.key.trim() || targetKeys.has(target.key)) throw new ApiError(422, 'allocation_policy_invalid', 'Duplicate or empty allocation target');
    targetKeys.add(target.key);
    integerBps(target.targetBps, 'Target allocation');
    if (target.minimumBps !== undefined) integerBps(target.minimumBps, 'Minimum allocation');
    if (target.maximumBps !== undefined) integerBps(target.maximumBps, 'Maximum allocation');
    const minimum = target.minimumBps ?? 0;
    const maximum = target.maximumBps ?? 10_000;
    if (minimum > maximum || target.targetBps < minimum || target.targetBps > maximum)
      throw new ApiError(422, 'allocation_policy_invalid', 'Target allocation conflicts with minimum or maximum');
    if (target.basis === 'CLASSIFICATION') {
      if (!target.classification || !allocationClassifications.includes(target.classification))
        throw new ApiError(422, 'allocation_policy_invalid', 'Classification target is invalid');
      if (target.classification === 'RESTRICTED' && target.targetBps > 0)
        throw new ApiError(422, 'restricted_asset', 'Restricted capital cannot have a positive executable target');
    } else {
      if (!target.asset || !target.network) throw new ApiError(422, 'allocation_policy_invalid', 'Asset target requires asset and network');
      const key = assetKey(target.asset, target.network);
      if (!supported.has(key)) throw new ApiError(422, 'unsupported_asset', `Unsupported allocation target ${key}`);
      if (restricted.has(key) && target.targetBps > 0) throw new ApiError(422, 'restricted_asset', `Restricted asset ${key} cannot have a positive target`);
      if (allowed.size && !allowed.has(key)) throw new ApiError(422, 'allocation_policy_invalid', `Target ${key} is not in the policy allowed-asset set`);
    }
    total += target.targetBps;
  }
  if (total !== 10_000) throw new ApiError(422, 'allocation_target_total_invalid', 'Allocation targets must total exactly 10000 basis points');
  if (input.reserveRequirementBps > 0) {
    const reserve = input.targets.find((target) => target.basis === 'CLASSIFICATION' && target.classification === 'RESERVE');
    if (reserve && reserve.targetBps < input.reserveRequirementBps)
      throw new ApiError(422, 'allocation_policy_invalid', 'Reserve target is below the reserve requirement');
  }
  return { ...input, name, objective };
}

export function observedFromCanonical(balances: readonly CanonicalBalance[]): AllocationObservedPosition[] {
  return balances.map((balance) => ({
    asset: balance.asset,
    network: balance.network,
    totalAtomic: balance.totalAtomic,
    availableAtomic: balance.availableAtomic,
    reservedAtomic: balance.reservedAtomic,
    pendingAtomic: balance.pendingAtomic,
    restrictedAtomic: balance.restrictedAtomic,
  }));
}

function positivePositions(observed: readonly AllocationObservedPosition[]) {
  return observed.filter((position) => BigInt(position.totalAtomic) > 0n);
}

export function calculateAllocationDrift(
  observed: readonly AllocationObservedPosition[],
  policy: AllocationPolicyRecord,
): { rows: AllocationDriftRow[]; valuationState: AllocationModelRecord['valuationState'] } {
  const positive = positivePositions(observed);
  const singleAssetTarget = policy.targets.length === 1 && policy.targets[0]?.basis === 'ASSET';
  const nativeComputable = positive.length <= 1 && singleAssetTarget;
  const restricted = new Set(policy.restrictedAssets.map((item) => assetKey(item.asset, item.network)));
  const rows = policy.targets.map((target): AllocationDriftRow => {
    const match = target.basis === 'ASSET'
      ? observed.find((position) => position.asset === target.asset && (position.network ?? '').toUpperCase() === (target.network ?? '').toUpperCase())
      : undefined;
    const isRestricted = target.basis === 'ASSET' && target.asset && target.network && restricted.has(assetKey(target.asset, target.network));
    if (isRestricted || target.classification === 'RESTRICTED') {
      return { ...target, currentBps: null, differenceBps: null, status: 'RESTRICTED', currentAtomic: match?.totalAtomic ?? null };
    }
    if (!nativeComputable) {
      return { ...target, currentBps: null, differenceBps: null, status: 'VALUATION_UNAVAILABLE', currentAtomic: match?.totalAtomic ?? null };
    }
    const currentBps = match && BigInt(match.totalAtomic) > 0n ? 10_000 : 0;
    const differenceBps = currentBps - target.targetBps;
    const absolute = Math.abs(differenceBps);
    const status: DriftStatus = absolute <= policy.driftToleranceBps ? 'WITHIN_POLICY' : absolute <= policy.driftToleranceBps * 2 ? 'REVIEW' : 'OUTSIDE_POLICY';
    return { ...target, currentBps, differenceBps, status, currentAtomic: match?.totalAtomic ?? '0' };
  });
  return { rows, valuationState: nativeComputable ? 'NOT_REQUIRED' : 'REQUIRED_UNAVAILABLE' };
}

export function modelMovements(model: AllocationModelRecord, policy: AllocationPolicyRecord): Omit<AllocationMovement, 'id'>[] {
  const restricted = new Set(policy.restrictedAssets.map((item) => assetKey(item.asset, item.network)));
  return model.drift
    .filter((row) => row.status !== 'WITHIN_POLICY')
    .map((row) => {
      const restrictedTarget = row.status === 'RESTRICTED' || (row.asset && row.network && restricted.has(assetKey(row.asset, row.network)));
      if (restrictedTarget) return { type: 'UNEXECUTABLE' as const, state: 'PROPOSED' as const, asset: row.asset ?? null, network: row.network ?? null, fromClassification: null, toClassification: row.classification ?? null, amountAtomic: null, executable: false, reason: 'restricted_capital' };
      if (row.status === 'VALUATION_UNAVAILABLE') return { type: 'UNEXECUTABLE' as const, state: 'PROPOSED' as const, asset: row.asset ?? null, network: row.network ?? null, fromClassification: null, toClassification: row.classification ?? null, amountAtomic: null, executable: false, reason: 'valuation_required' };
      return { type: 'CONVERSION_REQUIRED' as const, state: 'PROPOSED' as const, asset: row.asset ?? null, network: row.network ?? null, fromClassification: null, toClassification: row.classification ?? null, amountAtomic: null, executable: false, reason: 'execution_capability_unavailable' };
    });
}

const transitions: Readonly<Record<AllocationLifecycleState, readonly AllocationLifecycleState[]>> = {
  OBSERVED: ['MODELED', 'CANCELLED'], MODELED: ['AUTHORIZED', 'CANCELLED'], AUTHORIZED: ['EXECUTION_PENDING', 'CANCELLED'],
  EXECUTION_PENDING: ['EXECUTING', 'FAILED', 'CANCELLED'], EXECUTING: ['EXECUTED', 'PARTIALLY_EXECUTED', 'FAILED', 'DISCREPANCY'],
  PARTIALLY_EXECUTED: ['EXECUTING', 'RECONCILING', 'FAILED', 'DISCREPANCY'], EXECUTED: ['RECONCILING', 'DISCREPANCY'],
  RECONCILING: ['RECONCILED', 'DISCREPANCY'], RECONCILED: [], CANCELLED: [], FAILED: [], DISCREPANCY: ['RECONCILING', 'CANCELLED'],
};

export function assertAllocationTransition(current: AllocationLifecycleState, next: AllocationLifecycleState) {
  if (!transitions[current].includes(next)) throw new ApiError(409, 'invalid_allocation_transition', `Allocation cannot transition from ${current} to ${next}`);
}

export function derivePlanExecutionState(movements: readonly AllocationMovement[]): AllocationLifecycleState {
  if (!movements.length) return 'AUTHORIZED';
  const settled = movements.filter((movement) => movement.state === 'SETTLED' || movement.state === 'RECONCILED').length;
  const failed = movements.filter((movement) => movement.state === 'FAILED' || movement.state === 'DISCREPANCY').length;
  if (settled === movements.length) return 'EXECUTED';
  if (settled > 0 && settled + failed === movements.length) return 'PARTIALLY_EXECUTED';
  if (movements.some((movement) => movement.state === 'SUBMITTED')) return 'EXECUTING';
  return 'EXECUTION_PENDING';
}

export function reconciliationState(expected: { amountAtomic: string; asset: string; network: string | null }, actual: { amountAtomic: string; asset: string; network: string | null }) {
  return expected.amountAtomic === actual.amountAtomic && expected.asset === actual.asset && expected.network === actual.network ? 'RECONCILED' as const : 'DISCREPANCY' as const;
}
