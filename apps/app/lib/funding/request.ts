import {
  discardOperation,
  ensureOperation,
  recordIntent,
  type FundingOperationStore,
} from './operation';
import type { FundingRequestResult, InstructionLookup } from './outcome';

export interface FundingRequestDeps {
  readonly load: () => FundingOperationStore;
  readonly save: (store: FundingOperationStore) => void;
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

// Runs one customer request for deposit instructions against the operation
// for (capability, amount). An operation that already has an intent recovers
// instructions by that intent's ID and never submits again. Otherwise the
// intent is submitted under the operation's stable key, so a retry after an
// ambiguous outcome (including the server action itself failing in transit)
// replays the same request rather than recording another intent.
export async function requestDepositInstructions(
  deps: FundingRequestDeps,
  capability: string,
  amountAtomic: string | null = null,
): Promise<FundingRequestResult> {
  let ensured: ReturnType<typeof ensureOperation>;
  try {
    ensured = ensureOperation(deps.load(), capability, amountAtomic, deps.mintKey);
  } catch {
    return {
      ok: false,
      failure: 'REJECTED',
      error: 'This browser could not create a secure request reference. No request was sent.',
    };
  }
  deps.save(ensured.store);
  const operation = ensured.operation;

  if (operation.intentId) {
    const instructions = await deps.recover(operation.intentId).catch(() => RECOVERY_UNAVAILABLE);
    if (instructions.status === 'FORBIDDEN') {
      // The stored intent is not readable by this principal; forget it so a
      // later explicit request starts a new operation for this account.
      deps.save(discardOperation(deps.load(), capability, amountAtomic));
    }
    return { ok: true, intentId: operation.intentId, source: 'RECOVERED', instructions };
  }

  const result = await deps
    .create(capability, operation.key, amountAtomic)
    .catch(() => AMBIGUOUS_TRANSPORT);
  if (result.ok) {
    deps.save(recordIntent(deps.load(), operation, result.intentId));
  } else if (result.failure === 'KEY_CONFLICT') {
    deps.save(discardOperation(deps.load(), capability, amountAtomic));
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
  deps.save(discardOperation(deps.load(), capability, amountAtomic));
}
