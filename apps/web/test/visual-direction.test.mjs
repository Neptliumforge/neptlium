import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const page=read('app/page.tsx');
const marketing=read('app/marketing-platform.module.css');
const header=read('components/site-header.tsx');
const mobile=read('components/mobile-navigation.tsx');
const footer=read('components/site-footer.tsx');
const cta=read('components/global-conversion-cta.tsx');
const site=read('lib/content/site.ts');
const architecture=read('lib/content/public-architecture.ts');

test('homepage is an institutional investor narrative with truthful product visualizations',()=>{
  assert.equal((page.match(/<h1/g)??[]).length,1);
  for(const copy of ['Capital, made clearer.','Institutional trust','Investment experience','Portfolio intelligence','Funding infrastructure','Investor reporting']) assert.match(page,new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g,'\\$&'),'i'));
  for(const visual of ['OperatingEnvironmentVisual','CapitalSystemVisual','PortfolioVisual','CapitalAccountVisual','SecurityFlowVisual']) assert.match(page,new RegExp(visual));
  assert.doesNotMatch(page,/\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|projected returns?/i);
});

test('premium route styling is scoped, responsive and reduced-motion aware',()=>{
  assert.match(page,/marketing-platform\.module\.css/);
  for(const token of ['#f5f3ee','#101214','#0f8f86','#20afa3','#343a3f','#d8d5ce','#eceae5']) assert.match(marketing,new RegExp(token,'i'));
  assert.match(marketing,/@media\(max-width:64rem\)/);
  assert.match(marketing,/@media\(max-width:48rem\)/);
  assert.match(marketing,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(marketing,/backdrop-filter|filter:\s*blur|radial-gradient/i);
});

test('navigation and conversion semantics match the investor architecture',()=>{
  for(const label of ['Platform','Investments','Insights','Security','Company']) assert.match(architecture,new RegExp(`label: '${label}'`));
  for(const token of ['aria-expanded','aria-controls','aria-haspopup="true"',"event.key === 'Escape'"]) assert.match(header,new RegExp(token.replace(/[.*+?^$()|[\]\\]/g,'\\$&')));
  assert.match(header,/MobileNavigation/);
  assert.match(mobile,/mobile-nav-grid/);
  assert.match(mobile,/document\.body\.style\.overflow = 'hidden'/);
  assert.match(site,/publicAccessLabel:\s*'Get Started'/);
  assert.match(site,/exploreLabel:\s*'Explore the Platform'/);
  assert.match(cta,/Build a clearer view of your capital\./);
});

test('footer preserves investor, account and legal access',()=>{
  for(const label of ['Overview','Investments','Funding','Security','About','Insights','Contact','Sign In','Create Account']) assert.match(footer,new RegExp(label));
  for(const label of ['Bluesky','X','YouTube','TikTok','Privacy','Terms','Cookie Policy','Risk Disclosure','Accessibility']) assert.match(footer,new RegExp(label));
  assert.match(footer,/rel="noopener noreferrer"/);
});
