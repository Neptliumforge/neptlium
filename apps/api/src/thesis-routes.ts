import { ApiError } from './errors.js';
import { validateThesisCriterion, validateThesisInput, type ThesisCriterionInput, type ThesisInput } from './thesis-domain.js';
import { evaluateThesis } from './thesis-evaluator.js';
import { explainThesisEvaluation, proposeThesisFromText, type ThesisLanguageModel } from './thesis-intelligence.js';
import type { ThesisRepository } from './thesis-repository.js';

type ThesisContext = {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
};
type RouteResult = { status?: number; data: unknown };

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ApiError(422, 'validation_failed', 'Request body must be an object');
}
function subject(value: unknown, label: string, max: number) {
  const text = String(value ?? '').trim();
  if (!text || text.length > max) throw new ApiError(422, 'validation_failed', `${label} is invalid`);
  return text;
}

export async function handleThesisRoute(
  context: ThesisContext,
  deps: {
    repository: ThesisRepository;
    principal: () => Promise<{ id: string }>;
    languageModel?: ThesisLanguageModel;
  },
): Promise<RouteResult | undefined> {
  const { method, path } = context;
  if (!path.startsWith('/v1/theses') && !path.startsWith('/v1/entities/')) return undefined;

  if (method === 'POST' && path === '/v1/theses/propose') {
    await deps.principal();
    assertObject(context.body);
    const text = subject(context.body.text, 'text', 20_000);
    return { data: await proposeThesisFromText(text, deps.languageModel) };
  }

  if (method === 'GET' && path === '/v1/theses') {
    const principal = await deps.principal();
    const bundles = await deps.repository.listTheses(principal.id);
    return { data: { state: bundles.length ? 'VALUE' : 'EMPTY', data: bundles } };
  }

  if (method === 'POST' && path === '/v1/theses') {
    const principal = await deps.principal();
    assertObject(context.body);
    const input = validateThesisInput(context.body as unknown as ThesisInput);
    const thesis = await deps.repository.createThesis({ ownerId: principal.id, actorId: principal.id, thesis: input });
    return { status: 201, data: thesis };
  }

  const criterionMatch = path.match(/^\/v1\/theses\/([^/]+)\/criteria$/);
  if (method === 'POST' && criterionMatch?.[1]) {
    const principal = await deps.principal();
    assertObject(context.body);
    const input = validateThesisCriterion(context.body as unknown as ThesisCriterionInput);
    const criterion = await deps.repository.addCriterion({ ownerId: principal.id, thesisId: criterionMatch[1], criterion: input });
    return { status: 201, data: criterion };
  }

  const explainMatch = path.match(/^\/v1\/theses\/([^/]+)\/explain$/);
  if (method === 'GET' && explainMatch?.[1]) {
    const principal = await deps.principal();
    const subjectType = subject(context.query.get('subject_type'), 'subject_type', 80);
    const subjectKey = subject(context.query.get('subject_key'), 'subject_key', 240);
    const bundle = await deps.repository.getThesis(principal.id, explainMatch[1]);
    const evidence = await deps.repository.listEvidence(principal.id, subjectType, subjectKey);
    const summary = evaluateThesis(bundle.criteria, evidence);
    return {
      data: {
        thesis: bundle.thesis,
        subject: { type: subjectType, key: subjectKey },
        explanation: explainThesisEvaluation(summary),
      },
    };
  }

  const evaluateMatch = path.match(/^\/v1\/theses\/([^/]+)\/evaluate$/);
  if (method === 'POST' && evaluateMatch?.[1]) {
    const principal = await deps.principal();
    assertObject(context.body);
    const subjectType = subject(context.body.subject_type, 'subject_type', 80);
    const subjectKey = subject(context.body.subject_key, 'subject_key', 240);
    const bundle = await deps.repository.getThesis(principal.id, evaluateMatch[1]);
    const evidence = await deps.repository.listEvidence(principal.id, subjectType, subjectKey);
    const summary = evaluateThesis(bundle.criteria, evidence);
    const snapshot = await deps.repository.saveEvaluation({ ownerId: principal.id, actorId: principal.id, thesis: bundle.thesis, subjectType, subjectKey, summary });
    return { status: 201, data: snapshot };
  }

  const entityFitMatch = path.match(/^\/v1\/entities\/([^/]+)\/([^/]+)\/thesis-fit$/);
  if (method === 'GET' && entityFitMatch?.[1] && entityFitMatch[2]) {
    const principal = await deps.principal();
    const thesisId = subject(context.query.get('thesis_id'), 'thesis_id', 80);
    const subjectType = decodeURIComponent(entityFitMatch[1]);
    const subjectKey = decodeURIComponent(entityFitMatch[2]);
    const bundle = await deps.repository.getThesis(principal.id, thesisId);
    const evidence = await deps.repository.listEvidence(principal.id, subjectType, subjectKey);
    const live = evaluateThesis(bundle.criteria, evidence);
    const latest = await deps.repository.latestEvaluation(principal.id, thesisId, subjectType, subjectKey);
    return {
      data: {
        thesis: bundle.thesis,
        subject: { type: subjectType, key: subjectKey },
        live,
        explanation: explainThesisEvaluation(live),
        latest_snapshot: latest,
        stale_snapshot: latest ? latest.thesisVersion !== bundle.thesis.version : false,
      },
    };
  }

  const thesisMatch = path.match(/^\/v1\/theses\/([^/]+)$/);
  if (method === 'GET' && thesisMatch?.[1]) {
    const principal = await deps.principal();
    return { data: await deps.repository.getThesis(principal.id, thesisMatch[1]) };
  }

  throw new ApiError(404, 'not_found', 'Thesis route not found');
}
