import { Suspense } from 'react';
import { AuthShell } from '@/app/(auth)/components/AuthShell';
import { SupabaseAuthForm } from '@/app/(auth)/components/SupabaseAuthForm';

export default function SignInPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <SupabaseAuthForm mode="sign-in" />
      </Suspense>
    </AuthShell>
  );
}
