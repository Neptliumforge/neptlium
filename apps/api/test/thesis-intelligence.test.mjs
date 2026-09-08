import assert from 'node:assert/strict';
import test from 'node:test';
import { explainThesisEvaluation, proposeThesisFromText } from '../dist/thesis-intelligence.js';
import { evaluateThesis } from '../dist/thesis-evaluator.js';

test('deterministic proposal converts mandate language into governed criteria', async () => {
  const proposal = await proposeThesisFromText(`
Thesis: Growth Software Mandate
Strategy: Growth Equity
Sectors: Fintech, Enterprise Software, AI Infrastructure
Geographies: US, Europe
Revenue growth >25%
Gross margin >65%
NRR >110%
Maximum valuation: 12x forward revenue
Founder ownership >10%
Founder-led
Regulatory exposure: low
Required return: 25% IRR
  `);

  assert.equal(proposal.source, 'DETERMINISTIC');
  assert.equal(proposal.thesis.name, 'Growth Software Mandate');
  assert.equal(proposal.thesis.strategy, 'GROWTH_EQUITY');
  assert.deepEqual(proposal.thesis.sectors, ['Fintech', 'Enterprise Software', 'AI Infrastructure']);
  assert.deepEqual(proposal.thesis.geographies, ['US', 'Europe']);
  assert.equal(proposal.criteria.reduce((sum, criterion) => sum + criterion.weightBps, 0), 10000);
  assert.equal(proposal.criteria.find((criterion) => criterion.metricKey === 'revenue_growth_yoy')?.operator, 'GT');
  assert.equal(proposal.criteria.find((criterion) => criterion.metricKey === 'gross_margin')?.numericValue, 65);
  assert.equal(proposal.criteria.find((criterion) => criterion.metricKey === 'net_revenue_retention')?.numericValue, 110);
  assert.equal(proposal.criteria.find((criterion) => criterion.metricKey === 'ev_revenue_forward')?.operator, 'LTE');
  assert.equal(proposal.criteria.find((criterion) => criterion.metricKey === 'founder_led')?.operator, 'IS_TRUE');
  assert.match(proposal.warnings.join(' '), /IRR/);
});

test('model proposals are never trusted before registry and type validation', async () => {
  const model = {
    async propose() {
      return {
        thesis: { name: 'Model Proposal', strategy: 'GROWTH_EQUITY', sectors: [], geographies: [] },
        criteria: [{ metricKey: 'imaginary_metric', kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 20, importance: 'REQUIRED' }],
      };
    },
  };
  await assert.rejects(() => proposeThesisFromText('A valid mandate source text long enough.', model), (error) => error.code === 'thesis_intelligence_invalid');
});

test('valid model proposals are normalized through governed contracts', async () => {
  const model = {
    async propose() {
      return {
        thesis: { name: 'Validated Model Thesis', strategy: 'PUBLIC_EQUITY', sectors: ['Software'], geographies: ['US'] },
        criteria: [
          { metricKey: 'revenue_growth_yoy', kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 20, importance: 'REQUIRED' },
          { metricKey: 'gross_margin', kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 70, importance: 'PREFERRED' },
        ],
      };
    },
  };
  const proposal = await proposeThesisFromText('Public equity software mandate with durable growth.', model);
  assert.equal(proposal.source, 'MODEL');
  assert.deepEqual(proposal.criteria.map((criterion) => criterion.weightBps), [5000, 5000]);
});

test('explanation is derived only from deterministic evaluation and preserves evidence gaps', () => {
  const criteria = [
    { metricKey: 'revenue_growth_yoy', kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 25, weightBps: 6000, importance: 'REQUIRED', position: 0 },
    { metricKey: 'gross_margin', kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 70, weightBps: 4000, importance: 'PREFERRED', position: 1 },
  ];
  const evidence = [{
    subjectType: 'company', subjectKey: 'example', metricKey: 'revenue_growth_yoy', claim: 'Reported growth', observedValue: 31,
    sourceType: 'FILINGS', sourceUri: 'https://example.test/filing', confidenceBps: 9200, reported: true, derived: false,
  }];
  const explanation = explainThesisEvaluation(evaluateThesis(criteria, evidence));
  assert.equal(explanation.decision, 'INSUFFICIENT_EVIDENCE');
  assert.equal(explanation.positives.length, 1);
  assert.equal(explanation.evidenceGaps.length, 1);
  assert.equal(explanation.evidenceLedger[0].sourceType, 'FILINGS');
  assert.equal(explanation.evidenceLedger[0].confidenceBps, 9200);
});
