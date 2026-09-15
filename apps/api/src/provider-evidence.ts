import type { PrimaryProvider } from './provider-doctrine.js';
import type { ChainId } from './chain-registry.js';

export type ProviderEvidenceKind = 'provider_event' | 'chain_observation' | 'payment_observation' | 'settlement_observation';

export interface ProviderEvidence {
  readonly provider: PrimaryProvider;
  readonly kind: ProviderEvidenceKind;
  readonly providerReference: string;
  readonly observedAt: string;
  readonly chainId?: ChainId;
  readonly canonical: false;
  readonly reconciled: false;
}

/** Provider evidence is deliberately constructed as non-canonical and unreconciled. */
export function providerEvidence(input: Omit<ProviderEvidence, 'canonical' | 'reconciled'>): ProviderEvidence {
  if (!input.providerReference.trim()) throw new Error('provider evidence requires a provider reference');
  if (!Number.isFinite(Date.parse(input.observedAt))) throw new Error('provider evidence requires a valid observation timestamp');
  return { ...input, canonical: false, reconciled: false };
}
