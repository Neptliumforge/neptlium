import type { ProviderCapability } from './provider-capabilities.js';

export function providerCapabilityKey(capability: Pick<ProviderCapability, 'provider' | 'environment' | 'operation' | 'chainId' | 'assetOrCurrency'>): string {
  return [
    capability.provider,
    capability.environment,
    capability.operation,
    capability.chainId ?? '-',
    capability.assetOrCurrency?.trim().toUpperCase() ?? '-',
  ].join(':');
}
