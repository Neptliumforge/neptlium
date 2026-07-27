"use server";

import { createSupabaseAdminClient } from "@neptlium/lib/supabase/admin";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { onboardingPayloadSchema, type ProvisioningPayload } from "@neptlium/lib";
import { requireUser } from "@/lib/auth";

export interface OnboardingDraft {
  readonly data: Partial<ProvisioningPayload>;
  readonly stepIndex: number;
}

export type ProvisioningResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

function unavailable(message: string): ProvisioningResult {
  return { ok: false, error: message };
}

export async function getOnboardingDraft(): Promise<OnboardingDraft> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("onboarding_drafts")
    .select("data, step_index")
    .eq("user_id", user.id)
    .maybeSingle();
  const parsed = onboardingPayloadSchema.partial().safeParse(data?.data);

  return {
    data: parsed.success ? (parsed.data as Partial<ProvisioningPayload>) : {},
    stepIndex: parsed.success ? Math.min(Math.max(data?.step_index ?? 0, 0), 7) : 0
  };
}

export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  const user = await requireUser();
  const parsed = onboardingPayloadSchema.partial().safeParse(draft.data);
  if (!parsed.success || draft.stepIndex < 0 || draft.stepIndex > 7) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("onboarding_drafts").upsert(
    { user_id: user.id, data: parsed.data, step_index: draft.stepIndex, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

export async function submitProvisioning(input: ProvisioningPayload): Promise<ProvisioningResult> {
  const user = await requireUser();
  const parsed = onboardingPayloadSchema.safeParse(input);
  if (!parsed.success) return unavailable("Review the required information and try again.");

  const data = parsed.data;
  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const { data: currentProfile, error: profileLookupError } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileLookupError) return unavailable("Your workspace is temporarily unavailable. Please retry.");

  const { data: existingRole, error: roleLookupError } = await admin
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (roleLookupError) return unavailable("Unable to provision account access. Please try again.");
  if (!existingRole) {
    const { error } = await admin.from("user_roles").insert({ user_id: user.id, role: "user" });
    if (error) return unavailable("Unable to provision account access. Please try again.");
  }

  let organizationId = currentProfile?.organization_id ?? null;
  if (data.organizationName && !organizationId) {
    const { data: organization, error } = await admin
      .from("organizations")
      .insert({
        owner_id: user.id,
        name: data.organizationName,
        role: data.companyRole || null,
        website: data.website || null,
        country: data.country
      })
      .select("id")
      .single();
    if (error || !organization) return unavailable("Unable to save your organization profile. Please try again.");
    organizationId = organization.id;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`,
      country: data.country,
      investor_type: data.investorType,
      purpose: data.investorType.replaceAll("_", " "),
      organization_id: organizationId,
      compliance_status: "active",
      compliance_acknowledged_at: now,
      provisioned_at: now
    })
    .eq("id", user.id);
  if (profileError) return unavailable("Unable to save your profile. Please try again.");

  const { data: portfolio, error: portfolioError } = await admin
    .from("investment_portfolios")
    .upsert({ profile_id: user.id }, { onConflict: "profile_id" })
    .select("id")
    .single();
  if (portfolioError || !portfolio) return unavailable("Unable to provision your portfolio. Please try again.");

  const { data: existingWallet, error: walletLookupError } = await admin
    .from("wallets")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (walletLookupError) return unavailable("Unable to provision your wallet. Please try again.");
  if (!existingWallet) {
    const { error } = await admin
      .from("wallets")
      .insert({ portfolio_id: portfolio.id, profile_id: user.id, provider: "internal" });
    if (error) return unavailable("Unable to provision your wallet. Please try again.");
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      onboarding_completed: true,
      investor_type: data.investorType,
      country: data.country
    }
  });
  if (metadataError) return unavailable("Unable to finalize account setup. Please try again.");

  await admin.from("audit_logs").insert([
    { user_id: user.id, action: "onboarding.completed", table_name: "profiles", record_id: user.id, metadata: { investor_type: data.investorType } },
    { user_id: user.id, action: "workspace.provisioned", table_name: "investment_portfolios", record_id: portfolio.id, metadata: { security_choices: data.securityChoices } }
  ]);
  await admin.from("onboarding_drafts").delete().eq("user_id", user.id);

  return { ok: true };
}
