import type { PrimaryProvider } from './provider-doctrine.js';

export type ProviderErrorKind = 'configuration' | 'authentication' | 'authorization' | 'rate_limited' | 'unavailable' | 'invalid_request' | 'ambiguous_outcome' | 'provider_rejected' | 'unknown';

export interface NormalizedProviderError {
  readonly provider: PrimaryProvider;
  readonly kind: ProviderErrorKind;
  readonly retryable: boolean;
  readonly ambiguous: boolean;
  readonly safeMessage: string;
  readonly providerReference?: string;
}

export function normalizedProviderError(error: NormalizedProviderError): NormalizedProviderError {
  if (!error.safeMessage.trim()) throw new Error('normalized provider error requires a safe message');
  if (error.kind === 'ambiguous_outcome' && !error.ambiguous) throw new Error('ambiguous provider outcome must be marked ambiguous');
  return error;
}
