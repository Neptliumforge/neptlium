export type ChainEnvironment = 'testnet' | 'production';
export type ChainCapability = 'rpc' | 'observation' | 'webhook' | 'simulation' | 'deposits' | 'withdrawals' | 'contract_execution';
export type ChainCapabilityState = 'declared' | 'configured' | 'certified' | 'disabled';

export interface ChainDefinition {
  readonly id: string;
  readonly family: 'evm';
  readonly chainId: number;
  readonly nativeAsset: string;
  readonly strategicInfrastructureProvider: 'ALCHEMY';
  readonly capabilities: Readonly<Record<ChainCapability, ChainCapabilityState>>;
}

const observationFirst = (): Readonly<Record<ChainCapability, ChainCapabilityState>> => Object.freeze({
  rpc: 'declared',
  observation: 'declared',
  webhook: 'declared',
  simulation: 'declared',
  deposits: 'disabled',
  withdrawals: 'disabled',
  contract_execution: 'disabled',
});

/**
 * Canonical Neptlium network identity. Registry presence is not a live-capability claim.
 * Alchemy is the current strategic infrastructure provider; financial execution remains
 * independently gated by Neptlium policy/capability controls.
 */
export const chainRegistry = Object.freeze({
  ethereum: { id: 'ethereum', family: 'evm', chainId: 1, nativeAsset: 'ETH', strategicInfrastructureProvider: 'ALCHEMY', capabilities: observationFirst() },
  base: { id: 'base', family: 'evm', chainId: 8453, nativeAsset: 'ETH', strategicInfrastructureProvider: 'ALCHEMY', capabilities: observationFirst() },
  arbitrum: { id: 'arbitrum', family: 'evm', chainId: 42161, nativeAsset: 'ETH', strategicInfrastructureProvider: 'ALCHEMY', capabilities: observationFirst() },
  optimism: { id: 'optimism', family: 'evm', chainId: 10, nativeAsset: 'ETH', strategicInfrastructureProvider: 'ALCHEMY', capabilities: observationFirst() },
  polygon: { id: 'polygon', family: 'evm', chainId: 137, nativeAsset: 'POL', strategicInfrastructureProvider: 'ALCHEMY', capabilities: observationFirst() },
} satisfies Readonly<Record<string, ChainDefinition>>);

export type ChainRegistryId = keyof typeof chainRegistry;

export function getChainDefinition(id: string): ChainDefinition | undefined {
  return chainRegistry[id as ChainRegistryId];
}

export function requireChainDefinition(id: string): ChainDefinition {
  const chain = getChainDefinition(id);
  if (!chain) throw new Error(`unsupported Neptlium network: ${id}`);
  return chain;
}
