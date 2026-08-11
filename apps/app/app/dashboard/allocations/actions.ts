'use server';

import { randomUUID } from 'node:crypto';
import {
  authorizeAllocationPlan,
  authorizeAllocationPolicy,
  createAllocationModel,
  createAllocationPlan,
  createAllocationPolicy,
  recordAllocationDecision,
  updateAllocationPolicy,
  type AllocationPolicyInput,
} from '@/lib/api/allocation';

export type AllocationMutationResult = { readonly ok: true; readonly message: string; readonly id?: string } | { readonly ok: false; readonly error: string };

function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Allocation request failed.'; }

export async function saveAllocationPolicyAction(input: { policyId?: string; expectedVersion?: number; policy: AllocationPolicyInput }): Promise<AllocationMutationResult> {
  try {
    const key = randomUUID();
    const result = input.policyId && input.expectedVersion
      ? await updateAllocationPolicy(input.policyId, input.expectedVersion, input.policy, key)
      : await createAllocationPolicy(input.policy, key);
    return { ok: true, message: result.policy.status === 'DRAFT' ? 'Policy draft saved.' : 'Policy saved.', id: result.policy.id };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function authorizeAllocationPolicyAction(policyId: string, expectedVersion: number): Promise<AllocationMutationResult> {
  try { const result = await authorizeAllocationPolicy(policyId, expectedVersion, randomUUID()); return { ok: true, message: `Policy v${result.policy.version} authorized.`, id: result.policy.id }; }
  catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function modelAllocationAction(policyId: string): Promise<AllocationMutationResult> {
  try { const result = await createAllocationModel(policyId, randomUUID()); return { ok: true, message: 'Allocation model created from canonical capital.', id: result.model.id }; }
  catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function reviewRebalanceAction(policyId: string): Promise<AllocationMutationResult> {
  try {
    const model = await createAllocationModel(policyId, randomUUID());
    const plan = await createAllocationPlan(model.model.id, randomUUID());
    await recordAllocationDecision({ action: 'REVIEW_REBALANCE', policyId, modelId: model.model.id, planId: plan.plan.id });
    return { ok: true, message: 'Modeled rebalance plan created for review.', id: plan.plan.id };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function authorizeAllocationPlanAction(planId: string): Promise<AllocationMutationResult> {
  try { const result = await authorizeAllocationPlan(planId, randomUUID()); return { ok: true, message: result.execution === 'UNAVAILABLE' ? 'Plan authorized. Execution remains unavailable.' : 'Plan authorized.', id: result.plan.id }; }
  catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function leaveAllocationUnchangedAction(policyId?: string): Promise<AllocationMutationResult> {
  try { await recordAllocationDecision({ action: 'LEAVE_UNCHANGED', ...(policyId ? { policyId } : {}) }); return { ok: true, message: 'Decision recorded. No execution was created.' }; }
  catch (error) { return { ok: false, error: errorMessage(error) }; }
}
