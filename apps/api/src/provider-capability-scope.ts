import type { ProviderCapability } from './provider-capabilities.js';

export function validateProviderCapabilityScope(capability: ProviderCapability): void {
  if (capability.operation === 'observe_chain' || capability.operation === 'simulate_transaction') {
    if (!capability.chainId) throw new Error(`${capability.operation} requires a canonical chain identity`);
  }
  if (capability.operation === 'stablecoin_deposit' || capability.operation === 'stablecoin_withdrawal') {
    if (!capability.assetOrCurrency?.trim()) throw new Error(`${capability.operation} requires an asset identity`);
  }
  if (capability.operation === 'fiat_payment') {
    if (!capability.assetOrCurrency?.trim()) throw new Error('fiat payment capability requires a currency identity');
  }
}
