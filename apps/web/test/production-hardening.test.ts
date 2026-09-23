import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const visualCss = read('app/neptlium-visual-direction.css');
const marketingCss = read('app/marketing-platform.module.css');
const mobileCss = read('app/globals.css');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const mobile = read('components/mobile-navigation.tsx');
const footer = read('components/site-footer.tsx');
const shell = `${page}\n${visualCss}\n${marketingCss}\n${mobileCss}\n${layout}\n${header}\n${mobile}\n${footer}`;
const contentShell = `${page}\n${layout}\n${header}\n${mobile}\n${footer}`;

test('production public Web keeps a single canonical hero and truthful product-family architecture', () => {
  assert.match(page, /Capital, intelligently managed\./);
  for (const family of ['Capital', 'Treasury', 'Institutional', 'Infrastructure'])
    assert.match(page, new RegExp(`label: '${family}'`));
  assert.match(page, /Illustrative infrastructure — no customer data/);
  assert.match(page, /No customer balances, returns or performance data are[\s\S]*shown\./);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  for (const visual of ['CapitalRails', 'WorldStage', 'ProductStage', 'SystemMap'])
    assert.match(page, new RegExp(visual));
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|fake balance|projected return/i);
});

test('production visual system remains consolidated without retired global override layers', () => {
  assert.match(layout, /neptlium-visual-direction\.css/);
  assert.doesNotMatch(layout, /experience-v1\.css/);
  assert.match(page, /home-elite\.module\.css/);
  assert.doesNotMatch(layout, /production-hardening\.css/);
  for (const retired of [
    'marketing-shell.css',
    'apple-calibration.css',
    'product-showcase-calibration.css',
    'route-product-consolidation.css',
    'detail-product-consolidation.css',
    'marketing-production.css',
    'unified-design.css',
  ])
    assert.doesNotMatch(layout, new RegExp(retired.replace('.', '\\.')));
});

test('premium routes own the product visual layout rules they render', () => {
  for (const selector of [
    'product-frame',
    'operating-proof-grid',
    'capital-state-grid',
    'operating-proof-activity',
    'capital-system-visual',
  ]) {
    assert.match(
      marketingCss,
      new RegExp(selector),
      `Expected premium marketing styles for ${selector}`,
    );
  }
  assert.match(
    marketingCss,
    /\.scope :global\(\.mp-dark \.mp-sticky-copy>p\)\{color:rgb\(245 243 238 \/ 68%\)\}/,
  );
  assert.match(marketingCss, /--mp-link:#086c64/);
});

test('production shell preserves responsive, reduced-motion and mobile overlay hardening', () => {
  assert.match(
    `${visualCss}\n${marketingCss}`,
    /prefers-reduced-motion:\s*reduce|prefers-reduced-motion:reduce/,
  );
  assert.match(mobileCss, /100dvh/);
  assert.match(`${visualCss}\n${mobileCss}`, /safe-area-inset/);
  assert.match(visualCss, /overflow-x:\s*clip/);
  assert.match(mobile, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile, /event\.key === 'Escape'/);
  assert.match(mobile, /aria-modal="true"/);
  assert.match(header, /createPortal/);
});

test('homepage header keeps acquisition visually primary with direct account actions', () => {
  assert.match(header, /command-primary-action/);
  assert.match(header, />\s*Get started\s*</);
  assert.match(header, />\s*Sign up\s*</);
  assert.match(header, /SITE\.personalSignInUrl/);
  assert.match(header, /SITE\.personalSignUpUrl/);
  assert.match(mobile, /SITE\.businessAppUrl/);
  assert.match(mobile, /Neptlium Treasury/);
});

test('production public shell remains free of fabricated financial authority', () => {
  assert.doesNotMatch(
    contentShell,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|transaction volume|testimonial|licensed|regulated partner|\bPredict\b/i,
  );
  assert.doesNotMatch(
    shell,
    /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/,
  );
});
