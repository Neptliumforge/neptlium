'use client';

import { useRef, useState, useTransition } from 'react';
import {
  readOperationStore,
  writeOperationStore,
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

// Deposit-instruction requests bound to a stable funding operation. Disabling
// the submit control is only a convenience; duplicate protection comes from
// the operation key the API replays against.
export function useDepositInstructions() {
  const storeRef = useRef<FundingOperationStore | null>(null);
  const [result, setResult] = useState<FundingRequestResult | null>(null);
  const [pending, startTransition] = useTransition();

  const deps: FundingRequestDeps = {
    load: () => (storeRef.current ??= readOperationStore(sessionStore())),
    save: (store) => {
      storeRef.current = store;
      writeOperationStore(sessionStore(), store);
    },
    mintKey: () => crypto.randomUUID(),
    create: (capability, key, amountAtomic) =>
      createFundingIntentAction(capability, key, amountAtomic),
    recover: (fundingIntentId) => getDepositInstructionsAction(fundingIntentId),
  };

  function request(capability: string, amountAtomic: string | null = null) {
    if (!capability) return;
    setResult(null);
    startTransition(async () => {
      setResult(await requestDepositInstructions(deps, capability, amountAtomic));
    });
  }

  function startNew(capability: string, amountAtomic: string | null = null) {
    startNewDepositRequest(deps, capability, amountAtomic);
    setResult(null);
  }

  return { result, pending, request, startNew, clear: () => setResult(null) };
}
