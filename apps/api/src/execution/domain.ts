export type ExecutionEnvironment = 'TEST' | 'LIVE';

declare const executionProviderBrand: unique symbol;
export type ExecutionProviderId = string & { readonly [executionProviderBrand]: true };

export function executionProviderId(value: string): ExecutionProviderId {
  const normalized = value.trim().toUpperCase();
  if (!normalized) throw new Error('Execution provider identity is required');
  return normalized as ExecutionProviderId;
}

export type ExecutionProduct = 'SPOT' | 'PERPETUAL' | 'FUTURE' | 'OPTION' | 'OTHER';
export type ExecutionSide = 'BUY' | 'SELL';
export type ExecutionOrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' | 'OTHER';

export interface ExecutionInstrument {
  readonly id: string;
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly providerInstrumentId: string;
  readonly product: ExecutionProduct;
  readonly baseAsset: string;
  readonly quoteAsset: string;
  readonly collateralAsset: string | null;
  readonly quantityIncrement: string;
  readonly priceIncrement: string;
  readonly minimumQuantity: string | null;
  readonly maximumQuantity: string | null;
  readonly minimumNotional: string | null;
  readonly maximumNotional: string | null;
  readonly observedAt: string;
}

export type ExecutionSize =
  | { readonly kind: 'QUANTITY'; readonly quantity: string }
  | { readonly kind: 'NOTIONAL'; readonly notional: string; readonly asset: string };

export interface ExecutionIntent {
  readonly id: string;
  readonly principalId: string;
  readonly accountId: string;
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly instrumentId: string;
  readonly side: ExecutionSide;
  readonly orderType: ExecutionOrderType;
  readonly size: ExecutionSize;
  readonly limitPrice: string | null;
  readonly triggerPrice: string | null;
  readonly policyReference: string;
  readonly authorizationReference: string;
  readonly reservationReference: string | null;
  readonly createdAt: string;
}

export interface ExecutionOrder {
  readonly id: string;
  readonly intentId: string;
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly providerOrderId: string | null;
  readonly providerClientOrderId: string | null;
  readonly lifecycle: import('./lifecycle.js').ExecutionOrderLifecycle;
  readonly requestedQuantity: string;
  readonly executedQuantity: string;
  readonly remainingQuantity: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ExecutionFillObservation {
  readonly observationKind: 'PROVIDER_FILL';
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly providerFillId: string;
  readonly orderId: string | null;
  readonly providerOrderId: string | null;
  readonly instrumentId: string;
  readonly side: ExecutionSide;
  readonly quantity: string;
  readonly price: string;
  readonly fee: { readonly amount: string; readonly asset: string } | null;
  readonly occurredAt: string;
  readonly evidenceId: string;
}

export interface ExecutionPositionObservation {
  readonly observationKind: 'PROVIDER_POSITION';
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly providerAccountReference: string;
  readonly instrumentId: string;
  readonly quantity: string;
  readonly entryPrice: string | null;
  readonly unrealizedPnl: string | null;
  readonly realizedPnl: string | null;
  readonly observedAt: string;
  readonly evidenceId: string;
}

export interface ExecutionAccountObservation {
  readonly observationKind: 'PROVIDER_EXECUTION_ACCOUNT';
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly providerAccountReference: string;
  readonly collateral: readonly ProviderCollateralObservation[];
  readonly observedAt: string;
  readonly evidenceId: string;
}

export interface ProviderCollateralObservation {
  readonly observationKind: 'PROVIDER_COLLATERAL';
  readonly asset: string;
  readonly total: string;
  readonly available: string | null;
  readonly marginUsed: string | null;
}
