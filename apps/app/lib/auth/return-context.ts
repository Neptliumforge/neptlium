import { headers } from 'next/headers';
import {
  ACCOUNT_RETURN_HEADER,
  resolveReturnDestination,
  safeInternalPath,
} from '@/app/(auth)/auth-utils';

/** Trusted App proxy context only; destination validation does not authorize the target. */
export async function getRequestReturnPath(): Promise<string> {
  return safeInternalPath((await headers()).get(ACCOUNT_RETURN_HEADER));
}

export async function getOnboardingReturnPath(): Promise<string> {
  const entry = new URL(await getRequestReturnPath(), 'https://neptlium.invalid');
  // Completed onboarding must not send the user back into onboarding.
  return resolveReturnDestination(entry.searchParams, false);
}
