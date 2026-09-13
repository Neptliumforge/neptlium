import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (relative) => readFileSync(new URL(relative, import.meta.url), 'utf8');

const web = JSON.parse(read('../vercel.json'));
const projects = [
  ['app', read('../../app/vercel.json')],
  ['admin', read('../../admin/vercel.json')],
  ['api', read('../../api/vercel.json')],
];

test('Web Vercel detection compares against the last successful deployment', () => {
  assert.equal(typeof web.ignoreCommand, 'string', 'web must define an ignored-build command');
  assert.match(web.ignoreCommand, /VERCEL_GIT_PREVIOUS_SHA/, 'web must use the last successful deployment SHA');
  assert.match(web.ignoreCommand, /turbo query affected/, 'web must use dependency-aware affected detection');
  assert.match(web.ignoreCommand, /--packages @neptlium\/web/, 'web must scope affected detection to the Web package');
  assert.match(web.ignoreCommand, /--exit-code/, 'web affected detection must drive Vercel build/skip semantics');
});

test('remaining Vercel projects use path-aware ignored-build detection', () => {
  for (const [name, source] of projects) {
    const config = JSON.parse(source);
    assert.equal(typeof config.ignoreCommand, 'string', `${name} must define an ignored-build command`);
    assert.match(config.ignoreCommand, /git diff --quiet HEAD\^ HEAD -- \./, `${name} must anchor detection to the project directory`);
    assert.match(config.ignoreCommand, /\.\.\/\.\.\/package\.json/, `${name} must include root dependency metadata`);
    assert.match(config.ignoreCommand, /\.\.\/\.\.\/pnpm-lock\.yaml/, `${name} must include the workspace lockfile`);
    assert.match(config.ignoreCommand, /\.\.\/\.\.\/turbo\.json/, `${name} must include root build configuration`);
  }
});

test('application production API boundary remains explicit', () => {
  const env = read('../../app/.env.example');
  assert.match(env, /NEPTLIUM_API_URL=https:\/\/api\.neptlium\.com/);
  assert.match(env, /NEXT_PUBLIC_SITE_URL=https:\/\/app\.neptlium\.com/);
});

test('API deployment keeps explicit application and Stripe webhook serverless authorities', () => {
  const api = JSON.parse(read('../../api/vercel.json'));
  assert.equal(api.framework, null);
  assert.equal(api.builds?.length, 2);
  assert.deepEqual(api.builds.map((entry) => entry.src), ['api/index.js', 'api/stripe-webhook.js']);
  assert.deepEqual(api.routes, [
    { src: '/v1/webhooks/stripe', dest: '/api/stripe-webhook.js' },
    { src: '/(.*)', dest: '/api/index.js' },
  ]);
});
