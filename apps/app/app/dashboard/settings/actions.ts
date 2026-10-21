'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import {
  ApiClientError,
  getAccountContext,
  getAccountStatus,
  startIdentityVerificationSession,
  updateAccountProfile,
} from '@/lib/api/client';
import { isLegalNameEditable } from '@/lib/account/identity-verification';
import { buildProfileUpdate } from '@/lib/account/profile';

export type SettingsActionState =
  | { readonly state: 'IDLE' }
  | { readonly state: 'SAVED'; readonly message: string }
  | { readonly state: 'ERROR'; readonly message: string };

function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

export async function updateProfileAction(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireUser();
  try {
    const [current, status] = await Promise.all([getAccountContext(), getAccountStatus()]);
    // The API enforces the lock; this only avoids sending a change it would refuse.
    const legalNameEditable = isLegalNameEditable(status.identity_verification);
    const result = buildProfileUpdate(
      {
        firstName: text(formData, 'firstName'),
        lastName: text(formData, 'lastName'),
        displayName: text(formData, 'displayName'),
      },
      {
        firstName: current.firstName ?? null,
        lastName: current.lastName ?? null,
        displayName: current.displayName,
      },
      legalNameEditable,
    );
    if (!result.ok) return { state: 'ERROR', message: result.error };
    if (!result.payload) return { state: 'SAVED', message: 'No changes to save.' };
    await updateAccountProfile(result.payload);
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.code === 'session_expired' || error.status === 401)
        return {
          state: 'ERROR',
          message: 'Your session has expired. Sign in again to save changes.',
        };
      if (error.code === 'legal_name_locked')
        return {
          state: 'ERROR',
          message:
            'Your legal name can’t be changed while identity verification is pending or complete.',
        };
      if (error.code === 'validation_failed')
        return { state: 'ERROR', message: 'Review your details and try again.' };
    }
    return { state: 'ERROR', message: 'Your profile couldn’t be saved. Try again.' };
  }
  revalidatePath('/dashboard', 'layout');
  return { state: 'SAVED', message: 'Profile saved.' };
}

export async function startIdentityVerificationAction(
  _previous: SettingsActionState,
): Promise<SettingsActionState> {
  await requireUser();
  let destination: URL;
  try {
    const session = await startIdentityVerificationSession(randomUUID());
    destination = new URL(session.customer_action_url);
    if (destination.protocol !== 'https:') throw new Error('Unsafe verification destination');
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'identity_verification_not_enabled')
      return { state: 'ERROR', message: 'Identity verification isn’t available yet.' };
    if (error instanceof ApiClientError && error.code === 'identity_verification_not_startable')
      return { state: 'ERROR', message: 'Verification can’t be started from its current state.' };
    return { state: 'ERROR', message: 'Verification couldn’t be started. Try again later.' };
  }
  redirect(destination.toString());
}
