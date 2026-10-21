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
  PRINCIPAL_CHANGED_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  type FundingRequestResult,
  type InstructionLookup,
} from '@/lib/funding/outcome';
import { checkFundingOperationScope } from '@/lib/funding/scope';

export type FundingIntentActionResult = FundingRequestResult;

export type TransferAliasActionResult =
  | { readonly ok: true; readonly alias: TransferAlias; readonly message: string }
  | { readonly ok: false; readonly error: string };

// Records (or replays) the funding intent for one deposit operation. The
// caller supplies the operation-scoped idempotency key and must reuse it for
// every retry of the same request; the API scopes replay to the owner. The
// operation scope must belong to the current session's principal, so a key
// recorded for one account is never submitted under another.
export async function createFundingIntentAction(
  operationScope: string,
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

  const scope = await checkFundingOperationScope(operationScope);
  if (scope === 'NO_SESSION') {
    return { ok: false, failure: 'SESSION_EXPIRED', error: SESSION_EXPIRED_MESSAGE };
  }
  if (scope === 'MISMATCH') {
    return { ok: false, failure: 'PRINCIPAL_CHANGED', error: PRINCIPAL_CHANGED_MESSAGE };
  }
  if (scope === 'UNVERIFIED') {
    return {
      ok: false,
      failure: 'REJECTED',
      error: 'We could not verify your signed-in account. No request was sent; try again.',
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
// it never records a new intent. The API enforces ownership of the intent; the
// scope check additionally keeps one account's stored intent from being looked
// up under another account's session.
export async function getDepositInstructionsAction(
  operationScope: string,
  fundingIntentId: string,
): Promise<InstructionLookup> {
  if (!isFundingIntentId(fundingIntentId)) return classifyInstructionFailure({ status: 404 });
  const scope = await checkFundingOperationScope(operationScope);
  if (scope === 'NO_SESSION') return classifyInstructionFailure({ status: 401 });
  if (scope === 'MISMATCH') {
    return { status: 'PRINCIPAL_CHANGED', message: PRINCIPAL_CHANGED_MESSAGE };
  }
  if (scope === 'UNVERIFIED') return classifyInstructionFailure({ status: 503 });
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
