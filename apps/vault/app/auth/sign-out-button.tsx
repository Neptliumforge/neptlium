'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';

export function SignOutButton() {
  const router = useRouter();
  return <button className="vault-sign-out" type="button" onClick={async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace('/auth/sign-in');
    router.refresh();
  }}>Sign out</button>;
}
