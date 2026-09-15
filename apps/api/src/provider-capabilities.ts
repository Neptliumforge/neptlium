import type { PrimaryProvider } from './provider-doctrine.js';
import type { ChainId } from './chain-registry.js';

export type ProviderCapabilityState = 'configured' | 'connectivity_verified' | 'capability_certified';
export type ProviderOperation =
  | 'observe_chain'
  | 'simulate_transaction'
  | 'provision_wallet'
  | 'stablecoin_deposit'
  | 'stablecoin_withdrawal'
  | 'fiat_payment'
  | 'billing'
  | 'refund';

export interface ProviderCapability {
  readonly provider: PrimaryProvider;
  readonly operation: ProviderOperation;
  readonly environment: 'testnet' | 'production';
  readonly state: ProviderCapabilityState;
  readonly chainId?: ChainId;
  readonly assetOrCurrency?: string;
  readonly executionEnabled: boolean;
}

export function capabilityCanExecute(capability: ProviderCapability): boolean {
  return capability.state === 'capability_certified' && capability.executionEnabled;
}

export function assertProviderCapability(capability: ProviderCapability): void {
  if (capability.provider === 'alchemy' && !['observe_chain', 'simulate_transaction'].includes(capability.operation))
    throw new Error(`Alchemy cannot advertise financial execution operation ${capability.operation}`);
  if (capability.provider === 'stripe' && ['observe_chain', 'simulate_transaction', 'provision_wallet', 'stablecoin_deposit', 'stablecoin_withdrawal'].includes(capability.operation))
    throw new Error(`Stripe cannot advertise blockchain/stablecoin operation ${capability.operation}`);
  if (capability.provider === 'circle' && ['observe_chain', 'simulate_transaction', 'fiat_payment', 'billing'].includes(capability.operation))
    throw new Error(`Circle cannot advertise observation/fiat operation ${capability.operation}`);
  if (capability.provider === 'alchemy' && capability.executionEnabled)
    throw new Error('Alchemy observation/intelligence capabilities cannot grant financial execution authority');
}
