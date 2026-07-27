"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { InternalLedgerCustodyProvider, createNotification } from "@neptlium/lib";
import { requireUser } from "@/lib/auth";

async function getWalletId(
  profileId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<string | null> {
  const { data } = await supabase.from("wallets").select("id").eq("profile_id", profileId).maybeSingle();
  return data?.id ?? null;
}

export type GenerateAddressResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function generateDepositAddressAction(asset: string, network: string): Promise<GenerateAddressResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const walletId = await getWalletId(user.id, supabase);
  if (!walletId) return { ok: false, error: "Wallet not found." };

  const provider = new InternalLedgerCustodyProvider(supabase);

  try {
    await provider.provisionDepositAddress({ walletId, profileId: user.id, asset, network });
  } catch {
    return { ok: false, error: "Crypto deposits are not yet enabled for this account. A provider-assigned address is required before deposits can be displayed." };
  }

  await createNotification(
    supabase,
    user.id,
    "deposit",
    "Deposit address available",
    `New ${asset} (${network}) deposit destination is available.`
  );

  revalidatePath("/dashboard/wallet");
  return { ok: true };
}

export type WithdrawalResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function requestWithdrawalAction(
  _prevState: WithdrawalResult | null,
  formData: FormData
): Promise<WithdrawalResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const asset = String(formData.get("asset") ?? "");
  const network = String(formData.get("network") ?? "");
  const destination = String(formData.get("destination") ?? "").trim();
  const idempotencyKey = String(formData.get("idempotencyKey") ?? globalThis.crypto.randomUUID());
  const amount = Number(formData.get("amount"));

  if (!asset || !network || !destination || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "All fields are required and amount must be greater than zero." };
  }

  const walletId = await getWalletId(user.id, supabase);
  if (!walletId) return { ok: false, error: "Wallet not found." };

  const { error } = await supabase.rpc("request_wallet_withdrawal", {
    p_wallet_id: walletId,
    p_asset: asset,
    p_network: network,
    p_amount: amount,
    p_destination: destination,
    p_idempotency_key: idempotencyKey
  });

  if (error) {
    return { ok: false, error: "Unable to submit withdrawal request for review." };
  }

  await createNotification(
    supabase,
    user.id,
    "withdrawal",
    "Withdrawal requested",
    `${amount.toFixed(2)} ${asset} withdrawal to ${destination} is pending review.`
  );

  revalidatePath("/dashboard/wallet");
  return { ok: true };
}
