import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider threat model covers critical trust-boundary failures', async () => {
  const threatModel = await readFile(new URL('../../../docs/22_PROVIDER_SECURITY_THREAT_MODEL.md', import.meta.url), 'utf8');
  for (const phrase of ['Secret leakage', 'Webhook forgery/replay', 'Duplicate economic submission', 'Chain spoofing/misconfiguration', 'Privilege escalation from UI']) {
    assert.match(threatModel, new RegExp(phrase.replace('/', '\\/')));
  }
});
