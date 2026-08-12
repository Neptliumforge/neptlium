"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { type Role } from "@neptlium/lib";
import { requireAdminUser } from "@/lib/auth";
import { isDelegableRole } from "@/lib/auth/authorization";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function updateUserRole(userId: string, newRole: Role): Promise<ActionResult> {
  await requireAdminUser();

  if (!isDelegableRole(newRole)) {
    return {
      ok: false,
      error: "Administrative roles are not assignable from the admin console."
    };
  }

  const db = createSupabaseAdminClient();
  const { data: existingRole, error: existingRoleError } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingRoleError) {
    return { ok: false, error: "Failed to verify current role." };
  }

  if (existingRole?.role === "super_admin") {
    return {
      ok: false,
      error: "The General Platform Administrator role cannot be changed from this console."
    };
  }

  const { error } = await db
    .from("user_roles")
    .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });

  if (error) return { ok: false, error: "Failed to update role. Please try again." };

  revalidatePath(`/dashboard/users/${userId}`);
  revalidatePath("/dashboard/users");
  return { ok: true };
}

export async function suspendUser(userId: string): Promise<ActionResult> {
  await requireAdminUser();
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ compliance_status: "suspended" })
    .eq("id", userId);

  if (error) return { ok: false, error: "Failed to suspend user." };

  revalidatePath(`/dashboard/users/${userId}`);
  revalidatePath("/dashboard/users");
  return { ok: true };
}

export async function activateUser(userId: string): Promise<ActionResult> {
  await requireAdminUser();
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ compliance_status: "active" })
    .eq("id", userId);

  if (error) return { ok: false, error: "Failed to activate user." };

  revalidatePath(`/dashboard/users/${userId}`);
  revalidatePath("/dashboard/users");
  return { ok: true };
}
