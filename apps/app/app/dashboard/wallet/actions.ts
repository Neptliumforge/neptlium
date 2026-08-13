"use server";

import { revalidatePath } from "next/cache";
import { apiRequest, ApiClientError } from "@/lib/api/client";
import type { DepositInstruction, FundingActivity } from "@/lib/api/financial";

export type FundingIntentActionResult =
  | { readonly ok: true; readonly intent: FundingActivity; readonly instructions: DepositInstruction }
  | { readonly ok: false; readonly error: string };

export async function createFundingIntentAction(
  capability: string,
  amountAtomic?: string,
): Promise<FundingIntentActionResult> {
  if (!capability) return { ok: false, error: "Choose a governed funding asset first." };
  if (amountAtomic && (!/^\d+$/.test(amountAtomic) || BigInt(amountAtomic) <= 0n)) {
    return { ok: false, error: "Funding amount must be expressed in positive atomic units." };
  }

  try {
    const intent = await apiRequest<FundingActivity>("/v1/funding/intents", {
      method: "POST",
      headers: { "idempotency-key": globalThis.crypto.randomUUID() },
      body: JSON.stringify({
        capability,
        ...(amountAtomic ? { amount_atomic: amountAtomic } : {}),
      }),
    });
    const instructions = await apiRequest<DepositInstruction>(
      `/v1/capital-account/deposit-instructions?funding_intent_id=${encodeURIComponent(intent.id)}`,
    );
    revalidatePath("/dashboard/wallet");
    return { ok: true, intent, instructions };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.code === "provider_capability_unavailable") {
        return { ok: false, error: "This funding rail is not currently available." };
      }
      if (error.code === "provider_not_configured") {
        return { ok: false, error: "Funding infrastructure for this asset is not configured." };
      }
    }
    return { ok: false, error: "The governed funding intent could not be created." };
  }
}
