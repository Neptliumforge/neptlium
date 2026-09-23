import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const home = read('app/page.tsx');
const homeElite = read('app/home-elite.module.css');
const personal = read('app/personal/page.tsx');
const business = read('app/business/page.tsx');
const platform = read('app/platform/page.tsx');
const insights = read('app/insights/page.tsx');
const security = read('app/security/page.tsx');
const company = read('app/company/page.tsx');
const system = read('app/unified-marketing.module.css');
const productVisuals = read('app/globals.css');
const surfaces = [home, personal, business, platform, company].join('\n');
const shell = read('app/globals.css');
const calibration = read('app/globals.css');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const mobile = read('components/mobile-navigation.tsx');
const footer = read('components/site-footer.tsx');
const site = read('lib/content/site.ts');
const architecture = read('lib/content/public-architecture.ts');

const surfacesFor = (source) =>
  [...source.matchAll(/data-npt-surface="([^"]+)"/g)].map((match) => match[1]);

test('homepage is a distinct brand story rather than a copied product index', () => {
  assert.equal((home.match(/<h1/g) ?? []).length, 1);
  for (const copy of [
    'Capital, intelligently managed',
    'Know where your capital stands',
    'Put capital to work',
    'Every movement has authority',
    'Everything you’ve invested in',
    'Operate capital with control',
    'Intelligence for every capital decision',
  ])
    assert.match(home, new RegExp(copy, 'i'));
  for (const destination of [
    '/capital',
    '/treasury',
    '/institutional',
    '/infrastructure',
    '/insights',
  ])
    assert.match(home, new RegExp(destination.replaceAll('/', '\\/')));
  assert.doesNotMatch(
    home,
    /STEP ONE|STEP TWO|FEATURE 0[1-9]|WHY NEPTLIUM|POWERFUL FEATURES|EVERYTHING YOU NEED|HOW IT WORKS|THE FUTURE OF FINANCE/i,
  );
  assert.doesNotMatch(
    home,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|projected returns?/i,
  );
  assert.doesNotMatch(home, /currently supported|not configured|capability unavailable/i);
  assert.match(homeElite, /font-size:var\(--text-display-xl\)/);
  assert.match(homeElite, /@media\(max-width:760px\)/);
  assert.match(homeElite, /@media\(max-width:390px\)/);
  assert.match(homeElite, /prefers-reduced-motion:reduce/);
});

test('authoritative semantic surfaces exist and major marketing routes do not collapse into one canvas', () => {
  for (const surface of ['carbon', 'white', 'ivory', 'cloud', 'mineral', 'mineral-light'])
    assert.match(surfaces, new RegExp(`data-npt-surface=['"]${surface}['"]`, 'i'));
  const homeSurfaces = surfacesFor(home);
  for (const expected of ['carbon', 'white', 'cloud', 'mineral', 'ivory'])
    assert.ok(homeSurfaces.includes(expected));
  assert.ok(
    new Set(homeSurfaces).size >= 5,
    'homepage must remain a true multi-surface composition',
  );
  for (const [name, source, required] of [
    ['personal', personal, ['ivory', 'white', 'cloud', 'mineral', 'carbon']],
    ['business', business, ['mineral', 'white', 'carbon', 'cloud', 'mineral-light']],
    ['platform', platform, ['carbon', 'cloud', 'white', 'mineral']],
    ['company', company, ['ivory', 'white', 'cloud', 'mineral']],
  ]) {
    const routeSurfaces = surfacesFor(source);
    for (const expected of required)
      assert.ok(routeSurfaces.includes(expected), `${name} must include ${expected}`);
    assert.ok(new Set(routeSurfaces).size >= 3, `${name} must remain visually multi-surface`);
  }
  assert.match(security, /security\.module\.css/);
  assert.match(security, /Control starts with clear authority/);
  assert.match(security, /Login does not equal financial authority/);
});

