import type {
  PaymentAttemptState,
  PaymentAuthorizationState,
  PaymentDisputeState,
  PaymentRefundState,
  PaymentSettlementState,
  PaymentState,
} from './lifecycle.js';

export type PaymentEnvironment = 'TEST' | 'LIVE';

declare const paymentIdBrand: unique symbol;
declare const paymentAttemptIdBrand: unique symbol;
declare const paymentProviderBrand: unique symbol;
declare const paymentMethodReferenceIdBrand: unique symbol;

export type PaymentId = string & { readonly [paymentIdBrand]: true };
export type PaymentAttemptId = string & { readonly [paymentAttemptIdBrand]: true };
export type PaymentProviderId = string & { readonly [paymentProviderBrand]: true };
export type PaymentMethodReferenceId = string & { readonly [paymentMethodReferenceIdBrand]: true };

function requiredIdentity(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required`);
  return normalized;
}

export function paymentId(value: string): PaymentId {
  return requiredIdentity(value, 'Payment identity') as PaymentId;
}

export function paymentAttemptId(value: string): PaymentAttemptId {
  return requiredIdentity(value, 'Payment attempt identity') as PaymentAttemptId;
}

export function paymentProviderId(value: string): PaymentProviderId {
  return requiredIdentity(value, 'Payment provider identity').toUpperCase() as PaymentProviderId;
}

export function paymentMethodReferenceId(value: string): PaymentMethodReferenceId {
  return requiredIdentity(value, 'Payment method reference identity') as PaymentMethodReferenceId;
}

export interface PaymentAmount {
  readonly atomic: string;
  readonly asset: string;
}

export interface PaymentIntent {
  readonly paymentId: PaymentId;
  readonly principalId: string;
  readonly organizationId: string | null;
  readonly merchantAccountId: string;
  readonly amount: PaymentAmount;
  readonly purposeReference: string | null;
  readonly createdAt: string;
}

export interface Payment {
  readonly id: PaymentId;
  readonly intent: PaymentIntent;
  readonly state: PaymentState;
  readonly disputeState: PaymentDisputeState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PaymentAttempt {
  readonly id: PaymentAttemptId;
  readonly paymentId: PaymentId;
  readonly provider: PaymentProviderId;
  readonly environment: PaymentEnvironment;
  readonly providerReference: string | null;
  readonly state: PaymentAttemptState;
  readonly authorizationState: PaymentAuthorizationState;
  readonly settlementState: PaymentSettlementState;
  readonly refundState: PaymentRefundState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type PaymentMethodType =
  | 'CARD'
  | 'BANK_ACCOUNT'
  | 'WALLET'
  | 'STABLECOIN'
  | 'CAPITAL'
  | 'OTHER';

export interface PaymentMethodReference {
  readonly id: PaymentMethodReferenceId;
  readonly principalId: string;
  readonly provider: PaymentProviderId;
  readonly environment: PaymentEnvironment;
  readonly methodType: PaymentMethodType;
  readonly providerMethodReference: string;
  readonly displayLabel: string;
  readonly reusable: boolean;
  readonly createdAt: string;
  readonly revokedAt: string | null;
}

export const paymentFoundationMode = 'DOMAIN_ONLY' as const;
