import type { PrimaryProvider } from './provider-doctrine.js';

export type ProviderHealthState = 'unknown' | 'healthy' | 'degraded' | 'unavailable';

export interface ProviderHealth {
  readonly provider: PrimaryProvider;
  readonly state: ProviderHealthState;
  readonly checkedAt: string;
  readonly latencyMs?: number;
}

export function providerIsOperational(health: ProviderHealth): boolean {
  return health.state === 'healthy' || health.state === 'degraded';
}

/** Health answers operational reachability only; it never proves capability, settlement or balance truth. */
export function validateProviderHealth(health: ProviderHealth): void {
  if (!Number.isFinite(Date.parse(health.checkedAt))) throw new Error('provider health requires a valid timestamp');
  if (health.latencyMs !== undefined && (!Number.isFinite(health.latencyMs) || health.latencyMs < 0)) throw new Error('provider health latency is invalid');
}
