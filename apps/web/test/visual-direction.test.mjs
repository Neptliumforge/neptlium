import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const page=read('app/page.tsx');
const layout=read('app/layout.tsx');
const cinematic=read('app/cinematic-marketing.css');
const header=read('components/site-header.tsx');
const mobile=read('components/mobile-navigation.tsx');
const footer=read('components/site-footer.tsx');
const cta=read('components/global-conversion-cta.tsx');
const site=read('lib/content/site.ts');
const architecture=read('lib/content/public-architecture.ts');

test('homepage is a cinematic, image-led capital narrative',()=>{
  assert.equal((page.match(/<h1/g)??[]).length,1);
  for(const copy of ['Capital operating infrastructure','Capital should remain intelligible as it moves.','Capital Account','Treasury','Allocation','Portfolio Intelligence','Clarity before consequence']) assert.match(page,new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g,'\\$&'),'i'));
  for(const image of ['overview.webp','capital-account.webp','treasury.webp','allocation.webp','company-intelligence.webp']) assert.match(page,new RegExp(image.replace('.','\\.')));
  assert.match(page,/CinematicScrollStory/);
  assert.match(page,/href=\{SITE\.publicAccessUrl\}/);
  assert.doesNotMatch(page,/\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|projected returns?/i);
});

test('cinematic system has sticky story, episodic scenes, responsive layout and reduced motion',()=>{
  assert.match(layout,/import '\.\/cinematic-marketing\.css';/);
  assert.match(cinematic,/\.cin-story-stage\s*\{[^}]*position:sticky/s);
  for(const scene of ['cin-scene-carbon','cin-scene-marine','cin-scene-stone','cin-scene-navy']) assert.match(cinematic,new RegExp(`\\.${scene}`));
  assert.match(cinematic,/@media\(max-width:56rem\)/);
  assert.match(cinematic,/@media\(max-width:40rem\)/);
  assert.match(cinematic,/prefers-reduced-motion:reduce/);
});

test('navigation and conversion semantics remain canonical',()=>{
  for(const label of ['Platform','Products','Solutions','Resources','Company']) assert.match(architecture,new RegExp(`label: '${label}'`));
  for(const token of ['aria-expanded','aria-controls','aria-haspopup="true"',"event.key === 'Escape'"]) assert.match(header,new RegExp(token.replace(/[.*+?^$()|[\]\\]/g,'\\$&')));
  assert.match(header,/MobileNavigation/);
  assert.match(mobile,/mobile-nav-grid/);
  assert.match(mobile,/document\.body\.style\.overflow = 'hidden'/);
  assert.match(site,/publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site,/exploreLabel:\s*'Explore platform'/);
  assert.match(cta,/Capital deserves an operating environment\./);
});

test('footer preserves institutional navigation and legal access',()=>{
  assert.match(footer,/NAVIGATION\.map/);
  for(const label of ['Bluesky','X','YouTube','TikTok','Privacy','Terms','Cookie Policy','Risk Disclosure','Accessibility']) assert.match(footer,new RegExp(`label: '${label}'`));
  assert.match(footer,/rel="noopener noreferrer"/);
});
