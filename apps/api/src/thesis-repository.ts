import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import type { ThesisDecisionEvent, ThesisDecisionStatus } from './thesis-compounding.js';
import type { ThesisCriterionInput, ThesisCriterionRecord, ThesisEvidenceInput, ThesisInput, ThesisRecord } from './thesis-domain.js';
import type { ThesisEvaluationSummary } from './thesis-evaluator.js';

type Fetch = typeof fetch;

export interface ThesisEvaluationSnapshot {
  readonly id: string;
  readonly ownerId: string;
  readonly thesisId: string;
  readonly thesisVersion: number;
  readonly subjectType: string;
  readonly subjectKey: string;
  readonly decision: ThesisEvaluationSummary['decision'];
  readonly scoreBps: number;
  readonly coverageBps: number;
  readonly confidenceBps: number;
  readonly summary: ThesisEvaluationSummary;
  readonly evaluatedBy: string;
  readonly evaluatedAt: string;
}

export interface ThesisBundle {
  readonly thesis: ThesisRecord;
  readonly criteria: readonly ThesisCriterionRecord[];
}

export interface ThesisRepository {
  ready(): Promise<boolean>;
  listTheses(ownerId: string): Promise<ThesisBundle[]>;
  getThesis(ownerId: string, thesisId: string): Promise<ThesisBundle>;
  createThesis(input: { ownerId: string; actorId: string; thesis: ThesisInput }): Promise<ThesisRecord>;
  addCriterion(input: { ownerId: string; thesisId: string; criterion: ThesisCriterionInput }): Promise<ThesisCriterionRecord>;
  listEvidence(ownerId: string, subjectType: string, subjectKey: string): Promise<ThesisEvidenceInput[]>;
  saveEvaluation(input: { ownerId: string; actorId: string; thesis: ThesisRecord; subjectType: string; subjectKey: string; summary: ThesisEvaluationSummary }): Promise<ThesisEvaluationSnapshot>;
  latestEvaluation(ownerId: string, thesisId: string, subjectType: string, subjectKey: string): Promise<ThesisEvaluationSnapshot | null>;
  evaluationHistory(ownerId: string, thesisId: string, subjectType: string, subjectKey: string, limit: number): Promise<ThesisEvaluationSnapshot[]>;
  listEvaluations(ownerId: string, thesisId: string, limit: number): Promise<ThesisEvaluationSnapshot[]>;
  saveDecision(input: { ownerId: string; actorId: string; thesis: ThesisRecord; subjectType: string; subjectKey: string; status: ThesisDecisionStatus; rationale?: string; evaluationId?: string }): Promise<ThesisDecisionEvent>;
  listDecisions(ownerId: string, thesisId: string, subjectType?: string, subjectKey?: string, limit?: number): Promise<ThesisDecisionEvent[]>;
}

type ThesisRow = {
  id: string; owner_id: string; name: string; description: string | null; strategy: ThesisRecord['strategy']; sectors: string[]; geographies: string[];
  status: ThesisRecord['status']; is_default: boolean; version: number; created_by: string; created_at: string; updated_at: string;
};
type CriterionRow = {
  id: string; thesis_id: string; metric_key: string; kind: ThesisCriterionRecord['kind']; operator: ThesisCriterionRecord['operator']; numeric_value: number | null;
  numeric_min: number | null; numeric_max: number | null; text_value: string | null; weight_bps: number; importance: ThesisCriterionRecord['importance']; rationale: string | null;
  position: number; created_at: string; updated_at: string;
};
type EvidenceRow = {
  subject_type: string; subject_key: string; metric_key: string | null; claim: string; observed_value: unknown; source_type: ThesisEvidenceInput['sourceType']; source_uri: string | null;
  source_date: string | null; reporting_period_start: string | null; reporting_period_end: string | null; confidence_bps: number; reported: boolean; derived: boolean;
};
type EvaluationRow = {
  id: string; owner_id: string; thesis_id: string; thesis_version: number; subject_type: string; subject_key: string; decision: ThesisEvaluationSummary['decision'];
  score_bps: number; coverage_bps: number; confidence_bps: number; summary: ThesisEvaluationSummary; evaluated_by: string; evaluated_at: string;
};
type DecisionRow = {
  id: string; owner_id: string; thesis_id: string; thesis_version: number; subject_type: string; subject_key: string; status: ThesisDecisionStatus;
  rationale: string | null; evaluation_id: string | null; decided_by: string; decided_at: string;
};

