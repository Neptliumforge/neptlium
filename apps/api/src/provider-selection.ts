import type { ProviderCapability, ProviderOperation } from './provider-capabilities.js';
import type { ChainId } from './chain-registry.js';

export interface ProviderSelectionRequest {
  readonly operation: ProviderOperation;
  readonly environment: 'testnet' | 'production';
  readonly chainId?: ChainId;
  readonly assetOrCurrency?: string;
  readonly requireExecution: boolean;
}

export function selectProviderCapability(request: ProviderSelectionRequest, capabilities: readonly ProviderCapability[]): ProviderCapability {
  const candidates = capabilities.filter((capability) =>
    capability.operation === request.operation &&
    capability.environment === request.environment &&
    (!request.chainId || capability.chainId === request.chainId) &&
    (!request.assetOrCurrency || !capability.assetOrCurrency || capability.assetOrCurrency === request.assetOrCurrency) &&
    capability.state === 'capability_certified' &&
    (!request.requireExecution || capability.executionEnabled)
  );

  if (candidates.length === 0) throw new Error('no certified provider capability satisfies the request');
  if (candidates.length > 1) throw new Error('provider selection is ambiguous and requires explicit policy resolution');
  return candidates[0];
}
