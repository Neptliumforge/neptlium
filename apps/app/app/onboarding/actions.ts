'use server';

import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';
import { onboardingPayloadSchema, type ProvisioningPayload } from '@neptlium/lib';
import { requireUser } from '@/lib/auth';
import { completeAccountOnboarding } from '@/lib/api/client';

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
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('onboarding_drafts')
    .select('data, step_index')
    .eq('user_id', user.id)
    .maybeSingle();
  const parsed = onboardingPayloadSchema.partial().safeParse(data?.data);

  return {
    data: parsed.success ? (parsed.data as Partial<ProvisioningPayload>) : {},
    stepIndex: parsed.success ? Math.min(Math.max(data?.step_index ?? 0, 0), 7) : 0,
  };
}

export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  const user = await requireUser();
  const parsed = onboardingPayloadSchema.partial().safeParse(draft.data);
  if (!parsed.success || draft.stepIndex < 0 || draft.stepIndex > 7) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from('onboarding_drafts')
    .upsert(
      {
        user_id: user.id,
        data: parsed.data,
        step_index: draft.stepIndex,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
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
