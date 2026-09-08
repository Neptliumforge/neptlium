import 'server-only';

import { apiRequest } from './client';

export type ThesisStrategy = 'GROWTH_EQUITY' | 'VENTURE' | 'PRIVATE_EQUITY' | 'PUBLIC_EQUITY' | 'CREDIT' | 'MULTI_STRATEGY' | 'CUSTOM';

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
  readonly id: string;
  readonly thesisId: string;
  readonly metricKey: string;
  readonly weightBps: number;
  readonly importance: 'REQUIRED' | 'PREFERRED' | 'INFORMATIONAL';
}

export interface ThesisBundleSummary {
  readonly thesis: ThesisSummary;
  readonly criteria: readonly ThesisCriterionSummary[];
}

export interface ThesisFitResponse {
  readonly thesis: ThesisSummary;
  readonly subject: { readonly type: string; readonly key: string };
  readonly live: {
    readonly decision: 'QUALIFIED' | 'REJECTED' | 'INSUFFICIENT_EVIDENCE';
    readonly scoreBps: number;
    readonly coverageBps: number;
    readonly confidenceBps: number;
  };
  readonly latest_snapshot: null | {
    readonly decision: 'QUALIFIED' | 'REJECTED' | 'INSUFFICIENT_EVIDENCE';
    readonly scoreBps: number;
    readonly coverageBps: number;
    readonly confidenceBps: number;
    readonly evaluatedAt: string;
  };
  readonly stale_snapshot: boolean;
}

export function getTheses(): Promise<{ readonly state: 'VALUE' | 'EMPTY'; readonly data: readonly ThesisBundleSummary[] }> {
  return apiRequest('/v1/theses');
}

export function getEntityThesisFit(subjectType: string, subjectKey: string, thesisId: string): Promise<ThesisFitResponse> {
  return apiRequest(`/v1/entities/${encodeURIComponent(subjectType)}/${encodeURIComponent(subjectKey)}/thesis-fit?thesis_id=${encodeURIComponent(thesisId)}`);
}
