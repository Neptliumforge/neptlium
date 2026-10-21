import type { AccountStatus, IdentityVerificationView } from '../api/client';

export type VerificationTone = 'neutral' | 'pending' | 'positive' | 'attention';

export interface VerificationPresentation {
  /** Status chip text; null when no authoritative record supports showing a status. */
  readonly status: string | null;
  readonly tone: VerificationTone;
  readonly title: string;
  readonly detail: string;
  readonly action: { readonly label: string } | null;
}

const statusCopy = {
  NOT_VERIFIED: {
    status: 'Not verified',
    tone: 'neutral',
    detail: 'You haven’t verified your identity yet.',
  },
  PENDING: {
    status: 'Pending',
    tone: 'pending',
    detail: 'Your verification has been submitted and is being reviewed.',
  },
  ACTION_REQUIRED: {
    status: 'Action required',
    tone: 'attention',
    detail: 'We need more information to finish verifying your identity.',
  },
  VERIFIED: {
    status: 'Verified',
    tone: 'positive',
    detail: 'Your identity has been verified.',
  },
} as const;

const dashboardAccess = 'You don’t need it to use your dashboard or manage your profile.';

/**
 * Maps the API's verification view to customer copy. Status appears only when the
 * API returns a Neptlium verification record (or confirms an empty configured
 * record store). Account standing, onboarding completion and email confirmation are
 * never shown as verification.
 */
export function presentIdentityVerification(
  view: IdentityVerificationView | null,
): VerificationPresentation {
  if (!view || view.record.state === 'UNAVAILABLE') {
    return {
      status: null,
      tone: 'neutral',
      title: 'Verification status unavailable',
      detail: `We couldn’t load your verification status right now. ${dashboardAccess} Try again later.`,
      action: null,
    };
  }

  if (view.record.state === 'NOT_CONFIGURED') {
    return {
      status: null,
      tone: 'neutral',
      title: 'Identity verification isn’t available yet',
      detail: `No verification has been requested. ${dashboardAccess} When verification is available for your account, you’ll be able to start it here.`,
      action: null,
    };
  }

  const status = view.record.state === 'EMPTY' ? 'NOT_VERIFIED' : view.record.value.status;
  const copy = statusCopy[status];
  const reason = view.record.state === 'VALUE' ? view.record.value.action_required_reason : null;
  const paused =
    view.capability !== 'AVAILABLE' && (status === 'NOT_VERIFIED' || status === 'ACTION_REQUIRED');

  return {
    status: copy.status,
    tone: copy.tone,
    title: 'Verify your identity',
    detail: [
      copy.detail,
      status === 'ACTION_REQUIRED' && reason ? reason : null,
      paused ? 'Verification is temporarily unavailable. Try again later.' : null,
    ]
      .filter(Boolean)
      .join(' '),
    action: view.can_start
      ? { label: status === 'ACTION_REQUIRED' ? 'Continue verification' : 'Start verification' }
      : null,
  };
}

export function isIdentityVerified(view: IdentityVerificationView | null | undefined): boolean {
  return view?.record.state === 'VALUE' && view.record.value.status === 'VERIFIED';
}

export interface AccountSetupPrompt {
  readonly title: string;
  readonly detail: string;
  readonly cta: string;
}

/**
 * First-run guidance on the dashboard. Shown only when the API reports onboarding as
 * not complete; unknown state shows nothing, so the dashboard never blocks or loops.
 */
export function accountSetupPrompt(status: AccountStatus | null): AccountSetupPrompt | null {
  if (!status || status.onboarding.state === 'COMPLETED') return null;
  return status.onboarding.state === 'IN_PROGRESS'
    ? {
        title: 'Finish setting up your profile',
        detail: 'Your progress is saved. Pick up where you left off.',
        cta: 'Continue setup',
      }
    : {
        title: 'Set up your profile',
        detail: 'Add your name and country so your account is ready. It takes about a minute.',
        cta: 'Set up profile',
      };
}

/** Mirrors the API lock. Unknown status keeps the legal name read-only (fail closed). */
export function isLegalNameEditable(view: IdentityVerificationView | null | undefined): boolean {
  const record = view?.record;
  if (!record || record.state === 'UNAVAILABLE') return false;
  if (record.state === 'NOT_CONFIGURED' || record.state === 'EMPTY') return true;
  return record.value.status !== 'PENDING' && record.value.status !== 'VERIFIED';
}
