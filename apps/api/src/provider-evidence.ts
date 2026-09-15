import type { StrategicProvider } from './provider-doctrine.js';

export interface ProviderEvidence<T = unknown> {
  readonly provider: StrategicProvider;
  readonly providerReference: string;
  readonly observedAt: string;
  readonly networkOrRail?: string;
  readonly canonical: false;
  readonly payload: T;
}

export function providerEvidence<T>(input: Omit<ProviderEvidence<T>, 'canonical'>): ProviderEvidence<T> {
  if (!input.providerReference.trim()) throw new Error('provider evidence requires a provider reference');
  const timestamp = Date.parse(input.observedAt);
  if (!Number.isFinite(timestamp)) throw new Error('provider evidence requires a valid observedAt timestamp');
  return Object.freeze({ ...input, canonical: false as const });
}
