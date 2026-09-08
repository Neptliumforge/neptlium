import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const architecture=readFileSync(new URL('../lib/content/public-architecture.ts',import.meta.url),'utf8');
test('performance and capital universe remain supporting routes',()=>{assert.match(architecture,/PRIMARY_PRODUCTS = PRODUCTS\.slice\(0, 4\)/);});
