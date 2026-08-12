"use server";

import { revalidatePath } from "next/cache";
import { adminApiRequest, AdminApiError } from "@/lib/api";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

async function decision(id: string, action: "approve" | "reject", reason?: string): Promise<ActionResult> {
  try {
    await adminApiRequest(`/v1/admin/allocations/${encodeURIComponent(id)}/${action}`, {
      method: "POST",
      headers: { "idempotency-key": `allocation-${action}-${id}` },
      body: JSON.stringify(reason ? { reason } : {}),
    });
    revalidatePath("/dashboard/allocations");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof AdminApiError ? error.message : `Failed to ${action} allocation.` };
  }
}

export async function approveAllocation(id: string): Promise<ActionResult> {
  return decision(id, "approve");
}

export async function rejectAllocation(id: string, reason: string): Promise<ActionResult> {
  return decision(id, "reject", reason);
}

export async function executeAllocation(_id: string): Promise<ActionResult> {
  return { ok: false, error: "Allocation execution remains unavailable until governed execution capability is active." };
}
