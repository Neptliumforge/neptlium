import type { ThesisCriterionInput, ThesisEvidenceInput } from './thesis-domain.js';
import { getThesisMetricDefinition, type ThesisMetricDefinition } from './thesis-metric-registry.js';

export type ThesisCriterionOutcome = 'PASS' | 'FAIL' | 'UNKNOWN';
export type ThesisEvaluationDecision = 'QUALIFIED' | 'REJECTED' | 'INSUFFICIENT_EVIDENCE';

export interface ResolvedThesisMetric {
  readonly metric: ThesisMetricDefinition;
  readonly value: number | boolean | string;
  readonly evidence: ThesisEvidenceInput;
}

export interface ThesisMetricResolution {
  readonly status: 'RESOLVED' | 'UNKNOWN';
  readonly metric: ThesisMetricDefinition;
  readonly resolved?: ResolvedThesisMetric;
  readonly reason?: string;
}

export interface ThesisCriterionEvaluation {
  readonly criterion: ThesisCriterionInput;
  readonly outcome: ThesisCriterionOutcome;
  readonly resolved?: ResolvedThesisMetric;
  readonly reason: string;
}

export interface ThesisEvaluationSummary {
  readonly decision: ThesisEvaluationDecision;
  readonly scoreBps: number;
  readonly coverageBps: number;
  readonly confidenceBps: number;
  readonly totalWeightBps: number;
  readonly knownWeightBps: number;
  readonly passedWeightBps: number;
  readonly requiredOutcome: true | false | null;
  readonly criteria: readonly ThesisCriterionEvaluation[];
}

function isCompatibleValue(metric: ThesisMetricDefinition, value: unknown): value is number | boolean | string {
  switch (metric.valueType) {
    case 'PERCENTAGE':
    case 'CURRENCY':
    case 'MULTIPLE':
    case 'NUMBER':
      return typeof value === 'number' && Number.isFinite(value);
    case 'BOOLEAN':
      return typeof value === 'boolean';
    case 'TEXT':
      return typeof value === 'string' && value.trim().length > 0;
  }
}

function evidenceDate(evidence: ThesisEvidenceInput): number {
  const candidate = evidence.reportingPeriodEnd ?? evidence.sourceDate;
  if (!candidate) return 0;
  const parsed = Date.parse(candidate);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sourceRank(metric: ThesisMetricDefinition, sourceType: string): number {
  const rank = metric.sourcePreference.indexOf(sourceType);
  return rank === -1 ? metric.sourcePreference.length + 1 : rank;
}

export function resolveThesisMetric(
  metricKey: string,
  evidence: readonly ThesisEvidenceInput[],
): ThesisMetricResolution {
  const metric = getThesisMetricDefinition(metricKey);
  if (!metric) throw new Error(`Unknown thesis metric: ${metricKey}`);

  const candidates = evidence
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.metricKey === metricKey && isCompatibleValue(metric, item.observedValue))
    .sort((left, right) => {
      const sourceDelta = sourceRank(metric, left.item.sourceType) - sourceRank(metric, right.item.sourceType);
      if (sourceDelta !== 0) return sourceDelta;
      const reportedDelta = Number(right.item.reported) - Number(left.item.reported);
      if (reportedDelta !== 0) return reportedDelta;
      const confidenceDelta = right.item.confidenceBps - left.item.confidenceBps;
      if (confidenceDelta !== 0) return confidenceDelta;
      const dateDelta = evidenceDate(right.item) - evidenceDate(left.item);
      if (dateDelta !== 0) return dateDelta;
      return left.index - right.index;
    });

  const selected = candidates[0]?.item;
  if (!selected || !isCompatibleValue(metric, selected.observedValue)) {
    return {
      status: 'UNKNOWN',
      metric,
      reason: `No type-compatible evidence is available for ${metricKey}`,
    };
  }

  return {
    status: 'RESOLVED',
    metric,
    resolved: {
      metric,
      value: typeof selected.observedValue === 'string' ? selected.observedValue.trim() : selected.observedValue,
      evidence: selected,
    },
  };
}

