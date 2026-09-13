import { AuthShell } from '@/app/(auth)/components/AuthShell';
import { SupabaseAuthForm } from '@/app/(auth)/components/SupabaseAuthForm';

export default function SignUpPage() {
  return (
    <AuthShell>
      <SupabaseAuthForm mode="sign-up" />
    </AuthShell>
  );
}
