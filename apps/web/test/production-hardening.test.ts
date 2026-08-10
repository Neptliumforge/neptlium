import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('sitemap contains the complete indexable public product surface', () => {
  const sitemap = read('app/sitemap.ts');
  for (const route of [
    '/platform',
    '/portfolio-intelligence',
    '/capital-account',
    '/capital-activity',
    '/neptlium-link',
    '/allocation',
    '/treasury',
    '/capital-universe',
    '/research',
    '/learn',
    '/company',
    '/about',
    '/security',
    '/trust',
    '/contact',
  ]) {
    assert.equal(sitemap.includes(`'${route}'`), true, `Missing sitemap route: ${route}`);
  }
  assert.equal(sitemap.includes("'/pricing'"), false);
});

test('capital command bar exposes the governed production navigation', () => {
  const header = read('components/site-header.tsx');
  for (const section of ['Platform', 'Solutions', 'Infrastructure', 'Company']) {
    assert.equal(header.includes(`label: '${section}'`), true);
  }
  assert.equal(header.includes('Access Neptlium'), true);
  assert.equal(header.includes('Open Neptlium'), false);
  assert.equal(header.includes('aria-expanded={open}'), true);
  assert.equal(header.includes('aria-controls={id}'), true);
  assert.equal(header.includes('aria-haspopup="true"'), true);
  assert.equal(header.includes("event.key === 'Escape'"), true);
  assert.equal(header.includes("event.key !== 'ArrowDown'"), true);
  assert.equal(header.includes("document.addEventListener('pointerdown', dismiss)"), true);
});

test('homepage carries one proposition into truthful product proof', () => {
  const page = read('app/page.tsx');
  assert.equal(page.includes('Capital, operated as one system.'), true);
  assert.equal(page.includes('Access Neptlium'), true);
  assert.equal(page.includes('Explore the platform'), true);
  assert.equal(page.includes('OperatingEnvironmentVisual'), true);
  assert.equal(page.includes('Execution is a process, not a status.'), true);
  assert.equal(page.includes('Control is part of the architecture.'), true);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD']) {
    assert.equal(page.includes(fabricatedValue), false, `Fabricated value found: ${fabricatedValue}`);
  }
});

test('institutional ledger footer uses only real destinations', () => {
  const footer = read('components/site-footer.tsx');
  assert.equal(footer.includes('Capital infrastructure,'), true);
  assert.equal(footer.includes('built for control.'), true);
  assert.equal(footer.includes("['About', '/about']"), true);
  assert.equal(footer.includes("['Principles', '/company#principles']"), true);
  assert.equal(footer.includes("['Connectivity', '/neptlium-link']"), true);
});

test('production layer preserves reduced motion and explicit Paper/Ink authority', () => {
  const css = read('app/marketing-production.css');
  const layout = read('app/layout.tsx');
  assert.equal(layout.includes("import './marketing-production.css';"), true);
  assert.equal(css.includes('--np-paper: #fff'), true);
  assert.equal(css.includes('--np-ink: #090b0f'), true);
  assert.equal(css.includes('--np-blue: #2764ff'), true);
  assert.equal(css.includes('@media (prefers-reduced-motion: reduce)'), true);
  assert.equal(css.includes('radial-gradient'), false);
  assert.equal(css.includes('backdrop-filter: none'), true);
});
