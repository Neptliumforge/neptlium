import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { AuthShell } from '../components/AuthShell';
import {
  PasswordRecoveryRequestForm,
  PasswordResetForm,
} from '../components/PasswordRecoveryForms';
import { RECOVERY_COOKIE } from '../recovery';

/**
 * The new-password form appears only for a session that arrived through a recovery
 * link. Any other visitor (including an ordinary signed-in session) gets the request
 * form; changing a known password lives in Security settings and requires it.
 */
export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const recovering = Boolean(user) && cookieStore.get(RECOVERY_COOKIE)?.value === '1';
  return (
    <AuthShell>
      {recovering ? <PasswordResetForm /> : <PasswordRecoveryRequestForm linkInvalid={false} />}
    </AuthShell>
  );
}
