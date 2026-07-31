import { ApiError } from './errors.js';
import type { Asset, Network } from './domain.js';

export interface WithdrawalPolicy {
  asset: Asset;
  network: Network;
  singleApprovalLimit: bigint;
  dualApprovalThreshold: bigint;
  maximumAmount: bigint;
  requireAllowlist: boolean;
}
export interface Approval {
  actorId: string;
  role: 'approver';
  decision: 'approved' | 'rejected';
  createdAt: string;
}
export interface WithdrawalReview {
  ownerId: string;
  destination: string;
  amount: bigint;
  asset: Asset;
  network: Network;
  approvals: readonly Approval[];
}
export type PolicyDecision =
  { allowed: true; requiredApprovals: 1 | 2 } | { allowed: false; reason: string };
export function evaluateWithdrawalPolicy(
  review: WithdrawalReview,
  policy: WithdrawalPolicy,
  allowlisted: boolean,
): PolicyDecision {
  if (review.asset !== policy.asset || review.network !== policy.network)
    return { allowed: false, reason: 'policy_not_applicable' };
  if (review.amount <= 0n || review.amount > policy.maximumAmount)
    return { allowed: false, reason: 'amount_outside_policy' };
  if (policy.requireAllowlist && !allowlisted)
    return { allowed: false, reason: 'destination_not_allowlisted' };
  if (review.amount > policy.singleApprovalLimit && review.amount < policy.dualApprovalThreshold)
    return { allowed: false, reason: 'approval_threshold_gap' };
  const required = review.amount >= policy.dualApprovalThreshold ? 2 : 1;
  const distinct = new Set(
    review.approvals.filter((a) => a.decision === 'approved').map((a) => a.actorId),
  );
  if (distinct.has(review.ownerId)) return { allowed: false, reason: 'self_approval_prohibited' };
  if (review.approvals.some((a) => a.decision === 'rejected'))
    return { allowed: false, reason: 'withdrawal_rejected' };
  return distinct.size >= required
    ? { allowed: true, requiredApprovals: required }
    : { allowed: false, reason: 'approvals_required' };
}
export function assertPolicyAllowed(
  decision: PolicyDecision,
): asserts decision is Extract<PolicyDecision, { allowed: true }> {
  if (!decision.allowed)
    throw new ApiError(403, 'forbidden', `Withdrawal policy denied: ${decision.reason}`);
}
