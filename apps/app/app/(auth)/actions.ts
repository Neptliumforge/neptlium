'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import {
  isValidEmail,
  meetsPasswordRequirements,
  readRequiredField,
  safeInternalPath,
} from './auth-utils';

async function resolveOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  const protocol = headerList.get('x-forwarded-proto') ?? 'https';
  return `${protocol}://${host}`;
}
import { createNotification } from '@neptlium/lib';
import { recordSecurityEvent } from '@/lib/security/events';
import { recordTrustedDevice } from '@/lib/security/deviceCookie';
import type { AuthActionState } from './schema';
import { ensureAccountProvisioned, getAccountContext } from '@/lib/api/client';

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, 'email');
  const password = readRequiredField(formData, 'password');
  const next = safeInternalPath(readRequiredField(formData, 'next'));

  if (!isValidEmail(email)) {
    return { error: 'Enter a valid email address.', success: false };
  }
  if (!password) return { error: 'Password is required.', success: false };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'The email or password is incorrect.', success: false };
  }

  await recordSecurityEvent(supabase, data.user.id, 'login');
  await recordTrustedDevice(supabase, data.user.id);

  try {
    await ensureAccountProvisioned();
  } catch {
    return {
      error: 'Your session is valid, but account provisioning is unavailable. Please retry.',
      success: false,
    };
  }

  if (next !== '/dashboard') redirect(next);

  try {
    const context = await getAccountContext();
    redirect(context.provisionedAt ? '/dashboard' : '/onboarding');
  } catch {
    redirect('/onboarding');
  }
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, 'email');
  const password = readRequiredField(formData, 'password');
  const acceptedTerms = formData.get('acceptedTerms') === 'on';

  if (!isValidEmail(email)) return { error: 'Enter a valid email address.', success: false };
  if (!password) return { error: 'Password is required.', success: false };
  if (!meetsPasswordRequirements(password)) {
    return { error: 'Password must meet all security requirements.', success: false };
  }
  if (!acceptedTerms) {
    return { error: 'You must accept the Terms of Service and Privacy Policy.', success: false };
  }

  const supabase = await createSupabaseServerClient();
  const origin = await resolveOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error && !/already registered/i.test(error.message)) {
    return { error: 'We couldn’t complete the request. Please try again.', success: false };
  }

  if (data.session) {
    try {
      await ensureAccountProvisioned();
    } catch {
      return {
        error: 'Your account was created, but account provisioning is unavailable. Sign in to retry.',
        success: false,
      };
    }
    redirect('/dashboard');
  }

  return { error: null, success: true };
}

export async function resendVerification(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, 'email');
  if (!isValidEmail(email)) return { error: 'Enter a valid email address.', success: false };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({ type: 'signup', email });

  if (error) {
    return {
      error: /rate.?limit/i.test(error.message)
        ? 'Too many attempts. Please wait before trying again.'
        : 'We couldn’t complete the request. Please try again.',
      success: false,
    };
  }

  return { error: null, success: true, message: 'A new code has been sent.' };
}

export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredField(formData, 'email');
  if (!isValidEmail(email)) return { error: 'Enter a valid email address.', success: false };

  const supabase = await createSupabaseServerClient();
  const origin = await resolveOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent('/update-password')}`,
  });

  if (error && /rate limit/i.test(error.message)) {
    return { error: 'Too many attempts. Please wait before trying again.', success: false };
  }

  return { error: null, success: true };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readRequiredField(formData, 'password');
  const confirmPassword = readRequiredField(formData, 'confirmPassword');

  if (!password || !confirmPassword) return { error: 'Password is required.', success: false };
  if (password !== confirmPassword) return { error: 'Passwords do not match.', success: false };
  if (!meetsPasswordRequirements(password)) {
    return { error: 'Password must meet all security requirements.', success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error || !data.user) {
    return { error: 'Your session has expired. Please sign in again.', success: false };
  }

  await recordSecurityEvent(supabase, data.user.id, 'password_updated');
  await createNotification(
    supabase,
    data.user.id,
    'security',
    'Password changed',
    'Your account password was updated.',
  );

  redirect('/password-updated');
}
