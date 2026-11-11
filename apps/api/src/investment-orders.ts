import { ApiError } from './errors.js';

/** Server-owned design definitions, not approved offerings or payment products. */
export const proposedInvestmentOrders = Object.freeze([
  Object.freeze({
    id: 'entry',
    version: 1,
    name: 'Entry Order',
    currency: 'USD',
    amountMinor: '50000',
    durationMonths: 2,
  }),
  Object.freeze({
    id: 'growth',
    version: 1,
    name: 'Growth Order',
    currency: 'USD',
    amountMinor: '100000',
    durationMonths: 2,
  }),
  Object.freeze({
    id: 'advanced',
    version: 1,
    name: 'Advanced Order',
    currency: 'USD',
    amountMinor: '500000',
    durationMonths: 4,
  }),
  Object.freeze({
    id: 'executive',
    version: 1,
    name: 'Executive Order',
    currency: 'USD',
    amountMinor: '1500000',
    durationMonths: 6,
  }),
  Object.freeze({
    id: 'institutional',
    version: 1,
    name: 'Institutional Order',
    currency: 'USD',
    amountMinor: '2500000',
    durationMonths: 6,
  }),
]);

export const offeringApprovalRequirements = Object.freeze([
  'Documented offering terms and return terms',
  'Issuer and legal entity',
  'Investor eligibility',
  'Permitted jurisdictions',
  'Risk disclosures',
  'Custody structure',
  'Legal approval',
]);

export function investmentOrderCatalog() {
  return {
    state: 'PROPOSED' as const,
    purchasable: false as const,
    requirements: offeringApprovalRequirements,
    listings: proposedInvestmentOrders.map((definition) => ({
      ...definition,
      state: 'UNAVAILABLE' as const,
      enrollmentEnabled: false as const,
      returnTerms: null,
      issuer: null,
      legalApproval: 'PENDING' as const,
    })),
  };
}

// TARGET interfaces only. No implementation, persistence, route for money movement or provider IDs.
export type EnrollmentStage =
  | 'INTENT_RECORDED'
  | 'ELIGIBILITY_REVIEW'
  | 'PAYMENT_INSTRUCTIONS_PENDING'
  | 'PAYMENT_VERIFICATION'
  | 'COMPLIANCE_REVIEW'
  | 'ALLOCATION_REVIEW'
  | 'ENROLLED'
  | 'REJECTED'
  | 'EXPIRED';
export type EnrollmentPaymentException =
  'FAILED' | 'EXPIRED' | 'DISPUTED' | 'UNDERPAID' | 'OVERPAID' | 'DUPLICATE' | 'SUBMISSION_UNKNOWN';
export interface EnrollmentIntent {
  readonly id: string;
  readonly ownerId: string;
  readonly orderReference: string;
  readonly paymentReference: string;
  readonly definitionId: string;
  readonly definitionVersion: number;
  readonly offeringTermsDigest: string;
  readonly amountMinor: string;
  readonly currency: 'USD';
  readonly stage: EnrollmentStage;
  readonly idempotencyKey: string;
  readonly requestDigest: string;
  readonly createdAt: string;
}
export interface EnrollmentPaymentEvidence {
  readonly provider: string;
  readonly environment: 'TEST' | 'LIVE';
  readonly providerEventId: string;
  readonly enrollmentIntentId: string;
  readonly paymentReference: string;
  readonly payloadDigest: string;
  readonly observedAmountMinor: string;
  readonly currency: string;
  readonly canonical: false;
}
export interface EnrollmentHistoryEvent {
  readonly id: string;
  readonly enrollmentIntentId: string;
  readonly sequence: number;
  readonly actorId: string;
  readonly occurredAt: string;
  readonly previousStage: EnrollmentStage | null;
  readonly nextStage: EnrollmentStage;
  readonly evidenceReferences: readonly string[];
  readonly policyVersion: string;
  readonly requestId: string;
}

export async function handleInvestmentOrderRoute(
  method: string,
  path: string,
  ownerId: () => Promise<string>,
) {
  if (!path.startsWith('/v1/investment-orders')) return undefined;
  await ownerId(); // Browser-provided owner IDs, prices and legal acknowledgments grant no authority.
  if (method === 'GET' && path === '/v1/investment-orders')
    return { data: investmentOrderCatalog() };
  if (method === 'GET' && path === '/v1/investment-orders/enrollments')
    return {
      data: { state: 'UNAVAILABLE', reason: 'enrollment_not_authorized', enrollments: null },
    };
  if (method === 'POST' && path === '/v1/investment-orders/enrollment-intents')
    throw new ApiError(
      503,
      'provider_execution_disabled',
      'Investment Order Enrollment is unavailable pending offering approval',
    );
  throw new ApiError(404, 'not_found', 'Investment order route not found');
}
