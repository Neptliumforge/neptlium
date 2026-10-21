export interface ProfileFormInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
}

export interface ProfileFormCurrent {
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly displayName: string | null;
}

export type ProfileUpdatePayload = {
  first_name?: string;
  last_name?: string;
  display_name?: string | null;
};

export type ProfileFormResult =
  | { readonly ok: true; readonly payload: ProfileUpdatePayload | null }
  | { readonly ok: false; readonly error: string };

const controlCharacters = /[\u0000-\u001f\u007f]/;

function validName(value: string) {
  return value.length >= 1 && value.length <= 100 && !controlCharacters.test(value);
}

/**
 * Mirrors the API's profile validation so the form can explain problems before
 * submitting. The API remains the authority and re-validates every field.
 * Returns only changed fields; `payload: null` means nothing changed.
 */
export function buildProfileUpdate(
  input: ProfileFormInput,
  current: ProfileFormCurrent,
  legalNameEditable: boolean,
): ProfileFormResult {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const displayName = input.displayName.trim();
  const payload: ProfileUpdatePayload = {};

  if (legalNameEditable) {
    if (!validName(firstName) || !validName(lastName))
      return { ok: false, error: 'Enter a first and last name of up to 100 characters each.' };
    if (firstName !== (current.firstName ?? '')) payload.first_name = firstName;
    if (lastName !== (current.lastName ?? '')) payload.last_name = lastName;
  }
  if (displayName && !validName(displayName))
    return { ok: false, error: 'Display name must be up to 100 characters.' };
  if (displayName !== (current.displayName ?? '')) payload.display_name = displayName || null;

  return { ok: true, payload: Object.keys(payload).length > 0 ? payload : null };
}
