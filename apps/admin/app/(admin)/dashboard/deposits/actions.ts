"use server";

import { adminApiRequest, AdminApiError } from "@/lib/api";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function markDepositCompleted(id: string): Promise<ActionResult> {
  try {
    await adminApiRequest(`/v1/admin/deposits/${encodeURIComponent(id)}/complete`, {
      method: "POST",
      headers: { "idempotency-key": `deposit-complete-${id}` },
      body: JSON.stringify({}),
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof AdminApiError
        ? error.message
        : "Deposit completion is unavailable.",
    };
  }
}
