'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';

export function AccountSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/auth/sign-in');
      router.refresh();
    } catch {
      setPending(false);
    }
  }
  return <button type="button" onClick={signOut} disabled={pending} className="op-inline-link min-h-11" aria-label="Sign out of Neptlium">
    <LogOut size={16} aria-hidden="true" /> {pending ? 'Signing out…' : 'Sign out'}
  </button>;
}
