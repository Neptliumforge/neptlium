"use server";

import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { createNotification } from "@neptlium/lib";
import { requireUser } from "@/lib/auth";
import { recordSecurityEvent } from "@/lib/security/events";

const NOTIFICATION_COPY = {
  mfa_enrolled: { title: "Authenticator app enrolled", body: "Multi-factor authentication is now active on your account." },
  mfa_unenrolled: { title: "Authenticator app removed", body: "Multi-factor authentication was disabled on your account." }
} as const;

/**
 * MFA enroll/verify/unenroll itself happens client-side via
 * supabase.auth.mfa (it needs to render a QR code and collect a live TOTP
 * code) — this just records the resulting security event and notification
 * server-side.
 */
export async function recordMfaEvent(eventType: "mfa_enrolled" | "mfa_unenrolled"): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  await recordSecurityEvent(supabase, user.id, eventType);

  const copy = NOTIFICATION_COPY[eventType];
  await createNotification(supabase, user.id, "security", copy.title, copy.body);
}
