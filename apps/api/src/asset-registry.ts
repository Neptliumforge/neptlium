import type { CapabilityState, ProviderEnvironment } from './funding-domain.js';

export type AssetClass = 'FIAT' | 'NATIVE_CRYPTO' | 'TOKEN';
export type DepositMethod = 'BANK_REFERENCE' | 'UNIQUE_ADDRESS' | 'ADDRESS_WITH_MEMO_TAG';
export type AddressFormat = 'BANK_PROVIDER_REFERENCE' | 'BITCOIN' | 'EVM' | 'XRPL' | 'SOLANA';
export type ProviderCandidate = 'stripe' | 'circle' | 'unassigned';
export type RegistryCapabilityState = CapabilityState;

export interface GovernedAssetDefinition {
  readonly capabilityCode: string;
  readonly asset: string;
  readonly displayName: string;
  readonly assetClass: AssetClass;
  readonly atomicPrecision: number;
  readonly ledgerDenomination: string;
  readonly network: string;
  readonly networkIdentifier: string;
  readonly chainId?: number;
  readonly depositMethod: DepositMethod;
  readonly addressFormat: AddressFormat;
  readonly memoOrTag: 'REQUIRED' | 'OPTIONAL' | 'NOT_APPLICABLE';
  readonly finalityPolicy: {
    readonly mode: 'BANK_SETTLEMENT' | 'BLOCK_CONFIRMATIONS' | 'PROVIDER_FINALITY';
    readonly minimumConfirmations?: number;
    readonly policyReference: string;
  };
  readonly provider: ProviderCandidate;
  readonly custodyCapability: RegistryCapabilityState;
  readonly depositCapability: RegistryCapabilityState;
  readonly withdrawalCapability: RegistryCapabilityState;
  readonly reconciliationCapability: RegistryCapabilityState;
  readonly environment: ProviderEnvironment;
  readonly productionEnabled: boolean;
  readonly publiclyAddressable: boolean;
}

/**
 * Architecture registry only. Presence here never enables a customer capability.
 * Runtime/provider verification owns final capability state. Definitions beyond the
 * publiclyAddressable set are intentionally invisible to customer capability APIs.
 */
