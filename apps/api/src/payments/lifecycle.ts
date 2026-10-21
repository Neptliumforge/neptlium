export const paymentStates = [
  'CREATED',
  'REQUIRES_ACTION',
  'READY',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'DISPUTED',
  'UNKNOWN',
] as const;

export type PaymentState = (typeof paymentStates)[number];

export const paymentAttemptStates = [
  'CREATED',
  'ROUTING',
  'SUBMITTING',
  'NOT_SUBMITTED',
  'SUBMISSION_UNKNOWN',
  'AUTHORIZED',
  'DECLINED',
  'CAPTURED',
  'FAILED',
  'CANCELLED',
  'UNKNOWN',
] as const;

export type PaymentAttemptState = (typeof paymentAttemptStates)[number];

export type PaymentAuthorizationState =
  | 'UNREQUESTED'
  | 'REQUIRES_ACTION'
  | 'AUTHORIZED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'UNKNOWN';

export type PaymentSettlementState =
  | 'UNOBSERVED'
  | 'PENDING'
  | 'OBSERVED'
  | 'RECONCILING'
  | 'RECONCILED'
  | 'DISCREPANCY'
  | 'REVERSED'
  | 'UNKNOWN';

export type PaymentRefundState =
  | 'NONE'
  | 'REQUESTED'
  | 'SUBMITTING'
  | 'PENDING'
  | 'REFUNDED'
  | 'FAILED'
  | 'UNKNOWN';

export type PaymentDisputeState =
  | 'NONE'
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'WON'
  | 'LOST'
  | 'CLOSED'
  | 'UNKNOWN';

export interface PaymentResubmissionSemantics {
  readonly automaticRetryAllowed: false;
  readonly alternateProviderSubmissionAllowed: boolean;
  readonly providerLookupRequired: boolean;
  readonly reconciliationRequired: boolean;
  readonly duplicateSubmissionProhibited: boolean;
}

export function paymentResubmissionSemantics(
  state: PaymentAttemptState,
): PaymentResubmissionSemantics {
  if (state === 'NOT_SUBMITTED') {
    return {
      automaticRetryAllowed: false,
      alternateProviderSubmissionAllowed: true,
      providerLookupRequired: false,
      reconciliationRequired: false,
      duplicateSubmissionProhibited: false,
    };
  }

  if (state === 'SUBMISSION_UNKNOWN' || state === 'UNKNOWN') {
    return {
      automaticRetryAllowed: false,
      alternateProviderSubmissionAllowed: false,
      providerLookupRequired: true,
      reconciliationRequired: true,
      duplicateSubmissionProhibited: true,
    };
  }

  if (
    state === 'SUBMITTING'
    || state === 'AUTHORIZED'
    || state === 'CAPTURED'
  ) {
    return {
      automaticRetryAllowed: false,
      alternateProviderSubmissionAllowed: false,
      providerLookupRequired: state === 'SUBMITTING',
      reconciliationRequired: state !== 'AUTHORIZED',
      duplicateSubmissionProhibited: true,
    };
  }

  return {
    automaticRetryAllowed: false,
    alternateProviderSubmissionAllowed: false,
    providerLookupRequired: false,
    reconciliationRequired: false,
    duplicateSubmissionProhibited: false,
  };
}

export function settlementIsReconciled(state: PaymentSettlementState): boolean {
  return state === 'RECONCILED';
}

export function refundIsComplete(state: PaymentRefundState): boolean {
  return state === 'REFUNDED';
}

export function disputeIsFinalLoss(state: PaymentDisputeState): boolean {
  return state === 'LOST';
}

export function paymentStateIsKnown(state: PaymentState): boolean {
  return state !== 'UNKNOWN';
}
