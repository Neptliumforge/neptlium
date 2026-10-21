import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import {
  accountSetupPrompt,
  isIdentityVerified,
  isLegalNameEditable,
  presentIdentityVerification,
} from '../lib/account/identity-verification.ts';
import { buildProfileUpdate } from '../lib/account/profile.ts';
import { resolveReturnDestination } from '../app/(auth)/auth-utils.ts';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const notEnabled = {
  capability: 'NOT_ENABLED',
  record: { state: 'NOT_CONFIGURED' },
  can_start: false,
};
const recorded = (status, extra = {}) => ({
  capability: 'AVAILABLE',
  record: {
    state: 'VALUE',
    value: {
      status,
      updated_at: '2026-10-21T00:00:00.000Z',
      action_required_reason: null,
      ...extra,
    },
  },
  can_start: status === 'NOT_VERIFIED' || status === 'ACTION_REQUIRED',
});
const status = (onboarding, identity_verification = notEnabled) => ({
  onboarding: { state: onboarding, completed_at: null },
  standing: 'UNRESTRICTED',
  identity_verification,
});

test('verification with no provider shows a truthful not-yet-available state with no status or action', () => {
  const view = presentIdentityVerification(notEnabled);
  assert.equal(view.status, null);
  assert.equal(view.action, null);
  assert.match(view.title, /isn’t available yet/);
  assert.match(view.detail, /don’t need it to use your dashboard/);
  assert.doesNotMatch(`${view.title} ${view.detail}`, /\bverified\b|pending|submitted/i);
});

test('unreadable verification state is unknown, never "not verified"', () => {
  for (const view of [
    null,
    { capability: 'AVAILABLE', record: { state: 'UNAVAILABLE' }, can_start: false },
  ]) {
    const presented = presentIdentityVerification(view);
    assert.equal(presented.status, null);
    assert.equal(presented.action, null);
    assert.match(presented.title, /unavailable/);
  }
});

test('statuses render only from recorded verification and offer actions only when startable', () => {
  assert.equal(presentIdentityVerification(recorded('NOT_VERIFIED')).status, 'Not verified');
  assert.equal(
    presentIdentityVerification(recorded('NOT_VERIFIED')).action.label,
    'Start verification',
  );
  assert.equal(presentIdentityVerification(recorded('PENDING')).status, 'Pending');
  assert.equal(presentIdentityVerification(recorded('PENDING')).action, null);
  const actionRequired = presentIdentityVerification(
    recorded('ACTION_REQUIRED', {
      action_required_reason: 'Upload a clearer photo of your document.',
    }),
  );
  assert.equal(actionRequired.status, 'Action required');
  assert.equal(actionRequired.action.label, 'Continue verification');
  assert.match(actionRequired.detail, /clearer photo/);
  assert.equal(presentIdentityVerification(recorded('VERIFIED')).status, 'Verified');
  assert.equal(presentIdentityVerification(recorded('VERIFIED')).action, null);
  const empty = { capability: 'AVAILABLE', record: { state: 'EMPTY' }, can_start: true };
  assert.equal(presentIdentityVerification(empty).status, 'Not verified');
  const paused = { ...recorded('NOT_VERIFIED'), capability: 'DEGRADED', can_start: false };
  assert.equal(presentIdentityVerification(paused).action, null);
  assert.match(presentIdentityVerification(paused).detail, /temporarily unavailable/);
});

test('only a recorded VERIFIED status marks the account as verified', () => {
  assert.equal(isIdentityVerified(recorded('VERIFIED')), true);
  for (const view of [null, undefined, notEnabled, recorded('PENDING'), recorded('NOT_VERIFIED')])
    assert.equal(isIdentityVerified(view), false);
  const layout = read('app/dashboard/layout.tsx');
  assert.match(layout, /verified=\{isIdentityVerified\(status\?\.identity_verification\)\}/);
  assert.doesNotMatch(layout, /complianceStatus === 'active'/);
});

