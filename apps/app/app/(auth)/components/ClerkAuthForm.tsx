'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useSignIn, useSignUp } from '@clerk/nextjs/legacy';
import { Button, Field, Input, Label } from '@neptlium/ui';
import { accountEntryHref, safeInternalPath } from '../auth-utils';
export function ClerkAuthForm({
  mode,
  returnTo,
}: {
  mode: 'sign-in' | 'sign-up';
  returnTo: string;
}) {
  const clerk = useClerk();
  const si = useSignIn();
  const su = useSignUp();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'mfa'>('email');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const finish = '/auth/complete?next=' + encodeURIComponent(safeInternalPath(returnTo));
  const signup = mode === 'sign-up';
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await action();
    } catch {
      setMessage(
        'We could not complete this step. Check the details, wait a moment, and try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function activate(session: string | null) {
    if (!session) throw new Error('Incomplete session');
    await clerk.setActive({ session });
    window.location.assign(finish);
  }
  async function sendCode() {
    if (!si.isLoaded || !su.isLoaded) return;
    if (Date.now() < resendAt) {
      setMessage('Please wait before requesting another code.');
      return;
    }
    if (signup) {
      if (su.signUp.status === 'missing_requirements')
        await su.signUp.update({ emailAddress: email.trim() });
      else await su.signUp.create({ emailAddress: email.trim() });
      await su.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    } else {
      const attempt = await si.signIn.create({ identifier: email.trim() });
      const factor = attempt.supportedFirstFactors?.find((f) => f.strategy === 'email_code');
      if (!factor || factor.strategy !== 'email_code') throw new Error('Email sign-in unavailable');
      await si.signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: factor.emailAddressId,
      });
    }
    setResendAt(Date.now() + 30000);
    setStep('code');
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      if (!si.isLoaded || !su.isLoaded) return;
      if (signup) {
        const attempt = await su.signUp.attemptEmailAddressVerification({ code });
        if (attempt.status !== 'complete') throw new Error('Complete the required account details');
        await activate(attempt.createdSessionId);
      } else {
        const attempt =
          step === 'mfa'
            ? await si.signIn.attemptSecondFactor({ strategy: 'totp', code })
            : await si.signIn.attemptFirstFactor({ strategy: 'email_code', code });
        if (attempt.status === 'needs_second_factor') {
          setCode('');
          setStep('mfa');
          return;
        }
        if (attempt.status !== 'complete') throw new Error('Additional verification required');
        await activate(attempt.createdSessionId);
      }
    });
  }
  async function social(strategy: 'oauth_google' | 'oauth_apple') {
    if (!si.isLoaded || !su.isLoaded) return;
    const resource = signup ? su.signUp : si.signIn;
    await resource.authenticateWithRedirect({
      strategy,
      redirectUrl: '/auth/sso-callback?next=' + encodeURIComponent(safeInternalPath(returnTo)),
      redirectUrlComplete: finish,
    });
  }
  return (
    <div className="space-y-5">
      <div>
        <h1 className="np-h3">{signup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {step === 'mfa'
            ? 'Enter the code from your authenticator.'
            : 'Continue securely with a code sent to your email.'}
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={
          step === 'email'
            ? (e) => {
                e.preventDefault();
                void run(sendCode);
              }
            : verify
        }
      >
        {step === 'email' ? (
          <Field>
            <Label htmlFor="clerk-email">Email address</Label>
            <Input
              id="clerk-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        ) : (
          <Field>
            <Label htmlFor="clerk-code">
              {step === 'mfa' ? 'Authenticator code' : 'Email verification code'}
            </Label>
            <Input
              id="clerk-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Field>
        )}
        <Button
          type="submit"
          variant="accent"
          className="w-full"
          disabled={busy || !si.isLoaded || !su.isLoaded}
        >
          {busy ? 'Please wait…' : step === 'email' ? 'Continue with email' : 'Verify and continue'}
        </Button>
      </form>
      {step === 'code' && (
        <div className="flex gap-3">
          <Button variant="ghost" disabled={busy} onClick={() => void run(sendCode)}>
            Resend code
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setStep('email');
              setCode('');
            }}
          >
            Change email
          </Button>
        </div>
      )}
      {step === 'email' && (
        <>
          <div className="grid gap-3">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void run(() => social('oauth_google'))}
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void run(() => social('oauth_apple'))}
            >
              Continue with Apple
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await clerk.authenticateWithMetamask({ redirectUrl: finish });
                })
              }
            >
              Continue with MetaMask
            </Button>
          </div>
          <p className="text-xs leading-5 text-text-muted">
            A verified email is required, including when you use a wallet. Wallet signatures prove
            ownership only. Never share a recovery phrase or private key.
          </p>
        </>
      )}
      <div id="clerk-captcha" />
      {message && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}
      <Link
        className="block text-sm underline"
        href={accountEntryHref(signup ? 'sign-in' : 'sign-up', returnTo)}
      >
        {signup ? 'Already have an account? Sign in' : 'New to Neptlium? Create an account'}
      </Link>
    </div>
  );
}
