import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

test('public web retains Next.js production authority during selective Vite enablement', () => {
  const web = JSON.parse(read('apps/web/package.json'));
  assert.match(web.scripts.dev, /^next dev(?:\\s|$)/);
  assert.match(web.scripts.build, /^next build(?:\\s|$)/);
  assert.equal(typeof web.dependencies.next, 'string');
  assert.equal(existsSync(resolve(root, 'apps/web/app/layout.tsx')), true);
  assert.equal(existsSync(resolve(root, 'apps/web/vite.config.ts')), false);
  assert.equal(existsSync(resolve(root, 'tooling/design-lab')), false);
});

test('public web documentation points to current design and route authority', () => {
  const readme = read('apps/web/README.md');
  assert.match(readme, /docs\/experience\/DESIGN_SYSTEM\.md/);
  assert.match(readme, /packages\/ui\/src\/styles\/tokens\.css/);
  assert.match(readme, /lib\/content\/public-architecture\.ts/);
  assert.match(readme, /Vitest/);
  assert.doesNotMatch(readme, /Canonical top-level navigation:[\\s\\S]*?Personal →/);
});
