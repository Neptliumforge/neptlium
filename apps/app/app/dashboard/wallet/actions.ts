"use server";

import { revalidatePath } from "next/cache";
import { apiRequest, ApiClientError } from "@/lib/api/client";

export type GenerateAddressResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function generateDepositAddressAction(asset: string, network: string): Promise<GenerateAddressResult> {
  if (!asset || !network) return { ok: false, error: "Asset and network are required." };
  try {
    await apiRequest<{ status: string; environment: string }>("/v1/capital-account/provider-wallet", {
      method: "POST",
      headers: { "idempotency-key": globalThis.crypto.randomUUID() }
    });
    await apiRequest(
      `/v1/capital-account/deposit-address?asset=${encodeURIComponent(asset)}&network=${encodeURIComponent(network)}`
    );
    revalidatePath("/dashboard/wallet");
    return { ok: true };
  } catch (error) {
    const message = error instanceof ApiClientError && error.code === "provider_not_configured"
      ? "Deposits are not configured for this account."
      : "A governed deposit destination is not currently available.";
    return { ok: false, error: message };
  }
}

export type WithdrawalResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export async function requestWithdrawalAction(
  _prevState: WithdrawalResult | null,
  formData: FormData
): Promise<WithdrawalResult> {
  const asset = String(formData.get("asset") ?? "");
  const network = String(formData.get("network") ?? "");
  const destination = String(formData.get("destination") ?? "").trim();
  const idempotencyKey = String(formData.get("idempotencyKey") ?? globalThis.crypto.randomUUID());
  const amountInput = String(formData.get("amount") ?? "").trim();

  if (!asset || !network || !destination || !/^\d+$/.test(amountInput) || BigInt(amountInput) <= 0n) {
    return { ok: false, error: "All fields are required and amount must be a positive base-unit integer." };
  }

  try {
    await apiRequest("/v1/wallet/withdrawals", {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify({ asset, network, destination, amount: amountInput })
    });
    revalidatePath("/dashboard/wallet");
    return { ok: true };
  } catch (error) {
    const message = error instanceof ApiClientError && error.code === "unsupported_capability"
      ? "This transfer rail is unavailable."
      : "Unable to submit the governed transfer request.";
    return { ok: false, error: message };
  }
}
