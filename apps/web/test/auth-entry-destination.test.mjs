import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const webRoot = join(import.meta.dirname, '..');
const read = (path) => readFileSync(join(webRoot, path), 'utf8');

test('returning-user auth pages send the primary action to application sign-in, not sign-up', () => {
  for (const route of ['app/auth/sign-in/page.tsx', 'app/auth/session-expired/page.tsx']) {
    assert.match(
      read(route),
      /actionHref=\{SITE\.signInUrl\}/,
      `${route} must target SITE.signInUrl`,
    );
  }
});

test('auth page primary action honours an explicit destination before the public access default', () => {
  const component = read('components/auth-page.tsx');
  assert.match(component, /actionHref \?\? SITE\.publicAccessUrl/);
  assert.match(component, /href=\{primaryHref\}/);
  assert.doesNotMatch(component, /href=\{isReturnState \? '\/' : SITE\.publicAccessUrl\}/);
});
