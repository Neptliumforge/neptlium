'use client';

import { useState, type FormEvent } from 'react';
import { Button, Field, FieldError, Input, Label } from '@neptlium/ui';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';
import { meetsPasswordRequirements } from '@/app/(auth)/auth-utils';
import { PasswordRequirements } from '@/app/(auth)/components/PasswordRequirements';

type Result = { readonly kind: 'error' | 'success'; readonly message: string } | null;

export function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    if (!meetsPasswordRequirements(next)) {
      setResult({ kind: 'error', message: 'Your new password doesn’t meet the requirements.' });
      return;
    }
    if (next !== confirm) {
      setResult({ kind: 'error', message: 'The new passwords don’t match.' });
      return;
    }
    if (next === current) {
      setResult({ kind: 'error', message: 'Choose a password you haven’t used for this account.' });
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) {
        setResult({
          kind: 'error',
          message: 'Your session has expired. Sign in again to continue.',
        });
        return;
      }
      // Re-verify the current password before changing it.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (verifyError) {
        setResult({ kind: 'error', message: 'Your current password is incorrect.' });
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) {
        setResult({
          kind: 'error',
          message:
            error.code === 'same_password'
              ? 'Choose a password you haven’t used for this account.'
              : error.code === 'weak_password'
                ? 'That password is too weak. Choose a stronger one.'
                : 'Your password couldn’t be changed. Try again.',
        });
        return;
      }
      setCurrent('');
      setNext('');
      setConfirm('');
      setResult({
        kind: 'success',
        message: 'Password changed. Consider signing out on your other devices.',
      });
    } catch {
      setResult({ kind: 'error', message: 'Your password couldn’t be changed. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid max-w-md gap-4" onSubmit={submit}>
      <Field>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />
      </Field>
      <Field>
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          value={next}
          onChange={(event) => setNext(event.target.value)}
        />
        <PasswordRequirements password={next} />
      </Field>
      <Field>
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </Field>
      {result?.kind === 'error' ? <FieldError>{result.message}</FieldError> : null}
      {result?.kind === 'success' ? (
        <p className="text-sm text-success" role="status">
          {result.message}
        </p>
      ) : null}
      <div>
        <Button type="submit" variant="cta" size="sm" disabled={submitting}>
          {submitting ? 'Changing…' : 'Change password'}
        </Button>
      </div>
    </form>
  );
}
