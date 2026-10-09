import { AuthShell } from '@/app/(auth)/components/AuthShell';
import { SupabaseAuthForm } from '@/app/(auth)/components/SupabaseAuthForm';
import { resolveReturnDestination, type ReturnSearchParams } from '@/app/(auth)/auth-utils';

export default async function SignUpPage({
  searchParams,
}: {
  readonly searchParams: Promise<ReturnSearchParams>;
}) {
  const returnTo = resolveReturnDestination(await searchParams);
  return (
    <AuthShell>
      <SupabaseAuthForm mode="sign-up" returnTo={returnTo} />
    </AuthShell>
  );
}