test('compliance status is never presented as identity verification', () => {
  const experience = read('components/product/RecordExperiences.tsx');
  assert.doesNotMatch(experience, /Identity status/);
  assert.doesNotMatch(experience, /\{account\.complianceStatus/);
  for (const path of [
    'components/settings/IdentityVerificationPanel.tsx',
    'app/dashboard/settings/profile/page.tsx',
    'app/dashboard/settings/verification/page.tsx',
    'app/dashboard/settings/account/page.tsx',
  ])
    assert.doesNotMatch(read(path), /complianceStatus/, path);
});

test('dashboard shows non-blocking setup guidance and never redirects to onboarding', () => {
  assert.equal(accountSetupPrompt(null), null);
  assert.equal(accountSetupPrompt(status('COMPLETED')), null);
  assert.equal(accountSetupPrompt(status('NOT_STARTED')).cta, 'Set up profile');
  assert.equal(accountSetupPrompt(status('IN_PROGRESS')).cta, 'Continue setup');
  for (const path of ['app/dashboard/page.tsx', 'app/dashboard/layout.tsx']) {
    const source = read(path);
    assert.doesNotMatch(source, /redirect\(\s*['"]\/onboarding/, path);
  }
  assert.match(read('app/dashboard/page.tsx'), /<AccountSetupPrompt status=\{status\} \/>/);
  // Onboarding only ever redirects forward to a dashboard destination: no loop is possible.
  assert.match(read('app/onboarding/layout.tsx'), /redirect\(await getOnboardingReturnPath\(\)\)/);
  assert.match(
    read('lib/auth/return-context.ts'),
    /resolveReturnDestination\(entry\.searchParams, false\)/,
  );
  for (const next of ['/onboarding', '/onboarding?step=2'])
    assert.equal(resolveReturnDestination(new URLSearchParams({ next }), false), '/dashboard');
});

test('dashboard access never depends on identity verification or onboarding', () => {
  const guards = read('lib/auth/guards.ts');
  const layout = read('app/dashboard/layout.tsx');
  for (const source of [guards, layout]) {
    assert.doesNotMatch(
      source,
      /identity_verification[^)]*\?\s*redirect|onboarding\.state[^\n]*redirect/,
    );
  }
  assert.match(read('lib/account/status.ts'), /return null;/);
});

test('profile updates send only changed, valid fields', () => {
  const current = { firstName: 'Ada', lastName: 'Lovelace', displayName: null };
  assert.deepEqual(
    buildProfileUpdate({ firstName: 'Ada', lastName: 'Lovelace', displayName: '' }, current, true),
    {
      ok: true,
      payload: null,
    },
  );
  assert.deepEqual(
    buildProfileUpdate(
      { firstName: ' Ada ', lastName: 'Byron', displayName: 'Countess' },
      current,
      true,
    ),
    { ok: true, payload: { last_name: 'Byron', display_name: 'Countess' } },
  );
  assert.equal(
    buildProfileUpdate({ firstName: '', lastName: 'x', displayName: '' }, current, true).ok,
    false,
  );
  assert.equal(
    buildProfileUpdate(
      { firstName: 'a', lastName: 'x'.repeat(101), displayName: '' },
      current,
      true,
    ).ok,
    false,
  );
  // Locked legal name: name inputs are ignored, display name still saves.
  assert.deepEqual(
    buildProfileUpdate({ firstName: 'Eve', lastName: '', displayName: 'Ada' }, current, false),
    { ok: true, payload: { display_name: 'Ada' } },
  );
  assert.deepEqual(
    buildProfileUpdate(
      { firstName: 'Ada', lastName: 'Lovelace', displayName: '' },
      { ...current, displayName: 'A' },
      true,
    ),
    { ok: true, payload: { display_name: null } },
  );
});

test('legal name editability follows verification records and fails closed when unknown', () => {
  assert.equal(isLegalNameEditable(notEnabled), true);
  assert.equal(isLegalNameEditable(recorded('NOT_VERIFIED')), true);
  assert.equal(isLegalNameEditable(recorded('ACTION_REQUIRED')), true);
  assert.equal(isLegalNameEditable(recorded('PENDING')), false);
  assert.equal(isLegalNameEditable(recorded('VERIFIED')), false);
  assert.equal(isLegalNameEditable(null), false);
  assert.equal(
    isLegalNameEditable({
      capability: 'AVAILABLE',
      record: { state: 'UNAVAILABLE' },
      can_start: false,
    }),
    false,
  );
});

test('profile settings carries a dedicated Verify your identity section', () => {
  const profile = read('app/dashboard/settings/profile/page.tsx');
  const panel = read('components/settings/IdentityVerificationPanel.tsx');
  assert.match(profile, /<IdentityVerificationPanel status=\{status\} \/>/);
  assert.match(profile, /<ProfileForm/);
  assert.match(panel, /id="verify-identity"/);
  assert.match(panel, /Verify your identity/);
  assert.match(read('app/dashboard/settings/verification/page.tsx'), /IdentityVerificationPanel/);
  assert.match(
    read('app/dashboard/verification/page.tsx'),
    /redirect\('\/dashboard\/settings\/verification'\)/,
  );
  assert.match(
    read('components/settings/SettingsShell.tsx'),
    /'Verification', '\/dashboard\/settings\/verification'/,
  );
});

test('verification start goes through the API and only follows an https provider continuation', () => {
  const actions = read('app/dashboard/settings/actions.ts');
  assert.match(actions, /startIdentityVerificationSession\(randomUUID\(\)\)/);
  assert.match(actions, /destination\.protocol !== 'https:'/);
  assert.match(actions, /await requireUser\(\)/);
  const client = read('lib/api/client.ts');
  for (const contract of [
    '/v1/account/status',
    '/v1/account/profile',
    '/v1/account/identity-verification/sessions',
  ])
    assert.match(client, new RegExp(contract.replaceAll('/', '\\/')));
  assert.doesNotMatch(
    read('components/settings/StartVerificationButton.tsx') +
      read('components/settings/IdentityVerificationPanel.tsx'),
    /type="file"|getUserMedia|selfie|upload/i,
  );
});

test('settings server actions require a session and never read authority from the browser', () => {
  const actions = read('app/dashboard/settings/actions.ts');
  assert.equal(actions.match(/await requireUser\(\)/g)?.length, 2);
  assert.doesNotMatch(actions, /formData\.get\('(?:id|userId|role|compliance|status)'\)/);
  assert.doesNotMatch(actions, /service_role|SERVICE_ROLE/);
});

test('password recovery: request, dedicated code exchange and recovery-only reset', () => {
  const forgot = read('app/(auth)/forgot-password/page.tsx');
  const forms = read('app/(auth)/components/PasswordRecoveryForms.tsx');
  const recovery = read('app/auth/recovery/route.ts');
  const reset = read('app/(auth)/reset-password/page.tsx');
  const resetAction = read('app/(auth)/reset-password/actions.ts');
  assert.match(forgot, /PasswordRecoveryRequestForm/);
  assert.doesNotMatch(forgot, /redirect\(/);
  assert.match(forms, /resetPasswordForEmail\(/);
  assert.match(forms, /RECOVERY_REDIRECT_PATH/);
  assert.match(forms, /If an account exists/);
  assert.match(recovery, /exchangeCodeForSession\(code\)/);
  assert.match(recovery, /httpOnly: true/);
  assert.match(recovery, /new URL\('\/reset-password', url\.origin\)/);
  assert.match(recovery, /recovery_link_invalid/);
  assert.match(reset, /cookieStore\.get\(RECOVERY_COOKIE\)\?\.value === '1'/);
  assert.match(resetAction, /cookieStore\.get\(RECOVERY_COOKIE\)\?\.value !== '1'/);
  assert.match(resetAction, /meetsPasswordRequirements\(password\)/);
  assert.match(resetAction, /signOut\(\{ scope: 'global' \}\)/);
  assert.match(resetAction, /redirect\('\/password-updated'\)/);
  // The auth-error page's "Request a new link" target now exists.
  assert.match(read('app/(auth)/auth-error/page.tsx'), /href="\/reset-password"/);
  assert.ok(existsSync(resolve(root, 'app/(auth)/reset-password/page.tsx')));
});

test('security settings: password change re-verifies the current password; session scopes exist', () => {
  const change = read('components/settings/ChangePasswordForm.tsx');
  const sessions = read('components/settings/SessionControls.tsx');
  const verify = change.indexOf('signInWithPassword');
  const update = change.indexOf('updateUser');
  assert.ok(verify > 0 && update > verify, 'current password is verified before update');
  assert.match(change, /meetsPasswordRequirements\(next\)/);
  for (const scope of ['local', 'others', 'global'])
    assert.match(sessions, new RegExp(`signOut\\('${scope}'\\)`));
  assert.match(read('app/dashboard/settings/security/page.tsx'), /<ChangePasswordForm \/>/);
});

test('settings pages are truthful about unsupported preferences and link privacy documents', () => {
  const notifications = read('app/dashboard/settings/notifications/page.tsx');
  assert.match(notifications, /aren’t configurable yet/);
  assert.doesNotMatch(notifications, /<input|type="checkbox"|Switch/);
  const account = read('app/dashboard/settings/account/page.tsx');
  for (const href of [
    'https://neptlium.com/privacy',
    'https://neptlium.com/terms',
    'https://neptlium.com/cookie-policy',
  ])
    assert.match(account, new RegExp(href.replaceAll('/', '\\/').replaceAll('.', '\\.')));
  assert.match(account, /href="\/dashboard\/support"/);
});
