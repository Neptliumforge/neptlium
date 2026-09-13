"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@neptlium/lib/supabase/browser";

export function AdminSignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-text-muted hover:text-text-secondary hover:bg-[color:var(--color-surface-1)] transition-colors"
    >
      <LogOut className="size-3.5" />
      Sign out
    </button>
  );
}
