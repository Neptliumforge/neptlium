export const executionErrorCodes = [
  'EXECUTION_INPUT_INVALID',
  'EXECUTION_CAPABILITY_UNSUPPORTED',
  'EXECUTION_PROVIDER_UNAVAILABLE',
  'EXECUTION_RESTRICTED',
  'EXECUTION_SUBMISSION_AMBIGUOUS',
  'EXECUTION_PROVIDER_STATE_UNKNOWN',
  'EXECUTION_RECONCILIATION_REQUIRED',
] as const;

export type ExecutionErrorCode = (typeof executionErrorCodes)[number];

const reconciliationRequiredErrorCodes = new Set<ExecutionErrorCode>([
  'EXECUTION_SUBMISSION_AMBIGUOUS',
  'EXECUTION_PROVIDER_STATE_UNKNOWN',
  'EXECUTION_RECONCILIATION_REQUIRED',
]);

export class ExecutionDomainError extends Error {
  readonly reconciliationRequired: boolean;

  constructor(
    readonly code: ExecutionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ExecutionDomainError';
    this.reconciliationRequired = reconciliationRequiredErrorCodes.has(code);
  }
}

export function ambiguousSubmissionError(): ExecutionDomainError {
  return new ExecutionDomainError(
    'EXECUTION_SUBMISSION_AMBIGUOUS',
    'Execution submission result is unknown and requires provider lookup before any retry',
  );
}