export const governedAssetRegistry: readonly GovernedAssetDefinition[] = [
  {
    capabilityCode: 'USD_ACH',
    asset: 'USD',
    displayName: 'US Dollar',
    assetClass: 'FIAT',
    atomicPrecision: 2,
    ledgerDenomination: 'USD',
    network: 'ACH',
    networkIdentifier: 'US_ACH',
    depositMethod: 'BANK_REFERENCE',
    addressFormat: 'BANK_PROVIDER_REFERENCE',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BANK_SETTLEMENT',
      policyReference: 'provider_settlement_plus_reconciliation',
    },
    provider: 'stripe',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'DISABLED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: true,
  },
  {
    capabilityCode: 'BTC_BITCOIN',
    asset: 'BTC',
    displayName: 'Bitcoin',
    assetClass: 'NATIVE_CRYPTO',
    atomicPrecision: 8,
    ledgerDenomination: 'satoshi',
    network: 'BITCOIN',
    networkIdentifier: 'bitcoin-mainnet',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'BITCOIN',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'btc_production_finality_unverified',
    },
    provider: 'circle',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'DISABLED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: true,
  },
  {
    capabilityCode: 'ETH_BASE',
    asset: 'ETH',
    displayName: 'Ether',
    assetClass: 'NATIVE_CRYPTO',
    atomicPrecision: 18,
    ledgerDenomination: 'wei',
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    chainId: 8453,
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'base_eth_production_finality_unverified',
    },
    provider: 'circle',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'DISABLED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: true,
  },
  {
    capabilityCode: 'USDC_BASE',
    asset: 'USDC',
    displayName: 'USD Coin',
    assetClass: 'TOKEN',
    atomicPrecision: 6,
    ledgerDenomination: 'USDC_BASE_BASE_UNIT',
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    chainId: 8453,
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'base_usdc_production_finality_unverified',
    },
    provider: 'circle',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'DISABLED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: true,
  },
  {
    capabilityCode: 'ETH_ETHEREUM',
    asset: 'ETH',
    displayName: 'Ether',
    assetClass: 'NATIVE_CRYPTO',
    atomicPrecision: 18,
    ledgerDenomination: 'wei',
    network: 'ETHEREUM',
    networkIdentifier: 'ethereum-mainnet',
    chainId: 1,
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'ethereum_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'DISABLED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
  {
    capabilityCode: 'XRP_XRPL',
    asset: 'XRP',
    displayName: 'XRP',
    assetClass: 'NATIVE_CRYPTO',
    atomicPrecision: 6,
    ledgerDenomination: 'drop',
    network: 'XRPL',
    networkIdentifier: 'xrpl-mainnet',
    depositMethod: 'ADDRESS_WITH_MEMO_TAG',
    addressFormat: 'XRPL',
    memoOrTag: 'OPTIONAL',
    finalityPolicy: {
      mode: 'PROVIDER_FINALITY',
      policyReference: 'xrpl_validated_ledger_plus_reconciliation',
    },
    provider: 'circle',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'DISABLED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: true,
  },
  {
    capabilityCode: 'SOL_SOLANA',
    asset: 'SOL',
    displayName: 'Solana',
    assetClass: 'NATIVE_CRYPTO',
    atomicPrecision: 9,
    ledgerDenomination: 'lamport',
    network: 'SOLANA',
    networkIdentifier: 'solana-mainnet-beta',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'SOLANA',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'PROVIDER_FINALITY',
      policyReference: 'solana_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'NOT_CONFIGURED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
  {
    capabilityCode: 'AVAX_AVALANCHE_C',
    asset: 'AVAX',
    displayName: 'Avalanche',
    assetClass: 'NATIVE_CRYPTO',
    atomicPrecision: 18,
    ledgerDenomination: 'nAVAX',
    network: 'AVALANCHE_C',
    networkIdentifier: 'avalanche-c-mainnet',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'PROVIDER_FINALITY',
      policyReference: 'avalanche_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'NOT_CONFIGURED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
  {
    capabilityCode: 'LINK_BASE',
    asset: 'LINK',
    displayName: 'Chainlink',
    assetClass: 'TOKEN',
    atomicPrecision: 18,
    ledgerDenomination: 'LINK_BASE_BASE_UNIT',
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'base_link_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'NOT_CONFIGURED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
  {
    capabilityCode: 'UNI_BASE',
    asset: 'UNI',
    displayName: 'Uniswap',
    assetClass: 'TOKEN',
    atomicPrecision: 18,
    ledgerDenomination: 'UNI_BASE_BASE_UNIT',
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'base_uni_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'NOT_CONFIGURED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
  {
    capabilityCode: 'AAVE_BASE',
    asset: 'AAVE',
    displayName: 'Aave',
    assetClass: 'TOKEN',
    atomicPrecision: 18,
    ledgerDenomination: 'AAVE_BASE_BASE_UNIT',
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'base_aave_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'NOT_CONFIGURED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
  {
    capabilityCode: 'DAI_BASE',
    asset: 'DAI',
    displayName: 'Dai',
    assetClass: 'TOKEN',
    atomicPrecision: 18,
    ledgerDenomination: 'DAI_BASE_BASE_UNIT',
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'base_dai_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'NOT_CONFIGURED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
  {
    capabilityCode: 'USDT_BASE',
    asset: 'USDT',
    displayName: 'Tether USD',
    assetClass: 'TOKEN',
    atomicPrecision: 6,
    ledgerDenomination: 'USDT_BASE_BASE_UNIT',
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    depositMethod: 'UNIQUE_ADDRESS',
    addressFormat: 'EVM',
    memoOrTag: 'NOT_APPLICABLE',
    finalityPolicy: {
      mode: 'BLOCK_CONFIRMATIONS',
      policyReference: 'base_usdt_production_finality_unverified',
    },
    provider: 'unassigned',
    custodyCapability: 'NOT_CONFIGURED',
    depositCapability: 'NOT_CONFIGURED',
    withdrawalCapability: 'NOT_CONFIGURED',
    reconciliationCapability: 'NOT_CONFIGURED',
    environment: 'LIVE',
    productionEnabled: false,
    publiclyAddressable: false,
  },
] as const;

export function canonicalAssetIdentity(
  asset: string,
  network: string,
  environment: ProviderEnvironment,
): string {
  return `${asset}:${network}:${environment}`;
}

export function publicFundingDefinitions(): readonly GovernedAssetDefinition[] {
  return governedAssetRegistry.filter((definition) => definition.publiclyAddressable);
}

export function governedAssetDefinition(
  asset: string,
  network: string,
  environment: ProviderEnvironment,
) {
  return governedAssetRegistry.find(
    (definition) =>
      definition.asset === asset &&
      definition.network === network &&
      definition.environment === environment,
  );
}
