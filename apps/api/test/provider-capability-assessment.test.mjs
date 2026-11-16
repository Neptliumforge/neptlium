import test from 'node:test';
import assert from 'node:assert/strict';
import { assessProviderCapability } from '../dist/provider-capability-assessment.js';

const valid = { provider: 'circle', environment: 'preview', readiness: 'configured',
  declared: 'ENABLED', policyApproved: true, verificationPassed: true };

test('read-only assessment reports fully verified evidence', () => {
  assert.deepEqual(assessProviderCapability(valid), { eligible: true, reason: 'verified' });
});
test('missing provider readiness fails closed', () => {
  assert.deepEqual(assessProviderCapability({ ...valid, readiness: 'not_configured' }), { eligible: false, reason: 'unconfigured' });
});
test('degraded provider never qualifies', () => {
  assert.deepEqual(assessProviderCapability({ ...valid, readiness: 'degraded' }), { eligible: false, reason: 'provider-unready' });
});
test('disabled capability never qualifies', () => {
  assert.deepEqual(assessProviderCapability({ ...valid, declared: 'DISABLED' }), { eligible: false, reason: 'capability-disabled' });
});
test('policy and verification are independent gates', () => {
  assert.equal(assessProviderCapability({ ...valid, policyApproved: false }).reason, 'policy-unapproved');
  assert.equal(assessProviderCapability({ ...valid, verificationPassed: false }).reason, 'verification-missing');
});
test('invalid or absent evidence fails closed', () => {
  assert.equal(assessProviderCapability({ ...valid, provider: '' }).reason, 'invalid-evidence');
  assert.equal(assessProviderCapability({ ...valid, environment: 'unknown' }).reason, 'invalid-evidence');
  assert.equal(assessProviderCapability({ ...valid, policyApproved: undefined }).reason, 'invalid-evidence');
});
