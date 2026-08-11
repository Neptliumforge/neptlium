import { ApiError } from './errors.js';

export type WithdrawalLifecycleState =
  | 'REQUESTED'
  | 'RESERVED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUBMITTED'
  | 'SETTLED'
  | 'RECONCILED';

const transitions: Readonly<Record<WithdrawalLifecycleState, readonly WithdrawalLifecycleState[]>> = {
  REQUESTED: ['RESERVED'],
  RESERVED: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['SUBMITTED'],
  REJECTED: [],
  SUBMITTED: ['SETTLED'],
  SETTLED: ['RECONCILED'],
  RECONCILED: [],
};

export function transitionWithdrawal(
  from: WithdrawalLifecycleState,
  to: WithdrawalLifecycleState,
): WithdrawalLifecycleState {
  if (!transitions[from].includes(to))
    throw new ApiError(409, 'invalid_transfer_transition', `Withdrawal cannot transition from ${from} to ${to}`);
  return to;
}

export function withdrawalMaySubmit(input: {
  lifecycle: WithdrawalLifecycleState;
  reservationActive: boolean;
  operatorApproved: boolean;
}): boolean {
  return input.lifecycle === 'APPROVED' && input.reservationActive && input.operatorApproved;
}

export function withdrawalMaySettle(input: {
  lifecycle: WithdrawalLifecycleState;
  providerSettlementEvidence: boolean;
}): boolean {
  return input.lifecycle === 'SUBMITTED' && input.providerSettlementEvidence;
}

export function withdrawalMayReconcile(input: {
  lifecycle: WithdrawalLifecycleState;
  reconciliationMatched: boolean;
}): boolean {
  return input.lifecycle === 'SETTLED' && input.reconciliationMatched;
}

/**
 * Rejection never executes movement. The reservation must be released by a
 * balanced compensating journal through the governed ledger operation.
 */
export function rejectionRequiresReservationRelease(lifecycle: WithdrawalLifecycleState): boolean {
  return lifecycle === 'REJECTED';
}
