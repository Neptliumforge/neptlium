import assert from 'node:assert/strict';
import test from 'node:test';
import {
  disputeIsFinalLoss,
  isCanonicalPaymentTruth,
  paymentAttemptId,
  paymentEvidence,
  paymentFoundationMode,
  paymentId,
  paymentProviderId,
  paymentResubmissionSemantics,
  paymentStateIsKnown,
  refundIsComplete,
  settlementIsReconciled,
} from '../dist/payments/index.js';

const payment = paymentId('neptlium-payment-1');
const firstAttempt = paymentAttemptId('neptlium-attempt-1');
const secondAttempt = paymentAttemptId('neptlium-attempt-2');
const firstProvider = paymentProviderId('provider-a');
const secondProvider = paymentProviderId('provider-b');

test('Neptlium payment identity remains separate from provider and attempt identity', () => {
  assert.equal(payment, 'neptlium-payment-1');
  assert.notEqual(payment, firstAttempt);
  assert.notEqual(firstAttempt, secondAttempt);
  assert.notEqual(payment, 'provider-payment-intent-1');
});

test('one payment can retain identity across multiple bounded attempts', () => {
  const attempts = [
    { id: firstAttempt, paymentId: payment, provider: firstProvider },
    { id: secondAttempt, paymentId: payment, provider: secondProvider },
  ];

  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].paymentId, payment);
  assert.equal(attempts[1].paymentId, payment);
  assert.notEqual(attempts[0].id, attempts[1].id);
  assert.notEqual(attempts[0].provider, attempts[1].provider);
});

test('submission unknown prohibits retry and alternate-provider submission', () => {
  const semantics = paymentResubmissionSemantics('SUBMISSION_UNKNOWN');
  assert.equal(semantics.automaticRetryAllowed, false);
  assert.equal(semantics.alternateProviderSubmissionAllowed, false);
  assert.equal(semantics.providerLookupRequired, true);
  assert.equal(semantics.reconciliationRequired, true);
  assert.equal(semantics.duplicateSubmissionProhibited, true);
});

test('only confirmed not-submitted state permits consideration of another provider', () => {
  const semantics = paymentResubmissionSemantics('NOT_SUBMITTED');
  assert.equal(semantics.automaticRetryAllowed, false);
  assert.equal(semantics.alternateProviderSubmissionAllowed, true);
  assert.equal(semantics.providerLookupRequired, false);
  assert.equal(semantics.duplicateSubmissionProhibited, false);
});

test('authorized and captured attempts cannot be treated as safe to resubmit', () => {
  for (const state of ['AUTHORIZED', 'CAPTURED']) {
    const semantics = paymentResubmissionSemantics(state);
    assert.equal(semantics.automaticRetryAllowed, false);
    assert.equal(semantics.alternateProviderSubmissionAllowed, false);
    assert.equal(semantics.duplicateSubmissionProhibited, true);
  }
});

test('settlement observation is not reconciliation', () => {
  assert.equal(settlementIsReconciled('OBSERVED'), false);
  assert.equal(settlementIsReconciled('PENDING'), false);
  assert.equal(settlementIsReconciled('RECONCILED'), true);
});

test('refund requested is not refunded and dispute open is not final loss', () => {
  assert.equal(refundIsComplete('REQUESTED'), false);
  assert.equal(refundIsComplete('REFUNDED'), true);
  assert.equal(disputeIsFinalLoss('OPEN'), false);
  assert.equal(disputeIsFinalLoss('LOST'), true);
});

test('unknown payment state is preserved as unknown', () => {
  assert.equal(paymentStateIsKnown('UNKNOWN'), false);
  assert.equal(paymentStateIsKnown('FAILED'), true);
  assert.equal(paymentStateIsKnown('COMPLETED'), true);
});

test('provider payment evidence remains non-canonical financial truth', () => {
  const evidence = paymentEvidence({
    id: 'evidence-1',
    paymentId: payment,
    attemptId: firstAttempt,
    provider: firstProvider,
    environment: 'TEST',
    source: 'SUBMISSION_RESPONSE',
    operation: 'PAYMENT_SUBMISSION',
    providerReference: 'provider-payment-intent-1',
    observedAt: '2026-10-01T00:00:00.000Z',
    receivedAt: '2026-10-01T00:00:01.000Z',
    providerNativeState: 'succeeded',
    providerNativeReason: null,
    payloadDigest: 'sha256:fixture',
    payloadReference: null,
    schemaVersion: 1,
  });

  assert.equal(evidence.authority, 'PROVIDER_EVIDENCE');
  assert.equal(evidence.canonical, false);
  assert.equal(evidence.paymentId, payment);
  assert.notEqual(evidence.providerReference, evidence.paymentId);
  assert.equal(isCanonicalPaymentTruth(evidence), false);
});

test('payment foundation is domain-only and grants providers no execution authority', () => {
  assert.equal(paymentFoundationMode, 'DOMAIN_ONLY');
  assert.equal(firstProvider, 'PROVIDER-A');
});
