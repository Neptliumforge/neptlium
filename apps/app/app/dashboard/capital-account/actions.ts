'use server';

import { revalidatePath } from 'next/cache';
import { ApiClientError } from '@/lib/api/client';
import {
  createFundingIntent,
  createTransferAlias,
  getDepositInstructionsForIntent,
  type TransferAlias,
} from '@/lib/api/financial';
import { isFundingIntentId, isOperationKey } from '@/lib/funding/operation';
import {
  classifyInstructionFailure,
  classifyIntentFailure,
  type FundingRequestResult,
  type InstructionLookup,
} from '@/lib/funding/outcome';

export type FundingIntentActionResult = FundingRequestResult;

export type TransferAliasActionResult =
  | { readonly ok: true; readonly alias: TransferAlias; readonly message: string }
  | { readonly ok: false; readonly error: string };

// Records (or replays) the funding intent for one deposit operation. The
// caller supplies the operation-scoped idempotency key and must reuse it for
// every retry of the same request; the API scopes replay to the owner.
export async function createFundingIntentAction(
  capability: string,
  idempotencyKey: string,
  amountAtomic?: string | null,
): Promise<FundingIntentActionResult> {
  if (!capability) {
    return { ok: false, failure: 'REJECTED', error: 'Choose a governed funding asset first.' };
  }
  if (!isOperationKey(idempotencyKey)) {
    return {
      ok: false,
      failure: 'REJECTED',
      error: 'This deposit request has no valid request reference. No request was sent.',
    };
  }
  if (amountAtomic && (!/^\d+$/.test(amountAtomic) || BigInt(amountAtomic) <= 0n)) {
    return {
      ok: false,
      failure: 'REJECTED',
      error: 'Funding amount must be expressed in positive atomic units.',
    };
  }

  let intent: Awaited<ReturnType<typeof createFundingIntent>>;
  try {
    intent = await createFundingIntent({
      capability,
      idempotencyKey,
      ...(amountAtomic ? { amountAtomic } : {}),
    });
  } catch (error) {
    return { ok: false, ...classifyIntentFailure(error) };
  }

  // The intent is now durably recorded by the API. A failed instruction lookup
  // is classified against that intent and never reported as a failed intent.
  const instructions = await lookupInstructions(intent.id);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/capital');
  revalidatePath('/dashboard/capital-account');
  revalidatePath('/dashboard/activity');
  revalidatePath('/dashboard/deposit');
  return {
    ok: true,
    intentId: intent.id,
    source: intent.replayed ? 'REPLAYED' : 'CREATED',
    instructions,
  };
}

// Recovers deposit instructions for an intent that already exists. Read-only:
// it never records a new intent.
export async function getDepositInstructionsAction(
  fundingIntentId: string,
): Promise<InstructionLookup> {
  if (!isFundingIntentId(fundingIntentId)) return classifyInstructionFailure({ status: 404 });
  return lookupInstructions(fundingIntentId);
}

async function lookupInstructions(fundingIntentId: string): Promise<InstructionLookup> {
  try {
    const instruction = await getDepositInstructionsForIntent(fundingIntentId);
    return { status: 'RESOLVED', instruction };
  } catch (error) {
    return classifyInstructionFailure(error);
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
    return {
      ok: false,
      error:
        'Use a destination label between 3 and 64 characters using letters, numbers, dots, dashes, or underscores.',
    };
  }
  if (!normalizedType) return { ok: false, error: 'Choose a destination type.' };
  if (normalizedReference.length < 3 || normalizedReference.length > 512) {
    return { ok: false, error: 'Enter a valid destination reference.' };
  }

  try {
    const created = await createTransferAlias({
      alias: normalizedAlias,
      destinationType: normalizedType,
      destinationReference: normalizedReference,
    });
    revalidatePath('/dashboard/capital-account');
    return {
      ok: true,
      alias: created,
      message:
        'Destination saved for governed verification. Saving does not make it verified or active.',
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'validation_failed') {
      return {
        ok: false,
        error: 'The destination could not be accepted. Review the label, type, and reference.',
      };
    }
    return { ok: false, error: 'The governed destination could not be saved.' };
  }
}
