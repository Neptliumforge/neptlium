import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const routes = [
  'app/page.tsx',
  'app/platform/page.tsx',
  'app/products/page.tsx',
  'app/products/capital-account/page.tsx',
  'app/products/treasury/page.tsx',
  'app/products/allocation/page.tsx',
  'app/products/portfolio-intelligence/page.tsx',
  'app/products/performance/page.tsx',
  'app/products/capital-universe/page.tsx',
  'app/solutions/page.tsx',
  'app/resources/page.tsx',
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

test('institutional public architecture covers every canonical editorial surface', () => {
  for (const phrase of [
    'The operating system for capital.',
    'Capital should remain intelligible as it moves.',
    'Capital Account',
    'Treasury',
    'Allocation',
    'Portfolio Intelligence',
    'Capital visibility',
    'Treasury coordination',
    'Allocation workflows',
    'Governance and control',
    'Learn',
    'Research',
    'Security',
    'Trust',
    'About',
    'Contact',
    'Press',
  ]) assert.match(`${publicCopy}\n${architecture}\n${footer}`, new RegExp(phrase, 'i'));
});

test('public copy avoids unsupported institutional proof and promotional shorthand', () => {
  assert.doesNotMatch(publicCopy, /\bAUM\b|assets under management|customer count|transaction volume|guaranteed return|SOC\s*2|ISO\s*27001|licensed custodian|regulated bank|regulated broker/i);
  assert.doesNotMatch(publicCopy, /revolutioni[sz]e|supercharge|all-in-one|next-generation|seamless experience|AI-powered/i);
});

test('research and press remain truthful when verified material is unavailable', () => {
  const research = read('app/research/page.tsx');
  const press = read('app/press/page.tsx');
  assert.match(research, /when|published|available/i);
  assert.match(press, /verified|available|press/i);
  assert.doesNotMatch(`${research}\n${press}`, /award-winning|featured in|as seen in|client story|case study/i);
});

test('primary discovery remains contracted while institutional footer remains complete', () => {
  assert.match(architecture, /PRIMARY_PRODUCTS = PRODUCTS\.slice\(0, 4\)/);
  assert.match(architecture, /PRIMARY_COMPANY = COMPANY\.slice\(0, 2\)/);
  assert.doesNotMatch(architecture, /label: 'Press'[\s\S]*PRIMARY_COMPANY = COMPANY\.slice\(0, 3\)/);
  for (const legal of ['Privacy', 'Terms', 'Cookie Policy', 'Risk Disclosure', 'Accessibility']) assert.match(footer, new RegExp(legal));
});
