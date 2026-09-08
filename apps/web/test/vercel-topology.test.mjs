import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (relative) => readFileSync(new URL(relative, import.meta.url), 'utf8');

const projects = [
  ['web', '@neptlium/web', read('../vercel.json')],
  ['app', '@neptlium/app', read('../../app/vercel.json')],
  ['admin', '@neptlium/admin', read('../../admin/vercel.json')],
  ['api', '@neptlium/api', read('../../api/vercel.json')],
];

test('each Vercel project only builds when its monorepo package is affected', () => {
  for (const [name, packageName, source] of projects) {
    assert.match(source, /VERCEL_GIT_PREVIOUS_SHA/, `${name} must anchor affected detection to the previous deployment SHA`);
    assert.match(source, /turbo query affected/, `${name} must use Turborepo affected detection`);
    assert.match(source, new RegExp(`--packages ${packageName.replace('/', '\\/')} --exit-code`), `${name} must scope builds to ${packageName}`);
  }
});

test('application production API boundary remains explicit', () => {
  const env = read('../../app/.env.example');
  assert.match(env, /NEPTLIUM_API_URL=https:\/\/api\.neptlium\.com/);
  assert.match(env, /NEXT_PUBLIC_SITE_URL=https:\/\/app\.neptlium\.com/);
});

test('API deployment keeps one catch-all server authority', () => {
  const api = JSON.parse(read('../../api/vercel.json'));
  assert.equal(api.framework, null);
  assert.equal(api.builds?.length, 1);
  assert.equal(api.builds?.[0]?.src, 'api/index.js');
  assert.deepEqual(api.routes, [{ src: '/(.*)', dest: '/api/index.js' }]);
});
