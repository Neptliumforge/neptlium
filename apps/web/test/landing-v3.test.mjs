import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/landing-v3.css', import.meta.url), 'utf8');

test('current landing layer preserves the canonical capital-intelligence hero', () => {
  assert.match(page, /Capital,<br \/>understood before<br \/>it moves\./);
  assert.match(page, /href=\{SITE\.publicAccessUrl\}>Enter Neptlium/);
  assert.match(page, /href="#intelligence">Explore Intelligence/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('current landing layer remains image-independent and ordered after the canonical visual system', () => {
  const visualIndex = layout.indexOf("import './neptlium-visual-direction.css'");
  const landingIndex = layout.indexOf("import './landing-v3.css'");
  assert.ok(visualIndex >= 0 && landingIndex > visualIndex);
  assert.doesNotMatch(page, /<Image|<img|\.png|\.webp|\.jpe?g/i);
  assert.match(css, /\.neptlium-home > \.authority-hero/);
  assert.doesNotMatch(css, /url\([^)]*\.(?:png|webp|jpe?g)/i);
});

test('current landing layer retains responsive and reduced-motion behavior', () => {
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.authority-actions/);
});

test('hero architecture presents governed relationships rather than a dashboard simulation', () => {
  assert.match(page, /className="operating-panel capital-context-map"/);
  for (const context of ['Ownership', 'Markets', 'Context', 'Decisions', 'Operations'])
    assert.match(page, new RegExp(context));
  assert.doesNotMatch(page, /dashboard mockup|trading terminal|portfolio balance/i);
});
