import { ApiError } from './errors.js';
import {
  validateThesisCriterion,
  validateThesisInput,
  type ThesisCriterionInput,
  type ThesisInput,
  type ThesisStrategy,
} from './thesis-domain.js';
import type { ThesisEvaluationSummary } from './thesis-evaluator.js';
import { thesisMetricRegistry } from './thesis-metric-registry.js';

export interface ThesisProposal {
  readonly thesis: ThesisInput;
  readonly criteria: readonly ThesisCriterionInput[];
  readonly warnings: readonly string[];
  readonly source: 'DETERMINISTIC' | 'MODEL';
}

export interface ThesisLanguageModel {
  propose(input: {
    text: string;
    metrics: readonly { key: string; label: string; valueType: string; qualitative: boolean }[];
  }): Promise<{ thesis: unknown; criteria: unknown }>;
}

export interface ThesisEvaluationExplanation {
  readonly headline: string;
  readonly decision: ThesisEvaluationSummary['decision'];
  readonly scoreBps: number;
  readonly coverageBps: number;
  readonly confidenceBps: number;
  readonly positives: readonly string[];
  readonly risks: readonly string[];
  readonly evidenceGaps: readonly string[];
  readonly evidenceLedger: readonly {
    metricKey: string;
    outcome: 'PASS' | 'FAIL' | 'UNKNOWN';
    reason: string;
    sourceType?: string;
    sourceUri?: string;
    confidenceBps?: number;
  }[];
}

const aliases: ReadonlyArray<{ pattern: RegExp; metricKey: string }> = [
  { pattern: /\brevenue growth\b/i, metricKey: 'revenue_growth_yoy' },
  { pattern: /\barr growth\b/i, metricKey: 'arr_growth_yoy' },
  { pattern: /\bgross margin\b/i, metricKey: 'gross_margin' },
  { pattern: /\bebitda margin\b/i, metricKey: 'ebitda_margin' },
  { pattern: /\boperating margin\b/i, metricKey: 'operating_margin' },
  { pattern: /\bfree cash flow margin\b|\bfcf margin\b/i, metricKey: 'free_cash_flow_margin' },
  { pattern: /\bnet (?:revenue )?retention\b|\bnrr\b/i, metricKey: 'net_revenue_retention' },
  { pattern: /\bcustomer concentration\b/i, metricKey: 'customer_concentration' },
  { pattern: /\bforward (?:ev\s*\/\s*)?revenue\b|\bev\s*\/\s*revenue\b|\bforward revenue multiple\b/i, metricKey: 'ev_revenue_forward' },
  { pattern: /\bforward (?:ev\s*\/\s*)?ebitda\b|\bev\s*\/\s*ebitda\b/i, metricKey: 'ev_ebitda_forward' },
  { pattern: /\bforward p\s*\/\s*e\b|\bforward pe\b/i, metricKey: 'pe_forward' },
  { pattern: /\bfounder ownership\b/i, metricKey: 'founder_ownership' },
  { pattern: /\binstitutional ownership\b/i, metricKey: 'institutional_ownership' },
  { pattern: /\bmarket growth\b/i, metricKey: 'market_growth' },
];

function strategyFromText(text: string): ThesisStrategy {
  const value = text.toLowerCase();
  if (value.includes('growth equity')) return 'GROWTH_EQUITY';
  if (value.includes('venture')) return 'VENTURE';
  if (value.includes('private equity') || value.includes('buyout')) return 'PRIVATE_EQUITY';
  if (value.includes('public equity') || value.includes('long only') || value.includes('long-only')) return 'PUBLIC_EQUITY';
  if (value.includes('credit') || value.includes('lending')) return 'CREDIT';
  if (value.includes('multi-strategy') || value.includes('multi strategy')) return 'MULTI_STRATEGY';
  return 'CUSTOM';
}

function listAfterLabel(text: string, labels: readonly string[]): string[] {
  for (const label of labels) {
    const match = text.match(new RegExp(`(?:^|\\n)\\s*${label}\\s*:\\s*([^\\n]+)`, 'i'));
    if (match?.[1]) return match[1].split(/[,;|]/).map((x) => x.trim()).filter(Boolean).slice(0, 50);
  }
  return [];
}

function scaleNumber(raw: string): number {
  const normalized = raw.replace(/[$,%\s]/g, '');
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)([kmbt])?$/i);
  if (!match?.[1]) return Number.NaN;
  const base = Number(match[1]);
  const multiplier = match[2]?.toLowerCase() === 'k' ? 1e3 : match[2]?.toLowerCase() === 'm' ? 1e6 : match[2]?.toLowerCase() === 'b' ? 1e9 : match[2]?.toLowerCase() === 't' ? 1e12 : 1;
  return base * multiplier;
}

