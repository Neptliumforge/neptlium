import type { ProviderCapability } from './provider-capabilities.js';
import { assertProviderCapability, capabilityCanExecute } from './provider-capabilities.js';
import { validateProviderCapabilityScope } from './provider-capability-scope.js';

export interface ProviderExecutionPolicyContext {
  readonly capability: ProviderCapability;
  readonly neptliumAuthorized: boolean;
  readonly policySatisfied: boolean;
  readonly approvalsSatisfied: boolean;
}

export function providerExecutionPermitted(context: ProviderExecutionPolicyContext): boolean {
  assertProviderCapability(context.capability);
  validateProviderCapabilityScope(context.capability);
  return capabilityCanExecute(context.capability) && context.neptliumAuthorized && context.policySatisfied && context.approvalsSatisfied;
}
