import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/neptlium-visual-direction.css', import.meta.url), 'utf8');

test('the consolidated landing keeps the canonical first-view proposition and actions', () => {
  assert.match(page, /Capital intelligence/);
  assert.match(
    page,
    /Capital,[\s\S]*<br \/>[\s\S]*understood before[\s\S]*<br \/>[\s\S]*it moves\./,
  );
  assert.match(page, /position, change, and strategic attention/);
  assert.match(page, /SITE\.publicAccessLabel/);
  assert.match(page, /Explore Intelligence/);
});

test('the landing is image-independent and uses one canonical visual authority', () => {
  assert.match(layout, /import '\.\/neptlium-visual-direction\.css'/);
  assert.doesNotMatch(layout, /landing-v3\.css|marketing-shell\.css|unified-design\.css/);
  assert.doesNotMatch(page, /<Image|<img|\.png|\.webp|\.jpe?g/i);
  assert.doesNotMatch(
    css,
    /radial-gradient|linear-gradient|filter:\s*blur|backdrop-filter:\s*blur/i,
  );
  assert.match(css, /\.capital-context-map/);
});

test('the landing preserves hierarchy and action authority on mobile', () => {
  assert.match(css, /@media \(max-width: 48rem\)/);
  assert.match(css, /\.editorial-hero-copy h1/);
  assert.match(css, /\.authority-actions/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('the landing uses restrained product and relationship geometry', () => {
  assert.match(css, /border-radius:\s*(?:0|4px|8px|var\(--web-radius\))/);
  assert.match(css, /\.architecture-map-grid/);
  assert.match(css, /\.operating-view-list/);
  const shadows = [...css.matchAll(/box-shadow:\s*([^;]+);/g)].map((match) => match[1].trim());
  assert.ok(shadows.length > 0);
  assert.equal(
    shadows.every((value) => value === 'none'),
    true,
  );
});
