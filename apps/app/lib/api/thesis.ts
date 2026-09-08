import 'server-only';

import { apiRequest } from './client';

export type ThesisStrategy = 'GROWTH_EQUITY' | 'VENTURE' | 'PRIVATE_EQUITY' | 'PUBLIC_EQUITY' | 'CREDIT' | 'MULTI_STRATEGY' | 'CUSTOM';
export type ThesisDecision = 'QUALIFIED' | 'REJECTED' | 'INSUFFICIENT_EVIDENCE';
export type ThesisDecisionStatus = 'WATCH' | 'INTERESTED' | 'PASS' | 'INVESTED' | 'EXITED';

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
  readonly id?: string; readonly thesisId?: string; readonly metricKey: string; readonly kind?: 'QUANTITATIVE' | 'QUALITATIVE';
  readonly operator?: 'GT' | 'GTE' | 'LT' | 'LTE' | 'BETWEEN' | 'EQ' | 'CONTAINS' | 'IS_TRUE' | 'IS_FALSE';
  readonly numericValue?: number; readonly numericMin?: number; readonly numericMax?: number; readonly textValue?: string; readonly weightBps: number;
  readonly importance: 'REQUIRED' | 'PREFERRED' | 'INFORMATIONAL'; readonly rationale?: string; readonly position?: number;
}
export interface ThesisBundleSummary { readonly thesis: ThesisSummary; readonly criteria: readonly ThesisCriterionSummary[] }
export interface ThesisExplanation {
  readonly headline: string; readonly decision: ThesisDecision; readonly scoreBps: number; readonly coverageBps: number; readonly confidenceBps: number;
  readonly positives: readonly string[]; readonly risks: readonly string[]; readonly evidenceGaps: readonly string[];
  readonly evidenceLedger: readonly { readonly metricKey: string; readonly outcome: 'PASS' | 'FAIL' | 'UNKNOWN'; readonly reason: string; readonly sourceType?: string; readonly sourceUri?: string; readonly confidenceBps?: number }[];
}
export interface ThesisEvaluationSnapshot {
  readonly id: string; readonly thesisId: string; readonly thesisVersion: number; readonly subjectType: string; readonly subjectKey: string;
  readonly decision: ThesisDecision; readonly scoreBps: number; readonly coverageBps: number; readonly confidenceBps: number; readonly evaluatedAt: string;
}
export interface ThesisDrift {
  readonly state: 'COMPARABLE' | 'NOT_COMPARABLE'; readonly reason?: string; readonly current: ThesisEvaluationSnapshot; readonly previous?: ThesisEvaluationSnapshot;
  readonly scoreDeltaBps?: number; readonly coverageDeltaBps?: number; readonly confidenceDeltaBps?: number; readonly direction?: 'STRENGTHENED' | 'WEAKENED' | 'UNCHANGED';
  readonly changedCriteria: readonly { readonly metricKey: string; readonly previousOutcome: 'PASS' | 'FAIL' | 'UNKNOWN'; readonly currentOutcome: 'PASS' | 'FAIL' | 'UNKNOWN'; readonly previousValue?: number | boolean | string; readonly currentValue?: number | boolean | string }[];
}
export interface ThesisFitResponse {
  readonly thesis: ThesisSummary; readonly subject: { readonly type: string; readonly key: string };
  readonly live: { readonly decision: ThesisDecision; readonly scoreBps: number; readonly coverageBps: number; readonly confidenceBps: number };
  readonly explanation: ThesisExplanation; readonly latest_snapshot: ThesisEvaluationSnapshot | null; readonly stale_snapshot: boolean; readonly drift: ThesisDrift | null;
}
export interface ThesisProposalResponse {
  readonly thesis: { readonly name: string; readonly description?: string; readonly strategy: ThesisStrategy; readonly sectors: readonly string[]; readonly geographies: readonly string[] };
  readonly criteria: readonly ThesisCriterionSummary[]; readonly warnings: readonly string[]; readonly source: 'DETERMINISTIC' | 'MODEL';
}
export interface ThesisOpportunity {
  readonly rank: number; readonly subjectType: string; readonly subjectKey: string; readonly decision: ThesisDecision; readonly scoreBps: number; readonly coverageBps: number; readonly confidenceBps: number; readonly evaluatedAt: string;
}
export interface ThesisDecisionEvent {
  readonly id: string; readonly thesisId: string; readonly thesisVersion: number; readonly subjectType: string; readonly subjectKey: string; readonly status: ThesisDecisionStatus;
  readonly rationale?: string; readonly evaluationId?: string; readonly decidedBy: string; readonly decidedAt: string;
}

