import { ApiError } from './errors.js';
import { calculateThesisDrift, rankThesisOpportunities, type ThesisDecisionStatus } from './thesis-compounding.js';
import { validateThesisCriterion, validateThesisInput, type ThesisCriterionInput, type ThesisInput } from './thesis-domain.js';
import { evaluateThesis } from './thesis-evaluator.js';
import { explainThesisEvaluation, proposeThesisFromText, type ThesisLanguageModel } from './thesis-intelligence.js';
import type { ThesisRepository } from './thesis-repository.js';

type ThesisContext = { method: string; path: string; query: URLSearchParams; body: unknown };
type RouteResult = { status?: number; data: unknown };
const decisionStatuses: readonly ThesisDecisionStatus[] = ['WATCH', 'INTERESTED', 'PASS', 'INVESTED', 'EXITED'];

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError(422, 'validation_failed', 'Request body must be an object');
}
function subject(value: unknown, label: string, max: number) {
  const text = String(value ?? '').trim();
  if (!text || text.length > max) throw new ApiError(422, 'validation_failed', `${label} is invalid`);
  return text;
}
function optionalSubject(value: unknown, max: number) {
  if (value === null || value === undefined || value === '') return undefined;
  return subject(value, 'query value', max);
}
function limit(value: unknown, fallback = 100) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) throw new ApiError(422, 'validation_failed', 'limit must be an integer from 1 to 1000');
  return parsed;
}

