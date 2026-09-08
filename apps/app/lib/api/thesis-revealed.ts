import 'server-only';
import { apiRequest } from './client';
import type { ThesisCriterionSummary, ThesisSummary } from './thesis';

export interface RevealedThesisObservation {
  readonly id: string; readonly thesisId: string; readonly thesisVersions: readonly number[]; readonly metricKey: string;
  readonly observationType: 'PREFERRED_RANGE' | 'AVOIDED_RANGE' | 'MINIMUM_THRESHOLD' | 'MAXIMUM_THRESHOLD' | 'POSITIVE_ASSOCIATION' | 'NEGATIVE_ASSOCIATION' | 'EVIDENCE_QUALITY_PREFERENCE';
  readonly derivedOperator?: string; readonly derivedValue?: number | string; readonly derivedMin?: number; readonly derivedMax?: number;
  readonly supportCount: number; readonly contradictionCount: number; readonly sampleSize: number; readonly confidenceBps: number; readonly strengthBps: number;
  readonly positiveCohort: { readonly resolvedCount: number; readonly median?: number; readonly q1?: number; readonly q3?: number; readonly matchingCount?: number; readonly matchingBps?: number };
  readonly negativeCohort: { readonly resolvedCount: number; readonly median?: number; readonly q1?: number; readonly q3?: number; readonly matchingCount?: number; readonly matchingBps?: number };
  readonly evidenceEvaluationIds: readonly string[]; readonly evidenceDecisionIds: readonly string[]; readonly computedAt: string; readonly versionScope: 'CURRENT_ONLY' | 'MIXED';
}
export interface ThesisAlignment { readonly metricKey: string; readonly relationship: 'ALIGNED' | 'REVEALED_STRICTER' | 'REVEALED_LOOSER' | 'UNSTATED_PREFERENCE' | 'CONTRADICTORY' | 'INSUFFICIENT_HISTORY'; readonly statedCriterion?: ThesisCriterionSummary; readonly revealedObservation?: RevealedThesisObservation; readonly confidenceBps: number; readonly explanationCode: string }
export function getRevealedThesis(thesisId: string): Promise<{ readonly state: 'VALUE' | 'INSUFFICIENT_HISTORY'; readonly thesis: ThesisSummary; readonly data: readonly RevealedThesisObservation[] }> { return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/revealed`); }
export function getThesisAlignment(thesisId: string): Promise<{ readonly state: 'VALUE' | 'INSUFFICIENT_HISTORY'; readonly thesis: ThesisSummary; readonly data: readonly ThesisAlignment[] }> { return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/alignment`); }
export function computeRevealedThesis(thesisId: string) { return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/revealed/compute`, { method: 'POST' }); }
