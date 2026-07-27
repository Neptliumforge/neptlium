"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { getCurrentAdminUser } from "@/lib/auth/session";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function approveAllocation(id: string): Promise<ActionResult> {
  const adminUser = await getCurrentAdminUser();
  await requireAdminUser();
  const db = createSupabaseAdminClient();

  const { error } = await db
    .from("capital_allocation_requests")
    .update({
      status: "approved",
      reviewed_by: adminUser?.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("status", "pending_review");

  if (error) return { ok: false, error: "Failed to approve allocation." };

  revalidatePath("/dashboard/allocations");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rejectAllocation(id: string, reason: string): Promise<ActionResult> {
  const adminUser = await getCurrentAdminUser();
  await requireAdminUser();
  const db = createSupabaseAdminClient();

  const { error } = await db
    .from("capital_allocation_requests")
    .update({
      status: "rejected",
      notes: reason,
      reviewed_by: adminUser?.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("status", "pending_review");

  if (error) return { ok: false, error: "Failed to reject allocation." };

  revalidatePath("/dashboard/allocations");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function executeAllocation(id: string): Promise<ActionResult> {
  const adminUser = await getCurrentAdminUser();
  await requireAdminUser();
  const db = createSupabaseAdminClient();

  const { error } = await db
    .from("capital_allocation_requests")
    .update({
      status: "executed",
      reviewed_by: adminUser?.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("status", "approved");

  if (error) return { ok: false, error: "Failed to execute allocation." };

  revalidatePath("/dashboard/allocations");
  revalidatePath("/dashboard");
  return { ok: true };
}
