'use client';

import { useState, type FormEvent } from 'react';
import { useUser } from '@clerk/nextjs';

export function ExistingAccountLinkForm() {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/link-existing', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(
          payload.error === 'invalid_credentials'
            ? 'Those existing-account credentials could not be verified.'
            : 'We could not securely link your existing account. Please try again.',
        );
        return;
      }
      window.location.assign('/auth/complete');
    } finally {
      setSubmitting(false);
      setPassword('');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="legacy-email" className="block text-sm font-medium text-text-primary">
          Existing account email
        </label>
        <input
          id="legacy-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="legacy-password" className="block text-sm font-medium text-text-primary">
          Existing account password
        </label>
        <input
          id="legacy-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm leading-6 text-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-surface transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Linking account…' : 'Link existing account'}
      </button>
      <p className="text-xs leading-5 text-text-muted">
        Your existing password is used only to verify the legacy session for this one-time identity link. It is not stored by Neptlium.
      </p>
    </form>
  );
}