function compareCriterion(criterion: ThesisCriterionInput, value: number | boolean | string): boolean {
  switch (criterion.operator) {
    case 'GT':
      return typeof value === 'number' && value > (criterion.numericValue as number);
    case 'GTE':
      return typeof value === 'number' && value >= (criterion.numericValue as number);
    case 'LT':
      return typeof value === 'number' && value < (criterion.numericValue as number);
    case 'LTE':
      return typeof value === 'number' && value <= (criterion.numericValue as number);
    case 'BETWEEN':
      return typeof value === 'number' && value >= (criterion.numericMin as number) && value <= (criterion.numericMax as number);
    case 'EQ':
      if (typeof value === 'number') return value === criterion.numericValue;
      if (typeof value === 'string') return value.toLocaleLowerCase() === criterion.textValue?.trim().toLocaleLowerCase();
      return false;
    case 'CONTAINS':
      return typeof value === 'string' && value.toLocaleLowerCase().includes(criterion.textValue?.trim().toLocaleLowerCase() ?? '');
    case 'IS_TRUE':
      return value === true;
    case 'IS_FALSE':
      return value === false;
  }
}

export function evaluateThesisCriterion(
  criterion: ThesisCriterionInput,
  evidence: readonly ThesisEvidenceInput[],
): ThesisCriterionEvaluation {
  const resolution = resolveThesisMetric(criterion.metricKey, evidence);
  if (resolution.status === 'UNKNOWN' || !resolution.resolved) {
    return {
      criterion,
      outcome: 'UNKNOWN',
      reason: resolution.reason ?? `No evidence resolved for ${criterion.metricKey}`,
    };
  }

  const passed = compareCriterion(criterion, resolution.resolved.value);
  return {
    criterion,
    outcome: passed ? 'PASS' : 'FAIL',
    resolved: resolution.resolved,
    reason: passed ? 'Resolved evidence satisfies the criterion' : 'Resolved evidence does not satisfy the criterion',
  };
}

function clampBasisPoints(value: number): number {
  return Math.max(0, Math.min(10_000, Math.round(value)));
}

export function evaluateThesis(
  criteria: readonly ThesisCriterionInput[],
  evidence: readonly ThesisEvidenceInput[],
): ThesisEvaluationSummary {
  const evaluations = criteria.map((criterion) => evaluateThesisCriterion(criterion, evidence));
  const totalWeightBps = criteria.reduce((sum, criterion) => sum + criterion.weightBps, 0);
  const known = evaluations.filter((evaluation) => evaluation.outcome !== 'UNKNOWN');
  const passed = evaluations.filter((evaluation) => evaluation.outcome === 'PASS');
  const knownWeightBps = known.reduce((sum, evaluation) => sum + evaluation.criterion.weightBps, 0);
  const passedWeightBps = passed.reduce((sum, evaluation) => sum + evaluation.criterion.weightBps, 0);

  const scoreBps = totalWeightBps === 0 ? 0 : clampBasisPoints((passedWeightBps / totalWeightBps) * 10_000);
  const coverageBps = totalWeightBps === 0 ? 0 : clampBasisPoints((knownWeightBps / totalWeightBps) * 10_000);
  const confidenceNumerator = known.reduce(
    (sum, evaluation) => sum + evaluation.criterion.weightBps * (evaluation.resolved?.evidence.confidenceBps ?? 0),
    0,
  );
  const confidenceBps = totalWeightBps === 0 ? 0 : clampBasisPoints(confidenceNumerator / totalWeightBps);

  const required = evaluations.filter((evaluation) => evaluation.criterion.importance === 'REQUIRED');
  const requiredOutcome: true | false | null = required.some((evaluation) => evaluation.outcome === 'FAIL')
    ? false
    : required.some((evaluation) => evaluation.outcome === 'UNKNOWN')
      ? null
      : true;

  const decision: ThesisEvaluationDecision = requiredOutcome === false
    ? 'REJECTED'
    : requiredOutcome === null || evaluations.some((evaluation) => evaluation.outcome === 'UNKNOWN')
      ? 'INSUFFICIENT_EVIDENCE'
      : 'QUALIFIED';

  return {
    decision,
    scoreBps,
    coverageBps,
    confidenceBps,
    totalWeightBps,
    knownWeightBps,
    passedWeightBps,
    requiredOutcome,
    criteria: evaluations,
  };
}
