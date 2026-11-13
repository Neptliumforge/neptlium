/** Read-only, fail-closed provider capability assessment. No SDK, network or execution access. */
export type ObservedReadiness = 'configured' | 'not_configured' | 'degraded' | 'disabled';
export type DeclaredCapability = 'ENABLED' | 'DISABLED' | 'NOT_CONFIGURED' | 'PENDING_VERIFICATION';
export interface CapabilityEvidence {
  readonly provider: string;
  readonly environment: 'preview' | 'production';
  readonly readiness: ObservedReadiness;
  readonly declared: DeclaredCapability;
  readonly policyApproved: boolean;
  readonly verificationPassed: boolean;
}
export type CapabilityAssessment =
  | { readonly eligible: true; readonly reason: 'verified' }
  | { readonly eligible: false; readonly reason: 'unconfigured' | 'provider-unready' | 'capability-disabled' | 'policy-unapproved' | 'verification-missing' | 'invalid-evidence' };

/** Advisory only: a positive assessment never authorizes or activates a financial operation. */
export function assessProviderCapability(input: CapabilityEvidence): CapabilityAssessment {
  if (!input || !['preview', 'production'].includes(input.environment) ||
      typeof input.provider !== 'string' || !/^[a-z][a-z0-9_-]{1,63}$/.test(input.provider) ||
      !['configured', 'not_configured', 'degraded', 'disabled'].includes(input.readiness) ||
      !['ENABLED', 'DISABLED', 'NOT_CONFIGURED', 'PENDING_VERIFICATION'].includes(input.declared) ||
      typeof input.policyApproved !== 'boolean' || typeof input.verificationPassed !== 'boolean') {
    return { eligible: false, reason: 'invalid-evidence' };
  }
  if (input.readiness === 'not_configured' || input.declared === 'NOT_CONFIGURED')
    return { eligible: false, reason: 'unconfigured' };
  if (input.readiness !== 'configured') return { eligible: false, reason: 'provider-unready' };
  if (input.declared !== 'ENABLED') return { eligible: false, reason: 'capability-disabled' };
  if (!input.policyApproved) return { eligible: false, reason: 'policy-unapproved' };
  if (!input.verificationPassed) return { eligible: false, reason: 'verification-missing' };
  return { eligible: true, reason: 'verified' };
}