function thesis(row: ThesisRow): ThesisRecord {
  return { id: row.id, ownerId: row.owner_id, name: row.name, ...(row.description ? { description: row.description } : {}), strategy: row.strategy,
    sectors: row.sectors ?? [], geographies: row.geographies ?? [], isDefault: row.is_default, status: row.status, version: Number(row.version), createdBy: row.created_by,
    createdAt: row.created_at, updatedAt: row.updated_at };
}
function criterion(row: CriterionRow): ThesisCriterionRecord {
  return { id: row.id, thesisId: row.thesis_id, metricKey: row.metric_key, kind: row.kind, operator: row.operator,
    ...(row.numeric_value === null ? {} : { numericValue: Number(row.numeric_value) }), ...(row.numeric_min === null ? {} : { numericMin: Number(row.numeric_min) }),
    ...(row.numeric_max === null ? {} : { numericMax: Number(row.numeric_max) }), ...(row.text_value ? { textValue: row.text_value } : {}), weightBps: Number(row.weight_bps),
    importance: row.importance, ...(row.rationale ? { rationale: row.rationale } : {}), position: Number(row.position), createdAt: row.created_at, updatedAt: row.updated_at };
}
function evidence(row: EvidenceRow): ThesisEvidenceInput {
  return { subjectType: row.subject_type, subjectKey: row.subject_key, ...(row.metric_key ? { metricKey: row.metric_key } : {}), claim: row.claim,
    observedValue: row.observed_value, sourceType: row.source_type, ...(row.source_uri ? { sourceUri: row.source_uri } : {}), ...(row.source_date ? { sourceDate: row.source_date } : {}),
    ...(row.reporting_period_start ? { reportingPeriodStart: row.reporting_period_start } : {}), ...(row.reporting_period_end ? { reportingPeriodEnd: row.reporting_period_end } : {}),
    confidenceBps: Number(row.confidence_bps), reported: row.reported, derived: row.derived };
}
function evaluation(row: EvaluationRow): ThesisEvaluationSnapshot {
  return { id: row.id, ownerId: row.owner_id, thesisId: row.thesis_id, thesisVersion: Number(row.thesis_version), subjectType: row.subject_type, subjectKey: row.subject_key,
    decision: row.decision, scoreBps: Number(row.score_bps), coverageBps: Number(row.coverage_bps), confidenceBps: Number(row.confidence_bps), summary: row.summary,
    evaluatedBy: row.evaluated_by, evaluatedAt: row.evaluated_at };
}
function decision(row: DecisionRow): ThesisDecisionEvent {
  return { id: row.id, ownerId: row.owner_id, thesisId: row.thesis_id, thesisVersion: Number(row.thesis_version), subjectType: row.subject_type, subjectKey: row.subject_key,
    status: row.status, ...(row.rationale ? { rationale: row.rationale } : {}), ...(row.evaluation_id ? { evaluationId: row.evaluation_id } : {}), decidedBy: row.decided_by, decidedAt: row.decided_at };
}
function safeLimit(value: number | undefined, fallback = 100) { return Math.max(1, Math.min(1000, Number.isInteger(value) ? value as number : fallback)); }

