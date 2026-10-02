export const executionOrderLifecycles = [
  'OPEN',
  'PARTIALLY_FILLED',
  'FILLED',
  'CANCELLED',
  'REJECTED',
  'EXPIRED',
  'PROVIDER_UNAVAILABLE',
  'NOT_SUBMITTED',
  'SUBMISSION_UNKNOWN',
  'UNKNOWN',
  'DISCREPANCY',
] as const;

export type ExecutionOrderLifecycle = (typeof executionOrderLifecycles)[number];

export type ExecutionSubmissionDisposition = 'CONFIRMED_NOT_SUBMITTED' | 'AMBIGUOUS';

export interface ExecutionLifecycleSemantics {
  readonly terminalOrderState: boolean;
  readonly automaticRetryAllowed: boolean;
  readonly reconciliationRequired: boolean;
  readonly lookupRequiredBeforeRetry: boolean;
}

const terminalStates = new Set<ExecutionOrderLifecycle>([
  'FILLED',
  'CANCELLED',
  'REJECTED',
  'EXPIRED',
  'NOT_SUBMITTED',
]);

export function executionLifecycleSemantics(state: ExecutionOrderLifecycle): ExecutionLifecycleSemantics {
  if (
    state === 'SUBMISSION_UNKNOWN'
    || state === 'UNKNOWN'
    || state === 'DISCREPANCY'
    || state === 'PROVIDER_UNAVAILABLE'
  ) {
    return {
      terminalOrderState: false,
      automaticRetryAllowed: false,
      reconciliationRequired: true,
      lookupRequiredBeforeRetry: true,
    };
  }

  return {
    terminalOrderState: terminalStates.has(state),
    automaticRetryAllowed: false,
    reconciliationRequired: state !== 'NOT_SUBMITTED',
    lookupRequiredBeforeRetry: false,
  };
}

export function executionLifecycleFromSubmissionDisposition(
  disposition: ExecutionSubmissionDisposition,
): 'NOT_SUBMITTED' | 'SUBMISSION_UNKNOWN' {
  if (disposition === 'CONFIRMED_NOT_SUBMITTED') return 'NOT_SUBMITTED';
  return 'SUBMISSION_UNKNOWN';
}

export function normalizeExecutionLifecycle(providerState: string): ExecutionOrderLifecycle {
  const state = providerState.trim().toUpperCase();
  if (state === 'OPEN' || state === 'ACCEPTED' || state === 'NEW' || state === 'RESTING') return 'OPEN';
  if (state === 'PARTIALLY_FILLED' || state === 'PARTIAL_FILL') return 'PARTIALLY_FILLED';
  if (state === 'FILLED') return 'FILLED';
  if (state === 'CANCELLED' || state === 'CANCELED') return 'CANCELLED';
  if (state === 'REJECTED') return 'REJECTED';
  if (state === 'EXPIRED') return 'EXPIRED';
  return 'UNKNOWN';
}
