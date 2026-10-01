import type { ExecutionEnvironment, ExecutionProduct, ExecutionProviderId } from './domain.js';

export const executionOperations = [
  'MARKET_OBSERVATION',
  'ACCOUNT_OBSERVATION',
  'POSITION_OBSERVATION',
  'ORDER_OBSERVATION',
  'FILL_OBSERVATION',
  'STREAM_OBSERVATION',
  'SUBMIT_ORDER',
  'CANCEL_ORDER',
  'MODIFY_ORDER',
] as const;

export type ExecutionOperation = (typeof executionOperations)[number];
export type ExecutionCapabilityState = 'AVAILABLE' | 'UNAVAILABLE';

export interface ExecutionCapability {
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly operation: ExecutionOperation;
  readonly product: ExecutionProduct | null;
  readonly state: ExecutionCapabilityState;
  readonly certified: boolean;
  readonly reason: string;
}

export const executionFoundationMode = 'DOMAIN_ONLY' as const;

export function executionFoundationCapabilities(
  provider: ExecutionProviderId,
  environment: ExecutionEnvironment,
): readonly ExecutionCapability[] {
  return executionOperations.map((operation) => Object.freeze({
    provider,
    environment,
    operation,
    product: null,
    state: 'UNAVAILABLE' as const,
    certified: false,
    reason: 'execution_foundation_only',
  }));
}

export function hasExecutionCapability(
  capabilities: readonly ExecutionCapability[],
  operation: ExecutionOperation,
  environment: ExecutionEnvironment,
): boolean {
  return capabilities.some((capability) =>
    capability.operation === operation
    && capability.environment === environment
    && capability.state === 'AVAILABLE'
    && capability.certified,
  );
}
