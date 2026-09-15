import type { PrimaryProvider } from './provider-doctrine.js';
import type { ProviderOperation } from './provider-capabilities.js';
import type { ChainId } from './chain-registry.js';
import { requireProviderOperation } from './provider-operation-policy.js';

export interface ProviderOperationIntent {
  readonly intentId: string;
  readonly principalId: string;
  readonly ownerId: string;
  readonly provider: PrimaryProvider;
  readonly operation: ProviderOperation;
  readonly environment: 'testnet' | 'production';
  readonly chainId?: ChainId;
  readonly assetOrCurrency?: string;
  readonly idempotencyKey: string;
  readonly authorized: boolean;
}

export function validateProviderOperationIntent(intent: ProviderOperationIntent): void {
  if (!intent.intentId.trim() || !intent.principalId.trim() || !intent.ownerId.trim()) throw new Error('provider operation requires stable Neptlium identity');
  if (!intent.idempotencyKey.trim()) throw new Error('provider operation requires a Neptlium idempotency key');
  requireProviderOperation(intent.provider, intent.operation);
  if (!intent.authorized) throw new Error('provider operation intent is not authorized');
}
