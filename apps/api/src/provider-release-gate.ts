export type ProviderReleaseGate = 'P0_ARCHITECTURE' | 'P1_CONFIGURATION' | 'P2_CONNECTIVITY' | 'P3_EVIDENCE_INGRESS' | 'P4_CAPABILITY_CERTIFICATION' | 'P5_EXECUTION_AUTHORIZATION' | 'P6_RECONCILIATION' | 'P7_PRODUCTION_OBSERVATION';

const gateOrder: readonly ProviderReleaseGate[] = [
  'P0_ARCHITECTURE',
  'P1_CONFIGURATION',
  'P2_CONNECTIVITY',
  'P3_EVIDENCE_INGRESS',
  'P4_CAPABILITY_CERTIFICATION',
  'P5_EXECUTION_AUTHORIZATION',
  'P6_RECONCILIATION',
  'P7_PRODUCTION_OBSERVATION',
];

export function gatePredecessors(gate: ProviderReleaseGate): readonly ProviderReleaseGate[] {
  const index = gateOrder.indexOf(gate);
  return gateOrder.slice(0, index);
}

export function canPassProviderGate(gate: ProviderReleaseGate, passed: ReadonlySet<ProviderReleaseGate>): boolean {
  return gatePredecessors(gate).every((required) => passed.has(required));
}