export class SupabaseThesisRepository implements ThesisRepository {
  constructor(private readonly url: string, private readonly serviceRoleKey: string, private readonly request: Fetch = fetch) {}
  private headers(extra: HeadersInit = {}): HeadersInit { return { authorization: `Bearer ${this.serviceRoleKey}`, apikey: this.serviceRoleKey, 'content-type': 'application/json', ...extra }; }
  private async rest(path: string, init: RequestInit = {}) { return this.request(`${this.url}/rest/v1/${path}`, { ...init, headers: this.headers(init.headers), signal: AbortSignal.timeout(8_000) }); }
  private async rows<T>(path: string, message: string): Promise<T[]> { const response = await this.rest(path); if (!response.ok) throw new ApiError(503, 'data_unavailable', message); return await response.json() as T[]; }
  async ready() { try { return (await this.rest('theses?select=id&limit=1')).ok && (await this.rest('thesis_evaluations?select=id&limit=1')).ok; } catch { return false; } }
  async listTheses(ownerId: string) {
    const rows = await this.rows<ThesisRow>(`theses?owner_id=eq.${encodeURIComponent(ownerId)}&status=neq.ARCHIVED&select=*&order=is_default.desc,updated_at.desc`, 'Thesis storage is unavailable');
    return Promise.all(rows.map(async (row) => ({ thesis: thesis(row), criteria: (await this.rows<CriterionRow>(`thesis_criteria?owner_id=eq.${encodeURIComponent(ownerId)}&thesis_id=eq.${encodeURIComponent(row.id)}&select=*&order=position.asc,id.asc`, 'Thesis criteria are unavailable')).map(criterion) })));
  }
  async getThesis(ownerId: string, thesisId: string) {
    const row = (await this.rows<ThesisRow>(`theses?id=eq.${encodeURIComponent(thesisId)}&owner_id=eq.${encodeURIComponent(ownerId)}&select=*&limit=1`, 'Thesis storage is unavailable'))[0];
    if (!row) throw new ApiError(404, 'not_found', 'Thesis not found');
    const criteria = (await this.rows<CriterionRow>(`thesis_criteria?owner_id=eq.${encodeURIComponent(ownerId)}&thesis_id=eq.${encodeURIComponent(thesisId)}&select=*&order=position.asc,id.asc`, 'Thesis criteria are unavailable')).map(criterion);
    return { thesis: thesis(row), criteria };
  }
  async createThesis(input: { ownerId: string; actorId: string; thesis: ThesisInput }) {
    const response = await this.rest('theses?select=*', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ owner_id: input.ownerId, created_by: input.actorId, name: input.thesis.name, description: input.thesis.description ?? null, strategy: input.thesis.strategy, sectors: input.thesis.sectors, geographies: input.thesis.geographies, is_default: Boolean(input.thesis.isDefault), status: 'ACTIVE' }) });
    if (!response.ok) throw new ApiError(response.status === 409 ? 409 : 503, response.status === 409 ? 'thesis_invalid' : 'data_unavailable', 'Thesis could not be created');
    const row = (await response.json() as ThesisRow[])[0]; if (!row) throw new ApiError(503, 'data_unavailable', 'Thesis could not be created'); return thesis(row);
  }
  async addCriterion(input: { ownerId: string; thesisId: string; criterion: ThesisCriterionInput }) {
    await this.getThesis(input.ownerId, input.thesisId);
    const c = input.criterion;
    const response = await this.rest('thesis_criteria?select=*', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ owner_id: input.ownerId, thesis_id: input.thesisId, metric_key: c.metricKey, kind: c.kind, operator: c.operator, numeric_value: c.numericValue ?? null, numeric_min: c.numericMin ?? null, numeric_max: c.numericMax ?? null, text_value: c.textValue ?? null, weight_bps: c.weightBps, importance: c.importance, rationale: c.rationale ?? null, position: c.position }) });
    if (!response.ok) throw new ApiError(response.status === 409 ? 409 : 503, response.status === 409 ? 'thesis_criterion_invalid' : 'data_unavailable', 'Thesis criterion could not be created');
    const row = (await response.json() as CriterionRow[])[0]; if (!row) throw new ApiError(503, 'data_unavailable', 'Thesis criterion could not be created'); return criterion(row);
  }
  async listEvidence(ownerId: string, subjectType: string, subjectKey: string) {
    return (await this.rows<EvidenceRow>(`thesis_evidence?owner_id=eq.${encodeURIComponent(ownerId)}&subject_type=eq.${encodeURIComponent(subjectType)}&subject_key=eq.${encodeURIComponent(subjectKey)}&select=*&order=captured_at.desc`, 'Thesis evidence is unavailable')).map(evidence);
  }
  async saveEvaluation(input: { ownerId: string; actorId: string; thesis: ThesisRecord; subjectType: string; subjectKey: string; summary: ThesisEvaluationSummary }) {
    const response = await this.rest('thesis_evaluations?select=*', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ owner_id: input.ownerId, thesis_id: input.thesis.id, thesis_version: input.thesis.version, subject_type: input.subjectType, subject_key: input.subjectKey, decision: input.summary.decision, score_bps: input.summary.scoreBps, coverage_bps: input.summary.coverageBps, confidence_bps: input.summary.confidenceBps, summary: input.summary, evaluated_by: input.actorId }) });
    if (!response.ok) throw new ApiError(503, 'data_unavailable', 'Thesis evaluation could not be persisted');
    const row = (await response.json() as EvaluationRow[])[0]; if (!row) throw new ApiError(503, 'data_unavailable', 'Thesis evaluation could not be persisted'); return evaluation(row);
  }
  async latestEvaluation(ownerId: string, thesisId: string, subjectType: string, subjectKey: string) {
    return (await this.evaluationHistory(ownerId, thesisId, subjectType, subjectKey, 1))[0] ?? null;
  }
  async evaluationHistory(ownerId: string, thesisId: string, subjectType: string, subjectKey: string, limit: number) {
    return (await this.rows<EvaluationRow>(`thesis_evaluations?owner_id=eq.${encodeURIComponent(ownerId)}&thesis_id=eq.${encodeURIComponent(thesisId)}&subject_type=eq.${encodeURIComponent(subjectType)}&subject_key=eq.${encodeURIComponent(subjectKey)}&select=*&order=evaluated_at.desc,id.desc&limit=${safeLimit(limit)}`, 'Thesis evaluation history is unavailable')).map(evaluation);
  }
  async listEvaluations(ownerId: string, thesisId: string, limit: number) {
    return (await this.rows<EvaluationRow>(`thesis_evaluations?owner_id=eq.${encodeURIComponent(ownerId)}&thesis_id=eq.${encodeURIComponent(thesisId)}&select=*&order=evaluated_at.desc,id.desc&limit=${safeLimit(limit, 500)}`, 'Thesis evaluations are unavailable')).map(evaluation);
  }
  async saveDecision(input: { ownerId: string; actorId: string; thesis: ThesisRecord; subjectType: string; subjectKey: string; status: ThesisDecisionStatus; rationale?: string; evaluationId?: string }) {
    if (input.evaluationId) {
      const match = (await this.rows<EvaluationRow>(`thesis_evaluations?id=eq.${encodeURIComponent(input.evaluationId)}&owner_id=eq.${encodeURIComponent(input.ownerId)}&thesis_id=eq.${encodeURIComponent(input.thesis.id)}&subject_type=eq.${encodeURIComponent(input.subjectType)}&subject_key=eq.${encodeURIComponent(input.subjectKey)}&select=*&limit=1`, 'Thesis evaluation is unavailable'))[0];
      if (!match) throw new ApiError(422, 'validation_failed', 'Decision evaluation does not belong to this thesis subject');
    }
    const response = await this.rest('thesis_decisions?select=*', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ owner_id: input.ownerId, thesis_id: input.thesis.id, thesis_version: input.thesis.version, subject_type: input.subjectType, subject_key: input.subjectKey, status: input.status, rationale: input.rationale ?? null, evaluation_id: input.evaluationId ?? null, decided_by: input.actorId }) });
    if (!response.ok) throw new ApiError(503, 'data_unavailable', 'Thesis decision could not be persisted');
    const row = (await response.json() as DecisionRow[])[0]; if (!row) throw new ApiError(503, 'data_unavailable', 'Thesis decision could not be persisted'); return decision(row);
  }
  async listDecisions(ownerId: string, thesisId: string, subjectType?: string, subjectKey?: string, limit?: number) {
    const filters = [`owner_id=eq.${encodeURIComponent(ownerId)}`, `thesis_id=eq.${encodeURIComponent(thesisId)}`];
    if (subjectType) filters.push(`subject_type=eq.${encodeURIComponent(subjectType)}`);
    if (subjectKey) filters.push(`subject_key=eq.${encodeURIComponent(subjectKey)}`);
    return (await this.rows<DecisionRow>(`thesis_decisions?${filters.join('&')}&select=*&order=decided_at.desc,id.desc&limit=${safeLimit(limit)}`, 'Thesis decision history is unavailable')).map(decision);
  }
}

