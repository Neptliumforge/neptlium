import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const home = read('app/page.tsx');
const personal = read('app/personal/page.tsx');
const business = read('app/business/page.tsx');
const platform = read('app/platform/page.tsx');
const insights = read('app/insights/page.tsx');
const security = read('app/security/page.tsx');
const company = read('app/company/page.tsx');
const system = read('app/unified-marketing.module.css');
const surfaces = read('app/marketing-surfaces.css');
const shell = read('app/unified-shell.css');
const calibration = read('app/elite-route-calibration.css');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const mobile = read('components/mobile-navigation.tsx');
const footer = read('components/site-footer.tsx');
const site = read('lib/content/site.ts');
const architecture = read('lib/content/public-architecture.ts');

const surfacesFor = (source) => [...source.matchAll(/data-npt-surface="([^"]+)"/g)].map((match) => match[1]);

test('homepage establishes one company with two product journeys', () => {
  assert.equal((home.match(/<h1/g) ?? []).length, 1);
  for (const copy of ['One system for modern capital', 'Explore Personal', 'Explore Business', 'One financial system underneath', 'Built for investors', 'Built for teams responsible for real money']) {
    assert.match(home, new RegExp(copy, 'i'));
  }
  assert.doesNotMatch(home, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|projected returns?/i);
});

test('authoritative semantic surfaces exist and major routes do not collapse into one canvas', () => {
  for (const surface of ['carbon', 'white', 'ivory', 'cloud', 'mineral', 'mineral-light']) {
    assert.match(surfaces, new RegExp(`data-npt-surface=['"]${surface}['"]`, 'i'));
  }

  const homeSurfaces = surfacesFor(home);
  assert.ok(homeSurfaces.includes('carbon'));
  assert.ok(homeSurfaces.includes('white'));
  assert.ok(homeSurfaces.includes('cloud'));
  assert.ok(homeSurfaces.includes('mineral'));
  assert.ok(new Set(homeSurfaces).size >= 4, 'homepage must remain a true multi-surface composition');

  for (const [name, source, required] of [
    ['personal', personal, ['ivory', 'white', 'cloud', 'mineral', 'carbon']],
    ['business', business, ['mineral', 'white', 'carbon', 'cloud', 'mineral-light']],
    ['platform', platform, ['carbon', 'cloud', 'white', 'mineral']],
    ['security', security, ['carbon', 'white', 'cloud', 'mineral']],
    ['company', company, ['ivory', 'white', 'cloud', 'mineral']],
  ]) {
    const routeSurfaces = surfacesFor(source);
    for (const expected of required) assert.ok(routeSurfaces.includes(expected), `${name} must include ${expected}`);
    assert.ok(new Set(routeSurfaces).size >= 3, `${name} must remain visually multi-surface`);
  }
});

test('personal and business journeys remain differentiated but share product truth', () => {
  assert.equal((personal.match(/<h1/g) ?? []).length, 1);
  assert.equal((business.match(/<h1/g) ?? []).length, 1);
  for (const copy of ['Neptlium Capital', 'Available', 'Reserved', 'Allocated', 'Decisions before execution']) assert.match(personal, new RegExp(copy, 'i'));
  for (const copy of ['VaultRail', 'Treasury', 'Payments', 'Approvals', 'Policies', 'Risk', 'Audit', 'Intelligence without authority']) assert.match(business, new RegExp(copy, 'i'));
  assert.match(business, /Illustrative|Developing|Concept/i);
  assert.doesNotMatch(business, /guaranteed|bank-grade|risk-free/i);
});

test('platform presents one shared financial core without generic card-only architecture', () => {
  for (const copy of ['Personal', 'Business', 'Identity', 'Authority', 'Evidence', 'Reconciliation', 'Audit']) assert.match(platform, new RegExp(copy, 'i'));
  assert.match(platform, /platformMap/);
  assert.match(system, /\.platformMap/);
});

test('insights uses editorial coverage architecture instead of a placeholder topic-card wall', () => {
  assert.match(insights, /Editorial coverage/i);
  assert.match(insights, /Personal capital/i);
  assert.match(insights, /Operating capital/i);
  assert.doesNotMatch(insights, /Reserved for substantive Neptlium material when original work is available\./);
});

test('canonical navigation is Personal Business Platform Insights Security Company', () => {
  for (const label of ['Personal', 'Business', 'Platform', 'Insights', 'Security', 'Company']) assert.match(architecture, new RegExp(`label: '${label}'`));
  for (const route of ['/personal', '/business', '/platform', '/capital', '/portfolio', '/allocation', '/treasury']) assert.match(architecture, new RegExp(route.replaceAll('/', '\\/')));
  assert.match(header, /Get started/);
  assert.match(header, /Neptlium Capital/);
  assert.match(header, /VaultRail/);
  assert.match(header, /data-surface=/);
  assert.match(header, /window\.scrollY > 18/);
  assert.match(mobile, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile, /event\.key === 'Escape'/);
});

test('product destinations remain separated by audience', () => {
  assert.match(site, /personalAppUrl:\s*'https:\/\/app\.neptlium\.com'/);
  assert.match(site, /businessAppUrl:\s*'https:\/\/vault\.neptlium\.com'/);
  assert.match(site, /payUrl:\s*'https:\/\/pay\.neptlium\.com'/);
  assert.match(site, /docsUrl:\s*'https:\/\/docs\.neptlium\.com'/);
  assert.match(footer, /Neptlium Capital/);
  assert.match(footer, /VaultRail/);
});

test('shared elite layout is responsive, reduced-motion aware, and product visuals bind globally', () => {
  assert.match(system, /@media\s*\(max-width:\s*1100px\)/);
  assert.match(system, /@media\s*\(max-width:\s*760px\)/);
  assert.match(system, /@media\s*\(max-width:\s*390px\)/);
  assert.match(system, /:global\(\.uv-frame\)/);
  assert.match(read('app/marketing-system.css'), /prefers-reduced-motion:reduce/);
  assert.match(calibration, /prefers-reduced-motion:\s*reduce/);
  assert.match(shell, /account-menu-panel/);
});

test('supporting public routes are calibrated back to the Geist-led production family', () => {
  assert.match(layout, /elite-route-calibration\.css/);
  assert.match(calibration, /font-family:\s*var\(--font-sans/);
  assert.match(calibration, /\.architecture-page/);
  assert.match(calibration, /\.editorial-page/);
  assert.match(calibration, /\.cin-product-page/);
  assert.match(calibration, /\.mp-home/);
});
