'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { meetsPasswordRequirements } from '../auth-utils';
import { RECOVERY_COOKIE } from '../recovery';

export type ResetPasswordState = { readonly error: string | null };

export async function resetPasswordAction(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = formData.get('password');
  const confirm = formData.get('confirm');
  if (typeof password !== 'string' || !meetsPasswordRequirements(password))
    return { error: 'Your new password doesn’t meet the requirements.' };
  if (password !== confirm) return { error: 'The passwords don’t match.' };

  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || cookieStore.get(RECOVERY_COOKIE)?.value !== '1')
    return { error: 'This reset link has expired. Request a new one.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      error:
        error.code === 'same_password'
          ? 'Choose a password you haven’t used for this account.'
          : error.code === 'weak_password'
            ? 'That password is too weak. Choose a stronger one.'
            : 'Your password couldn’t be reset. Request a new link and try again.',
    };

  // A recovery means the old password may be compromised: end every session.
  await supabase.auth.signOut({ scope: 'global' });
  cookieStore.delete(RECOVERY_COOKIE);
  redirect('/password-updated');
}
