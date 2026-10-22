import { notFound } from 'next/navigation';
import { clerkDevelopmentEnabled } from '@/lib/auth/provider';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import {
  accountEntryHref,
  resolveReturnDestination,
  type ReturnSearchParams,
} from '@/app/(auth)/auth-utils';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ReturnSearchParams>;
}) {
  if (!clerkDevelopmentEnabled()) notFound();
  const returnTo = resolveReturnDestination(await searchParams);
  const finish = '/auth/complete?next=' + encodeURIComponent(returnTo);
  return (
    <AuthenticateWithRedirectCallback
      signInUrl={accountEntryHref('sign-in', returnTo)}
      signUpUrl={accountEntryHref('sign-up', returnTo)}
      continueSignUpUrl={accountEntryHref('sign-up', returnTo)}
      signInForceRedirectUrl={finish}
      signUpForceRedirectUrl={finish}
    />
  );
}
