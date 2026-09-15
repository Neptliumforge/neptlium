import type { TreasuryMoney, TreasuryNetworkId, TreasuryPaymentRail } from './treasury-orchestration-domain.js';

export type TreasuryProvider = 'zengo' | 'alchemy' | 'circle' | 'stripe';
export type TreasuryProviderCapabilityState = 'available' | 'unavailable' | 'not_configured' | 'disabled';

export interface TreasuryProviderCapability {
  readonly provider: TreasuryProvider;
  readonly capability: string;
  readonly state: TreasuryProviderCapabilityState;
  readonly reason?: string;
}

export interface ExternalTreasuryAddress {
  readonly organizationId: string;
  readonly accountId: string;
  readonly address: string;
  readonly networkId: TreasuryNetworkId;
  readonly signingAuthority: 'external';
}

export interface ExternalSigningRequest {
  readonly intentId: string;
  readonly accountId: string;
  readonly networkId: TreasuryNetworkId;
  readonly unsignedPayload: string;
  readonly expiresAt: string;
}

/** Zengo is an external signer boundary. This port deliberately exposes no key material or server-side sign method. */
export interface ZengoExternalTreasuryService {
  registerPublicAddress(input: ExternalTreasuryAddress): Promise<ExternalTreasuryAddress>;
  prepareExternalSigningRequest(input: { intentId: string; account: ExternalTreasuryAddress; unsignedPayload: string; expiresAt: string }): Promise<ExternalSigningRequest>;
  observeTransaction(input: { networkId: TreasuryNetworkId; transactionHash: string }): Promise<{ observed: boolean; confirmations?: number }>;
}

export interface AlchemyRpcService {
  getNativeBalance(input: { networkId: TreasuryNetworkId; address: string }): Promise<{ amountAtomic: string; observedAt: string }>;
  getTokenBalances(input: { networkId: TreasuryNetworkId; address: string }): Promise<readonly { assetKey: string; amountAtomic: string; observedAt: string }[]>;
}

export interface AlchemyTransactionService {
  getAddressActivity(input: { networkId: TreasuryNetworkId; address: string }): Promise<readonly { transactionHash: string; observedAt: string }[]>;
}

export interface AlchemySimulationService {
  simulate(input: { networkId: TreasuryNetworkId; from: string; to: string; data?: string; valueAtomic?: string }): Promise<{
    readonly state: 'passed' | 'failed' | 'unavailable';
    readonly warnings: readonly string[];
    readonly assetChanges: readonly { assetKey: string; amountAtomic: string }[];
  }>;
}

export interface AlchemySmartAccountService {
  capability(input: { organizationId: string; networkId: TreasuryNetworkId }): Promise<TreasuryProviderCapability>;
}

export interface AlchemyGasService {
  capability(input: { organizationId: string; networkId: TreasuryNetworkId }): Promise<TreasuryProviderCapability>;
}

export interface CircleAssetService {
  capability(assetKey: string, networkId: TreasuryNetworkId): Promise<TreasuryProviderCapability>;
}

export interface CircleSettlementService {
  observe(reference: string): Promise<{ state: 'pending' | 'settled' | 'failed' | 'unknown'; observedAt: string }>;
}

export interface StripePaymentService {
  capability(rail: Extract<TreasuryPaymentRail, 'stripe_card' | 'stripe_bank' | 'stripe_checkout'>): Promise<TreasuryProviderCapability>;
}

export interface StripeSettlementService {
  observe(reference: string): Promise<{ state: 'pending' | 'available' | 'paid_out' | 'failed' | 'unknown'; observedAt: string }>;
}

export interface PaymentRailContext {
  readonly money: TreasuryMoney;
  readonly preferredRail?: TreasuryPaymentRail;
  readonly allowedRails: readonly TreasuryPaymentRail[];
  readonly capabilities: readonly TreasuryProviderCapability[];
  readonly networkId?: TreasuryNetworkId;
}

export interface PaymentRailResolution {
  readonly rail: TreasuryPaymentRail | null;
  readonly state: 'resolved' | 'unavailable';
  readonly reasons: readonly string[];
  readonly executionAuthorized: false;
}

const railProvider: Readonly<Partial<Record<TreasuryPaymentRail, TreasuryProvider>>> = {
  stablecoin_onchain: 'alchemy',
  circle_transfer: 'circle',
  stripe_card: 'stripe',
  stripe_bank: 'stripe',
  stripe_checkout: 'stripe',
};

export function resolvePaymentRail(context: PaymentRailContext): PaymentRailResolution {
  const ordered = context.preferredRail
    ? [context.preferredRail, ...context.allowedRails.filter((rail) => rail !== context.preferredRail)]
    : [...context.allowedRails];

  for (const rail of ordered) {
    if (!context.allowedRails.includes(rail)) continue;
    const provider = railProvider[rail];
    if (!provider) continue;
    const capability = context.capabilities.find((entry) => entry.provider === provider && entry.capability === rail);
    if (capability?.state === 'available') {
      return { rail, state: 'resolved', reasons: [], executionAuthorized: false };
    }
  }

  return {
    rail: null,
    state: 'unavailable',
    reasons: ['No allowed payment rail has an available provider capability'],
    executionAuthorized: false,
  };
}
