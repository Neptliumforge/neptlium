import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryObserver } from '../dist/observability.js';

test('Observer lifecycle records preserve correlation and omit sensitive fields', () => {
  const observer = new MemoryObserver();
  observer.lifecycle({
    event: 'observation.completed',
    entityType: 'provider_event',
    entityId: 'event-123',
    lifecycleState: 'observed',
    timestamp: new Date().toISOString(),
    correlationId: 'request-123',
    source: 'alchemy',
  });
  assert.equal(observer.lifecycleEvents.length, 1);
  const record = observer.lifecycleEvents[0];
  assert.equal(record.correlationId, 'request-123');
  assert.equal('secret' in record, false);
  assert.equal('token' in record, false);
  assert.equal('credential' in record, false);
});
