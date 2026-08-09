import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const actionable = [
  'confirm-signup.html',
  'reset-password.html',
  'change-email.html',
  'invite-user.html',
  'magic-link.html',
];

const informational = [
  'password-changed.html',
  'email-changed.html',
];

for (const file of actionable) {
  test(`${file} uses the Neptlium transactional email contract`, async () => {
    const html = await readFile(
      new URL(`../templates/${file}`, import.meta.url),
      'utf8',
    );

    assert.match(html, /https:\/\/neptlium\.com\/neptlium-email-logo\.png/);
    assert.match(html, /\{\{\s*\.ConfirmationURL\s*\}\}/);
    assert.doesNotMatch(html, /\{\{\s*\.Token\s*\}\}/);
    assert.doesNotMatch(html, /6-digit/i);
    assert.doesNotMatch(html, /verification code/i);
    assert.match(html, /#FFFFFF/i);
    assert.match(html, /#0B8CFF/i);
    assert.match(html, /role="presentation"/i);
  });
}

for (const file of informational) {
  test(`${file} uses the Neptlium transactional email contract`, async () => {
    const html = await readFile(
      new URL(`../templates/${file}`, import.meta.url),
      'utf8',
    );

    assert.match(html, /https:\/\/neptlium\.com\/neptlium-email-logo\.png/);
    assert.doesNotMatch(html, /\{\{\s*\.Token\s*\}\}/);
    assert.doesNotMatch(html, /6-digit/i);
    assert.match(html, /#FFFFFF/i);
    assert.match(html, /role="presentation"/i);
  });
}

test('confirm signup uses canonical copy', async () => {
  const html = await readFile(
    new URL('../templates/confirm-signup.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /Confirm your email/);
  assert.match(html, />Confirm email</);
});

test('subject registry contains canonical subjects', async () => {
  const subjects = JSON.parse(
    await readFile(
      new URL('../templates/subjects.json', import.meta.url),
      'utf8',
    ),
  );

  assert.equal(
    subjects.confirm_signup,
    'Confirm your Neptlium account',
  );

  assert.equal(
    subjects.reset_password,
    'Reset your Neptlium password',
  );
});
