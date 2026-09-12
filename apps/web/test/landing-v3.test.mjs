import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const marketing = readFileSync(new URL('../app/marketing-platform.module.css', import.meta.url), 'utf8');

test('current homepage states the premium capital proposition and focused exploration paths', () => {
  assert.match(page, /Capital, made clearer\./);
  assert.match(page, /portfolio visibility, capital management, funding workflows, reporting and governed financial activity/i);
  assert.match(page, /href="\/platform">Explore the Platform/);
  assert.match(page, /href="\/investments">View Investment Solutions/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('homepage uses truthful product compositions rather than fabricated financial screenshots', () => {
  for (const visual of ['OperatingEnvironmentVisual','CapitalSystemVisual','PortfolioVisual','CapitalAccountVisual','SecurityFlowVisual']) {
    assert.match(page, new RegExp(visual));
  }
  assert.match(page, /No fabricated balances, performance or transaction states/i);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|dashboard mockup|trading terminal/i);
});

test('premium homepage styling is scoped after the established global system', () => {
  assert.match(layout, /neptlium-visual-direction\.css/);
  assert.match(page, /marketing-platform\.module\.css/);
  assert.match(marketing, /@media\(max-width:64rem\)/);
  assert.match(marketing, /@media\(max-width:48rem\)/);
  assert.match(marketing, /prefers-reduced-motion:reduce/);
});

test('homepage architecture explains trust, investing, funding and reporting', () => {
  for (const context of ['Institutional trust','Investment experience','Portfolio intelligence','Funding infrastructure','Security & financial integrity','Investor reporting']) {
    assert.match(page, new RegExp(context.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  }
  assert.match(page, /USD funding is not represented on this website as a currently available public capability/i);
});
