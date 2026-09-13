import { AuthShell } from '@/app/(auth)/components/AuthShell';
import { SupabaseAuthForm } from '@/app/(auth)/components/SupabaseAuthForm';

export default function SignInPage() {
  return (
    <AuthShell>
      <SupabaseAuthForm mode="sign-in" />
    </AuthShell>
  );
}
