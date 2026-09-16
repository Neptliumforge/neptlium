import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const routes = [
  'app/page.tsx',
  'app/business/page.tsx',
  'app/institutional/page.tsx',
  'app/infrastructure/page.tsx',
  'app/insights/page.tsx',
  'app/products/page.tsx',
  'app/solutions/page.tsx',
  'app/learn/page.tsx',
  'app/research/page.tsx',
  'app/security/page.tsx',
  'app/trust/page.tsx',
  'app/company/page.tsx',
  'app/about/page.tsx',
  'app/contact/page.tsx',
  'app/press/page.tsx',
];
const publicCopy = routes.map(read).join('\n');
const architecture = read('lib/content/public-architecture.ts');
const footer = read('components/site-footer.tsx');

test('public architecture covers the canonical Neptlium product families and supporting trust surfaces', () => {
  for (const phrase of [
    'Capital, intelligently managed',
    'Capital',
    'Treasury',
    'Institutional',
    'Infrastructure',
    'Insights',
    'Learn',
    'Research',
    'Security',
    'Trust',
    'Company',
    'About',
    'Contact',
    'Press',
  ])
    assert.match(`${publicCopy}\n${architecture}\n${footer}`, new RegExp(phrase, 'i'));
});

test('public copy avoids unsupported institutional proof and promotional shorthand', () => {
  assert.doesNotMatch(
    publicCopy,
    /\bAUM\b|assets under management|customer count|transaction volume|guaranteed return|SOC\s*2|ISO\s*27001|licensed custodian|regulated bank|regulated broker/i,
  );
  assert.doesNotMatch(
    publicCopy,
    /revolutioni[sz]e|supercharge|all-in-one|next-generation|seamless experience|AI-powered/i,
  );
  assert.doesNotMatch(publicCopy, /\bPredict\b/i);
});

test('research and press remain truthful when verified material is unavailable', () => {
  const research = read('app/research/page.tsx');
  const press = read('app/press/page.tsx');
  assert.match(research, /when|published|available/i);
  assert.match(press, /verified|available|press/i);
  assert.doesNotMatch(
    `${research}\n${press}`,
    /award-winning|featured in|as seen in|client story|case study/i,
  );
});

test('primary discovery follows the audience hierarchy while the footer remains minimal and complete', () => {
  assert.match(architecture, /export const PRIMARY_PRODUCTS = PRODUCTS;/);
  assert.match(architecture, /export const PRIMARY_COMPANY = COMPANY;/);
  for (const topLevel of ['Individuals', 'Institutions', 'Investments', 'Company'])
    assert.match(architecture, new RegExp(`label: '${topLevel}'`));
  for (const legal of [
    'Security',
    'Privacy',
    'Terms',
    'Risk disclosure',
    'Accessibility',
    'Cookies',
  ])
    assert.match(footer, new RegExp(legal, 'i'));
  assert.match(footer, /View system status/);
});
