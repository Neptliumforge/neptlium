import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const architecture=readFileSync(new URL('../lib/content/public-architecture.ts',import.meta.url),'utf8');
test('canonical solution set remains problem-led',()=>{for(const phrase of ['Capital visibility','Treasury coordination','Allocation workflows','Governance and control']) assert.match(architecture,new RegExp(phrase));});
