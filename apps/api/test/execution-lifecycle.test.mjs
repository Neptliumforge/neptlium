import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ambiguousSubmissionError,
  executionLifecycleFromSubmissionDisposition,
  executionLifecycleSemantics,
  normalizeExecutionLifecycle,
} from '../dist/execution/index.js';

test('normalizes known provider lifecycle without inventing reconciliation', () => {
  assert.equal(normalizeExecutionLifecycle('accepted'), 'OPEN');
  assert.equal(normalizeExecutionLifecycle('PARTIALLY_FILLED'), 'PARTIALLY_FILLED');
  assert.equal(normalizeExecutionLifecycle('filled'), 'FILLED');
  assert.equal(normalizeExecutionLifecycle('cancelled'), 'CANCELLED');
  assert.equal(normalizeExecutionLifecycle('canceled'), 'CANCELLED');
  assert.equal(normalizeExecutionLifecycle('rejected'), 'REJECTED');
  assert.equal(normalizeExecutionLifecycle('expired'), 'EXPIRED');
  assert.equal(normalizeExecutionLifecycle('provider_future_state'), 'UNKNOWN');
});

test('filled is terminal for the provider order but still requires reconciliation', () => {
  const semantics = executionLifecycleSemantics('FILLED');
  assert.equal(semantics.terminalOrderState, true);
  assert.equal(semantics.reconciliationRequired, true);
  assert.equal(semantics.automaticRetryAllowed, false);
});

test('unknown provider state stays unknown and requires lookup before retry', () => {
  const semantics = executionLifecycleSemantics('UNKNOWN');
  assert.equal(semantics.terminalOrderState, false);
  assert.equal(semantics.reconciliationRequired, true);
  assert.equal(semantics.lookupRequiredBeforeRetry, true);
  assert.equal(semantics.automaticRetryAllowed, false);
});

test('ambiguous submission maps to submission-unknown and is structurally non-retryable', () => {
  assert.equal(executionLifecycleFromSubmissionDisposition('AMBIGUOUS'), 'SUBMISSION_UNKNOWN');
  assert.equal(executionLifecycleFromSubmissionDisposition('CONFIRMED_NOT_SUBMITTED'), 'NOT_SUBMITTED');

  const semantics = executionLifecycleSemantics('SUBMISSION_UNKNOWN');
  assert.equal(semantics.terminalOrderState, false);
  assert.equal(semantics.automaticRetryAllowed, false);
  assert.equal(semantics.lookupRequiredBeforeRetry, true);
  assert.equal(semantics.reconciliationRequired, true);

  const error = ambiguousSubmissionError();
  assert.equal(error.code, 'EXECUTION_SUBMISSION_AMBIGUOUS');
  assert.equal(error.reconciliationRequired, true);
});

test('provider unavailable and not-submitted remain distinct from ambiguous submission', () => {
  assert.equal(executionLifecycleSemantics('PROVIDER_UNAVAILABLE').lookupRequiredBeforeRetry, false);
  assert.equal(executionLifecycleSemantics('NOT_SUBMITTED').terminalOrderState, true);
});
