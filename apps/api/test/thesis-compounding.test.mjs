import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateThesisDrift, rankThesisOpportunities } from '../dist/thesis-compounding.js';

const criterion = (metricKey, outcome, value) => ({
  criterion: { metricKey, kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 1, weightBps: 5000, importance: 'PREFERRED', position: 0 },
  outcome,
  ...(value === undefined ? {} : { resolved: { metric: { key: metricKey }, value, evidence: { confidenceBps: 9000 } } }),
  reason: outcome,
});
const snapshot = ({ id, key, version = 1, score, at, decision = 'QUALIFIED', criteria = [] }) => ({
  id, ownerId: 'owner', thesisId: 'thesis', thesisVersion: version, subjectType: 'company', subjectKey: key,
  decision, scoreBps: score, coverageBps: 10000, confidenceBps: 9000,
  summary: { decision, scoreBps: score, coverageBps: 10000, confidenceBps: 9000, totalWeightBps: 10000, knownWeightBps: 10000, passedWeightBps: score, requiredOutcome: true, criteria },
  evaluatedBy: 'owner', evaluatedAt: at,
});

test('drift compares only the latest two evaluations under the same thesis version', () => {
  const current = snapshot({ id: '2', key: 'acme', score: 7000, at: '2026-09-08T02:00:00Z', criteria: [criterion('revenue_growth_yoy', 'FAIL', 20)] });
  const previous = snapshot({ id: '1', key: 'acme', score: 9000, at: '2026-09-01T02:00:00Z', criteria: [criterion('revenue_growth_yoy', 'PASS', 31)] });
  const drift = calculateThesisDrift([current, previous]);
  assert.equal(drift.state, 'COMPARABLE');
  assert.equal(drift.direction, 'WEAKENED');
  assert.equal(drift.scoreDeltaBps, -2000);
  assert.deepEqual(drift.changedCriteria[0], { metricKey: 'revenue_growth_yoy', previousOutcome: 'PASS', currentOutcome: 'FAIL', previousValue: 31, currentValue: 20 });
});

test('drift refuses to compare across thesis versions', () => {
  const drift = calculateThesisDrift([
    snapshot({ id: '2', key: 'acme', version: 2, score: 7000, at: '2026-09-08T02:00:00Z' }),
    snapshot({ id: '1', key: 'acme', version: 1, score: 9000, at: '2026-09-01T02:00:00Z' }),
  ]);
  assert.equal(drift.state, 'NOT_COMPARABLE');
  assert.match(drift.reason, /version changed/i);
});

test('opportunity ranking uses only the latest snapshot per subject and remains deterministic', () => {
  const ranked = rankThesisOpportunities([
    snapshot({ id: 'a2', key: 'alpha', score: 8000, at: '2026-09-08T03:00:00Z' }),
    snapshot({ id: 'a1', key: 'alpha', score: 9500, at: '2026-09-01T03:00:00Z' }),
    snapshot({ id: 'b1', key: 'beta', score: 8500, at: '2026-09-08T02:00:00Z' }),
    snapshot({ id: 'c1', key: 'gamma', score: 9900, at: '2026-09-08T04:00:00Z', decision: 'REJECTED' }),
  ]);
  assert.deepEqual(ranked.map((item) => item.subjectKey), ['beta', 'alpha', 'gamma']);
  assert.equal(ranked.find((item) => item.subjectKey === 'alpha').scoreBps, 8000);
});
