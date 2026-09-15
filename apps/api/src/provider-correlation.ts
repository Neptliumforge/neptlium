import type { PrimaryProvider } from './provider-doctrine.js';

export interface ProviderCorrelation {
  readonly correlationId: string;
  readonly intentId: string;
  readonly provider: PrimaryProvider;
  readonly providerReference?: string;
}

export function validateProviderCorrelation(value: ProviderCorrelation): void {
  if (!value.correlationId.trim()) throw new Error('provider correlation requires correlation identity');
  if (!value.intentId.trim()) throw new Error('provider correlation requires intent identity');
  if (value.providerReference !== undefined && !value.providerReference.trim()) throw new Error('provider reference cannot be blank');
}
