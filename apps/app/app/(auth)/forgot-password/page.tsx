import { clerkDevelopmentEnabled } from '@/lib/auth/provider';
import { redirect } from 'next/navigation';
import { AuthShell } from '../components/AuthShell';
import { PasswordRecoveryRequestForm } from '../components/PasswordRecoveryForms';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ error?: string | string[] }>;
}) {
  if (clerkDevelopmentEnabled()) redirect('/auth/sign-in');
  const { error } = await searchParams;
  return (
    <AuthShell>
      <PasswordRecoveryRequestForm linkInvalid={error === 'recovery_link_invalid'} />
    </AuthShell>
  );
}
