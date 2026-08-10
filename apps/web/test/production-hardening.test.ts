import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('sitemap contains the complete indexable public product surface', () => {
  const sitemap = read('app/sitemap.ts');

  const requiredRoutes = [
    '/platform',
    '/portfolio-intelligence',
    '/capital-account',
    '/allocation',
    '/treasury',
    '/performance',
    '/capital-universe',
    '/research',
    '/learn',
    '/company',
    '/about',
    '/security',
    '/trust',
    '/press',
    '/contact',
  ];

  for (const route of requiredRoutes) {
    assert.equal(sitemap.includes(`'${route}'`), true, `Missing sitemap route: ${route}`);
  }

  assert.equal(sitemap.includes("'/pricing'"), false);
  assert.equal(sitemap.includes("'/maintenance'"), false);
  assert.equal(sitemap.includes("'/auth/"), false);
});

test('robots references the canonical sitemap and excludes operational routes', () => {
  const robots = read('app/robots.ts');

  assert.equal(robots.includes('https://neptlium.com/sitemap.xml'), true);
  assert.equal(robots.includes("'/auth/'"), true);
  assert.equal(robots.includes("'/maintenance'"), true);
  assert.equal(robots.includes('localhost'), false);
  assert.equal(robots.includes('vercel.app'), false);
});

test('company navigation exposes truthful company destinations', () => {
  const header = read('components/site-header.tsx');
  const footer = read('components/site-footer.tsx');

  assert.equal(header.includes("href: '/about'"), true);
  assert.equal(header.includes("href: '/company#principles'"), true);
  assert.equal(footer.includes("['About Neptlium', '/about']"), true);
  assert.equal(footer.includes("['Principles', '/company#principles']"), true);
});

test('desktop navigation uses governed, accessible disclosure menus', () => {
  const header = read('components/site-header.tsx');

  assert.equal(header.includes("label: 'Platform'"), true);
  assert.equal(header.includes("label: 'Solutions'"), true);
  assert.equal(header.includes("label: 'Resources'"), true);
  assert.equal(header.includes("label: 'Company'"), true);
  assert.equal(header.includes('className={`mega-menu '), true);
  assert.equal(header.includes('aria-expanded={open}'), true);
  assert.equal(header.includes('aria-controls={id}'), true);
  assert.equal(header.includes('aria-haspopup="true"'), true);
  assert.equal(header.includes("event.key === 'Escape'"), true);
  assert.equal(header.includes("event.key !== 'ArrowDown'"), true);
  assert.equal(header.includes('event.currentTarget.contains(event.relatedTarget)'), true);
  assert.equal(header.includes("document.addEventListener('pointerdown', dismiss)"), true);
  assert.equal(header.includes('Open Neptlium'), true);
  assert.equal(header.includes('Access Neptlium'), false);
  assert.equal(header.includes('Enter Neptlium'), false);
  assert.equal(header.includes('Launch App'), false);
});

test('first view represents the Neptlium operating model without fabricated financial values', () => {
  const page = read('app/page.tsx');
  const architecture = read('components/hero-architecture.tsx');
  const stage = read('components/product-stage.tsx');

  assert.equal(page.includes('<HeroArchitecture />'), true);
  assert.equal(page.includes('Digital capital,'), true);
  assert.equal(page.includes('organized around'), true);
  assert.equal(page.includes('Enter Neptlium'), true);

  for (const label of ['Capital Account', 'Treasury', 'Allocation']) {
    assert.equal(stage.includes(`'${label}'`), true, `Missing staged product system: ${label}`);
  }

  for (const state of ['Observe', 'Organize', 'Govern', 'Resolve']) {
    assert.equal(architecture.includes(state), true, `Missing operating state: ${state}`);
  }

  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%']) {
    assert.equal(
      page.includes(fabricatedValue),
      false,
      `Fabricated value found: ${fabricatedValue}`,
    );
    assert.equal(
      stage.includes(fabricatedValue),
      false,
      `Fabricated value found: ${fabricatedValue}`,
    );
  }
});

test('production hardening preserves reduced-motion and visible focus support', () => {
  const hardening = read('app/production-hardening.css');
  const layout = read('app/layout.tsx');

  assert.equal(layout.includes("import './production-hardening.css';"), true);
  assert.equal(hardening.includes('@media (prefers-reduced-motion: reduce)'), true);
  assert.equal(hardening.includes(':focus-visible'), true);
  assert.equal(hardening.includes('overflow-x: clip'), true);
});
