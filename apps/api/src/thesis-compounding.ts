import type { ThesisEvaluationSummary } from './thesis-evaluator.js';
import type { ThesisEvaluationSnapshot } from './thesis-repository.js';

export type ThesisDecisionStatus = 'WATCH' | 'INTERESTED' | 'PASS' | 'INVESTED' | 'EXITED';

export interface ThesisDecisionEvent {
  readonly id: string;
  readonly ownerId: string;
  readonly thesisId: string;
  readonly thesisVersion: number;
  readonly subjectType: string;
  readonly subjectKey: string;
  readonly status: ThesisDecisionStatus;
  readonly rationale?: string;
  readonly evaluationId?: string;
  readonly decidedBy: string;
  readonly decidedAt: string;
}

export interface ThesisDrift {
  readonly state: 'COMPARABLE' | 'NOT_COMPARABLE';
  readonly reason?: string;
  readonly current: ThesisEvaluationSnapshot;
  readonly previous?: ThesisEvaluationSnapshot;
  readonly scoreDeltaBps?: number;
  readonly coverageDeltaBps?: number;
  readonly confidenceDeltaBps?: number;
  readonly direction?: 'STRENGTHENED' | 'WEAKENED' | 'UNCHANGED';
  readonly changedCriteria: readonly {
    readonly metricKey: string;
    readonly previousOutcome: 'PASS' | 'FAIL' | 'UNKNOWN';
    readonly currentOutcome: 'PASS' | 'FAIL' | 'UNKNOWN';
    readonly previousValue?: number | boolean | string;
    readonly currentValue?: number | boolean | string;
  }[];
}

function criterionMap(summary: ThesisEvaluationSummary) {
  return new Map(summary.criteria.map((item) => [item.criterion.metricKey, item]));
}

export function calculateThesisDrift(history: readonly ThesisEvaluationSnapshot[]): ThesisDrift | null {
  const current = history[0];
  if (!current) return null;
  const previous = history[1];
  if (!previous) return { state: 'NOT_COMPARABLE', reason: 'A prior evaluation is required to calculate drift', current };
  if (current.thesisVersion !== previous.thesisVersion) {
    return { state: 'NOT_COMPARABLE', reason: 'Thesis version changed between evaluations', current, previous };
  }

  const currentCriteria = criterionMap(current.summary);
  const previousCriteria = criterionMap(previous.summary);
  const keys = new Set([...currentCriteria.keys(), ...previousCriteria.keys()]);
  const changedCriteria = [...keys].flatMap((metricKey) => {
    const now = currentCriteria.get(metricKey);
    const before = previousCriteria.get(metricKey);
    if (!now || !before) return [];
    const previousValue = before.resolved?.value;
    const currentValue = now.resolved?.value;
    if (now.outcome === before.outcome && currentValue === previousValue) return [];
    return [{
      metricKey,
      previousOutcome: before.outcome,
      currentOutcome: now.outcome,
      ...(previousValue === undefined ? {} : { previousValue }),
      ...(currentValue === undefined ? {} : { currentValue }),
    }];
  });

  const scoreDeltaBps = current.scoreBps - previous.scoreBps;
  return {
    state: 'COMPARABLE',
    current,
    previous,
    scoreDeltaBps,
    coverageDeltaBps: current.coverageBps - previous.coverageBps,
    confidenceDeltaBps: current.confidenceBps - previous.confidenceBps,
    direction: scoreDeltaBps > 0 ? 'STRENGTHENED' : scoreDeltaBps < 0 ? 'WEAKENED' : 'UNCHANGED',
    changedCriteria,
  };
}

export interface ThesisOpportunity {
  readonly rank: number;
  readonly subjectType: string;
  readonly subjectKey: string;
  readonly decision: ThesisEvaluationSummary['decision'];
  readonly scoreBps: number;
  readonly coverageBps: number;
  readonly confidenceBps: number;
  readonly evaluatedAt: string;
}

function decisionRank(decision: ThesisEvaluationSummary['decision']) {
  return decision === 'QUALIFIED' ? 0 : decision === 'INSUFFICIENT_EVIDENCE' ? 1 : 2;
}

export function rankThesisOpportunities(snapshots: readonly ThesisEvaluationSnapshot[], limit = 50): ThesisOpportunity[] {
  const latest = new Map<string, ThesisEvaluationSnapshot>();
  for (const snapshot of snapshots) {
    const key = `${snapshot.subjectType}\u0000${snapshot.subjectKey}`;
    const existing = latest.get(key);
    if (!existing || Date.parse(snapshot.evaluatedAt) > Date.parse(existing.evaluatedAt)) latest.set(key, snapshot);
  }
  return [...latest.values()]
    .sort((a, b) => decisionRank(a.decision) - decisionRank(b.decision)
      || b.scoreBps - a.scoreBps
      || b.coverageBps - a.coverageBps
      || b.confidenceBps - a.confidenceBps
      || Date.parse(b.evaluatedAt) - Date.parse(a.evaluatedAt)
      || a.subjectKey.localeCompare(b.subjectKey))
    .slice(0, Math.max(1, Math.min(200, limit)))
    .map((snapshot, index) => ({
      rank: index + 1,
      subjectType: snapshot.subjectType,
      subjectKey: snapshot.subjectKey,
      decision: snapshot.decision,
      scoreBps: snapshot.scoreBps,
      coverageBps: snapshot.coverageBps,
      confidenceBps: snapshot.confidenceBps,
      evaluatedAt: snapshot.evaluatedAt,
    }));
}
