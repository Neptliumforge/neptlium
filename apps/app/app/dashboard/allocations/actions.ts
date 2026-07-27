"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { createNotification } from "@neptlium/lib";
import { requireRole } from "@/lib/auth";

export type AllocationActionResult =
  | { readonly ok: true; readonly requestId: string }
  | { readonly ok: false; readonly error: string };

export async function submitAllocationRequestAction(
  _prevState: AllocationActionResult | null,
  formData: FormData
): Promise<AllocationActionResult> {
  // Requires at minimum analyst role
  const { user } = await requireRole("analyst");
  const supabase = await createSupabaseServerClient();

  const walletId = String(formData.get("wallet_id") ?? "").trim();
  const portfolioId = String(formData.get("portfolio_id") ?? "").trim() || null;
  const asset = String(formData.get("asset") ?? "").trim();
  const network = String(formData.get("network") ?? "").trim();
  const rawAmount = formData.get("amount");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const idempotencyKey = String(formData.get("idempotency_key") ?? "").trim() || null;

  const amount = Number(rawAmount);

  if (!walletId || !asset || !network) {
    return { ok: false, error: "Wallet, asset, and network are required." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  // Verify wallet belongs to this user
  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("id", walletId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!wallet) {
    return { ok: false, error: "Wallet not found." };
  }

  // Verify portfolio belongs to this user (if provided)
  if (portfolioId) {
    const { data: portfolio } = await supabase
      .from("investment_portfolios")
      .select("id")
      .eq("id", portfolioId)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!portfolio) {
      return { ok: false, error: "Portfolio not found." };
    }
  }

  // Check idempotency — return existing request if key already submitted
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from("capital_allocation_requests")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing) {
      revalidatePath("/dashboard/allocations");
      return { ok: true, requestId: existing.id };
    }
  }

  const { data, error } = await supabase
    .from("capital_allocation_requests")
    .insert({
      profile_id: user.id,
      wallet_id: walletId,
      portfolio_id: portfolioId,
      asset,
      network,
      amount,
      status: "pending_review",
      notes,
      idempotency_key: idempotencyKey
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: "Unable to submit allocation request. Please try again." };
  }

  await createNotification(
    supabase,
    user.id,
    "system",
    "Allocation request submitted",
    `${amount.toFixed(2)} ${asset} allocation request is pending review.`
  );

  revalidatePath("/dashboard/allocations");
  return { ok: true, requestId: data.id };
}
