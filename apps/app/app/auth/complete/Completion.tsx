'use client';
import { useEffect, useRef, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button, Field, Input, Label } from '@neptlium/ui';
import { completeClerkSignIn } from '@/lib/auth/clerk-actions';
import { safeInternalPath } from '@/app/(auth)/auth-utils';
export function Completion({ returnTo }: { returnTo: string }) {
  const { isLoaded, user } = useUser();
  const clerk = useClerk();
  const started = useRef(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailId, setEmailId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function finish() {
    setBusy(true);
    const result = await completeClerkSignIn();
    setBusy(false);
    if (result.ok)
      window.location.replace(
        result.provisioned
          ? safeInternalPath(returnTo)
          : '/onboarding?next=' + encodeURIComponent(safeInternalPath(returnTo)),
      );
    else setMessage(result.error ?? 'Account setup is unavailable.');
  }
  useEffect(() => {
    if (
      isLoaded &&
      user?.primaryEmailAddress?.verification?.status === 'verified' &&
      !started.current
    ) {
      started.current = true;
      void finish();
    }
    // Completion is explicit and idempotent; retry remains user-driven after an outage.
  }, [isLoaded, user?.id]);
  async function verifyEmail() {
    if (!user) return;
    setBusy(true);
    setMessage('');
    try {
      if (!emailId) {
        const address =
          user.emailAddresses.find(
            (a) => a.emailAddress.toLowerCase() === email.trim().toLowerCase(),
          ) ?? (await user.createEmailAddress({ email: email.trim() }));
        await address.prepareVerification({ strategy: 'email_code' });
        await user.reload();
        setEmailId(address.id);
      } else {
        const address = user.emailAddresses.find((a) => a.id === emailId);
        if (!address) throw new Error('Email unavailable');
        const verified = await address.attemptVerification({ code });
        if (verified.verification?.status !== 'verified') throw new Error('Code not verified');
        await user.update({ primaryEmailAddressId: emailId });
        await finish();
      }
    } catch {
      setMessage('Email verification could not be completed. Try again.');
    } finally {
      setBusy(false);
    }
  }
  if (!isLoaded) return <p role="status">Loading secure session…</p>;
  if (!user)
    return (
      <div>
        <p>Complete sign-in to continue.</p>
        <a href="/auth/sign-in">Sign in</a>
      </div>
    );
  return (
    <div className="space-y-5">
      <h1 className="np-h3">Finish secure account setup</h1>
      {user.primaryEmailAddress?.verification?.status !== 'verified' ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void verifyEmail();
          }}
        >
          <p className="text-sm text-text-secondary">
            Verify your email before entering Neptlium, including when you sign in with a wallet.
          </p>
          <Field>
            <Label htmlFor="verify-contact">
              {emailId ? 'Verification code' : 'Email address'}
            </Label>
            <Input
              id="verify-contact"
              type={emailId ? 'text' : 'email'}
              autoComplete={emailId ? 'one-time-code' : 'email'}
              required
              value={emailId ? code : email}
              onChange={(e) => (emailId ? setCode(e.target.value) : setEmail(e.target.value))}
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {emailId ? 'Verify email' : 'Send verification code'}
          </Button>
          {emailId && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setEmailId(null);
                setCode('');
              }}
            >
              Change email or request a new code
            </Button>
          )}
        </form>
      ) : (
        <Button disabled={busy} onClick={() => void finish()}>
          {busy ? 'Preparing your account…' : 'Continue'}
        </Button>
      )}
      {message && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}
      <Button
        variant="ghost"
        disabled={busy}
        onClick={() => void clerk.signOut({ redirectUrl: '/auth/sign-in' })}
      >
        Sign out
      </Button>
    </div>
  );
}
