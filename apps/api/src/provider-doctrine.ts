export const providerDoctrine = {
  circle: {
    role: 'digital_money_settlement',
    responsibilities: ['wallet_infrastructure', 'stablecoin_rails', 'settlement_evidence', 'provider_events'],
    forbiddenAuthority: ['authorization', 'policy', 'canonical_balance', 'canonical_ledger', 'reconciliation'],
  },
  alchemy: {
    role: 'multichain_observation_intelligence',
    responsibilities: ['rpc', 'activity', 'receipts', 'confirmations', 'webhooks', 'simulation'],
    forbiddenAuthority: ['financial_authorization', 'canonical_balance', 'canonical_ledger', 'reconciliation'],
  },
  stripe: {
    role: 'fiat_payment_infrastructure',
    responsibilities: ['payment_collection', 'card_bank_rails', 'billing', 'refunds', 'provider_events'],
    forbiddenAuthority: ['account_model', 'financial_authorization', 'canonical_balance', 'canonical_ledger', 'reconciliation'],
  },
} as const;

export type PrimaryProvider = keyof typeof providerDoctrine;

export const providerAuthorityInvariants = {
  providerObservationIsCanonicalLedger: false,
  configuredMeansLiveCapability: false,
  capabilityMeansExecutionAuthorized: false,
  submittedMeansSettled: false,
  settledMeansReconciled: false,
} as const;

export function requirePrimaryProvider(value: string): PrimaryProvider {
  if (!(value in providerDoctrine)) throw new Error(`unsupported primary provider: ${value}`);
  return value as PrimaryProvider;
}