function numericCriterion(line: string, metricKey: string, position: number): ThesisCriterionInput | null {
  const between = line.match(/(?:between|from)\s*\$?([\d.]+\s*[kmbt]?)\s*(?:%|x)?\s*(?:and|to|-)\s*\$?([\d.]+\s*[kmbt]?)\s*(?:%|x)?/i);
  const comparator = line.match(/(>=|<=|>|<|at least|minimum|min\.?|maximum|max\.?|no more than|under|below|above|over)\s*\$?([\d.]+\s*[kmbt]?)\s*(%|x)?/i);
  const simple = line.match(/\$?([\d.]+\s*[kmbt]?)\s*(%|x)\b/i);
  const importance = /\brequired\b|\bmust\b|\bminimum\b|\bmaximum\b/i.test(line) ? 'REQUIRED' as const : 'PREFERRED' as const;
  const base = { metricKey, kind: 'QUANTITATIVE' as const, weightBps: 1, importance, rationale: line.trim().slice(0, 1000), position };
  if (between?.[1] && between[2]) {
    const numericMin = scaleNumber(between[1]);
    const numericMax = scaleNumber(between[2]);
    if (Number.isFinite(numericMin) && Number.isFinite(numericMax)) return { ...base, operator: 'BETWEEN', numericMin, numericMax };
  }
  const valueMatch = comparator ?? simple;
  if (!valueMatch) return null;
  const raw = comparator ? comparator[2] : simple?.[1];
  if (!raw) return null;
  const numericValue = scaleNumber(raw);
  if (!Number.isFinite(numericValue)) return null;
  const token = comparator?.[1]?.toLowerCase() ?? '';
  const operator = ['<', 'maximum', 'max.', 'no more than', 'under', 'below'].includes(token) ? 'LTE'
    : ['>', 'above', 'over'].includes(token) ? 'GT'
      : ['>=', 'at least', 'minimum', 'min.'].includes(token) ? 'GTE'
        : token === '<=' ? 'LTE'
          : metricKey === 'customer_concentration' || metricKey.startsWith('ev_') || metricKey === 'pe_forward' ? 'LTE' : 'GTE';
  return { ...base, operator, numericValue };
}

function qualitativeCriteria(text: string, startPosition: number): ThesisCriterionInput[] {
  const result: ThesisCriterionInput[] = [];
  let position = startPosition;
  const add = (criterion: Omit<ThesisCriterionInput, 'weightBps' | 'position'>) => result.push({ ...criterion, weightBps: 1, position: position++ });
  if (/\bfounder[- ]led\b/i.test(text)) add({ metricKey: 'founder_led', kind: 'QUALITATIVE', operator: 'IS_TRUE', importance: 'PREFERRED', rationale: 'Founder-led leadership preference extracted from mandate.' });
  const switching = text.match(/switching costs?\s*(?::|=|are|should be)?\s*(high|strong|medium|moderate|low)/i);
  if (switching?.[1]) add({ metricKey: 'switching_costs', kind: 'QUALITATIVE', operator: 'CONTAINS', textValue: switching[1], importance: 'PREFERRED', rationale: 'Switching-cost preference extracted from mandate.' });
  const category = text.match(/category leadership\s*(?::|=|is|should be)?\s*(strong|leading|leader|high|moderate|weak)/i);
  if (category?.[1]) add({ metricKey: 'category_leadership', kind: 'QUALITATIVE', operator: 'CONTAINS', textValue: category[1], importance: 'PREFERRED', rationale: 'Category-position preference extracted from mandate.' });
  const regulatory = text.match(/regulatory (?:exposure|risk)\s*(?::|=|is|should be)?\s*(low|limited|moderate|medium|high|elevated)/i);
  if (regulatory?.[1]) add({ metricKey: 'regulatory_exposure', kind: 'QUALITATIVE', operator: 'CONTAINS', textValue: regulatory[1], importance: /low|limited/i.test(regulatory[1]) ? 'REQUIRED' : 'PREFERRED', rationale: 'Regulatory-exposure preference extracted from mandate.' });
  return result;
}

function normalizeWeights(criteria: readonly ThesisCriterionInput[]): ThesisCriterionInput[] {
  if (!criteria.length) return [];
  const base = Math.floor(10_000 / criteria.length);
  let remainder = 10_000 - base * criteria.length;
  return criteria.map((criterion) => ({ ...criterion, weightBps: base + (remainder-- > 0 ? 1 : 0) }));
}