export async function handleThesisRoute(
  context: ThesisContext,
  deps: { repository: ThesisRepository; principal: () => Promise<{ id: string }>; languageModel?: ThesisLanguageModel },
): Promise<RouteResult | undefined> {
  const { method, path } = context;
  if (!path.startsWith('/v1/theses') && !path.startsWith('/v1/entities/')) return undefined;

  if (method === 'POST' && path === '/v1/theses/propose') {
    await deps.principal(); assertObject(context.body);
    return { data: await proposeThesisFromText(subject(context.body.text, 'text', 20_000), deps.languageModel) };
  }
  if (method === 'GET' && path === '/v1/theses') {
    const principal = await deps.principal(); const bundles = await deps.repository.listTheses(principal.id);
    return { data: { state: bundles.length ? 'VALUE' : 'EMPTY', data: bundles } };
  }
  if (method === 'POST' && path === '/v1/theses') {
    const principal = await deps.principal(); assertObject(context.body);
    const thesis = await deps.repository.createThesis({ ownerId: principal.id, actorId: principal.id, thesis: validateThesisInput(context.body as unknown as ThesisInput) });
    return { status: 201, data: thesis };
  }

  const criterionMatch = path.match(/^\/v1\/theses\/([^/]+)\/criteria$/);
  if (method === 'POST' && criterionMatch?.[1]) {
    const principal = await deps.principal(); assertObject(context.body);
    const criterion = await deps.repository.addCriterion({ ownerId: principal.id, thesisId: criterionMatch[1], criterion: validateThesisCriterion(context.body as unknown as ThesisCriterionInput) });
    return { status: 201, data: criterion };
  }

  const historyMatch = path.match(/^\/v1\/theses\/([^/]+)\/history$/);
  if (method === 'GET' && historyMatch?.[1]) {
    const principal = await deps.principal(); await deps.repository.getThesis(principal.id, historyMatch[1]);
    const subjectType = subject(context.query.get('subject_type'), 'subject_type', 80);
    const subjectKey = subject(context.query.get('subject_key'), 'subject_key', 240);
    const history = await deps.repository.evaluationHistory(principal.id, historyMatch[1], subjectType, subjectKey, limit(context.query.get('limit'), 100));
    return { data: { state: history.length ? 'VALUE' : 'EMPTY', subject: { type: subjectType, key: subjectKey }, data: history } };
  }

  const driftMatch = path.match(/^\/v1\/theses\/([^/]+)\/drift$/);
  if (method === 'GET' && driftMatch?.[1]) {
    const principal = await deps.principal(); await deps.repository.getThesis(principal.id, driftMatch[1]);
    const subjectType = subject(context.query.get('subject_type'), 'subject_type', 80);
    const subjectKey = subject(context.query.get('subject_key'), 'subject_key', 240);
    const history = await deps.repository.evaluationHistory(principal.id, driftMatch[1], subjectType, subjectKey, 2);
    const drift = calculateThesisDrift(history);
    return { data: drift ? { state: 'VALUE', subject: { type: subjectType, key: subjectKey }, drift } : { state: 'EMPTY', subject: { type: subjectType, key: subjectKey } } };
  }

  const opportunitiesMatch = path.match(/^\/v1\/theses\/([^/]+)\/opportunities$/);
  if (method === 'GET' && opportunitiesMatch?.[1]) {
    const principal = await deps.principal(); const bundle = await deps.repository.getThesis(principal.id, opportunitiesMatch[1]);
    const requested = limit(context.query.get('limit'), 50);
    const evaluations = await deps.repository.listEvaluations(principal.id, opportunitiesMatch[1], 1000);
    const ranked = rankThesisOpportunities(evaluations.filter((item) => item.thesisVersion === bundle.thesis.version), requested);
    return { data: { state: ranked.length ? 'VALUE' : 'EMPTY', thesis: bundle.thesis, data: ranked } };
  }

  const decisionsMatch = path.match(/^\/v1\/theses\/([^/]+)\/decisions$/);
  if (method === 'POST' && decisionsMatch?.[1]) {
    const principal = await deps.principal(); assertObject(context.body);
    const bundle = await deps.repository.getThesis(principal.id, decisionsMatch[1]);
    const status = subject(context.body.status, 'status', 32) as ThesisDecisionStatus;
    if (!decisionStatuses.includes(status)) throw new ApiError(422, 'validation_failed', 'Decision status is invalid');
    const rationale = optionalSubject(context.body.rationale, 2_000);
    const evaluationId = optionalSubject(context.body.evaluation_id, 80);
    const event = await deps.repository.saveDecision({ ownerId: principal.id, actorId: principal.id, thesis: bundle.thesis, subjectType: subject(context.body.subject_type, 'subject_type', 80), subjectKey: subject(context.body.subject_key, 'subject_key', 240), status, ...(rationale ? { rationale } : {}), ...(evaluationId ? { evaluationId } : {}) });
    return { status: 201, data: event };
  }
  if (method === 'GET' && decisionsMatch?.[1]) {
    const principal = await deps.principal(); await deps.repository.getThesis(principal.id, decisionsMatch[1]);
    const subjectType = optionalSubject(context.query.get('subject_type'), 80);
    const subjectKey = optionalSubject(context.query.get('subject_key'), 240);
    if (subjectKey && !subjectType) throw new ApiError(422, 'validation_failed', 'subject_type is required when filtering by subject_key');
    const events = await deps.repository.listDecisions(principal.id, decisionsMatch[1], subjectType, subjectKey, limit(context.query.get('limit'), 100));
    return { data: { state: events.length ? 'VALUE' : 'EMPTY', data: events } };
  }

  const explainMatch = path.match(/^\/v1\/theses\/([^/]+)\/explain$/);
  if (method === 'GET' && explainMatch?.[1]) {
    const principal = await deps.principal();
    const subjectType = subject(context.query.get('subject_type'), 'subject_type', 80); const subjectKey = subject(context.query.get('subject_key'), 'subject_key', 240);
    const bundle = await deps.repository.getThesis(principal.id, explainMatch[1]); const evidence = await deps.repository.listEvidence(principal.id, subjectType, subjectKey);
    return { data: { thesis: bundle.thesis, subject: { type: subjectType, key: subjectKey }, explanation: explainThesisEvaluation(evaluateThesis(bundle.criteria, evidence)) } };
  }

  const evaluateMatch = path.match(/^\/v1\/theses\/([^/]+)\/evaluate$/);
  if (method === 'POST' && evaluateMatch?.[1]) {
    const principal = await deps.principal(); assertObject(context.body);
    const subjectType = subject(context.body.subject_type, 'subject_type', 80); const subjectKey = subject(context.body.subject_key, 'subject_key', 240);
    const bundle = await deps.repository.getThesis(principal.id, evaluateMatch[1]); const evidence = await deps.repository.listEvidence(principal.id, subjectType, subjectKey);
    const summary = evaluateThesis(bundle.criteria, evidence); const snapshot = await deps.repository.saveEvaluation({ ownerId: principal.id, actorId: principal.id, thesis: bundle.thesis, subjectType, subjectKey, summary });
    const history = await deps.repository.evaluationHistory(principal.id, evaluateMatch[1], subjectType, subjectKey, 2);
    return { status: 201, data: { ...snapshot, drift: calculateThesisDrift(history) } };
  }

  const entityFitMatch = path.match(/^\/v1\/entities\/([^/]+)\/([^/]+)\/thesis-fit$/);
  if (method === 'GET' && entityFitMatch?.[1] && entityFitMatch[2]) {
    const principal = await deps.principal(); const thesisId = subject(context.query.get('thesis_id'), 'thesis_id', 80);
    const subjectType = decodeURIComponent(entityFitMatch[1]); const subjectKey = decodeURIComponent(entityFitMatch[2]);
    const bundle = await deps.repository.getThesis(principal.id, thesisId); const evidence = await deps.repository.listEvidence(principal.id, subjectType, subjectKey);
    const live = evaluateThesis(bundle.criteria, evidence); const history = await deps.repository.evaluationHistory(principal.id, thesisId, subjectType, subjectKey, 2); const latest = history[0] ?? null;
    return { data: { thesis: bundle.thesis, subject: { type: subjectType, key: subjectKey }, live, explanation: explainThesisEvaluation(live), latest_snapshot: latest, stale_snapshot: latest ? latest.thesisVersion !== bundle.thesis.version : false, drift: calculateThesisDrift(history) } };
  }

  const thesisMatch = path.match(/^\/v1\/theses\/([^/]+)$/);
  if (method === 'GET' && thesisMatch?.[1]) { const principal = await deps.principal(); return { data: await deps.repository.getThesis(principal.id, thesisMatch[1]) }; }

  throw new ApiError(404, 'not_found', 'Thesis route not found');
}
