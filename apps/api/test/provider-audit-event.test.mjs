import assert from 'node:assert/strict';
import test from 'node:test';

import { validateProviderAuditEvent } from '../dist/provider-audit-event.js';

test('provider audit event requires stable event/system identity and time', () => {
  assert.doesNotThrow(() => validateProviderAuditEvent({ eventId: 'evt_1', provider: 'circle', action: 'capability_certified', occurredAt: '2026-09-15T12:00:00.000Z', actorOrSystemId: 'system:provider-certifier' }));
  assert.throws(() => validateProviderAuditEvent({ eventId: '', provider: 'stripe', action: 'configuration_validated', occurredAt: '2026-09-15T12:00:00.000Z', actorOrSystemId: 'system' }));
});
