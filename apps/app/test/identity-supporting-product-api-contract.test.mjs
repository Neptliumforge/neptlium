import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function readIfExists(relative) {
  const target = path.join(root, relative);
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
}

test('supporting product state is consumed through server-only API contracts', () => {
  const client = read('lib/api/client.ts');

  assert.match(client, /import 'server-only'/);
  assert.match(client, /\/v1\/account\/settings/);
  assert.match(client, /\/v1\/account\/onboarding-draft/);
  assert.match(client, /\/v1\/account\/provision/);
  assert.match(client, /\/v1\/account\/onboarding/);
  assert.match(client, /\/v1\/notifications/);
  assert.match(client, /\/v1\/documents/);
});

test('settings is API-authoritative and Thesis remains governed separately', () => {
  const page = read('app/dashboard/settings/page.tsx');

  assert.match(page, /getAccountSettings/);
  assert.match(page, /getTheses/);
  assert.match(page, /getThesisAlignment/);

  assert.doesNotMatch(page, /createClient|createServerClient|\.from\(|\.rpc\(/);
  assert.doesNotMatch(page, /\/v1\//);
});

test('documents and notifications do not bypass the API boundary', () => {
  const documents = read('app/dashboard/documents/page.tsx');
  const notifications = read('app/dashboard/notifications/page.tsx');

  assert.match(documents, /getDocuments/);
  assert.match(notifications, /getNotifications/);

  for (const source of [documents, notifications]) {
    assert.doesNotMatch(source, /createClient|createServerClient|\.from\(|\.rpc\(/);
    assert.doesNotMatch(source, /\/v1\//);
  }
});

test('onboarding remains governed by authenticated account provisioning contracts', () => {
  const page = read('app/onboarding/page.tsx');
  const client = read('lib/api/client.ts');

  assert.match(page, /requireUser/);
  assert.match(page, /getCurrentProfile/);
  assert.match(page, /OnboardingWizard/);

  assert.match(client, /\/v1\/account\/onboarding-draft/);
  assert.match(client, /\/v1\/account\/provision/);
  assert.match(client, /\/v1\/account\/onboarding/);

  assert.doesNotMatch(page, /createClient|createServerClient|\.from\(|\.rpc\(/);
});

test('Thesis and revealed Thesis remain API-authoritative', () => {
  const thesis = read('lib/api/thesis.ts');
  const revealed = read('lib/api/thesis-revealed.ts');

  assert.match(thesis, /import 'server-only'/);
  assert.match(revealed, /import 'server-only'/);
  assert.match(thesis, /apiRequest/);
  assert.match(revealed, /apiRequest/);
  assert.match(revealed, /\/v1\/theses\//);
});

test('reports no longer instruct the customer to connect product persistence directly', () => {
  const reports = read('app/dashboard/reports/page.tsx');

  assert.match(reports, /getDocuments/);
  assert.match(reports, /document\.category === 'report'/);
  assert.match(reports, /current API response contains no reports/);

  assert.doesNotMatch(reports, /Connect to Supabase/i);
  assert.doesNotMatch(reports, /createClient|createServerClient|\.from\(|\.rpc\(/);
});

test('existing-account migration bridge remains an intentional isolated exception', () => {
  const bridge = readIfExists('app/api/auth/link-existing/route.ts');

  if (!bridge) return;

  assert.doesNotMatch(
    read('app/dashboard/settings/page.tsx') +
      read('app/dashboard/documents/page.tsx') +
      read('app/dashboard/notifications/page.tsx'),
    /link-existing/,
  );
});

test('supporting-product UI contains no direct provider authority', () => {
  const sources = [
    read('app/dashboard/settings/page.tsx'),
    read('app/dashboard/documents/page.tsx'),
    read('app/dashboard/notifications/page.tsx'),
    read('app/dashboard/reports/page.tsx'),
    read('app/onboarding/page.tsx'),
  ].join('\n');

  assert.doesNotMatch(
    sources,
    /ALCHEMY|CIRCLE_API|STRIPE_SECRET|STRIPE_TREASURY|SUPABASE_SERVICE_ROLE/,
  );
});
