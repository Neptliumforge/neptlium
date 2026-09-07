import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const architecture=readFileSync(new URL('../lib/content/public-architecture.ts',import.meta.url),'utf8');
test('canonical resource set remains institutional',()=>{for(const phrase of ['Learn','Research','Security','Trust']) assert.match(architecture,new RegExp(phrase));});
