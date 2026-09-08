import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const architecture=readFileSync(new URL('../lib/content/public-architecture.ts',import.meta.url),'utf8');
test('press remains footer company architecture rather than primary nav',()=>{assert.match(architecture,/PRIMARY_COMPANY = COMPANY\.slice\(0, 2\)/);});
