"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function approveWithdrawal(id: string): Promise<ActionResult> {
  await requireAdminUser();
  const db = createSupabaseAdminClient();

  const { error } = await db
    .from("wallet_transactions")
    .update({ status: "completed" })
    .eq("id", id)
    .in("status", ["pending", "pending_review"]);

  if (error) return { ok: false, error: "Failed to approve withdrawal." };

  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rejectWithdrawal(id: string, reason: string): Promise<ActionResult> {
  await requireAdminUser();
  const db = createSupabaseAdminClient();

  const { error } = await db
    .from("wallet_transactions")
    .update({ status: "cancelled", reference: reason.slice(0, 255) })
    .eq("id", id)
    .in("status", ["pending", "pending_review"]);

  if (error) return { ok: false, error: "Failed to reject withdrawal." };

  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard");
  return { ok: true };
}
