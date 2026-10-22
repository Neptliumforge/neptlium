'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';
import { accountEntryHref, safeInternalPath } from '../auth-utils';

// Supabase Auth allows one confirmation email per address per 60 seconds.
const RESEND_COOLDOWN_SECONDS = 60;

export function SupabaseAuthForm({
  mode,
  returnTo,
}: {
  readonly mode: 'sign-in' | 'sign-up';
  readonly returnTo: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const destination = safeInternalPath(returnTo);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  function confirmationRedirect() {
    const callback = new URL('/auth/callback', window.location.origin);
    callback.searchParams.set('next', destination);
    return callback.toString();
  }

  async function resendConfirmation() {
    if (!pendingEmail || resendIn > 0) return;
    setResendStatus(null);
    const supabase = createSupabaseBrowserClient();
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: pendingEmail,
      options: { emailRedirectTo: confirmationRedirect() },
    });
    setResendIn(RESEND_COOLDOWN_SECONDS);
    // Supabase does not reveal whether an address is registered; neither does this message.
    setResendStatus(
      resendError?.status === 429
        ? 'Too many requests. Wait a minute, then try again.'
        : 'If a confirmation is waiting for this address, we sent a new email.',
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError('That email or password did not match. Try again or reset your password.');
          return;
        }
        router.replace(destination);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: confirmationRedirect() },
      });
      if (signUpError) {
        console.error('Supabase sign-up failed', { code: signUpError.code });
        setError('We could not create your account. Review your details and try again.');
        return;
      }
      if (data.session) {
        router.replace(destination);
        router.refresh();
        return;
      }
      // Supabase answers an already registered address with the same response and sends no
      // email, so this state must also lead an existing customer to sign-in or reset.
      setPendingEmail(email.trim());
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setResendStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  const isSignIn = mode === 'sign-in';

  if (!isSignIn && pendingEmail) {
    return (
      <div className="rounded-[14px] border border-border-hairline bg-surface-1 p-6 sm:p-7">
        <p className="neptlium-meta mb-3">Confirm your email</p>
        <h1 className="text-[1.8rem] font-medium tracking-[-0.035em] text-text-primary">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary" role="status">
          If <strong className="font-medium text-text-primary">{pendingEmail}</strong> can be used
          for a new account, we sent a link to confirm it. Open the link on this device and browser
          to finish creating your account.
        </p>
        <div className="mt-5 rounded-[10px] border border-border-hairline bg-surface-0 p-4 text-sm leading-6 text-text-secondary">
          <p className="font-medium text-text-primary">Already have a Neptlium account?</p>
          <p className="mt-1">No email is sent for an address that is already registered.</p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link
              className="font-medium text-[#35D5C1] underline-offset-4 hover:underline"
              href={accountEntryHref('sign-in', destination)}
            >
              Sign in
            </Link>
            <Link
              className="font-medium text-[#35D5C1] underline-offset-4 hover:underline"
              href="/forgot-password"
            >
              Reset password
            </Link>
          </p>
        </div>
        <div className="mt-6 space-y-3">
          <button
            className="w-full rounded-[10px] border border-border-default px-4 py-3 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={resendIn > 0}
            onClick={resendConfirmation}
            type="button"
          >
            {resendIn > 0 ? `Resend email in ${resendIn}s` : 'Resend email'}
          </button>
          {resendStatus ? (
            <p className="text-sm text-text-secondary" role="status">
              {resendStatus}
            </p>
          ) : null}
          <p className="text-sm text-text-muted">
            Wrong address?{' '}
            <button
              className="font-medium text-[#35D5C1] underline-offset-4 hover:underline"
              onClick={() => {
                setPendingEmail(null);
                setResendStatus(null);
              }}
              type="button"
            >
              Use a different email
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-border-hairline bg-surface-1 p-6 sm:p-7">
      <p className="neptlium-meta mb-3">Secure access</p>
      <h1 className="text-[1.8rem] font-medium tracking-[-0.035em] text-text-primary">
        {isSignIn ? 'Sign in' : 'Create account'}
      </h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {isSignIn
          ? 'Access your portfolio, capital and account activity.'
          : 'Create your Neptlium account with email and password.'}
      </p>

      <form className="mt-7 space-y-5" onSubmit={submit}>
        <label className="block text-sm text-text-secondary">
          Email
          <input
            className="mt-2 w-full rounded-[10px] border border-border-default bg-surface-0 px-3.5 py-3 text-text-primary outline-none focus:border-[#35D5C1]"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {isSignIn ? (
          <div className="-mt-2 text-right">
            <Link
              className="text-sm font-medium text-[#35D5C1] underline-offset-4 hover:underline"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}
        <label className="block text-sm text-text-secondary">
          Password
          <input
            className="mt-2 w-full rounded-[10px] border border-border-default bg-surface-0 px-3.5 py-3 text-text-primary outline-none focus:border-[#35D5C1]"
            type="password"
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? (
          <p className="text-sm text-status-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="text-sm text-text-secondary" role="status">
            {notice}
          </p>
        ) : null}
        <button
          className="w-full rounded-[10px] bg-[#35D5C1] px-4 py-3 text-sm font-semibold text-[#050505] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'Working…' : isSignIn ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-text-muted">
        {isSignIn ? 'New to Neptlium? ' : 'Already have an account? '}
        <Link
          className="font-medium text-[#35D5C1] underline-offset-4 hover:underline"
          href={accountEntryHref(isSignIn ? 'sign-up' : 'sign-in', destination)}
        >
          {isSignIn ? 'Create account' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
