import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { schemaInstallPlan } from '../scripts/schema-install-plan.mjs';

const manifest = JSON.parse(readFileSync(new URL('../schema-install-manifest.json', import.meta.url), 'utf8'));
const files = manifest.migrations.map(entry => entry.file);
const versions = files.map(file => file.slice(0, 14));

test('checks canonical SQL bytes and lists the reviewed install order for an empty target', () => {
  assert.deepEqual(schemaInstallPlan([]), { source: manifest.source, appliedCount: 0, pending: files });
  assert.equal(files[0], '20260710104755_remote_schema.sql');
});

test('resumes from the exact applied prefix and reports no pending work after the final version', () => {
  assert.deepEqual(schemaInstallPlan(versions.slice(0, 3)).pending, files.slice(3));
  assert.deepEqual(schemaInstallPlan(versions).pending, []);
});

test('blocks drift in the migration ledger or reviewed SQL', () => {
  for (const history of [[versions[1]], [versions[0], versions[0]], [...versions, '20990101000000']]) {
    assert.throws(() => schemaInstallPlan(history), /exact prefix/);
  }
  const tampered = structuredClone(manifest);
  tampered.migrations[0].blob = 'unreviewed';
  assert.throws(() => schemaInstallPlan([], tampered), /differs from the reviewed manifest/);
});
