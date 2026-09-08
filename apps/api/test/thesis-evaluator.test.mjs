import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateThesis,
  evaluateThesisCriterion,
  resolveThesisMetric,
} from '../dist/thesis-evaluator.js';

const criterion = {
  metricKey: 'revenue_growth_yoy',
  kind: 'QUANTITATIVE',
  operator: 'GTE',
  numericValue: 25,
  weightBps: 6000,
  importance: 'REQUIRED',
  position: 0,
};

function evidence(overrides = {}) {
  return {
    subjectType: 'company',
    subjectKey: 'example-company',
    metricKey: 'revenue_growth_yoy',
    claim: 'Revenue growth evidence',
    observedValue: 31,
    sourceType: 'FILINGS',
    sourceDate: '2026-08-01',
    confidenceBps: 9000,
    reported: true,
    derived: false,
    ...overrides,
  };
}

test('metric resolution respects governed source preference before confidence', () => {
  const resolution = resolveThesisMetric('revenue_growth_yoy', [
    evidence({ sourceType: 'COMPANY', observedValue: 50, confidenceBps: 9900 }),
    evidence({ sourceType: 'FILINGS', observedValue: 31, confidenceBps: 8000 }),
  ]);

  assert.equal(resolution.status, 'RESOLVED');
  assert.equal(resolution.resolved?.value, 31);
  assert.equal(resolution.resolved?.evidence.sourceType, 'FILINGS');
});

test('metric resolution ignores type-incompatible evidence instead of coercing it', () => {
  const resolution = resolveThesisMetric('revenue_growth_yoy', [
    evidence({ observedValue: '31%' }),
  ]);

  assert.equal(resolution.status, 'UNKNOWN');
  assert.match(resolution.reason ?? '', /type-compatible evidence/);
});

test('criterion evaluation is three-state and missing evidence stays unknown', () => {
  assert.equal(evaluateThesisCriterion(criterion, [evidence({ observedValue: 30 })]).outcome, 'PASS');
  assert.equal(evaluateThesisCriterion(criterion, [evidence({ observedValue: 20 })]).outcome, 'FAIL');
  assert.equal(evaluateThesisCriterion(criterion, []).outcome, 'UNKNOWN');
});

test('qualitative and boolean criteria evaluate without numeric coercion', () => {
  const switching = {
    metricKey: 'switching_costs',
    kind: 'QUALITATIVE',
    operator: 'CONTAINS',
    textValue: 'high',
    weightBps: 2000,
    importance: 'PREFERRED',
    position: 1,
  };
  const founderLed = {
    metricKey: 'founder_led',
    kind: 'QUALITATIVE',
    operator: 'IS_TRUE',
    weightBps: 2000,
    importance: 'PREFERRED',
    position: 2,
  };

  assert.equal(evaluateThesisCriterion(switching, [evidence({
    metricKey: 'switching_costs',
    observedValue: 'High integration and workflow switching costs',
    sourceType: 'RESEARCH',
  })]).outcome, 'PASS');

  assert.equal(evaluateThesisCriterion(founderLed, [evidence({
    metricKey: 'founder_led',
    observedValue: true,
    sourceType: 'FILINGS',
  })]).outcome, 'PASS');
});

test('weighted score does not inflate when evidence is missing', () => {
  const preferred = {
    metricKey: 'gross_margin',
    kind: 'QUANTITATIVE',
    operator: 'GTE',
    numericValue: 70,
    weightBps: 4000,
    importance: 'PREFERRED',
    position: 1,
  };

  const result = evaluateThesis([criterion, preferred], [evidence({ observedValue: 30, confidenceBps: 9000 })]);
  assert.equal(result.decision, 'INSUFFICIENT_EVIDENCE');
  assert.equal(result.scoreBps, 6000);
  assert.equal(result.coverageBps, 6000);
  assert.equal(result.confidenceBps, 5400);
  assert.equal(result.requiredOutcome, true);
});

test('required failures reject even when aggregate weighted score is otherwise strong', () => {
  const preferred = {
    metricKey: 'gross_margin',
    kind: 'QUANTITATIVE',
    operator: 'GTE',
    numericValue: 70,
    weightBps: 4000,
    importance: 'PREFERRED',
    position: 1,
  };

  const result = evaluateThesis([criterion, preferred], [
    evidence({ observedValue: 20, confidenceBps: 9500 }),
    evidence({ metricKey: 'gross_margin', observedValue: 80, confidenceBps: 9500 }),
  ]);

  assert.equal(result.decision, 'REJECTED');
  assert.equal(result.requiredOutcome, false);
  assert.equal(result.scoreBps, 4000);
  assert.equal(result.coverageBps, 10000);
  assert.equal(result.confidenceBps, 9500);
});
