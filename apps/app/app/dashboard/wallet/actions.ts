"use server";

import { revalidatePath } from "next/cache";
import { apiRequest, ApiClientError } from "@/lib/api/client";
import type { DepositInstruction, FundingActivity, TransferAlias } from "@/lib/api/financial";

export type FundingIntentActionResult =
  | { readonly ok: true; readonly intent: FundingActivity; readonly instructions: DepositInstruction }
  | { readonly ok: false; readonly error: string };

export type TransferAliasActionResult =
  | { readonly ok: true; readonly alias: TransferAlias; readonly message: string }
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

export async function createTransferAliasAction(
  alias: string,
  destinationType: string,
  destinationReference: string,
): Promise<TransferAliasActionResult> {
  const normalizedAlias = alias.trim();
  const normalizedType = destinationType.trim();
  const normalizedReference = destinationReference.trim();

  if (!/^[A-Za-z0-9._-]{3,64}$/.test(normalizedAlias)) {
    return { ok: false, error: "Use a destination label between 3 and 64 characters using letters, numbers, dots, dashes, or underscores." };
  }
  if (!normalizedType) return { ok: false, error: "Choose a destination type." };
  if (normalizedReference.length < 3 || normalizedReference.length > 512) {
    return { ok: false, error: "Enter a valid destination reference." };
  }

  try {
    const created = await apiRequest<TransferAlias>("/v1/treasury/aliases", {
      method: "POST",
      body: JSON.stringify({
        alias: normalizedAlias,
        destination_type: normalizedType,
        destination_reference: normalizedReference,
      }),
    });
    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/treasury");
    return {
      ok: true,
      alias: created,
      message: "Destination saved for governed verification. Saving does not make it verified or active.",
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "validation_failed") {
      return { ok: false, error: "The destination could not be accepted. Review the label, type, and reference." };
    }
    return { ok: false, error: "The governed destination could not be saved." };
  }
}
