export const strategicProviders = ['CIRCLE', 'ALCHEMY', 'STRIPE'] as const;
export type StrategicProvider = (typeof strategicProviders)[number];

export type ProviderRole = 'STABLECOIN_SETTLEMENT' | 'CHAIN_INTELLIGENCE' | 'FIAT_PAYMENTS';
export type CapabilityState = 'DECLARED' | 'CONFIGURED' | 'CONNECTED' | 'OBSERVED' | 'CERTIFIED' | 'ELIGIBLE' | 'AUTHORIZED' | 'EXECUTION_ENABLED' | 'SETTLED' | 'RECONCILED';

export const providerDoctrine: Readonly<Record<StrategicProvider, { role: ProviderRole; authoritative: false }>> = {
  CIRCLE: { role: 'STABLECOIN_SETTLEMENT', authoritative: false },
  ALCHEMY: { role: 'CHAIN_INTELLIGENCE', authoritative: false },
  STRIPE: { role: 'FIAT_PAYMENTS', authoritative: false },
};

const activationOrder: readonly CapabilityState[] = [
  'DECLARED', 'CONFIGURED', 'CONNECTED', 'OBSERVED', 'CERTIFIED', 'ELIGIBLE', 'AUTHORIZED', 'EXECUTION_ENABLED', 'SETTLED', 'RECONCILED',
];

export function capabilityAtLeast(actual: CapabilityState, required: CapabilityState): boolean {
  return activationOrder.indexOf(actual) >= activationOrder.indexOf(required);
}

export function requireCapabilityState(actual: CapabilityState, required: CapabilityState): void {
  if (!capabilityAtLeast(actual, required)) throw new Error(`provider capability ${actual} does not satisfy required state ${required}`);
}

export const neptliumFinancialAuthority = Object.freeze({
  principalIdentity: true,
  ownership: true,
  authorization: true,
  policy: true,
  transactionIntents: true,
  canonicalLedger: true,
  reconciliation: true,
  audit: true,
});
