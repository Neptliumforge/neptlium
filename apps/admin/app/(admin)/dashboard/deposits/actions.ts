"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function markDepositCompleted(id: string): Promise<ActionResult> {
  await requireAdminUser();
  const db = createSupabaseAdminClient();

  const { error } = await db
    .from("wallet_transactions")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("type", "deposit")
    .in("status", ["pending", "pending_review"]);

  if (error) return { ok: false, error: "Failed to mark deposit as completed." };

  revalidatePath("/dashboard/deposits");
  revalidatePath("/dashboard");
  return { ok: true };
}
