'use server';

import { onboardingPayloadSchema, type ProvisioningPayload } from '@neptlium/lib/validation';
import { requireUser } from '@/lib/auth';
import {
  completeAccountOnboarding,
  getOnboardingDraftApi,
  saveOnboardingDraftApi,
} from '@/lib/api/client';

export interface OnboardingDraft {
  readonly data: Partial<ProvisioningPayload>;
  readonly stepIndex: number;
}

export type ProvisioningResult =
  { readonly ok: true } | { readonly ok: false; readonly error: string };

function unavailable(message: string): ProvisioningResult {
  return { ok: false, error: message };
}

export async function getOnboardingDraft(): Promise<OnboardingDraft> {
  await requireUser();
  try {
    const draft = await getOnboardingDraftApi();
    const parsed = onboardingPayloadSchema.partial().safeParse(draft.data);
    return {
      data: parsed.success ? (parsed.data as Partial<ProvisioningPayload>) : {},
      stepIndex: parsed.success ? Math.min(Math.max(draft.stepIndex, 0), 7) : 0,
    };
  } catch {
    return { data: {}, stepIndex: 0 };
  }
}

export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await requireUser();
  const parsed = onboardingPayloadSchema.partial().safeParse(draft.data);
  if (!parsed.success || draft.stepIndex < 0 || draft.stepIndex > 7) return;

  try {
    await saveOnboardingDraftApi({
      data: parsed.data as Record<string, unknown>,
      stepIndex: draft.stepIndex,
    });
  } catch {
    // Draft persistence is best-effort. Final onboarding remains fail-closed.
  }
}

export async function submitProvisioning(input: ProvisioningPayload): Promise<ProvisioningResult> {
  await requireUser();
  const parsed = onboardingPayloadSchema.safeParse(input);
  if (!parsed.success) return unavailable('Review the required information and try again.');
  try {
    await completeAccountOnboarding(parsed.data);
    return { ok: true };
  } catch {
    return unavailable('Unable to finalize account setup. Please try again.');
  }
}