function deterministicProposal(text: string): ThesisProposal {
  const clean = text.trim();
  if (clean.length < 10 || clean.length > 20_000) throw new ApiError(422, 'thesis_intelligence_invalid', 'Thesis source text must be between 10 and 20000 characters');
  const criteria: ThesisCriterionInput[] = [];
  const lines = clean.split(/\n|[.;](?=\s|$)/).map((x) => x.trim()).filter(Boolean);
  for (const line of lines) {
    const alias = aliases.find((item) => item.pattern.test(line));
    if (!alias) continue;
    const criterion = numericCriterion(line, alias.metricKey, criteria.length);
    if (criterion && !criteria.some((item) => item.metricKey === criterion.metricKey)) criteria.push(criterion);
  }
  criteria.push(...qualitativeCriteria(clean, criteria.length).filter((candidate) => !criteria.some((item) => item.metricKey === candidate.metricKey)));
  const normalized = normalizeWeights(criteria).map(validateThesisCriterion);
  const sectors = listAfterLabel(clean, ['preferred sectors?', 'sectors?']);
  const geographies = listAfterLabel(clean, ['geograph(?:y|ies)', 'regions?', 'markets?']);
  const nameMatch = clean.match(/(?:^|\n)\s*(?:thesis|mandate|strategy name)\s*:\s*([^\n]+)/i);
  const thesis = validateThesisInput({
    name: (nameMatch?.[1]?.trim() || 'Investment Thesis').slice(0, 120),
    description: clean.slice(0, 1000),
    strategy: strategyFromText(clean),
    sectors,
    geographies,
  });
  const unsupported = ['IRR', 'MOIC', 'ownership target', 'investment horizon'].filter((term) => new RegExp(term, 'i').test(clean));
  const warnings = [
    ...(normalized.length ? [] : ['No governed metric criteria could be extracted from the supplied text.']),
    ...unsupported.map((term) => `${term} is present in the mandate but is not yet represented by the Phase 1 governed metric registry.`),
  ];
  return { thesis, criteria: normalized, warnings, source: 'DETERMINISTIC' };
}

function validateModelProposal(raw: { thesis: unknown; criteria: unknown }): ThesisProposal {
  if (!raw.thesis || typeof raw.thesis !== 'object' || Array.isArray(raw.thesis)) throw new ApiError(422, 'thesis_intelligence_invalid', 'Model thesis proposal is invalid');
  if (!Array.isArray(raw.criteria) || raw.criteria.length > 50) throw new ApiError(422, 'thesis_intelligence_invalid', 'Model criterion proposal is invalid');
  try {
    const thesis = validateThesisInput(raw.thesis as ThesisInput);
    const criteria = normalizeWeights(raw.criteria.map((value, index) => validateThesisCriterion({ ...(value as ThesisCriterionInput), position: index, weightBps: 1 })));
    return { thesis, criteria, warnings: [], source: 'MODEL' };
  } catch (error) {
    if (error instanceof ApiError) throw new ApiError(422, 'thesis_intelligence_invalid', 'Model output failed governed Thesis validation', { cause: error.code });
    throw error;
  }
}

export async function proposeThesisFromText(text: string, model?: ThesisLanguageModel): Promise<ThesisProposal> {
  if (!model) return deterministicProposal(text);
  const clean = text.trim();
  if (clean.length < 10 || clean.length > 20_000) throw new ApiError(422, 'thesis_intelligence_invalid', 'Thesis source text must be between 10 and 20000 characters');
  const raw = await model.propose({ text: clean, metrics: thesisMetricRegistry.map(({ key, label, valueType, qualitative }) => ({ key, label, valueType, qualitative })) });
  return validateModelProposal(raw);
}

export function explainThesisEvaluation(summary: ThesisEvaluationSummary): ThesisEvaluationExplanation {
  const positives: string[] = [];
  const risks: string[] = [];
  const evidenceGaps: string[] = [];
  const evidenceLedger = summary.criteria.map((evaluation) => {
    const label = evaluation.resolved?.metric.label ?? evaluation.criterion.metricKey;
    if (evaluation.outcome === 'PASS') positives.push(`${label}: criterion satisfied.`);
    else if (evaluation.outcome === 'FAIL') risks.push(`${label}: criterion not satisfied.`);
    else evidenceGaps.push(`${label}: insufficient governed evidence.`);
    return {
      metricKey: evaluation.criterion.metricKey,
      outcome: evaluation.outcome,
      reason: evaluation.reason,
      ...(evaluation.resolved?.evidence.sourceType ? { sourceType: evaluation.resolved.evidence.sourceType } : {}),
      ...(evaluation.resolved?.evidence.sourceUri ? { sourceUri: evaluation.resolved.evidence.sourceUri } : {}),
      ...(evaluation.resolved ? { confidenceBps: evaluation.resolved.evidence.confidenceBps } : {}),
    };
  });
  const headline = summary.decision === 'QUALIFIED'
    ? `Thesis qualified at ${Math.round(summary.scoreBps / 100)}% fit.`
    : summary.decision === 'REJECTED'
      ? `Thesis rejected because at least one required criterion failed.`
      : `Thesis fit remains unresolved because governed evidence is incomplete.`;
  return {
    headline,
    decision: summary.decision,
    scoreBps: summary.scoreBps,
    coverageBps: summary.coverageBps,
    confidenceBps: summary.confidenceBps,
    positives,
    risks,
    evidenceGaps,
    evidenceLedger,
  };
}
