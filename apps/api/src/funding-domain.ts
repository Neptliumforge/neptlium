import { ApiError } from './errors.js';

export type ProviderEnvironment = 'TEST' | 'LIVE';
export type CapitalAsset = 'USD' | 'USDC' | 'ETH' | 'BTC' | 'XRP';
export type FundingState =
  | 'CREATED' | 'AUTHORIZED' | 'PROVIDER_SUBMITTED' | 'PENDING' | 'PROVIDER_CONFIRMED'
  | 'LEDGER_POSTED' | 'RECONCILED' | 'AVAILABLE'
  | 'FAILED' | 'RETURNED' | 'REVERSED' | 'CANCELLED';
export type TransferExecutionState =
  | 'REQUESTED' | 'AUTHORIZED' | 'RESERVED' | 'SUBMITTED' | 'SETTLED'
  | 'RECONCILED' | 'FAILED' | 'REVERSED' | 'CANCELLED';
export type CapabilityState = 'ENABLED' | 'DISABLED' | 'NOT_CONFIGURED' | 'INELIGIBLE';

export interface FundingIntent {
  id: string;
  ownerId: string;
  asset: CapitalAsset;
  network?: string;
  rail: string;
  amountAtomic?: string;
  state: FundingState;
  environment: ProviderEnvironment;
}

export interface SettlementEvidence {
  source: 'STRIPE' | 'CIRCLE' | 'ALCHEMY' | 'CHAIN';
  environment: ProviderEnvironment;
  asset: string;
  network?: string;
  amountAtomic: string;
  address?: string;
  txHash?: string;
  confirmations?: number;
  state: string;
}

const fundingTransitions: Readonly<Record<FundingState, readonly FundingState[]>> = {
  CREATED: ['AUTHORIZED', 'CANCELLED'],
  AUTHORIZED: ['PROVIDER_SUBMITTED', 'CANCELLED', 'FAILED'],
  PROVIDER_SUBMITTED: ['PENDING', 'PROVIDER_CONFIRMED', 'FAILED', 'CANCELLED'],
  PENDING: ['PROVIDER_CONFIRMED', 'FAILED', 'RETURNED', 'CANCELLED'],
  PROVIDER_CONFIRMED: ['LEDGER_POSTED', 'FAILED', 'RETURNED', 'REVERSED'],
  LEDGER_POSTED: ['RECONCILED', 'RETURNED', 'REVERSED'],
  RECONCILED: ['AVAILABLE', 'RETURNED', 'REVERSED'],
  AVAILABLE: ['RETURNED', 'REVERSED'],
  FAILED: [], RETURNED: ['REVERSED'], REVERSED: [], CANCELLED: [],
};

const transferTransitions: Readonly<Record<TransferExecutionState, readonly TransferExecutionState[]>> = {
  REQUESTED: ['AUTHORIZED', 'CANCELLED'],
  AUTHORIZED: ['RESERVED', 'CANCELLED', 'FAILED'],
  RESERVED: ['SUBMITTED', 'CANCELLED', 'FAILED'],
  SUBMITTED: ['SETTLED', 'FAILED', 'REVERSED'],
  SETTLED: ['RECONCILED', 'REVERSED'],
  RECONCILED: ['REVERSED'],
  FAILED: [], REVERSED: [], CANCELLED: [],
};

export function transitionFunding(from: FundingState, to: FundingState): FundingState {
  if (!fundingTransitions[from].includes(to))
    throw new ApiError(409, 'invalid_funding_transition', `Funding cannot transition from ${from} to ${to}`);
  return to;
}

export function transitionTransfer(from: TransferExecutionState, to: TransferExecutionState): TransferExecutionState {
  if (!transferTransitions[from].includes(to))
    throw new ApiError(409, 'invalid_transfer_transition', `Transfer cannot transition from ${from} to ${to}`);
  return to;
}

export interface ReconciliationExpectation {
  asset: string;
  amountAtomic: string;
  network?: string;
  destination?: string;
}

export function reconcileEvidence(expected: ReconciliationExpectation, evidence: SettlementEvidence[]) {
  const discrepancyCodes = new Set<string>();
  if (evidence.length === 0) discrepancyCodes.add('MISSING_EVIDENCE');
  for (const item of evidence) {
    if (item.asset !== expected.asset) discrepancyCodes.add('ASSET_MISMATCH');
    if (item.amountAtomic !== expected.amountAtomic) discrepancyCodes.add('AMOUNT_MISMATCH');
    if (expected.network && item.network !== expected.network) discrepancyCodes.add('NETWORK_MISMATCH');
    if (expected.destination && item.address !== expected.destination) discrepancyCodes.add('DESTINATION_MISMATCH');
  }
  const fingerprints = evidence.map((item) => `${item.source}:${item.environment}:${item.txHash ?? ''}:${item.asset}:${item.amountAtomic}`);
  if (new Set(fingerprints).size !== fingerprints.length) discrepancyCodes.add('DUPLICATE_EVIDENCE');
  return { state: discrepancyCodes.size ? 'DISCREPANCY' as const : 'MATCHED' as const, discrepancyCodes: [...discrepancyCodes] };
}

export function canCreditAvailable(state: FundingState, reconciliationState: 'MATCHED' | 'DISCREPANCY' | 'PENDING') {
  return state === 'RECONCILED' && reconciliationState === 'MATCHED';
}

export function evaluateOmnibusBacking(reconciledTreasuryAtomic: string, customerClaimAtomics: readonly string[]) {
  const treasury = BigInt(reconciledTreasuryAtomic);
  const customerClaims = customerClaimAtomics.reduce((total, value) => total + BigInt(value), 0n);
  if (treasury < 0n || customerClaims < 0n) throw new ApiError(500, 'invalid_canonical_balance', 'Canonical balances cannot be negative for backing evaluation');
  return {
    treasuryAtomic: treasury.toString(),
    customerClaimsAtomic: customerClaims.toString(),
    state: customerClaims <= treasury ? 'BACKED' as const : 'SHORTFALL' as const,
  };
}

export function assertLiveExecutionGate(input: {
  environment: ProviderEnvironment;
  capability: CapabilityState;
  explicitlyEnabled: boolean;
}) {
  if (input.environment !== 'LIVE') return;
  if (input.capability !== 'ENABLED' || !input.explicitlyEnabled)
    throw new ApiError(503, 'live_execution_disabled', 'Live financial execution is not enabled');
}
