import type { PrimaryProvider } from './provider-doctrine.js';
import type { ProviderOperation } from './provider-capabilities.js';

const providerOperations = {
  circle: ['provision_wallet', 'stablecoin_deposit', 'stablecoin_withdrawal', 'refund'],
  alchemy: ['observe_chain', 'simulate_transaction'],
  stripe: ['fiat_payment', 'billing', 'refund'],
} as const satisfies Record<PrimaryProvider, readonly ProviderOperation[]>;

export function providerSupportsOperation(provider: PrimaryProvider, operation: ProviderOperation): boolean {
  return (providerOperations[provider] as readonly ProviderOperation[]).includes(operation);
}

export function requireProviderOperation(provider: PrimaryProvider, operation: ProviderOperation): void {
  if (!providerSupportsOperation(provider, operation)) throw new Error(`${provider} does not own provider operation ${operation}`);
}
