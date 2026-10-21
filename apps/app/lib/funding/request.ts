import {
  discardOperation,
  ensureOperation,
  findOperation,
  isOperationKey,
  recordIntent,
  type FundingOperationStore,
} from './operation';
import {
  FORBIDDEN_MESSAGE,
  PRINCIPAL_CHANGED_MESSAGE,
  STORAGE_UNAVAILABLE_MESSAGE,
  type FundingRequestResult,
  type InstructionLookup,
} from './outcome';

export interface FundingRequestDeps {
  // The principal-scoped operations, or null when they cannot be read.
  readonly load: () => FundingOperationStore | null;
  // Records the operations; returns true only when they are durably stored.
  readonly save: (store: FundingOperationStore) => boolean;
  readonly mintKey: () => string;
  readonly create: (
    capability: string,
    idempotencyKey: string,
    amountAtomic: string | null,
  ) => Promise<FundingRequestResult>;
  readonly recover: (fundingIntentId: string) => Promise<InstructionLookup>;
}

const AMBIGUOUS_TRANSPORT: FundingRequestResult = {
  ok: false,
  failure: 'AMBIGUOUS',
  error:
    'We could not confirm whether your funding request was recorded. Retrying is safe: it resumes this same request and will not create a duplicate.',
};

const RECOVERY_UNAVAILABLE: InstructionLookup = {
  status: 'UNAVAILABLE',
  message:
    'Your funding request is recorded, but its deposit instructions could not be retrieved right now. Try again shortly; no new request will be created.',
};

const NO_KEY: FundingRequestResult = {
  ok: false,
  failure: 'REJECTED',
  error: 'This browser could not create a secure request reference. No request was sent.',
};

const STORAGE_UNAVAILABLE: FundingRequestResult = {
  ok: false,
  failure: 'STORAGE_UNAVAILABLE',
  error: STORAGE_UNAVAILABLE_MESSAGE,
};

// Runs one customer request for deposit instructions against the operation
// for (capability, amount). An operation that already has an intent recovers
// instructions by that intent's ID and never submits again. Otherwise the
// intent is submitted under the operation's stable key, so a retry after an
// ambiguous outcome (including the server action itself failing in transit)
// replays the same request rather than recording another intent.
//
// A new key is only ever submitted after it has been durably stored, so a lost
// response followed by a reload can always replay it. When storage cannot be
// read or written, no new request is sent.
export async function requestDepositInstructions(
  deps: FundingRequestDeps,
  capability: string,
  amountAtomic: string | null = null,
): Promise<FundingRequestResult> {
  const current = deps.load();
  if (!current) return STORAGE_UNAVAILABLE;

  let operation = findOperation(current, capability, amountAtomic);
  if (!operation) {
    let ensured: ReturnType<typeof ensureOperation>;
    try {
      ensured = ensureOperation(current, capability, amountAtomic, deps.mintKey);
    } catch {
      return NO_KEY;
    }
    if (!isOperationKey(ensured.operation.key)) return NO_KEY;
    if (!deps.save(ensured.store)) {
      // Never keep an unrecoverable key in memory: a later retry would submit
      // it without the reload protection it exists for.
      deps.save(current);
      return STORAGE_UNAVAILABLE;
    }
    operation = ensured.operation;
  }

  if (operation.intentId) {
    const instructions = await deps.recover(operation.intentId).catch(() => RECOVERY_UNAVAILABLE);
    // The operation identity is retained in both cases: it belongs to the
    // account that recorded it, and discarding it would let that account
    // record a duplicate intent later. Its intent ID is not presented.
    if (instructions.status === 'PRINCIPAL_CHANGED') {
      return { ok: false, failure: 'PRINCIPAL_CHANGED', error: PRINCIPAL_CHANGED_MESSAGE };
    }
    if (instructions.status === 'FORBIDDEN') {
      return { ok: false, failure: 'FORBIDDEN', error: FORBIDDEN_MESSAGE };
    }
    return { ok: true, intentId: operation.intentId, source: 'RECOVERED', instructions };
  }

  const result = await deps
    .create(capability, operation.key, amountAtomic)
    .catch(() => AMBIGUOUS_TRANSPORT);
  const latest = deps.load();
  if (result.ok) {
    // If this write is lost, the stored key still replays the same intent.
    if (latest) deps.save(recordIntent(latest, operation, result.intentId));
  } else if (result.failure === 'KEY_CONFLICT') {
    if (latest) deps.save(discardOperation(latest, capability, amountAtomic));
  }
  return result;
}

// Explicitly begins a genuinely new deposit request: the next request for this
// (capability, amount) mints a new key and records a new intent.
export function startNewDepositRequest(
  deps: Pick<FundingRequestDeps, 'load' | 'save'>,
  capability: string,
  amountAtomic: string | null = null,
) {
  const current = deps.load();
  if (current) deps.save(discardOperation(current, capability, amountAtomic));
}
