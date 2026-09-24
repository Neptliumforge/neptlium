import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const rails = fs.readFileSync('../../packages/ui/src/components/CapitalRails.tsx', 'utf8');
const tokens = fs.readFileSync('../../packages/ui/src/styles/tokens.css', 'utf8');
const design = fs.readFileSync('../../docs/experience/DESIGN_SYSTEM.md', 'utf8');
const home = fs.readFileSync('./app/page.tsx', 'utf8');

test('Capital Rails geometry derives from the canonical Neptlium mark strokes', () => {
  assert.match(rails, /M9 17\.5C23 17\.5 38 13\.5 54 6\.5/);
  assert.match(rails, /M10 38\.5C19\.5 36\.5 25\.5 28\.5 34\.5 27\.5/);
  assert.match(rails, /M30\.5 52C35\.5 45\.5 44\.5 45\.5 50\.5 51\.5/);
});

test('Capital Rails use canonical semantic tokens and reduced motion', () => {
  for (const token of ['--rail-shadow', '--rail-structural', '--rail-active', '--rail-evidence']) {
    assert.match(tokens, new RegExp(token));
  }
  assert.match(tokens, /prefers-reduced-motion: reduce/);
  assert.match(tokens, /\.n-capital-rails/);
});

test('homepage signature object consumes shared Capital Rails', () => {
  assert.match(home, /CapitalRails as CapitalRailsVisual/);
  assert.match(home, /SignatureHeroObject/);
  assert.doesNotMatch(home, /function CapitalRails\(\)/);
});

test('design authority documents extension rules and financial authority boundaries', () => {
  assert.match(design, /Neptlium Capital Rails/);
  assert.match(design, /Provider confirmation never receives the Available treatment/);
  assert.match(design, /Future developers MUST extend CapitalRails/);
});
