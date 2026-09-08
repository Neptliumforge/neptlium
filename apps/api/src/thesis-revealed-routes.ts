import { ApiError } from './errors.js';
import type { ThesisRepository } from './thesis-repository.js';
import type { RevealedThesisRepository } from './thesis-revealed-repository.js';
import { analyzeRevealedThesis, compareStatedAndRevealed, proposeRevealedThesisAdoption } from './thesis-revealed.js';

type Context = { method: string; path: string; query: URLSearchParams; body: unknown };
type Result = { status?: number; data: unknown };

export async function handleRevealedThesisRoute(context: Context, deps: { repository: ThesisRepository; revealedRepository: RevealedThesisRepository; principal: () => Promise<{ id: string }> }): Promise<Result | undefined> {
  if (!context.path.includes('/revealed') && !context.path.endsWith('/alignment')) return undefined;
  const compute = context.path.match(/^\/v1\/theses\/([^/]+)\/revealed\/compute$/);
  if (context.method === 'POST' && compute?.[1]) {
    const principal = await deps.principal(); const bundle = await deps.repository.getThesis(principal.id, compute[1]);
    const [decisions, evaluations] = await Promise.all([deps.repository.listDecisions(principal.id, compute[1], undefined, undefined, 1000), deps.repository.listEvaluations(principal.id, compute[1], 1000)]);
    const computedAt = new Date().toISOString();
    const analysis = analyzeRevealedThesis({ ownerId: principal.id, thesisId: compute[1], thesisVersion: bundle.thesis.version, decisions, evaluations, computedAt });
    if (analysis.state === 'INSUFFICIENT_HISTORY') return { status: 422, data: { state: 'INSUFFICIENT_HISTORY', thesis: bundle.thesis, relevantDecisionCount: analysis.relevantDecisionCount, observations: [] } };
    await deps.revealedRepository.saveSnapshot({ ownerId: principal.id, thesisId: compute[1], thesisVersion: bundle.thesis.version, observations: analysis.observations, computedAt });
    return { status: 201, data: { ...analysis, thesis: bundle.thesis } };
  }
  const list = context.path.match(/^\/v1\/theses\/([^/]+)\/revealed$/);
  if (context.method === 'GET' && list?.[1]) {
    const principal = await deps.principal(); const bundle = await deps.repository.getThesis(principal.id, list[1]); const rows = await deps.revealedRepository.listLatest(principal.id, list[1], bundle.thesis.version);
    return { data: { state: rows.length ? 'VALUE' : 'INSUFFICIENT_HISTORY', thesis: bundle.thesis, data: rows.map((row) => row.observation) } };
  }
  const detail = context.path.match(/^\/v1\/theses\/([^/]+)\/revealed\/([^/]+)$/);
  if (context.method === 'GET' && detail?.[1] && detail[2]) {
    const principal = await deps.principal(); const bundle = await deps.repository.getThesis(principal.id, detail[1]); const row = await deps.revealedRepository.get(principal.id, detail[1], decodeURIComponent(detail[2]));
    if (!row || row.thesisVersion !== bundle.thesis.version) throw new ApiError(404, 'not_found', 'Revealed Thesis observation not found for the current thesis version');
    const decisions = await deps.repository.listDecisions(principal.id, detail[1], undefined, undefined, 1000); const evaluations = await deps.repository.listEvaluations(principal.id, detail[1], 1000);
    return { data: { thesis: bundle.thesis, observation: row.observation, decisions: decisions.filter((item) => row.observation.evidenceDecisionIds.includes(item.id)), evaluations: evaluations.filter((item) => row.observation.evidenceEvaluationIds.includes(item.id)), alignment: compareStatedAndRevealed(bundle.criteria, [row.observation]).find((item) => item.metricKey === row.observation.metricKey) } };
  }
  const alignment = context.path.match(/^\/v1\/theses\/([^/]+)\/alignment$/);
  if (context.method === 'GET' && alignment?.[1]) {
    const principal = await deps.principal(); const bundle = await deps.repository.getThesis(principal.id, alignment[1]); const rows = await deps.revealedRepository.listLatest(principal.id, alignment[1], bundle.thesis.version);
    return { data: { state: rows.length ? 'VALUE' : 'INSUFFICIENT_HISTORY', thesis: bundle.thesis, data: compareStatedAndRevealed(bundle.criteria, rows.map((row) => row.observation)) } };
  }
  const proposal = context.path.match(/^\/v1\/theses\/([^/]+)\/revealed\/([^/]+)\/proposal$/);
  if (context.method === 'POST' && proposal?.[1] && proposal[2]) {
    const principal = await deps.principal(); const bundle = await deps.repository.getThesis(principal.id, proposal[1]); const row = await deps.revealedRepository.get(principal.id, proposal[1], decodeURIComponent(proposal[2]));
    if (!row || row.thesisVersion !== bundle.thesis.version) throw new ApiError(404, 'not_found', 'Revealed Thesis observation not found for the current thesis version');
    return { data: proposeRevealedThesisAdoption(row.observation, bundle.criteria.find((item) => item.metricKey === row.observation.metricKey)) };
  }
  throw new ApiError(404, 'not_found', 'Revealed Thesis route not found');
}
