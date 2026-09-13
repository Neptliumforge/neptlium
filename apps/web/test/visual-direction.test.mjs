import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const home=read('app/page.tsx');
const personal=read('app/personal/page.tsx');
const business=read('app/business/page.tsx');
const platform=read('app/platform/page.tsx');
const system=read('app/unified-marketing.module.css');
const shell=read('app/unified-shell.css');
const header=read('components/site-header.tsx');
const mobile=read('components/mobile-navigation.tsx');
const footer=read('components/site-footer.tsx');
const site=read('lib/content/site.ts');
const architecture=read('lib/content/public-architecture.ts');

test('homepage establishes one company with two product journeys',()=>{
  assert.equal((home.match(/<h1/g)??[]).length,1);
  for(const copy of ['One system for modern capital','Explore Personal','Explore Business','One financial system underneath','Built for investors','Built for teams responsible for real money']) assert.match(home,new RegExp(copy,'i'));
  assert.doesNotMatch(home,/\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|projected returns?/i);
});

test('personal and business journeys remain differentiated but share product truth',()=>{
  assert.equal((personal.match(/<h1/g)??[]).length,1);
  assert.equal((business.match(/<h1/g)??[]).length,1);
  for(const copy of ['Neptlium Capital','Available','Reserved','Allocated','Decisions before execution']) assert.match(personal,new RegExp(copy,'i'));
  for(const copy of ['VaultRail','Treasury','Payments','Approvals','Policies','Risk','Audit','Intelligence without authority']) assert.match(business,new RegExp(copy,'i'));
  assert.match(business,/Illustrative|Developing|Concept/i);
  assert.doesNotMatch(business,/guaranteed|bank-grade|risk-free/i);
});

test('platform presents one shared financial core',()=>{
  for(const copy of ['Personal','Business','Identity','Authority','Evidence','Reconciliation','Audit']) assert.match(platform,new RegExp(copy,'i'));
});

test('canonical navigation is Personal Business Platform Insights Security Company',()=>{
  for(const label of ['Personal','Business','Platform','Insights','Security','Company']) assert.match(architecture,new RegExp(`label: '${label}'`));
  for(const route of ['/personal','/business','/platform','/capital','/portfolio','/allocation','/treasury']) assert.match(architecture,new RegExp(route.replaceAll('/','\\/')));
  assert.match(header,/Get started/);
  assert.match(header,/Neptlium Capital/);
  assert.match(header,/VaultRail/);
  assert.match(mobile,/document\.body\.style\.overflow = 'hidden'/);
  assert.match(mobile,/event\.key === 'Escape'/);
});

test('product destinations remain separated by audience',()=>{
  assert.match(site,/personalAppUrl:\s*'https:\/\/app\.neptlium\.com'/);
  assert.match(site,/businessAppUrl:\s*'https:\/\/vault\.neptlium\.com'/);
  assert.match(site,/payUrl:\s*'https:\/\/pay\.neptlium\.com'/);
  assert.match(site,/docsUrl:\s*'https:\/\/docs\.neptlium\.com'/);
  assert.match(footer,/Neptlium Capital/);
  assert.match(footer,/VaultRail/);
});

test('unified marketing system is responsive and reduced-motion aware',()=>{
  for(const token of ['#050505','#0d0d0d','#141414','#f7f7f2','#35d5c1','#8ce8dc','#f3f0e8']) assert.match(read('app/marketing-system.css'),new RegExp(token,'i'));
  assert.match(system,/@media\(max-width:1100px\)/);
  assert.match(system,/@media\(max-width:760px\)/);
  assert.match(read('app/marketing-system.css'),/prefers-reduced-motion:reduce/);
  assert.match(shell,/account-menu-panel/);
});
