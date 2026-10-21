import 'server-only';

import { cache } from 'react';
import { getAccountStatus, type AccountStatus } from '@/lib/api/client';

/**
 * Account status for presentation, deduplicated per request. An unreadable status is
 * `null` (unknown), never a default state: callers must not infer "not verified" or
 * "setup required" from it.
 */
export const loadAccountStatus = cache(async (): Promise<AccountStatus | null> => {
  try {
    return await getAccountStatus();
  } catch {
    return null;
  }
});
