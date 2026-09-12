import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const visualCss = read('app/neptlium-visual-direction.css');
const marketingCss = read('app/marketing-platform.module.css');
const mobileCss = read('app/mobile-navigation-fix.css');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const mobile = read('components/mobile-navigation.tsx');
const footer = read('components/site-footer.tsx');
const shell = `${page}\n${visualCss}\n${marketingCss}\n${mobileCss}\n${layout}\n${header}\n${mobile}\n${footer}`;
const contentShell = `${page}\n${layout}\n${header}\n${mobile}\n${footer}`;

test('production public Web keeps a single institutional investor hero and truthful product architecture', () => {
  assert.match(page, /Capital, made clearer\./);
  assert.match(page, /Institutional trust/);
  assert.match(page, /Funding infrastructure/);
  assert.match(page, /Investor reporting/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /OperatingEnvironmentVisual/);
  assert.match(page, /SecurityFlowVisual/);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|fake balance|projected return/i);
});

test('production visual system remains consolidated without retired global override layers', () => {
  assert.match(layout, /neptlium-visual-direction\.css/);
  assert.match(page, /marketing-platform\.module\.css/);
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

test('premium routes own the product visual layout rules they render', () => {
  for (const selector of ['product-frame', 'operating-proof-grid', 'capital-state-grid', 'operating-proof-activity', 'capital-system-visual']) {
    assert.match(marketingCss, new RegExp(selector), `Expected premium marketing styles for ${selector}`);
  }
  assert.match(marketingCss, /\.scope :global\(\.mp-dark \.mp-sticky-copy>p\)\{color:rgb\(245 243 238 \/ 68%\)\}/);
  assert.match(marketingCss, /--mp-link:#086c64/);
});

test('production shell preserves responsive, reduced-motion and mobile overlay hardening', () => {
  assert.match(`${visualCss}\n${marketingCss}`, /prefers-reduced-motion:\s*reduce|prefers-reduced-motion:reduce/);
  assert.match(mobileCss, /100dvh/);
  assert.match(`${visualCss}\n${mobileCss}`, /safe-area-inset/);
  assert.match(visualCss, /overflow-x:\s*clip/);
  assert.match(mobile, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile, /event\.key === 'Escape'/);
  assert.match(mobile, /aria-modal="true"/);
  assert.match(header, /createPortal/);
});

test('homepage header keeps acquisition visually primary over return sign-in', () => {
  assert.match(header, /<Link href=\{SITE\.signInUrl\}>Sign In<\/Link>/);
  assert.match(header, /className="elite-header-entry command-primary-action" href=\{SITE\.signUpUrl\}>Get Started/);
});

test('production public shell remains free of fabricated financial authority', () => {
  assert.doesNotMatch(
    contentShell,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|transaction volume|testimonial|licensed|regulated partner|\bPredict\b/i,
  );
  assert.doesNotMatch(shell, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/);
});
