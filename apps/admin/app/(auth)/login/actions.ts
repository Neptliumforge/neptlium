"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { isGeneralPlatformAdminRole } from "@/lib/auth/authorization";

export interface AdminLoginState {
  readonly error: string | null;
  readonly success: boolean;
}

export const initialAdminLoginState: AdminLoginState = {
  error: null,
  success: false
};

function safeInternalPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  try {
    const url = new URL(value, "https://neptlium.invalid");
    return url.origin === "https://neptlium.invalid"
      ? `${url.pathname}${url.search}`
      : fallback;
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address.", success: false };
  }
  if (!password) {
    return { error: "Password is required.", success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "The email or password is incorrect.", success: false };
  }

  // Authentication establishes identity only. Administrative authorization
  // requires the exact General Platform Administrator role on the server.
  const db = createSupabaseAdminClient();
  const { data: roleRow } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!isGeneralPlatformAdminRole(roleRow?.role)) {
    await supabase.auth.signOut();
    return {
      error: "Your account does not have General Platform Administrator access.",
      success: false
    };
  }

  redirect(next);
}
