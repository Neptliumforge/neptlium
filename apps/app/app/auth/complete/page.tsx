import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { ApiClientError, bootstrapClerkAccount, getAccountContext } from '@/lib/api/client';
import { AuthShell } from '@/app/(auth)/components/AuthShell';

export default async function CompleteAuthenticationPage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth/sign-in');

  try {
    await bootstrapClerkAccount();
    const context = await getAccountContext();
    redirect(context.provisionedAt ? '/dashboard' : '/onboarding');
  } catch (error) {
    const message =
      error instanceof ApiClientError && error.code === 'identity_bootstrap_unavailable'
        ? 'Your identity is verified, but account setup is not available yet.'
        : 'We could not complete secure account setup. Please try again.';
    return (
      <AuthShell>
        <div className="space-y-3">
          <h1 className="text-2xl font-medium text-text-primary">Account setup unavailable</h1>
          <p className="text-sm leading-6 text-text-muted">{message}</p>
        </div>
      </AuthShell>
    );
  }
}
