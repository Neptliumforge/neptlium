"use server";

import { revalidatePath } from "next/cache";
import { type Role } from "@neptlium/lib";
import { adminApiRequest, AdminApiError } from "@/lib/api";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };
const DELEGABLE_ROLES: readonly Role[] = ["user", "operator", "analyst", "manager"];

function failure(error: unknown, fallback: string): ActionResult {
  return { ok: false, error: error instanceof AdminApiError ? error.message : fallback };
}

export async function updateUserRole(userId: string, newRole: Role): Promise<ActionResult> {
  if (!DELEGABLE_ROLES.includes(newRole)) return { ok: false, error: "Administrator delegation is disabled." };
  try {
    await adminApiRequest(`/v1/admin/users/${encodeURIComponent(userId)}/role`, {
      method: "PATCH", body: JSON.stringify({ role: newRole })
    });
    revalidatePath(`/dashboard/users/${userId}`); revalidatePath("/dashboard/users");
    return { ok: true };
  } catch (error) { return failure(error, "Failed to update role."); }
}
export async function suspendUser(userId: string): Promise<ActionResult> {
  try {
    await adminApiRequest(`/v1/admin/users/${encodeURIComponent(userId)}/suspend`, { method: "POST" });
    revalidatePath(`/dashboard/users/${userId}`); revalidatePath("/dashboard/users");
    return { ok: true };
  } catch (error) { return failure(error, "Failed to suspend user."); }
}
export async function activateUser(userId: string): Promise<ActionResult> {
  try {
    await adminApiRequest(`/v1/admin/users/${encodeURIComponent(userId)}/activate`, { method: "POST" });
    revalidatePath(`/dashboard/users/${userId}`); revalidatePath("/dashboard/users");
    return { ok: true };
  } catch (error) { return failure(error, "Failed to activate user."); }
}
