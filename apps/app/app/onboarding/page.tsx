import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { resolveAccountState } from '@/lib/auth/account-state';
import { OnboardingWizard } from './OnboardingWizard';
import { getOnboardingReturnPath } from '@/lib/auth/return-context';

export default async function OnboardingPage() {
  const user = await requireUser();
  const account = await resolveAccountState(user);
  const returnTo = await getOnboardingReturnPath();
  if (account.state === 'PROVISIONED') redirect(returnTo);
  if (account.state === 'UNVERIFIED') {
    return (
      <main className="mx-auto max-w-xl px-6 py-16" role="status">
        <h1 className="text-xl font-semibold">Account setup temporarily unavailable</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Your session is still active, but we cannot verify your account setup right now.
          No onboarding information was changed. Refresh this page to try again.
        </p>
      </main>
    );
  }

  return <OnboardingWizard email={user.email ?? 'Verified account'} returnTo={returnTo} />;
}
