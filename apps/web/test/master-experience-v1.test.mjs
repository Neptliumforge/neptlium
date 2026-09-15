import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const architecture = readFileSync(new URL('../lib/content/public-architecture.ts', import.meta.url), 'utf8');
const homepage = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const nts = readFileSync(new URL('../../../packages/ui/src/styles/nts.css', import.meta.url), 'utf8');

test('public architecture exposes the four canonical Neptlium product families', () => {
  for (const label of ['Capital','Treasury','Institutional','Infrastructure']) assert.match(architecture, new RegExp(`label: '${label}'`));
  assert.match(architecture, /\/institutional/);
  assert.match(architecture, /\/infrastructure/);
});

test('homepage uses the canonical hero without a redundant brand eyebrow', () => {
  assert.match(homepage, /Capital, clearly\./);
  assert.match(homepage, /data-npt-nts="hero"/);
  assert.doesNotMatch(homepage, /styles\.kicker}>Neptlium/);
  for (const label of ['Capital','Treasury','Institutional','Infrastructure']) assert.match(homepage, new RegExp(`label: '${label}'`));
});

test('NTS defines centralized semantic typography roles', () => {
  for (const token of ['--np-type-display-xl','--np-type-hero','--np-type-h1','--np-type-h2','--np-type-h3','--np-type-lead','--np-type-body-lg','--np-type-body','--np-type-small','--np-type-label']) assert.match(nts, new RegExp(token));
});
