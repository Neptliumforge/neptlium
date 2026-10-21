// Customer-facing classification of funding intent and deposit-instruction
// outcomes. Intent creation and instruction retrieval are separate operations:
// once the API has recorded an intent, a failed instruction lookup is reported
// as a lookup failure against that intent, never as a failed intent.

import type { DepositInstruction } from '@/lib/api/financial';

export type InstructionLookup =
  // The API answered. The instruction may still be PENDING (route not
  // assigned) or carry a non-ENABLED capability state; only an ENABLED
  // instruction with an address is a usable deposit route.
  | { readonly status: 'RESOLVED'; readonly instruction: DepositInstruction }
  | {
      readonly status: 'SESSION_EXPIRED' | 'FORBIDDEN' | 'UNAVAILABLE';
      readonly message: string;
    };

export type IntentFailure =
  // Authentication must be re-established; nothing was submitted under it.
  | 'SESSION_EXPIRED'
  // The API definitively declined the request.
  | 'REJECTED'
  // The outcome is unknown: the API may have recorded the intent. Retrying
  // with the same operation key replays it instead of creating a duplicate.
  | 'AMBIGUOUS'
  // The operation key was already bound to a different request. A new key is
  // required; the customer must explicitly request again.
  | 'KEY_CONFLICT';

export type FundingRequestResult =
  | {
      readonly ok: true;
      readonly intentId: string;
      readonly source: 'CREATED' | 'REPLAYED' | 'RECOVERED';
      readonly instructions: InstructionLookup;
    }
  | { readonly ok: false; readonly failure: IntentFailure; readonly error: string };

interface ErrorShape {
  readonly status?: unknown;
  readonly code?: unknown;
}

function errorShape(error: unknown): { status: number | null; code: string | null } {
  if (!error || typeof error !== 'object') return { status: null, code: null };
  const { status, code } = error as ErrorShape;
  return {
    status: typeof status === 'number' ? status : null,
    code: typeof code === 'string' ? code : null,
  };
}

export const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Sign in again to continue this deposit request.';

export function classifyInstructionFailure(error: unknown): InstructionLookup {
  const { status, code } = errorShape(error);
  if (status === 401 || code === 'session_expired') {
    return { status: 'SESSION_EXPIRED', message: SESSION_EXPIRED_MESSAGE };
  }
  // Funding intents are owner-scoped: an intent the signed-in principal cannot
  // read is reported as not found, which is equivalent to forbidden here.
  if (status === 403 || status === 404 || code === 'forbidden' || code === 'not_found') {
    return {
      status: 'FORBIDDEN',
      message: 'This deposit request is not available to the signed-in account.',
    };
  }
  return {
    status: 'UNAVAILABLE',
    message:
      'Your funding request is recorded, but its deposit instructions could not be retrieved right now. Try again shortly; no new request will be created.',
  };
}

export function classifyIntentFailure(error: unknown): {
  readonly failure: IntentFailure;
  readonly error: string;
} {
  const { status, code } = errorShape(error);
  if (status === 401 || code === 'session_expired') {
    return { failure: 'SESSION_EXPIRED', error: SESSION_EXPIRED_MESSAGE };
  }
  if (code === 'idempotency_conflict') {
    return {
      failure: 'KEY_CONFLICT',
      error:
        'This deposit request no longer matches the one first submitted. Request deposit instructions again to start a new request.',
    };
  }
  if (code === 'provider_capability_unavailable') {
    return { failure: 'REJECTED', error: 'This funding rail is not currently available.' };
  }
  if (code === 'provider_not_configured') {
    return { failure: 'REJECTED', error: 'This funding method is not currently available.' };
  }
  if (status !== null && status >= 400 && status < 500) {
    return { failure: 'REJECTED', error: 'The governed funding intent could not be created.' };
  }
  // Timeouts, transport failures, 5xx and unknown errors: the API may have
  // committed the intent before the response was lost.
  return {
    failure: 'AMBIGUOUS',
    error:
      'We could not confirm whether your funding request was recorded. Retrying is safe: it resumes this same request and will not create a duplicate.',
  };
}
