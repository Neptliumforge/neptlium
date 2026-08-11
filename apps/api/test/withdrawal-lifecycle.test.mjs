import assert from 'node:assert/strict';
import test from 'node:test';
import {
  rejectionRequiresReservationRelease,
  transitionWithdrawal,
  withdrawalMayReconcile,
  withdrawalMaySettle,
  withdrawalMaySubmit,
} from '../dist/withdrawal-lifecycle.js';

test('withdrawal control lifecycle requires reservation before manual approval', () => {
  assert.equal(transitionWithdrawal('REQUESTED', 'RESERVED'), 'RESERVED');
  assert.equal(transitionWithdrawal('RESERVED', 'PENDING_APPROVAL'), 'PENDING_APPROVAL');
  assert.equal(transitionWithdrawal('PENDING_APPROVAL', 'APPROVED'), 'APPROVED');
  assert.throws(() => transitionWithdrawal('REQUESTED', 'APPROVED'));
  assert.throws(() => transitionWithdrawal('PENDING_APPROVAL', 'SUBMITTED'));
});

test('operator approval authorizes submission but never settlement', () => {
  assert.equal(withdrawalMaySubmit({ lifecycle: 'APPROVED', reservationActive: true, operatorApproved: true }), true);
  assert.equal(withdrawalMaySubmit({ lifecycle: 'APPROVED', reservationActive: false, operatorApproved: true }), false);
  assert.equal(withdrawalMaySettle({ lifecycle: 'APPROVED', providerSettlementEvidence: true }), false);
  assert.equal(withdrawalMaySettle({ lifecycle: 'SUBMITTED', providerSettlementEvidence: false }), false);
  assert.equal(withdrawalMaySettle({ lifecycle: 'SUBMITTED', providerSettlementEvidence: true }), true);
});

test('reconciliation requires settled state and matched evidence', () => {
  assert.equal(withdrawalMayReconcile({ lifecycle: 'SETTLED', reconciliationMatched: true }), true);
  assert.equal(withdrawalMayReconcile({ lifecycle: 'SUBMITTED', reconciliationMatched: true }), false);
  assert.equal(withdrawalMayReconcile({ lifecycle: 'SETTLED', reconciliationMatched: false }), false);
});

test('rejection terminates approval and requires reservation release', () => {
  assert.equal(transitionWithdrawal('PENDING_APPROVAL', 'REJECTED'), 'REJECTED');
  assert.equal(rejectionRequiresReservationRelease('REJECTED'), true);
  assert.throws(() => transitionWithdrawal('REJECTED', 'SUBMITTED'));
});
