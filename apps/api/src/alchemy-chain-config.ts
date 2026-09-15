import { chainRegistry, type ChainId } from './chain-registry.js';

const rpcEnvironmentKeys = {
  ethereum: 'ALCHEMY_ETHEREUM_RPC_URL',
  base: 'ALCHEMY_BASE_RPC_URL',
  arbitrum: 'ALCHEMY_ARBITRUM_RPC_URL',
  optimism: 'ALCHEMY_OPTIMISM_RPC_URL',
  polygon: 'ALCHEMY_POLYGON_RPC_URL',
} as const satisfies Record<ChainId, string>;

export type AlchemyRpcEnvironmentKey = (typeof rpcEnvironmentKeys)[ChainId];

export interface AlchemyChainEndpoint {
  readonly chainId: ChainId;
  readonly rpcUrl: string;
}

function validatedAlchemyUrl(value: string, chainId: ChainId): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(`Invalid Alchemy RPC URL for ${chainId}`); }
  const expected = `${chainRegistry[chainId].alchemyNetworkSlug}.g.alchemy.com`;
  if (url.hostname !== expected) throw new Error(`Alchemy RPC URL for ${chainId} must use ${expected}`);
  if (url.protocol !== 'https:') throw new Error(`Alchemy RPC URL for ${chainId} must use HTTPS`);
  return url.toString();
}

/**
 * Reads independently configured production endpoints. Missing endpoints are allowed:
 * configuration presence never means that a network is financially enabled.
 */
export function loadAlchemyChainEndpoints(env: NodeJS.ProcessEnv = process.env): Readonly<Partial<Record<ChainId, AlchemyChainEndpoint>>> {
  const endpoints: Partial<Record<ChainId, AlchemyChainEndpoint>> = {};
  for (const chainId of Object.keys(rpcEnvironmentKeys) as ChainId[]) {
    const value = env[rpcEnvironmentKeys[chainId]];
    if (!value) continue;
    endpoints[chainId] = { chainId, rpcUrl: validatedAlchemyUrl(value, chainId) };
  }
  return endpoints;
}

export function alchemyRpcEnvironmentKey(chainId: ChainId): AlchemyRpcEnvironmentKey {
  return rpcEnvironmentKeys[chainId];
}
