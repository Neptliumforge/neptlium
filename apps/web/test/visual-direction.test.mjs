import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const page=read('app/page.tsx');
const marketing=read('app/marketing-system.css');
const homepage=read('app/homepage-stage01.module.css');
const header=read('components/site-header.tsx');
const mobile=read('components/mobile-navigation.tsx');
const footer=read('components/site-footer.tsx');
const cta=read('components/global-conversion-cta.tsx');
const site=read('lib/content/site.ts');
const architecture=read('lib/content/public-architecture.ts');

test('homepage is product-first, black-first and financially truthful',()=>{
  assert.equal((page.match(/<h1/g)??[]).length,1);
  for(const copy of ['Capital, intelligently managed.','Know where your capital stands.','Move capital with clarity.','See the whole portfolio. Not fragments.','Decisions before execution. Evidence after it.','Financial state should be explainable.']) assert.match(page,new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g,'\\$&'),'i'));
  for(const visual of ['HeroCapitalVisual','SystemRevealVisual','CapitalStateVisual','TreasuryFlowVisual','PortfolioIntelligenceVisual','AllocationLifecycleVisual','GovernanceVisual','ActivityDocumentsVisual']) assert.match(page,new RegExp(visual));
  assert.doesNotMatch(page,/\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|projected returns?/i);
});

test('Stage 01 system owns palette, scale, responsiveness and reduced motion',()=>{
  for(const token of ['#050505','#0d0d0d','#141414','#f7f7f2','#35d5c1','#8ce8dc','#f3f0e8','#101010']) assert.match(marketing,new RegExp(token,'i'));
  assert.match(homepage,/clamp\(64px,8vw,128px\)/);
  assert.match(homepage,/@media\(max-width:760px\)/);
  assert.match(marketing,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(marketing,/radial-gradient|backdrop-filter/i);
});

test('navigation and conversion semantics match Stage 01 architecture',()=>{
  for(const label of ['Platform','Investments','Capital','Insights','Security','Company']) assert.match(architecture,new RegExp(`label: '${label}'`));
  assert.match(header,/aria-label="Primary navigation"/);
  assert.match(header,/MobileNavigation/);
  assert.match(mobile,/document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile,/event\.key === 'Escape'/);
  assert.match(site,/publicAccessLabel:\s*'Open account'/);
  assert.match(site,/exploreLabel:\s*'Explore the platform'/);
  assert.match(cta,/Your capital deserves a better operating system\./);
});

test('footer preserves capital, account, company and legal access',()=>{
  for(const label of ['Overview','Capital','Treasury','Allocation','Investment experience','Portfolio intelligence','Insights','Security','Company','Contact','Sign in','Open account']) assert.match(footer,new RegExp(label,'i'));
  for(const label of ['Privacy','Terms','Cookies','Risk disclosure','Accessibility']) assert.match(footer,new RegExp(label,'i'));
  assert.match(footer,/rel="noopener noreferrer"/);
});
