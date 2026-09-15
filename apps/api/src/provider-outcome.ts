import type { PrimaryProvider } from './provider-doctrine.js';

export type ProviderSubmissionState = 'not_submitted' | 'submitted' | 'ambiguous' | 'rejected';

export interface ProviderOutcome {
  readonly provider: PrimaryProvider;
  readonly intentId: string;
  readonly submissionState: ProviderSubmissionState;
  readonly providerReference?: string;
  readonly observedAt: string;
  readonly settled: false;
  readonly reconciled: false;
}

export function providerOutcome(input: Omit<ProviderOutcome, 'settled' | 'reconciled'>): ProviderOutcome {
  if (!input.intentId.trim()) throw new Error('provider outcome requires intent identity');
  if (input.submissionState === 'submitted' && !input.providerReference?.trim()) throw new Error('submitted provider outcome requires provider reference');
  return { ...input, settled: false, reconciled: false };
}
