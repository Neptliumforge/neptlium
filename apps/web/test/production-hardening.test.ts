import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const css = read('app/neptlium-visual-direction.css');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const shell = `${page}\n${css}\n${layout}\n${header}\n${footer}`;
const contentShell = `${page}\n${layout}\n${header}\n${footer}`;

test('production public Web keeps a single institutional hero and operating architecture', () => {
  assert.match(page, /Capital should remain<br \/>intelligible as it moves\./);
  assert.match(page, /Capital state\.<br \/>Operating context\.<br \/>Governed work\./);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /className="operating-panel capital-context-map"/);
  assert.match(page, /aria-label="Capital state and evidence connect through operating context to governed work and consequence"/);
  assert.match(page, /Clarity before consequence/);
  assert.doesNotMatch(page, /authority-wave-field|<Image|<img|\.png|\.webp/i);
});

test('production visual system is consolidated without retired override layers', () => {
  assert.match(layout, /neptlium-visual-direction\.css/);
  assert.doesNotMatch(layout, /production-hardening\.css/);
  for (const retired of [
    'marketing-shell.css',
    'apple-calibration.css',
    'product-showcase-calibration.css',
    'route-product-consolidation.css',
    'detail-product-consolidation.css',
    'marketing-production.css',
    'unified-design.css',
  ]) assert.doesNotMatch(layout, new RegExp(retired.replace('.', '\\.')));
});

test('production shell preserves responsive, reduced-motion and safe-area hardening', () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /100dvh/);
  assert.match(css, /safe-area-inset/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(header, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(header, /event\.key === 'Escape'/);
  assert.match(header, /aria-modal="true"/);
});

test('production public shell remains free of fabricated financial authority', () => {
  assert.doesNotMatch(
    contentShell,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|transaction volume|testimonial|licensed|regulated partner|\bPredict\b/i,
  );
  assert.doesNotMatch(shell, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/);
});
