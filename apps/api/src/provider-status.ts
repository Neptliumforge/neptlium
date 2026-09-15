import type { ProviderCapability, ProviderCapabilityState } from './provider-capabilities.js';
import type { PrimaryProvider } from './provider-doctrine.js';

export interface ProviderStatusProjection {
  readonly provider: PrimaryProvider;
  readonly configured: boolean;
  readonly highestCapabilityState: ProviderCapabilityState | 'unconfigured';
  readonly executionCapabilityCount: number;
  readonly observationCapabilityCount: number;
}

const stateRank: Record<ProviderCapabilityState, number> = { configured: 1, connectivity_verified: 2, capability_certified: 3 };

export function projectProviderStatus(provider: PrimaryProvider, capabilities: readonly ProviderCapability[]): ProviderStatusProjection {
  const relevant = capabilities.filter((capability) => capability.provider === provider);
  const highest = relevant.reduce<ProviderCapabilityState | 'unconfigured'>((current, capability) => {
    if (current === 'unconfigured' || stateRank[capability.state] > stateRank[current]) return capability.state;
    return current;
  }, 'unconfigured');

  return {
    provider,
    configured: relevant.length > 0,
    highestCapabilityState: highest,
    executionCapabilityCount: relevant.filter((capability) => capability.state === 'capability_certified' && capability.executionEnabled).length,
    observationCapabilityCount: relevant.filter((capability) => capability.operation === 'observe_chain' && capability.state === 'capability_certified').length,
  };
}
