import type { ExecutionEnvironment, ExecutionProviderId } from './domain.js';

export const executionEvidenceSources = [
  'REST_OBSERVATION',
  'STREAM_OBSERVATION',
  'SUBMISSION_RESPONSE',
  'RECONCILIATION_LOOKUP',
] as const;

export type ExecutionEvidenceSource = (typeof executionEvidenceSources)[number];

export interface ExecutionEvidence {
  readonly authority: 'PROVIDER_EVIDENCE';
  readonly id: string;
  readonly provider: ExecutionProviderId;
  readonly environment: ExecutionEnvironment;
  readonly source: ExecutionEvidenceSource;
  readonly providerReference: string | null;
  readonly observedAt: string;
  readonly receivedAt: string;
  readonly payloadDigest: string;
  readonly payloadReference: string | null;
  readonly schemaVersion: number;
  readonly providerNativeState: string | null;
  readonly providerNativeReason: string | null;
}

export function executionEvidence(input: Omit<ExecutionEvidence, 'authority'>): ExecutionEvidence {
  return Object.freeze({ ...input, authority: 'PROVIDER_EVIDENCE' });
}

export function isCanonicalFinancialTruth(_evidence: ExecutionEvidence): false {
  return false;
}
