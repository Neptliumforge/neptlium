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
const productVisuals = read('app/elite-product-visuals.css');
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

test('homepage is a distinct brand story rather than a copied product index', () => {
  assert.equal((home.match(/<h1/g) ?? []).length, 1);
  for (const copy of ['Capital, clearly', 'See your financial world as one', 'Built for the way capital actually lives', 'Know what moved', 'Everything important, in context', 'From understanding to action', 'Context changes the decision']) assert.match(home, new RegExp(copy, 'i'));
  for (const destination of ['/capital', '/business', '/institutional', '/infrastructure', '/insights']) assert.match(home, new RegExp(destination.replaceAll('/', '\\/')));
  assert.doesNotMatch(home, /STEP ONE|STEP TWO|FEATURE 0[1-9]|WHY NEPTLIUM|POWERFUL FEATURES|EVERYTHING YOU NEED|HOW IT WORKS|THE FUTURE OF FINANCE/i);
  assert.doesNotMatch(home, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|projected returns?/i);
  assert.doesNotMatch(home, /currently supported|not configured|capability unavailable/i);
  assert.match(homeElite, /font-size:clamp\(64px,6\.4vw,88px\)/);
  assert.match(homeElite, /@media\(max-width:760px\)/);
  assert.match(homeElite, /@media\(max-width:390px\)/);
  assert.match(homeElite, /prefers-reduced-motion:reduce/);
});

test('authoritative semantic surfaces exist and major routes do not collapse into one canvas', () => {
  for (const surface of ['carbon', 'white', 'ivory', 'cloud', 'mineral', 'mineral-light']) assert.match(surfaces, new RegExp(`data-npt-surface=['"]${surface}['"]`, 'i'));
  const homeSurfaces = surfacesFor(home);
  for (const expected of ['carbon', 'white', 'cloud', 'mineral', 'ivory']) assert.ok(homeSurfaces.includes(expected));
  assert.ok(new Set(homeSurfaces).size >= 5, 'homepage must remain a true multi-surface composition');
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
  for (const copy of ['Neptlium Treasury', 'Treasury', 'Payments', 'Approvals', 'Policies', 'Risk', 'Audit', 'Intelligence without authority']) assert.match(business, new RegExp(copy, 'i'));
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

test('canonical navigation is Capital Treasury Institutional Infrastructure Insights Company', () => {
  for (const label of ['Capital', 'Treasury', 'Institutional', 'Infrastructure', 'Insights', 'Company']) assert.match(architecture, new RegExp(`label: '${label}'`));
  for (const route of ['/capital', '/business', '/institutional', '/infrastructure', '/insights', '/company']) assert.match(architecture, new RegExp(route.replaceAll('/', '\\/')));
  assert.match(header, /Get started/);
  assert.match(header, /Neptlium Capital/);
  assert.match(header, /Neptlium Treasury/);
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
  assert.match(layout, /elite-product-visuals\.css/);
  assert.match(productVisuals, /\.uv-frame/);
  assert.match(productVisuals, /\.uv-core/);
  assert.match(productVisuals, /@media\(max-width:760px\)/);
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
