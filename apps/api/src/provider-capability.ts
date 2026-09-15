import type { StrategicProvider, CapabilityState } from './provider-doctrine.js';

export interface ProviderCapability {
  readonly provider: StrategicProvider;
  readonly operation: string;
  readonly environment: 'testnet' | 'production';
  readonly state: CapabilityState;
  readonly assetOrCurrency?: string;
  readonly networkOrRail?: string;
}

export interface ProviderExecutionDecision {
  readonly allowed: boolean;
  readonly reason: 'execution_enabled' | 'capability_not_execution_enabled';
}

/**
 * Provider configuration/certification must never implicitly authorize execution.
 * Authorization of the underlying Neptlium intent is a separate upstream requirement.
 */
export function providerExecutionDecision(capability: ProviderCapability): ProviderExecutionDecision {
  if (capability.state !== 'EXECUTION_ENABLED') {
    return { allowed: false, reason: 'capability_not_execution_enabled' };
  }
  return { allowed: true, reason: 'execution_enabled' };
}
