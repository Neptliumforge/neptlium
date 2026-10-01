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
  if (state === 'SUBMISSION_UNKNOWN' || state === 'UNKNOWN' || state === 'DISCREPANCY') {
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
    reconciliationRequired: state !== 'NOT_SUBMITTED' && state !== 'PROVIDER_UNAVAILABLE',
    lookupRequiredBeforeRetry: false,
  };
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
