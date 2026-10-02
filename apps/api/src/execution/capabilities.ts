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

const executionWriteOperations = new Set<ExecutionOperation>([
  'SUBMIT_ORDER',
  'CANCEL_ORDER',
  'MODIFY_ORDER',
]);

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
  provider: ExecutionProviderId,
  operation: ExecutionOperation,
  environment: ExecutionEnvironment,
  product: ExecutionProduct | null,
): boolean {
  if (executionWriteOperations.has(operation)) return false;

  return capabilities.some((capability) =>
    capability.provider === provider
    && capability.operation === operation
    && capability.environment === environment
    && capability.product === product
    && capability.state === 'AVAILABLE'
    && capability.certified,
  );
}
