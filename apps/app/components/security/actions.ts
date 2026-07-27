"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { createNotification } from "@neptlium/lib";
import { requireUser } from "@/lib/auth";
import { recordSecurityEvent } from "@/lib/security/events";

export async function signOutAction(): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  await recordSecurityEvent(supabase, user.id, "logout");
  await supabase.auth.signOut({ scope: "local" });

  redirect("/login");
}

export type RevokeOtherSessionsResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

/**
 * Signs out every session for this account except the one making the
 * request (Supabase's `others` scope) — the real behavior behind a
 * "Sign out of other devices" control, not a placeholder.
 */
export async function revokeOtherSessionsAction(): Promise<RevokeOtherSessionsResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) {
    return { ok: false, error: "Unable to sign out other devices. Please try again." };
  }

  await recordSecurityEvent(supabase, user.id, "sessions_revoked");
  await createNotification(
    supabase,
    user.id,
    "security",
    "Other sessions signed out",
    "Every session other than this one was signed out of your account."
  );
  return { ok: true };
}
