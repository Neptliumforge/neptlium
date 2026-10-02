import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ExecutionDomainError,
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
  assert.equal(executionLifecycleFromSubmissionDisposition('TIMEOUT'), 'SUBMISSION_UNKNOWN');
  assert.equal(executionLifecycleFromSubmissionDisposition(undefined), 'SUBMISSION_UNKNOWN');

  const semantics = executionLifecycleSemantics('SUBMISSION_UNKNOWN');
  assert.equal(semantics.terminalOrderState, false);
  assert.equal(semantics.automaticRetryAllowed, false);
  assert.equal(semantics.lookupRequiredBeforeRetry, true);
  assert.equal(semantics.reconciliationRequired, true);

  const error = ambiguousSubmissionError();
  assert.equal(error.code, 'EXECUTION_SUBMISSION_AMBIGUOUS');
  assert.equal(error.reconciliationRequired, true);
});

test('reconciliation-required error codes cannot be constructed with a false reconciliation flag', () => {
  assert.equal(new ExecutionDomainError('EXECUTION_RECONCILIATION_REQUIRED', 'fixture').reconciliationRequired, true);
  assert.equal(new ExecutionDomainError('EXECUTION_SUBMISSION_AMBIGUOUS', 'fixture').reconciliationRequired, true);
  assert.equal(new ExecutionDomainError('EXECUTION_PROVIDER_STATE_UNKNOWN', 'fixture').reconciliationRequired, true);
  assert.equal(new ExecutionDomainError('EXECUTION_INPUT_INVALID', 'fixture').reconciliationRequired, false);
});

test('provider unavailable requires lookup and reconciliation while confirmed not-submitted does not', () => {
  const unavailable = executionLifecycleSemantics('PROVIDER_UNAVAILABLE');
  assert.equal(unavailable.terminalOrderState, false);
  assert.equal(unavailable.reconciliationRequired, true);
  assert.equal(unavailable.lookupRequiredBeforeRetry, true);
  assert.equal(unavailable.automaticRetryAllowed, false);

  const notSubmitted = executionLifecycleSemantics('NOT_SUBMITTED');
  assert.equal(notSubmitted.terminalOrderState, true);
  assert.equal(notSubmitted.reconciliationRequired, false);
  assert.equal(notSubmitted.lookupRequiredBeforeRetry, false);
});
