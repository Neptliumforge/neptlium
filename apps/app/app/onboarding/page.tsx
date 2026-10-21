import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/auth/session';
import { OnboardingWizard } from './OnboardingWizard';
import { getOnboardingReturnPath } from '@/lib/auth/return-context';

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const returnTo = await getOnboardingReturnPath();
  if (profile?.provisionedAt) redirect(returnTo);

  return <OnboardingWizard email={user.email ?? 'Verified account'} returnTo={returnTo} />;
}
