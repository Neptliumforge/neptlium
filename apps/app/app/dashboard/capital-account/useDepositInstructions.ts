'use client';

import { useRef, useState, useTransition } from 'react';
import {
  persistOperationStore,
  readOperationStore,
  type FundingOperationStore,
} from '@/lib/funding/operation';
import type { FundingRequestResult } from '@/lib/funding/outcome';
import {
  requestDepositInstructions,
  startNewDepositRequest,
  type FundingRequestDeps,
} from '@/lib/funding/request';
import { createFundingIntentAction, getDepositInstructionsAction } from './actions';

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

// Deposit-instruction requests bound to a stable funding operation for the
// principal identified by `operationScope` (server-derived from the session).
// Disabling the submit control is only a convenience; duplicate protection
// comes from the durably stored operation key the API replays against.
export function useDepositInstructions(operationScope: string) {
  const storeRef = useRef<{ scope: string; store: FundingOperationStore } | null>(null);
  const inFlight = useRef(false);
  const [result, setResult] = useState<FundingRequestResult | null>(null);
  const [pending, startTransition] = useTransition();

  const deps: FundingRequestDeps = {
    load: () => {
      if (storeRef.current?.scope === operationScope) return storeRef.current.store;
      const store = readOperationStore(sessionStore(), operationScope);
      if (store) storeRef.current = { scope: operationScope, store };
      return store;
    },
    save: (store) => {
      storeRef.current = { scope: operationScope, store };
      return persistOperationStore(sessionStore(), operationScope, store);
    },
    mintKey: () => crypto.randomUUID(),
    create: (capability, key, amountAtomic) =>
      createFundingIntentAction(operationScope, capability, key, amountAtomic),
    recover: (fundingIntentId) => getDepositInstructionsAction(operationScope, fundingIntentId),
  };

  function request(capability: string, amountAtomic: string | null = null) {
    if (!capability || inFlight.current) return;
    inFlight.current = true;
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await requestDepositInstructions(deps, capability, amountAtomic));
      } finally {
        inFlight.current = false;
      }
    });
  }

  function startNew(capability: string, amountAtomic: string | null = null) {
    if (inFlight.current) return;
    startNewDepositRequest(deps, capability, amountAtomic);
    setResult(null);
  }

  return { result, pending, request, startNew, clear: () => setResult(null) };
}
