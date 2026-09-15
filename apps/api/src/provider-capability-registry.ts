import { loadAlchemyChainEndpoints } from './alchemy-chain-config.js';
import type { ChainId } from './chain-registry.js';
import type { ProviderCapability } from './provider-capabilities.js';

/**
 * Builds only evidence-backed configured capabilities. This registry deliberately
 * does not infer certification or execution authorization from credential presence.
 */
export function buildConfiguredProviderCapabilities(env: NodeJS.ProcessEnv = process.env): readonly ProviderCapability[] {
  const capabilities: ProviderCapability[] = [];
  const environment = env.NODE_ENV === 'production' ? 'production' : 'testnet';

  for (const chainId of Object.keys(loadAlchemyChainEndpoints(env)) as ChainId[]) {
    capabilities.push({ provider: 'alchemy', operation: 'observe_chain', environment, state: 'configured', chainId, executionEnabled: false });
  }

  if (env.CIRCLE_API_KEY && env.CIRCLE_ENTITY_SECRET && env.CIRCLE_ENVIRONMENT) {
    capabilities.push({ provider: 'circle', operation: 'provision_wallet', environment: env.CIRCLE_ENVIRONMENT === 'production' ? 'production' : 'testnet', state: 'configured', executionEnabled: false });
    capabilities.push({ provider: 'circle', operation: 'stablecoin_deposit', environment: env.CIRCLE_ENVIRONMENT === 'production' ? 'production' : 'testnet', state: 'configured', executionEnabled: false });
    capabilities.push({ provider: 'circle', operation: 'stablecoin_withdrawal', environment: env.CIRCLE_ENVIRONMENT === 'production' ? 'production' : 'testnet', state: 'configured', executionEnabled: false });
  }

  if (env.STRIPE_SECRET_KEY || env.STRIPE_WEBHOOK_SECRET) {
    capabilities.push({ provider: 'stripe', operation: 'billing', environment, state: 'configured', executionEnabled: false });
  }

  return capabilities;
}
