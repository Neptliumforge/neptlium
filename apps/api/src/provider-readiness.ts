import type { ProviderCapability } from './provider-capabilities.js';
import type { ProviderReleaseGate } from './provider-release-gate.js';
import { capabilityCanExecute } from './provider-capabilities.js';

export interface ProviderReadiness {
  readonly capability: ProviderCapability;
  readonly passedGates: ReadonlySet<ProviderReleaseGate>;
}

export function providerCapabilityReadyForExecution(readiness: ProviderReadiness): boolean {
  return capabilityCanExecute(readiness.capability) &&
    readiness.passedGates.has('P4_CAPABILITY_CERTIFICATION') &&
    readiness.passedGates.has('P5_EXECUTION_AUTHORIZATION');
}

export function providerCapabilityReadyForObservation(readiness: ProviderReadiness): boolean {
  return readiness.capability.state === 'capability_certified' &&
    readiness.passedGates.has('P2_CONNECTIVITY') &&
    readiness.passedGates.has('P4_CAPABILITY_CERTIFICATION');
}
