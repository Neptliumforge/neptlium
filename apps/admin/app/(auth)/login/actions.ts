"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { adminApiRequestWithToken, AdminApiError } from "@/lib/api";

export interface AdminLoginState {
  readonly error: string | null;
  readonly success: boolean;
}
export const initialAdminLoginState: AdminLoginState = { error: null, success: false };

function safeInternalPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://neptlium.invalid");
    return url.origin === "https://neptlium.invalid" ? `${url.pathname}${url.search}` : fallback;
  } catch {
    return fallback;
  }
}

export async function adminLogin(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const next = safeInternalPath(formData.get("next") as string | null);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Enter a valid email address.", success: false };
  if (!password) return { error: "Password is required.", success: false };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session?.access_token)
    return { error: "The email or password is incorrect.", success: false };

  try {
    await adminApiRequestWithToken<{ role: "super_admin" }>(
      data.session.access_token,
      "/v1/admin/session",
    );
  } catch (error) {
    await supabase.auth.signOut();
    if (error instanceof AdminApiError && error.status === 403)
      return { error: "Your account does not have access to this console.", success: false };
    return { error: "Administrative authorization is currently unavailable.", success: false };
  }

  redirect(next);
}
