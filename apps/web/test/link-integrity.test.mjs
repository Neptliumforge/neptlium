import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const webRoot = fileURLToPath(new URL('../', import.meta.url));
const appRoot = join(webRoot, 'app');
const sourceRoots = [join(webRoot, 'app'), join(webRoot, 'components')];

function filesUnder(root) {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory()
      ? filesUnder(path)
      : /\.(?:ts|tsx|js|jsx|mjs)$/.test(name)
        ? [path]
        : [];
  });
}

function routeExists(href) {
  const pathname = href.split('#')[0].split('?')[0] || '/';
  if (pathname === '/') return existsSync(join(appRoot, 'page.tsx'));
  return existsSync(join(appRoot, pathname.replace(/^\//, ''), 'page.tsx'));
}

function internalLinks() {
  const links = new Set();
  const patterns = [
    /(?:href|ctaHref)\s*=\s*["'](\/[^"']*)["']/g,
    /(?:href|ctaHref)\s*:\s*["'](\/[^"']*)["']/g,
  ];

  for (const file of sourceRoots.flatMap(filesUnder)) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /href\s*=\s*["']#["']/, `Placeholder href in ${file}`);
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) links.add(match[1]);
    }
  }
  return [...links];
}

test('all static internal Web links resolve to real App Router pages', () => {
  const links = internalLinks();
  assert.ok(links.length > 0, 'Expected internal links to be discovered');
  for (const href of links) {
    assert.equal(routeExists(href), true, `Internal link has no route: ${href}`);
  }
});

test('canonical product pages are authored independently rather than through FoundationPage', () => {
  assert.equal(existsSync(join(webRoot, 'components/foundation-page.tsx')), false);
  const productPaths = [
    'products/capital-account',
    'products/treasury',
    'products/allocation',
    'products/portfolio-intelligence',
    'products/performance',
    'products/capital-universe',
  ];
  for (const path of productPaths) {
    const source = readFileSync(join(appRoot, path, 'page.tsx'), 'utf8');
    assert.doesNotMatch(source, /FoundationPage|DetailPage/);
    assert.equal((source.match(/<h1/g) ?? []).length, 1, `Expected one H1 in ${path}`);
    assert.match(source, /<section className=\{styles\.hero\}|className="[^"]*(?:story|hero)/, `Expected authored composition in ${path}`);
  }
});

test('public access CTA resolves to the canonical application root while explicit auth routes remain distinct', () => {
  const site = readFileSync(join(webRoot, 'lib/content/site.ts'), 'utf8');
  const publicMatch = site.match(/publicAccessUrl:\s*['"]([^'"]+)['"]/);
  const signInMatch = site.match(/signInUrl:\s*['"]([^'"]+)['"]/);
  const signUpMatch = site.match(/signUpUrl:\s*['"]([^'"]+)['"]/);
  assert.ok(publicMatch, 'SITE.publicAccessUrl must be statically declared');
  assert.ok(signInMatch, 'SITE.signInUrl must be statically declared');
  assert.ok(signUpMatch, 'SITE.signUpUrl must be statically declared');

  const publicUrl = new URL(publicMatch[1]);
  assert.equal(publicUrl.protocol, 'https:');
  assert.equal(publicUrl.hostname, 'app.neptlium.com');
  assert.equal(publicUrl.pathname, '/auth/sign-up');

  assert.equal(new URL(signInMatch[1]).pathname, '/auth/sign-in');
  assert.equal(new URL(signUpMatch[1]).pathname, '/auth/sign-up');
});

test('sitemap entries resolve to real pages and never fabricate freshness', () => {
  const sitemap = readFileSync(join(appRoot, 'sitemap.ts'), 'utf8');
  const routes = [...sitemap.matchAll(/['"](\/[^'"]*)['"]/g)].map((match) => match[1]);
  for (const route of routes) assert.equal(routeExists(route), true, `Sitemap route has no page: ${route}`);
  assert.doesNotMatch(sitemap, /lastModified:\s*new Date\(/);
});
