"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { hasRole, type Role } from "@neptlium/lib";
import { requireAdminUser } from "@/lib/auth";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function updateUserRole(userId: string, newRole: Role): Promise<ActionResult> {
  const { role: adminRole } = await requireAdminUser();

  // Only super_admin can grant admin or super_admin roles
  if ((newRole === "admin" || newRole === "super_admin") && !hasRole(adminRole, "super_admin")) {
    return { ok: false, error: "Only super administrators can grant admin roles." };
  }

  const db = createSupabaseAdminClient();
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
