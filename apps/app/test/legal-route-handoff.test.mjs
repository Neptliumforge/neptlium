import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nextConfig, { PUBLIC_LEGAL_PATHS, PUBLIC_SITE_ORIGIN } from '../next.config.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('legal paths on the app domain hand off to the public site instead of 404ing', async () => {
  assert.equal(PUBLIC_SITE_ORIGIN, 'https://neptlium.com');
  const redirects = await nextConfig.redirects();
  for (const path of ['/terms', '/privacy', '/risk-disclosure', '/e-delivery', '/cookie-policy', '/aml-kyc', '/complaints', '/legal']) {
    const rule = redirects.find((candidate) => candidate.source === path);
    assert.ok(rule, `missing app redirect for ${path}`);
    assert.equal(rule.destination, `https://neptlium.com${path}`);
    assert.equal(rule.permanent, false);
  }
  assert.equal(redirects.length, PUBLIC_LEGAL_PATHS.length);
});

test('every relative legal link in the app is covered by a handoff', () => {
  const onboarding = read('app/onboarding/OnboardingWizard.tsx');
  const linked = [...onboarding.matchAll(/href="(\/(?:terms|privacy)[^"]*)"/g)].map((match) => match[1]);
  assert.ok(linked.length >= 2);
  for (const href of linked) assert.ok(PUBLIC_LEGAL_PATHS.includes(href), href);
});

test('legal handoff does not touch authenticated routes or authorization', () => {
  for (const path of PUBLIC_LEGAL_PATHS) {
    assert.ok(!path.startsWith('/dashboard') && !path.startsWith('/onboarding') && !path.startsWith('/auth'), path);
  }
  const proxy = read('proxy.ts');
  assert.match(proxy, /const protectedPrefixes = \[\s*'\/dashboard',\s*'\/onboarding',?\s*\];/);
});
