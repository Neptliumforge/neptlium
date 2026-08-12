"use server";

import { revalidatePath } from "next/cache";
import { adminApiRequest, AdminApiError } from "@/lib/api";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function approveWithdrawal(id: string): Promise<ActionResult> {
  try {
    await adminApiRequest(`/v1/admin/withdrawals/${encodeURIComponent(id)}/approve`, {
      method: "POST",
      headers: { "idempotency-key": `withdrawal-approve-${id}` },
      body: JSON.stringify({}),
    });
    revalidatePath("/dashboard/withdrawals"); revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof AdminApiError ? error.message : "Failed to approve withdrawal." };
  }
}
export async function rejectWithdrawal(id: string, reason: string): Promise<ActionResult> {
  try {
    await adminApiRequest(`/v1/admin/withdrawals/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      headers: { "idempotency-key": `withdrawal-reject-${id}` },
      body: JSON.stringify({ reason }),
    });
    revalidatePath("/dashboard/withdrawals"); revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof AdminApiError ? error.message : "Failed to reject withdrawal." };
  }
}
