import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const files = [
  'app/page.tsx','app/platform/page.tsx','app/products/page.tsx','app/solutions/page.tsx','app/resources/page.tsx','app/company/page.tsx','app/about/page.tsx','app/contact/page.tsx','app/security/page.tsx','app/trust/page.tsx'
].map(read).join('\n');

test('public metadata remains precise and non-promotional', () => {
  assert.match(files, /createPageMetadata/);
  assert.doesNotMatch(files, /best-in-class|world-class|revolutionary|market-leading|industry-leading|guaranteed|risk-free/i);
});
