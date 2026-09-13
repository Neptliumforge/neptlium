"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@neptlium/ui";
import { createSupabaseBrowserClient } from "@neptlium/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
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
