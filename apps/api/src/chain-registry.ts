export type ChainEnvironment = 'testnet' | 'production';

export interface ChainDefinition {
  readonly id: string;
  readonly family: 'evm';
  readonly chainId: number;
  readonly displayName: string;
  readonly alchemyNetworkSlug: string;
  readonly environment: ChainEnvironment;
  readonly enabledByDefault: boolean;
}

/**
 * Canonical chain identities are Neptlium-owned domain configuration.
 * Provider support does not imply product capability, execution authority or settlement support.
 */
export const chainRegistry = {
  ethereum: { id: 'ethereum', family: 'evm', chainId: 1, displayName: 'Ethereum', alchemyNetworkSlug: 'eth-mainnet', environment: 'production', enabledByDefault: true },
  base: { id: 'base', family: 'evm', chainId: 8453, displayName: 'Base', alchemyNetworkSlug: 'base-mainnet', environment: 'production', enabledByDefault: true },
  arbitrum: { id: 'arbitrum', family: 'evm', chainId: 42161, displayName: 'Arbitrum One', alchemyNetworkSlug: 'arb-mainnet', environment: 'production', enabledByDefault: true },
  optimism: { id: 'optimism', family: 'evm', chainId: 10, displayName: 'Optimism', alchemyNetworkSlug: 'opt-mainnet', environment: 'production', enabledByDefault: true },
  polygon: { id: 'polygon', family: 'evm', chainId: 137, displayName: 'Polygon PoS', alchemyNetworkSlug: 'polygon-mainnet', environment: 'production', enabledByDefault: true },
} as const satisfies Record<string, ChainDefinition>;

export type ChainId = keyof typeof chainRegistry;

export function getChainDefinition(chainId: string): ChainDefinition {
  const chain = chainRegistry[chainId as ChainId];
  if (!chain) throw new Error(`unsupported Neptlium chain: ${chainId}`);
  return chain;
}

export function listAlchemyProductionChains(): readonly ChainDefinition[] {
  return Object.values(chainRegistry).filter((chain) => chain.environment === 'production');
}
