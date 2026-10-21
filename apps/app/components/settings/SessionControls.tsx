'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@neptlium/ui';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';

type Scope = 'local' | 'others' | 'global';

export function SessionControls({ lastSignInAt }: { readonly lastSignInAt: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Scope | null>(null);
  const [message, setMessage] = useState<{
    readonly kind: 'error' | 'success';
    readonly text: string;
  } | null>(null);

  async function signOut(scope: Scope) {
    setBusy(scope);
    setMessage(null);
    try {
      const { error } = await createSupabaseBrowserClient().auth.signOut({ scope });
      if (error) {
        setMessage({ kind: 'error', text: 'We couldn’t sign you out. Try again.' });
        return;
      }
      if (scope === 'others') {
        setMessage({ kind: 'success', text: 'You’ve been signed out on all other devices.' });
        return;
      }
      router.replace('/auth/sign-in');
      router.refresh();
    } catch {
      setMessage({ kind: 'error', text: 'We couldn’t sign you out. Try again.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-text-secondary">
        {lastSignInAt
          ? `This device signed in ${new Date(lastSignInAt).toLocaleString()}.`
          : 'Sign-in time for this device isn’t available.'}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => signOut('local')}
        >
          {busy === 'local' ? 'Signing out…' : 'Sign out'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => signOut('others')}
        >
          {busy === 'others' ? 'Signing out…' : 'Sign out on other devices'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => signOut('global')}
        >
          {busy === 'global' ? 'Signing out…' : 'Sign out everywhere'}
        </Button>
      </div>
      {message ? (
        <p
          className={message.kind === 'error' ? 'text-sm text-danger' : 'text-sm text-success'}
          role={message.kind === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