test('personal and business journeys remain differentiated but share product truth', () => {
  assert.equal((personal.match(/<h1/g) ?? []).length, 0);
  assert.equal((business.match(/<h1/g) ?? []).length, 0);
  for (const copy of [
    'Neptlium Capital',
    'Capital',
    'Portfolio',
    'Allocation',
    'Activity',
    'Illustrative interface',
  ])
    assert.match(personal, new RegExp(copy, 'i'));
  for (const copy of [
    'Neptlium Treasury',
    'Treasury',
    'Payments',
    'Approvals',
    'Policies',
    'Risk',
    'Audit',
    'Intelligence without authority',
  ])
    assert.match(business, new RegExp(copy, 'i'));
  assert.match(business, /Illustrative|Developing|Concept/i);
  assert.doesNotMatch(business, /guaranteed|bank-grade|risk-free/i);
});

test('platform presents one shared financial core without generic card-only architecture', () => {
  for (const copy of [
    'Personal',
    'Business',
    'Identity',
    'Authority',
    'Evidence',
    'Reconciliation',
    'Audit',
  ])
    assert.match(platform, new RegExp(copy, 'i'));
  assert.match(platform, /platformMap/);
  assert.match(system, /\.platformMap/);
});

test('insights uses a truthful editorial standard without invented publications', () => {
  assert.match(insights, /Editorial standard/i);
  assert.match(insights, /Publish when there is something worth understanding/i);
  assert.match(insights, /Current library/i);
  assert.match(insights, /Substantive authored Insights are not yet published/i);
  assert.match(insights, /Personal capital/i);
  assert.match(insights, /Treasury/i);
  assert.doesNotMatch(insights, /award-winning|featured in|as seen in|customer story/i);
});

test('canonical public navigation is Individuals Institutions Investments Company', () => {
  for (const label of ['Individuals', 'Institutions', 'Investments', 'Company'])
    assert.match(architecture, new RegExp(`label: '${label}'`));
  for (const route of [
    '/capital',
    '/treasury',
    '/institutional',
    '/infrastructure',
    '/insights',
    '/company',
  ])
    assert.match(architecture, new RegExp(route.replaceAll('/', '\\/')));
  assert.match(header, /Get started/);
  assert.match(site, /personalAppUrl/);
  assert.match(mobile, /Neptlium Treasury/);
  assert.match(header, /data-surface=/);
  assert.match(header, /window\.scrollY > 18/);
  assert.match(mobile, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile, /event\.key === 'Escape'/);
});

test('product destinations remain separated by audience while the public footer stays minimal', () => {
  assert.match(site, /personalAppUrl:\s*'https:\/\/app\.neptlium\.com'/);
  assert.match(site, /businessAppUrl:\s*'https:\/\/treasury\.neptlium\.com'/);
  assert.match(site, /payUrl:\s*'https:\/\/pay\.neptlium\.com'/);
  assert.match(site, /docsUrl:\s*'https:\/\/docs\.neptlium\.com'/);
  assert.match(footer, /Capital systems for people, businesses and institutions/);
  assert.match(footer, /View system status/);
  assert.doesNotMatch(footer, /Neptlium Capital|Neptlium Treasury/);
});

test('shared elite layout is responsive, reduced-motion aware, and product visuals bind globally', () => {
  assert.match(system, /@media\s*\(max-width:\s*1100px\)/);
  assert.match(system, /@media\s*\(max-width:\s*760px\)/);
  assert.match(system, /@media\s*\(max-width:\s*390px\)/);
  assert.doesNotMatch(layout, /elite-product-visuals\.css/);
  assert.match(read('app/globals.css'), /prefers-reduced-motion/);
  assert.match(read('../../packages/ui/src/styles/tokens.css'), /--motion-duration-normal/);
  assert.match(read('app/globals.css'), /--header-marketing/);
});

test('supporting public routes are calibrated back to the Geist-led production family', () => {
  assert.doesNotMatch(layout, /elite-route-calibration\.css/);
  assert.match(read('app/globals.css'), /font-family:\s*var\(--font/);
  assert.match(read('../../packages/ui/src/styles/tokens.css'), /--font-sans/);
});
