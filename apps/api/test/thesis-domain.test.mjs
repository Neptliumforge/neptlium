import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateThesisCriterion,
  validateThesisEvidence,
  validateThesisInput,
} from '../dist/thesis-domain.js';
import {
  assertThesisMetricRegistryIntegrity,
  getThesisMetricDefinition,
  thesisMetricRegistry,
} from '../dist/thesis-metric-registry.js';

const baseThesis = {
  name: 'Growth Equity',
  strategy: 'GROWTH_EQUITY',
  sectors: ['Software', 'Fintech'],
  geographies: ['United States', 'Europe'],
};

const baseCriterion = {
  weightBps: 1000,
  importance: 'PREFERRED',
  position: 1,
};

test('thesis input normalizes text and rejects duplicate governed dimensions', () => {
  assert.deepEqual(validateThesisInput({ ...baseThesis, name: '  Growth Equity  ' }).name, 'Growth Equity');
  assert.throws(
    () => validateThesisInput({ ...baseThesis, sectors: ['Software', 'software'] }),
    /duplicate entries/,
  );
});

test('governed thesis metric registry is unique and complete', () => {
  assert.doesNotThrow(() => assertThesisMetricRegistryIntegrity());
  assert.ok(thesisMetricRegistry.length >= 15);
  assert.equal(getThesisMetricDefinition('revenue_growth_yoy')?.valueType, 'PERCENTAGE');
  assert.equal(getThesisMetricDefinition('switching_costs')?.qualitative, true);
  assert.equal(getThesisMetricDefinition('not_a_metric'), null);
});

test('quantitative criteria require governed metrics and operator values', () => {
  const criterion = validateThesisCriterion({
    metricKey: 'revenue_growth_yoy',
    kind: 'QUANTITATIVE',
    operator: 'GTE',
    numericValue: 25,
    weightBps: 2500,
    importance: 'REQUIRED',
    position: 0,
  });
  assert.equal(criterion.metricKey, 'revenue_growth_yoy');
  assert.throws(
    () => validateThesisCriterion({ ...criterion, metricKey: 'invented_metric' }),
    /Unknown thesis metric/,
  );
  assert.throws(
    () => validateThesisCriterion({ ...criterion, numericValue: undefined }),
    /requires numericValue/,
  );
});

test('criterion operators must match governed metric value types', () => {
  assert.throws(() => validateThesisCriterion({
    ...baseCriterion,
    metricKey: 'revenue_growth_yoy',
    kind: 'QUANTITATIVE',
    operator: 'CONTAINS',
    textValue: '25',
  }), /requires a text metric/);

  assert.throws(() => validateThesisCriterion({
    ...baseCriterion,
    metricKey: 'switching_costs',
    kind: 'QUALITATIVE',
    operator: 'GT',
    numericValue: 1,
  }), /requires a numeric metric/);

  assert.throws(() => validateThesisCriterion({
    ...baseCriterion,
    metricKey: 'gross_margin',
    kind: 'QUANTITATIVE',
    operator: 'EQ',
  }), /requires numericValue/);
});

test('boolean criteria require explicit boolean operators', () => {
  assert.doesNotThrow(() => validateThesisCriterion({
    ...baseCriterion,
    metricKey: 'founder_led',
    kind: 'QUALITATIVE',
    operator: 'IS_TRUE',
  }));

  assert.throws(() => validateThesisCriterion({
    ...baseCriterion,
    metricKey: 'founder_led',
    kind: 'QUALITATIVE',
    operator: 'EQ',
  }), /require IS_TRUE or IS_FALSE/);
});

test('qualitative metrics cannot silently become quantitative criteria', () => {
  assert.throws(
    () => validateThesisCriterion({
      metricKey: 'switching_costs',
      kind: 'QUANTITATIVE',
      operator: 'EQ',
      textValue: 'strong',
      weightBps: 1000,
      importance: 'PREFERRED',
      position: 1,
    }),
    /registered as qualitative/,
  );
});

test('evidence preserves reported-versus-derived truth distinction', () => {
  assert.doesNotThrow(() => validateThesisEvidence({
    subjectType: 'company',
    subjectKey: 'example-company',
    metricKey: 'gross_margin',
    claim: 'Gross margin was reported as 72%.',
    observedValue: 72,
    sourceType: 'FILINGS',
    sourceUri: 'https://example.com/filing',
    confidenceBps: 9800,
    reported: true,
    derived: false,
  }));

  assert.throws(() => validateThesisEvidence({
    subjectType: 'company',
    subjectKey: 'example-company',
    claim: 'Ambiguous evidence',
    sourceType: 'RESEARCH',
    confidenceBps: 5000,
    reported: true,
    derived: true,
  }), /cannot be both reported and derived/);
});
