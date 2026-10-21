import { AuthShell } from '../components/AuthShell';
import { PasswordRecoveryRequestForm } from '../components/PasswordRecoveryForms';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthShell>
      <PasswordRecoveryRequestForm linkInvalid={error === 'recovery_link_invalid'} />
    </AuthShell>
  );
}
