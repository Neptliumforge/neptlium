'use client';

import { useActionState, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button, Field, FieldError, Input, Label } from '@neptlium/ui';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';
import { isValidEmail } from '../auth-utils';
import { RECOVERY_REDIRECT_PATH } from '../recovery';
import { resetPasswordAction, type ResetPasswordState } from '../reset-password/actions';
import { PasswordRequirements } from './PasswordRequirements';

const heading = 'text-[24px] font-semibold tracking-[-0.02em] text-text-primary';
const linkClass = 'text-[13px] font-medium text-accent-primary hover:brightness-110';

export function PasswordRecoveryRequestForm({ linkInvalid }: { readonly linkInvalid: boolean }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isValidEmail(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const redirectTo = new URL(RECOVERY_REDIRECT_PATH, window.location.origin).toString();
      const { error: requestError } =
        await createSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });
      // Rate limits are the only error worth surfacing; never reveal whether an account exists.
      if (requestError?.status === 429) {
        setError('Too many requests. Wait a few minutes and try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('We couldn’t send the email. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className={heading}>Check your email</h1>
          <p className="text-[13px] text-text-muted" role="status">
            If an account exists for {email.trim()}, we’ve sent a link to reset your password. The
            link expires after a short time.
          </p>
        </div>
        <Link href="/auth/sign-in" className={linkClass}>
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={submit}>
      <div className="space-y-1.5">
        <h1 className={heading}>Reset your password</h1>
        <p className="text-[13px] text-text-muted">
          {linkInvalid
            ? 'That reset link is invalid or has expired. Enter your email to get a new one.'
            : 'Enter the email for your account and we’ll send you a reset link.'}
        </p>
      </div>
      <Field>
        <Label htmlFor="recovery-email">Email</Label>
        <Input
          id="recovery-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button
        type="submit"
        variant="cta"
        className="h-11 w-full rounded-md text-[14px] font-semibold"
        disabled={submitting}
      >
        {submitting ? 'Sending…' : 'Send reset link'}
      </Button>
      <Link href="/auth/sign-in" className={`${linkClass} text-center`}>
        Return to sign in
      </Link>
    </form>
  );
}

const initialReset: ResetPasswordState = { error: null };

export function PasswordResetForm() {
  const [password, setPassword] = useState('');
  const [state, action, pending] = useActionState(resetPasswordAction, initialReset);
  return (
    <form className="flex flex-col gap-6" action={action}>
      <div className="space-y-1.5">
        <h1 className={heading}>Choose a new password</h1>
        <p className="text-[13px] text-text-muted">
          After you reset it, you’ll be signed out everywhere and can sign in with your new
          password.
        </p>
      </div>
      <Field>
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordRequirements password={password} />
      </Field>
      <Field>
        <Label htmlFor="reset-password-confirm">Confirm new password</Label>
        <Input
          id="reset-password-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      {state.error ? <FieldError>{state.error}</FieldError> : null}
      <Button
        type="submit"
        variant="cta"
        className="h-11 w-full rounded-md text-[14px] font-semibold"
        disabled={pending}
      >
        {pending ? 'Resetting…' : 'Reset password'}
      </Button>
    </form>
  );
}
