import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const menu = read('components/navigation/ProfileMenu.tsx');
const shell = read('components/settings/SettingsShell.tsx');
const verificationRoute = '/dashboard/settings/verification';

test('compact profile hub keeps Profile, Security and Settings', () => {
  const destinations = menu.slice(menu.indexOf('const destinations'), menu.indexOf('] as const;'));
  assert.deepEqual(
    [...destinations.matchAll(/\['([^']+)', '([^']+)'\]/g)].map(([, label, href]) => [label, href]),
    [
      ['Profile', '/dashboard/settings/profile'],
      ['Security', '/dashboard/settings/security'],
      ['Settings', '/dashboard/settings'],
    ],
  );
});

test('profile hub links directly to identity verification without implying an outcome', () => {
  assert.ok(menu.includes(`href="${verificationRoute}"`));
  assert.match(menu, /verified \? 'Identity verified' : 'Identity verification'/);
  assert.doesNotMatch(menu, /not verified|unverified/i);
});

test('profile hub keeps sign out, appearance and support', () => {
  assert.match(menu, /onClick=\{signOut\}/);
  assert.match(menu, /<legend[^>]*>Appearance<\/legend>/);
  assert.ok(menu.includes('href="/dashboard/support"'));
});

test('verification is listed in settings navigation on every settings page and the index', () => {
  assert.match(shell, new RegExp(`\\['Verification', '${verificationRoute}'\\]`));
  assert.match(shell, /settingsDestinations\.map/);
  assert.match(read('app/dashboard/settings/page.tsx'), /settingsDestinations\.map/);
  assert.match(read('app/dashboard/settings/profile/page.tsx'), /<SettingsShell/);
});

test('settings index keeps every destination removed from the compact hub', () => {
  for (const href of [
    '/dashboard/settings/account',
    verificationRoute,
    '/dashboard/settings/addresses',
    '/dashboard/settings/payment-methods',
    '/dashboard/settings/appearance',
    '/dashboard/settings/notifications',
    '/dashboard/settings/support',
  ]) {
    assert.ok(shell.includes(`'${href}'`), `settings navigation is missing ${href}`);
  }
});
