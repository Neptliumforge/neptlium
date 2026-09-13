import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readIfExists = (relative) => {
  const target = path.join(root, relative);
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
};

test('supporting product state is consumed through server-only API contracts', () => {
  const client = read('lib/api/client.ts');
  for (const contract of [
    '/v1/account/settings', '/v1/account/onboarding-draft', '/v1/account/provision',
    '/v1/account/onboarding', '/v1/notifications', '/v1/documents',
  ]) assert.match(client, new RegExp(contract.replaceAll('/', '\\/')));
  assert.match(client, /import 'server-only'/);
});

test('settings is API-authoritative through the shared authenticated bootstrap', () => {
  const bootstrap = read('lib/product/bootstrap.ts');
  const page = read('app/dashboard/settings/page.tsx');
  const experience = read('components/product/RecordExperiences.tsx');

  assert.match(bootstrap, /getAccountSettings\(\)/);
  assert.match(bootstrap, /settings: projection\(settings\)/);
  assert.match(page, /SettingsExperience/);
  assert.match(experience, /snapshot\.settings\.state === 'READY'/);
  assert.match(experience, /Security activity unavailable/);
  assert.doesNotMatch(page + experience, /createClient|createServerClient|\.from\(|\.rpc\(/);
});

test('documents and notifications remain API-owned and distinguish unavailable from empty', () => {
  const bootstrap = read('lib/product/bootstrap.ts');
  const documents = read('app/dashboard/documents/page.tsx');
  const notifications = read('app/dashboard/notifications/page.tsx');
  const experience = read('components/product/RecordExperiences.tsx');

  assert.match(bootstrap, /getDocuments\(\)/);
  assert.match(bootstrap, /getNotifications\(\)/);
  assert.match(bootstrap, /document_projection_unavailable/);
  assert.match(bootstrap, /notification_projection_unavailable/);
  assert.match(documents, /DocumentsExperience/);
  assert.match(notifications, /NotificationsExperience/);
  assert.match(experience, /Documents unavailable/);
  assert.match(experience, /No documents yet/);
  assert.match(experience, /Notifications unavailable/);
  assert.match(experience, /No notifications/);

  for (const source of [documents, notifications, experience]) {
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
  assert.doesNotMatch(reports, /Connect to Supabase|createClient|createServerClient|\.from\(|\.rpc\(/i);
});

test('existing-account migration bridge remains an intentional isolated exception', () => {
  const bridge = readIfExists('app/api/auth/link-existing/route.ts');
  if (!bridge) return;
  assert.doesNotMatch(
    read('app/dashboard/settings/page.tsx') + read('app/dashboard/documents/page.tsx') + read('app/dashboard/notifications/page.tsx'),
    /link-existing/,
  );
});

test('supporting-product UI contains no direct provider authority', () => {
  const sources = [
    read('app/dashboard/settings/page.tsx'), read('app/dashboard/documents/page.tsx'),
    read('app/dashboard/notifications/page.tsx'), read('app/dashboard/reports/page.tsx'),
    read('app/onboarding/page.tsx'), read('components/product/RecordExperiences.tsx'),
  ].join('\n');
  assert.doesNotMatch(sources, /ALCHEMY|CIRCLE_API|STRIPE_SECRET|STRIPE_TREASURY|SUPABASE_SERVICE_ROLE/);
});
