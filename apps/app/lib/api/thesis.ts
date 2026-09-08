import 'server-only';

import { apiRequest } from './client';

export type ThesisStrategy = 'GROWTH_EQUITY' | 'VENTURE' | 'PRIVATE_EQUITY' | 'PUBLIC_EQUITY' | 'CREDIT' | 'MULTI_STRATEGY' | 'CUSTOM';
export type ThesisDecision = 'QUALIFIED' | 'REJECTED' | 'INSUFFICIENT_EVIDENCE';

export interface ThesisSummary {
  readonly id: string;
  readonly name: string;
  readonly strategy: ThesisStrategy;
  readonly sectors: readonly string[];
  readonly geographies: readonly string[];
  readonly status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  readonly isDefault?: boolean;
  readonly version: number;
}

export interface ThesisCriterionSummary {
  readonly id?: string;
  readonly thesisId?: string;
  readonly metricKey: string;
  readonly kind?: 'QUANTITATIVE' | 'QUALITATIVE';
  readonly operator?: 'GT' | 'GTE' | 'LT' | 'LTE' | 'BETWEEN' | 'EQ' | 'CONTAINS' | 'IS_TRUE' | 'IS_FALSE';
  readonly numericValue?: number;
  readonly numericMin?: number;
  readonly numericMax?: number;
  readonly textValue?: string;
  readonly weightBps: number;
  readonly importance: 'REQUIRED' | 'PREFERRED' | 'INFORMATIONAL';
  readonly rationale?: string;
  readonly position?: number;
}

export interface ThesisBundleSummary {
  readonly thesis: ThesisSummary;
  readonly criteria: readonly ThesisCriterionSummary[];
}

export interface ThesisExplanation {
  readonly headline: string;
  readonly decision: ThesisDecision;
  readonly scoreBps: number;
  readonly coverageBps: number;
  readonly confidenceBps: number;
  readonly positives: readonly string[];
  readonly risks: readonly string[];
  readonly evidenceGaps: readonly string[];
  readonly evidenceLedger: readonly {
    readonly metricKey: string;
    readonly outcome: 'PASS' | 'FAIL' | 'UNKNOWN';
    readonly reason: string;
    readonly sourceType?: string;
    readonly sourceUri?: string;
    readonly confidenceBps?: number;
  }[];
}

export interface ThesisFitResponse {
  readonly thesis: ThesisSummary;
  readonly subject: { readonly type: string; readonly key: string };
  readonly live: {
    readonly decision: ThesisDecision;
    readonly scoreBps: number;
    readonly coverageBps: number;
    readonly confidenceBps: number;
  };
  readonly explanation: ThesisExplanation;
  readonly latest_snapshot: null | {
    readonly decision: ThesisDecision;
    readonly scoreBps: number;
    readonly coverageBps: number;
    readonly confidenceBps: number;
    readonly evaluatedAt: string;
  };
  readonly stale_snapshot: boolean;
}

export interface ThesisProposalResponse {
  readonly thesis: {
    readonly name: string;
    readonly description?: string;
    readonly strategy: ThesisStrategy;
    readonly sectors: readonly string[];
    readonly geographies: readonly string[];
  };
  readonly criteria: readonly ThesisCriterionSummary[];
  readonly warnings: readonly string[];
  readonly source: 'DETERMINISTIC' | 'MODEL';
}

export function getTheses(): Promise<{ readonly state: 'VALUE' | 'EMPTY'; readonly data: readonly ThesisBundleSummary[] }> {
  return apiRequest('/v1/theses');
}

export function proposeThesis(text: string): Promise<ThesisProposalResponse> {
  return apiRequest('/v1/theses/propose', { method: 'POST', body: JSON.stringify({ text }) });
}

export function getThesisExplanation(thesisId: string, subjectType: string, subjectKey: string): Promise<{
  readonly thesis: ThesisSummary;
  readonly subject: { readonly type: string; readonly key: string };
  readonly explanation: ThesisExplanation;
}> {
  return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/explain?subject_type=${encodeURIComponent(subjectType)}&subject_key=${encodeURIComponent(subjectKey)}`);
}

export function getEntityThesisFit(subjectType: string, subjectKey: string, thesisId: string): Promise<ThesisFitResponse> {
  return apiRequest(`/v1/entities/${encodeURIComponent(subjectType)}/${encodeURIComponent(subjectKey)}/thesis-fit?thesis_id=${encodeURIComponent(thesisId)}`);
}
