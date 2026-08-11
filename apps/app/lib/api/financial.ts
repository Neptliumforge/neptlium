import 'server-only';

import { apiRequest } from './client';

export type CapabilityState = 'ENABLED' | 'DISABLED' | 'NOT_CONFIGURED' | 'INELIGIBLE';
export interface FundingCapability {
  readonly code: 'USD_ACH' | 'USDC_BASE' | 'ETH_BASE' | 'BTC_BITCOIN' | 'XRP_XRPL';
  readonly asset: 'USD' | 'USDC' | 'ETH' | 'BTC' | 'XRP';
  readonly network: 'ACH' | 'BASE' | 'BITCOIN' | 'XRPL';
  readonly state: CapabilityState;
  readonly reason?: string;
}
export interface CanonicalBalance {
  readonly asset: string;
  readonly network: string | null;
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
export function getCanonicalBalances() {
  return apiRequest<{ state: 'VALUE' | 'EMPTY'; source: 'NEPTLIUM_CANONICAL_LEDGER'; balances: readonly CanonicalBalance[] }>('/v1/capital-account/balances');
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
export function getTransferCapabilities() {
  return apiRequest<{ environment: 'LIVE'; custody_model: 'OMNIBUS'; capabilities: readonly FundingCapability[] }>('/v1/treasury/transfer-capabilities');
}
export function getTransferActivity() {
  return apiRequest<{ state: 'VALUE' | 'EMPTY'; data: readonly TransferActivity[] }>('/v1/treasury/transfers');
}
