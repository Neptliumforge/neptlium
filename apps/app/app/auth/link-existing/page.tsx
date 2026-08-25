import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { AuthShell } from '@/app/(auth)/components/AuthShell';
import { ExistingAccountLinkForm } from './ExistingAccountLinkForm';

export default async function LinkExistingAccountPage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth/sign-in');

  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">Identity migration</p>
          <h1 className="text-2xl font-medium text-text-primary">Link your existing Neptlium account</h1>
          <p className="text-sm leading-6 text-text-muted">
            Your Clerk sign-in is verified. Confirm the credentials from your existing Neptlium account once so we can preserve the same internal account and financial ownership.
          </p>
        </div>
        <ExistingAccountLinkForm />
      </div>
    </AuthShell>
  );
}
