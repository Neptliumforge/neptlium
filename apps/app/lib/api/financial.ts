import 'server-only';

import { apiRequest } from './client';

export type CapabilityState = 'ENABLED' | 'DISABLED' | 'NOT_CONFIGURED' | 'INELIGIBLE';
export interface FundingCapability {
  readonly code: 'USDC_BASE' | 'ETH_BASE' | 'BTC_BITCOIN' | 'XRP_XRPL';
  readonly asset: 'USDC' | 'ETH' | 'BTC' | 'XRP';
  readonly network: 'BASE' | 'BITCOIN' | 'XRPL';
  readonly decimals: number;
  readonly atomicPrecision: number;
  readonly state: CapabilityState;
  readonly reason?: string;
}
export interface CanonicalBalance {
  readonly asset: string;
  readonly network: string | null;
  /** Governed precision for this exact asset and network; null when not governed. */
  readonly decimals: number | null;
  readonly atomic_precision?: number | null;
  readonly total_atomic: string;
  readonly available_atomic: string;
  readonly reserved_atomic: string;
  readonly pending_atomic: string;
  readonly restricted_atomic: string;
}
export interface FundingActivity {
  readonly id: string;
  readonly asset: string;
  readonly network: string | null;
  readonly decimals: number;
  readonly atomicPrecision: number;
  readonly rail: string;
  readonly amount_atomic: string | null;
  readonly state: string;
  readonly environment: 'LIVE';
  readonly created_at: string;
  readonly updated_at: string;
}
export interface DepositInstruction {
  readonly funding_intent_id?: string;
  readonly capability: string;
  readonly state: string;
  readonly reason?: string;
  readonly asset?: string;
  readonly network?: string | null;
  readonly deposit_address?: string;
  readonly memo_or_tag?: string | null;
}
export interface TransferAlias {
  readonly id: string;
  readonly alias: string;
  readonly destination_type: string;
  readonly verification_state: string;
  readonly activation_state: string;
  readonly created_at: string;
  readonly updated_at: string;
}
export interface TransferActivity {
  readonly id: string;
  readonly alias_id: string;
  readonly asset: string;
  readonly network: string | null;
  readonly decimals: number;
  readonly atomicPrecision: number;
  readonly rail: string;
  readonly amount_atomic: string;
  readonly state: string;
  readonly environment: 'LIVE';
  readonly created_at: string;
  readonly updated_at: string;
}

export function getFundingCapabilities() {
  return apiRequest<{ environment: 'LIVE'; custody_model: 'OMNIBUS'; capabilities: readonly FundingCapability[] }>('/v1/funding/capabilities');
}

// The idempotency key is operation-scoped and supplied by the caller: every
// retry of one deposit request must reuse it so the API replays the recorded
// intent instead of creating another.
export function createFundingIntent(input: {
  readonly capability: string;
  readonly amountAtomic?: string;
  readonly idempotencyKey: string;
}) {
  return apiRequest<FundingActivity & { readonly replayed: boolean }>('/v1/funding/intents', {
    method: 'POST',
    headers: { 'idempotency-key': input.idempotencyKey },
    body: JSON.stringify({
      capability: input.capability,
      ...(input.amountAtomic ? { amount_atomic: input.amountAtomic } : {}),
    }),
  });
}
/** Canonical balances contract; see docs/financial/CANONICAL_BALANCES.md. */
export interface CanonicalBalancesResponse {
  readonly contract_version?: number;
  /** EMPTY is the version 1 shape and is never treated as zero. */
  readonly state: 'NOT_INITIALIZED' | 'ZERO' | 'VALUE' | 'EMPTY';
  readonly source: 'NEPTLIUM_CANONICAL_LEDGER';
  readonly as_of?: string;
  readonly ledger_initialized_at?: string | null;
  readonly reporting?: {
    readonly currency: string;
    readonly decimals: number;
    readonly total_minor: string | null;
    readonly valuation: 'ZERO_LEDGER' | 'UNAVAILABLE';
  };
  readonly balances: readonly CanonicalBalance[];
}
export function getCanonicalBalances() {
  return apiRequest<CanonicalBalancesResponse>('/v1/capital-account/balances');
}
export function getFundingActivity() {
  return apiRequest<{ state: 'VALUE' | 'EMPTY'; data: readonly FundingActivity[] }>('/v1/funding/activity');
}
export function getDepositInstructionsForIntent(fundingIntentId: string) {
  return apiRequest<DepositInstruction>(
    `/v1/capital-account/deposit-instructions?funding_intent_id=${encodeURIComponent(fundingIntentId)}`,
  );
}
export function getTransferAliases() {
  return apiRequest<{ state: 'VALUE' | 'EMPTY'; data: readonly TransferAlias[] }>('/v1/treasury/aliases');
}

export function createTransferAlias(input: {
  readonly alias: string;
  readonly destinationType: string;
  readonly destinationReference: string;
}) {
  return apiRequest<TransferAlias>('/v1/treasury/aliases', {
    method: 'POST',
    body: JSON.stringify({
      alias: input.alias,
      destination_type: input.destinationType,
      destination_reference: input.destinationReference,
    }),
  });
}
export function getTransferCapabilities() {
  return apiRequest<{ environment: 'LIVE'; custody_model: 'OMNIBUS'; capabilities: readonly FundingCapability[] }>('/v1/treasury/transfer-capabilities');
}
export function getTransferActivity() {
  return apiRequest<{ state: 'VALUE' | 'EMPTY'; data: readonly TransferActivity[] }>('/v1/treasury/transfers');
}