export class MemoryThesisRepository implements ThesisRepository {
  readonly theses = new Map<string, ThesisRecord>(); readonly criteria = new Map<string, ThesisCriterionRecord[]>(); readonly evidence: ThesisEvidenceInput[] = []; readonly evaluations: ThesisEvaluationSnapshot[] = []; readonly decisions: ThesisDecisionEvent[] = [];
  async ready() { return true; }
  async listTheses(ownerId: string) { return [...this.theses.values()].filter((x) => x.ownerId === ownerId && x.status !== 'ARCHIVED').map((value) => ({ thesis: structuredClone(value), criteria: structuredClone(this.criteria.get(value.id) ?? []) })); }
  async getThesis(ownerId: string, thesisId: string) { const value = this.theses.get(thesisId); if (!value || value.ownerId !== ownerId) throw new ApiError(404, 'not_found', 'Thesis not found'); return { thesis: structuredClone(value), criteria: structuredClone(this.criteria.get(thesisId) ?? []) }; }
  async createThesis(input: { ownerId: string; actorId: string; thesis: ThesisInput }) { const now = new Date().toISOString(); const value: ThesisRecord = { id: randomUUID(), ownerId: input.ownerId, ...input.thesis, status: 'ACTIVE', version: 1, createdBy: input.actorId, createdAt: now, updatedAt: now }; this.theses.set(value.id, value); return structuredClone(value); }
  async addCriterion(input: { ownerId: string; thesisId: string; criterion: ThesisCriterionInput }) { await this.getThesis(input.ownerId, input.thesisId); const now = new Date().toISOString(); const value: ThesisCriterionRecord = { id: randomUUID(), thesisId: input.thesisId, ...input.criterion, createdAt: now, updatedAt: now }; this.criteria.set(input.thesisId, [...(this.criteria.get(input.thesisId) ?? []), value]); return structuredClone(value); }
  async listEvidence(ownerId: string, subjectType: string, subjectKey: string) { return structuredClone(this.evidence.filter((x) => x.subjectType === subjectType && x.subjectKey === subjectKey && (!('ownerId' in x) || (x as ThesisEvidenceInput & { ownerId?: string }).ownerId === ownerId))); }
  async saveEvaluation(input: { ownerId: string; actorId: string; thesis: ThesisRecord; subjectType: string; subjectKey: string; summary: ThesisEvaluationSummary }) { const value: ThesisEvaluationSnapshot = { id: randomUUID(), ownerId: input.ownerId, thesisId: input.thesis.id, thesisVersion: input.thesis.version, subjectType: input.subjectType, subjectKey: input.subjectKey, decision: input.summary.decision, scoreBps: input.summary.scoreBps, coverageBps: input.summary.coverageBps, confidenceBps: input.summary.confidenceBps, summary: structuredClone(input.summary), evaluatedBy: input.actorId, evaluatedAt: new Date().toISOString() }; this.evaluations.unshift(value); return structuredClone(value); }
  async latestEvaluation(ownerId: string, thesisId: string, subjectType: string, subjectKey: string) { return structuredClone(this.evaluations.find((x) => x.ownerId === ownerId && x.thesisId === thesisId && x.subjectType === subjectType && x.subjectKey === subjectKey) ?? null); }
  async evaluationHistory(ownerId: string, thesisId: string, subjectType: string, subjectKey: string, limit: number) { return structuredClone(this.evaluations.filter((x) => x.ownerId === ownerId && x.thesisId === thesisId && x.subjectType === subjectType && x.subjectKey === subjectKey).slice(0, safeLimit(limit))); }
  async listEvaluations(ownerId: string, thesisId: string, limit: number) { return structuredClone(this.evaluations.filter((x) => x.ownerId === ownerId && x.thesisId === thesisId).slice(0, safeLimit(limit, 500))); }
  async saveDecision(input: { ownerId: string; actorId: string; thesis: ThesisRecord; subjectType: string; subjectKey: string; status: ThesisDecisionStatus; rationale?: string; evaluationId?: string }) { if (input.evaluationId && !this.evaluations.some((x) => x.id === input.evaluationId && x.ownerId === input.ownerId && x.thesisId === input.thesis.id && x.subjectType === input.subjectType && x.subjectKey === input.subjectKey)) throw new ApiError(422, 'validation_failed', 'Decision evaluation does not belong to this thesis subject'); const value: ThesisDecisionEvent = { id: randomUUID(), ownerId: input.ownerId, thesisId: input.thesis.id, thesisVersion: input.thesis.version, subjectType: input.subjectType, subjectKey: input.subjectKey, status: input.status, ...(input.rationale ? { rationale: input.rationale } : {}), ...(input.evaluationId ? { evaluationId: input.evaluationId } : {}), decidedBy: input.actorId, decidedAt: new Date().toISOString() }; this.decisions.unshift(value); return structuredClone(value); }
  async listDecisions(ownerId: string, thesisId: string, subjectType?: string, subjectKey?: string, limit?: number) { return structuredClone(this.decisions.filter((x) => x.ownerId === ownerId && x.thesisId === thesisId && (!subjectType || x.subjectType === subjectType) && (!subjectKey || x.subjectKey === subjectKey)).slice(0, safeLimit(limit))); }
}
