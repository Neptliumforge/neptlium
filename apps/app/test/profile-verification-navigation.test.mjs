import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const menu = read('components/navigation/ProfileMenu.tsx');
const shell = read('components/settings/SettingsShell.tsx');
const verificationRoute = '/dashboard/settings/verification';

test('compact profile entry routes to the settings hub', () => {
  assert.match(menu, /href="\/dashboard\/settings"/);
  assert.match(menu, /aria-label="Account and settings"/);
});

test('identity verification remains discoverable through settings without implying an outcome', () => {
  assert.match(shell, new RegExp(`\\['Verification', '${verificationRoute}'\\]`));
  assert.doesNotMatch(menu, /not verified|unverified/i);
});

test('settings hub retains sign out, appearance and support', () => {
  const settingsIndex = read('app/dashboard/settings/page.tsx');
  const signOut = read('components/settings/AccountSignOut.tsx');
  assert.match(settingsIndex, /<AccountSignOut \/>/);
  assert.match(signOut, /onClick=\{signOut\}/);
  assert.match(signOut, /supabase\.auth\.signOut\(\)/);
  assert.ok(shell.includes("'/dashboard/settings/appearance'"));
  assert.ok(shell.includes("'/dashboard/settings/support'"));
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
