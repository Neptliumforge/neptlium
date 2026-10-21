import { ApiError } from './errors.js';
import type { AccountContext, OnboardingDraftRecord } from './repositories.js';

/**
 * Onboarding is profile setup. Completing it never grants financial, Treasury,
 * organization or provider-execution authority, and it never implies identity
 * verification.
 */
export type OnboardingState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export function onboardingStateOf(
  context: Pick<AccountContext, 'provisionedAt'>,
  draft: OnboardingDraftRecord | null,
): OnboardingState {
  if (context.provisionedAt) return 'COMPLETED';
  if (draft && (draft.stepIndex > 0 || Object.keys(draft.data).length > 0)) return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

/**
 * Account standing reflects operator suspend/revoke decisions only. `pending` is the
 * column default for every account and `active` is an operator reinstatement; neither
 * describes identity verification.
 */
export type AccountStanding = 'UNRESTRICTED' | 'RESTRICTED';

export function accountStandingOf(
  context: Pick<AccountContext, 'complianceStatus'>,
): AccountStanding {
  return context.complianceStatus === 'suspended' || context.complianceStatus === 'revoked'
    ? 'RESTRICTED'
    : 'UNRESTRICTED';
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  displayName?: string | null;
}

const profileFields = new Set(['first_name', 'last_name', 'display_name']);

function nameField(value: unknown, field: string): string {
  if (typeof value !== 'string')
    throw new ApiError(422, 'validation_failed', `${field} must be a string`);
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 100 || /[\u0000-\u001f\u007f]/.test(trimmed))
    throw new ApiError(422, 'validation_failed', `${field} must be 1 to 100 characters`);
  return trimmed;
}

export function parseProfileUpdate(body: unknown): ProfileUpdate {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ApiError(422, 'validation_failed', 'Request body must be an object');
  const input = body as Record<string, unknown>;
  const keys = Object.keys(input);
  if (keys.length === 0 || keys.some((key) => !profileFields.has(key)))
    throw new ApiError(
      422,
      'validation_failed',
      'Only first_name, last_name and display_name can be updated',
    );

  const update: ProfileUpdate = {};
  if ('first_name' in input) update.firstName = nameField(input.first_name, 'first_name');
  if ('last_name' in input) update.lastName = nameField(input.last_name, 'last_name');
  if ('display_name' in input) {
    const value = input.display_name;
    if (value === null || (typeof value === 'string' && value.trim() === '')) {
      update.displayName = null;
    } else {
      update.displayName = nameField(value, 'display_name');
    }
  }
  return update;
}

export function changesLegalName(update: ProfileUpdate): boolean {
  return update.firstName !== undefined || update.lastName !== undefined;
}
