import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const page=readFileSync(new URL('../app/contact/page.tsx',import.meta.url),'utf8');
test('contact warns against sensitive authentication material',()=>{assert.match(page,/passwords|private keys|recovery material/i);});
