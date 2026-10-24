'use client';

import { useIdentityActions } from '@/components/security/IdentityActions';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@neptlium/ui';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';

export function SignOutButton() {
  const router = useRouter();
  const identity = useIdentityActions();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      const supabase = identity ? null : createSupabaseBrowserClient();
      if (identity) await identity.signOut();
      else await supabase?.auth.signOut();
      router.replace('/auth/sign-in');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={signOut}>
      {busy ? 'Signing out…' : 'Sign Out'}
    </Button>
  );
}
