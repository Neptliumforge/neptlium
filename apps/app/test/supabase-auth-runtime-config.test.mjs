import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const runtimeConfig = await readFile(new URL('../lib/runtime-config.ts', import.meta.url), 'utf8');
const browserClient = await readFile(new URL('../../../packages/lib/src/supabase/browser.ts', import.meta.url), 'utf8');

test('production static rendering does not require Supabase public auth configuration', () => {
  assert.equal(runtimeConfig.includes('NEXT_PUBLIC_SUPABASE_URL'), false);
  assert.equal(runtimeConfig.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), false);
  assert.equal(runtimeConfig.includes('NEXT_PUBLIC_SITE_URL'), true);
  assert.equal(runtimeConfig.includes('NEPTLIUM_API_URL'), true);
});

test('Supabase browser auth validates public configuration only when the client is created', () => {
  const validationFunction = browserClient.indexOf('function requiredPublicConfig()');
  const environmentRead = browserClient.indexOf('process.env.NEXT_PUBLIC_SUPABASE_URL');
  const clientFactory = browserClient.indexOf('export function createSupabaseBrowserClient()');
  const validationCall = browserClient.indexOf('requiredPublicConfig();', clientFactory);

  assert.ok(validationFunction >= 0);
  assert.ok(environmentRead > validationFunction);
  assert.ok(clientFactory > environmentRead);
  assert.ok(validationCall > clientFactory);
  assert.equal(browserClient.includes('Supabase Auth public configuration is unavailable'), true);
});

test('browser Supabase auth source cannot reference the service role secret', () => {
  assert.equal(browserClient.includes('SUPABASE_SERVICE_ROLE'), false);
  assert.equal(browserClient.includes('service_role'), false);
});
