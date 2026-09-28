import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../scripts/css-dependency-report.mjs', import.meta.url));
const report = JSON.parse(execFileSync(process.execPath, [script, '--json'], { encoding: 'utf8' }));
const get = (file: string) => report.stylesheets.find((entry: { file: string }) => entry.file === file);

test('CSS inventory reports the active global dependency chain', () => {
  assert.ok(report.cssCount >= 21);
  const layout = 'apps/web/app/layout.tsx';
  const globals = get('apps/web/app/globals.css');
  const visual = get('apps/web/app/neptlium-visual-direction.css');
  assert.ok(globals?.importedBy.includes(layout));
  assert.ok(visual?.importedBy.includes(layout));
  assert.ok(report.imports.some((edge: { source: string; specifier: string }) =>
    edge.source === 'apps/web/app/globals.css' && edge.specifier.endsWith('packages/ui/src/styles/tokens.css')));
});

test('CSS inventory preserves known route consumers', () => {
  assert.ok(get('apps/web/app/home-elite.module.css')?.importedBy.includes('apps/web/app/page.tsx'));
  assert.ok(get('apps/web/app/product-pages.module.css')?.importedBy.includes('apps/web/app/portfolio/page.tsx'));
  assert.ok(get('apps/web/app/product-pages.module.css')?.importedBy.includes('apps/web/app/investments/page.tsx'));
});

test('retired global layers are not reintroduced into root layout', () => {
  const layout = 'apps/web/app/layout.tsx';
  for (const file of [
    'marketing-shell.css', 'marketing-production.css', 'unified-design.css',
    'apple-calibration.css', 'product-showcase-calibration.css',
    'route-product-consolidation.css', 'detail-product-consolidation.css',
  ]) {
    assert.ok(!get('apps/web/app/' + file)?.importedBy.includes(layout), file);
  }
});

test('CSS inventory has no broken relative stylesheet edges', () => {
  const unresolved = report.imports.filter((edge: { unresolved: boolean }) => edge.unresolved);
  assert.deepEqual(unresolved, []);
});


test('test fixture strings do not create runtime CSS import edges', () => {
  assert.ok(!report.imports.some((edge: { source: string }) =>
    edge.source.startsWith('apps/web/test/') || edge.source.startsWith('apps/web/tests/')));
});
