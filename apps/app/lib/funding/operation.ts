// A funding operation is one intended deposit request. Its idempotency key is
// minted once and reused for every retry of that same request, so an ambiguous
// POST (committed by the API, response lost) replays the recorded intent
// instead of creating a duplicate. Once the API returns the intent ID, the
// operation recovers instructions by that ID and never re-submits. A new key is
// minted only when the customer explicitly starts a new deposit request, or the
// API reports the key was already bound to a different request.
//
// The record lives in per-tab sessionStorage purely so a reload after a lost
// response still replays. It is not authority: the API scopes replay to the
// authenticated owner and owns the canonical intent.

export interface FundingOperation {
  readonly capability: string;
  readonly amountAtomic: string | null;
  readonly key: string;
  readonly intentId: string | null;
}

export type FundingOperationStore = Readonly<Record<string, FundingOperation>>;

export const FUNDING_OPERATION_STORAGE_KEY = 'neptlium.funding-operations.v1';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isOperationKey(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export function isFundingIntentId(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function slot(capability: string, amountAtomic: string | null): string {
  return `${capability}:${amountAtomic ?? ''}`;
}

export function findOperation(
  store: FundingOperationStore,
  capability: string,
  amountAtomic: string | null = null,
): FundingOperation | null {
  return store[slot(capability, amountAtomic)] ?? null;
}

export function ensureOperation(
  store: FundingOperationStore,
  capability: string,
  amountAtomic: string | null,
  mintKey: () => string,
): { readonly store: FundingOperationStore; readonly operation: FundingOperation } {
  const existing = findOperation(store, capability, amountAtomic);
  if (existing) return { store, operation: existing };
  const operation: FundingOperation = { capability, amountAtomic, key: mintKey(), intentId: null };
  return { store: { ...store, [slot(capability, amountAtomic)]: operation }, operation };
}

export function recordIntent(
  store: FundingOperationStore,
  operation: FundingOperation,
  intentId: string,
): FundingOperationStore {
  const id = slot(operation.capability, operation.amountAtomic);
  const current = store[id];
  // Only bind the intent to the operation that submitted it.
  if (!current || current.key !== operation.key) return store;
  return { ...store, [id]: { ...current, intentId } };
}

export function discardOperation(
  store: FundingOperationStore,
  capability: string,
  amountAtomic: string | null = null,
): FundingOperationStore {
  const id = slot(capability, amountAtomic);
  if (!(id in store)) return store;
  const next = { ...store };
  delete next[id];
  return next;
}

function isOperation(value: unknown): value is FundingOperation {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.capability === 'string' &&
    candidate.capability.length > 0 &&
    (candidate.amountAtomic === null ||
      (typeof candidate.amountAtomic === 'string' && /^\d+$/.test(candidate.amountAtomic))) &&
    isOperationKey(candidate.key) &&
    (candidate.intentId === null || isFundingIntentId(candidate.intentId))
  );
}

export function parseOperationStore(raw: string | null): FundingOperationStore {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const store: Record<string, FundingOperation> = {};
    for (const value of Object.values(parsed as Record<string, unknown>)) {
      if (isOperation(value)) store[slot(value.capability, value.amountAtomic)] = value;
    }
    return store;
  } catch {
    return {};
  }
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function readOperationStore(storage: StorageLike | null): FundingOperationStore {
  try {
    return parseOperationStore(storage?.getItem(FUNDING_OPERATION_STORAGE_KEY) ?? null);
  } catch {
    return {};
  }
}

export function writeOperationStore(storage: StorageLike | null, store: FundingOperationStore) {
  try {
    storage?.setItem(FUNDING_OPERATION_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage may be unavailable (private mode, blocked site data). The
    // in-memory operation still protects retries within this page.
  }
}