export function getTheses(): Promise<{ readonly state: 'VALUE' | 'EMPTY'; readonly data: readonly ThesisBundleSummary[] }> { return apiRequest('/v1/theses'); }
export function proposeThesis(text: string): Promise<ThesisProposalResponse> { return apiRequest('/v1/theses/propose', { method: 'POST', body: JSON.stringify({ text }) }); }
export function getThesisExplanation(thesisId: string, subjectType: string, subjectKey: string): Promise<{ readonly thesis: ThesisSummary; readonly subject: { readonly type: string; readonly key: string }; readonly explanation: ThesisExplanation }> {
  return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/explain?subject_type=${encodeURIComponent(subjectType)}&subject_key=${encodeURIComponent(subjectKey)}`);
}
export function getEntityThesisFit(subjectType: string, subjectKey: string, thesisId: string): Promise<ThesisFitResponse> {
  return apiRequest(`/v1/entities/${encodeURIComponent(subjectType)}/${encodeURIComponent(subjectKey)}/thesis-fit?thesis_id=${encodeURIComponent(thesisId)}`);
}
export function getThesisEvaluationHistory(thesisId: string, subjectType: string, subjectKey: string, limit = 100): Promise<{ readonly state: 'VALUE' | 'EMPTY'; readonly subject: { readonly type: string; readonly key: string }; readonly data: readonly ThesisEvaluationSnapshot[] }> {
  return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/history?subject_type=${encodeURIComponent(subjectType)}&subject_key=${encodeURIComponent(subjectKey)}&limit=${limit}`);
}
export function getThesisDrift(thesisId: string, subjectType: string, subjectKey: string): Promise<{ readonly state: 'VALUE' | 'EMPTY'; readonly subject: { readonly type: string; readonly key: string }; readonly drift?: ThesisDrift }> {
  return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/drift?subject_type=${encodeURIComponent(subjectType)}&subject_key=${encodeURIComponent(subjectKey)}`);
}
export function getThesisOpportunities(thesisId: string, limit = 50): Promise<{ readonly state: 'VALUE' | 'EMPTY'; readonly thesis: ThesisSummary; readonly data: readonly ThesisOpportunity[] }> {
  return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/opportunities?limit=${limit}`);
}
export function recordThesisDecision(thesisId: string, input: { subjectType: string; subjectKey: string; status: ThesisDecisionStatus; rationale?: string; evaluationId?: string }): Promise<ThesisDecisionEvent> {
  return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/decisions`, { method: 'POST', body: JSON.stringify({ subject_type: input.subjectType, subject_key: input.subjectKey, status: input.status, ...(input.rationale ? { rationale: input.rationale } : {}), ...(input.evaluationId ? { evaluation_id: input.evaluationId } : {}) }) });
}
export function getThesisDecisions(thesisId: string, filters: { subjectType?: string; subjectKey?: string; limit?: number } = {}): Promise<{ readonly state: 'VALUE' | 'EMPTY'; readonly data: readonly ThesisDecisionEvent[] }> {
  const search = new URLSearchParams(); if (filters.subjectType) search.set('subject_type', filters.subjectType); if (filters.subjectKey) search.set('subject_key', filters.subjectKey); if (filters.limit) search.set('limit', String(filters.limit));
  return apiRequest(`/v1/theses/${encodeURIComponent(thesisId)}/decisions${search.size ? `?${search.toString()}` : ''}`);
}
