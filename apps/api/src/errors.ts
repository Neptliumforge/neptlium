export type ErrorCode =
  | 'authentication_required'
  | 'authentication_unavailable'
  | 'forbidden'
  | 'validation_failed'
  | 'payload_too_large'
  | 'rate_limited'
  | 'not_found'
  | 'invalid_state_transition'
  | 'idempotency_conflict'
  | 'idempotency_key_required'
  | 'provider_not_configured'
  | 'invalid_webhook'
  | 'webhook_replay_detected'
  | 'insufficient_funds'
  | 'internal_error';
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}
