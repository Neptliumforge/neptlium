import type {
  PaymentAttemptId,
  PaymentEnvironment,
  PaymentId,
  PaymentProviderId,
} from './domain.js';

export const paymentEvidenceSources = [
  'SUBMISSION_RESPONSE',
  'WEBHOOK',
  'PROVIDER_LOOKUP',
  'SETTLEMENT_OBSERVATION',
  'RECONCILIATION_LOOKUP',
] as const;

export type PaymentEvidenceSource = (typeof paymentEvidenceSources)[number];

export interface PaymentEvidence {
  readonly authority: 'PROVIDER_EVIDENCE';
  readonly canonical: false;
  readonly id: string;
  readonly paymentId: PaymentId;
  readonly attemptId: PaymentAttemptId;
  readonly provider: PaymentProviderId;
  readonly environment: PaymentEnvironment;
  readonly source: PaymentEvidenceSource;
  readonly operation: string;
  readonly providerReference: string | null;
  readonly observedAt: string;
  readonly receivedAt: string;
  readonly providerNativeState: string | null;
  readonly providerNativeReason: string | null;
  readonly payloadDigest: string;
  readonly payloadReference: string | null;
  readonly schemaVersion: number;
}

export function paymentEvidence(
  input: Omit<PaymentEvidence, 'authority' | 'canonical'>,
): PaymentEvidence {
  return Object.freeze({
    ...input,
    authority: 'PROVIDER_EVIDENCE',
    canonical: false,
  });
}

export function isCanonicalPaymentTruth(_evidence: PaymentEvidence): false {
  return false;
}
