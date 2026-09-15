import type { OrganizationRole } from './platform-core-domain.js';
import type { TreasuryMoney, TreasuryPaymentRail } from './treasury-orchestration-domain.js';

export type PolicyDecisionState = 'allow' | 'deny' | 'requires_approval';

export interface TreasuryPolicyRule {
  readonly id: string;
  readonly enabled: boolean;
  readonly kind: 'amount_limit' | 'allowed_rail' | 'allowed_asset' | 'allowed_network' | 'approved_counterparty' | 'approval_threshold' | 'segregation_of_duties';
  readonly amountLimitAtomic?: string;
  readonly currencyOrAsset?: string;
  readonly rail?: TreasuryPaymentRail;
  readonly networkId?: string;
  readonly counterpartyId?: string;
  readonly requiredRoles?: readonly OrganizationRole[];
  readonly forbidSelfApproval?: boolean;
}

export interface TreasuryPolicyContext {
  readonly organizationId: string;
  readonly actorId: string;
  readonly creatorId: string;
  readonly money: TreasuryMoney;
  readonly rail: TreasuryPaymentRail;
  readonly networkId?: string;
  readonly counterpartyId?: string;
  readonly counterpartyApproved: boolean;
  readonly rules: readonly TreasuryPolicyRule[];
}

export interface PolicyDecision {
  readonly decision: PolicyDecisionState;
  readonly warnings: readonly string[];
  readonly violations: readonly string[];
  readonly requiredApprovals: readonly OrganizationRole[];
  readonly matchedRules: readonly string[];
  readonly forbidSelfApproval: boolean;
}

export function evaluateTreasuryPolicy(context: TreasuryPolicyContext): PolicyDecision {
  const violations: string[] = [];
  const warnings: string[] = [];
  const requiredApprovals = new Set<OrganizationRole>();
  const matchedRules: string[] = [];
  let forbidSelfApproval = false;

  for (const rule of context.rules) {
    if (!rule.enabled) continue;

    if (rule.kind === 'amount_limit' && rule.amountLimitAtomic && (!rule.currencyOrAsset || rule.currencyOrAsset === context.money.currencyOrAsset)) {
      matchedRules.push(rule.id);
      if (BigInt(context.money.amountAtomic) > BigInt(rule.amountLimitAtomic)) violations.push(`Amount exceeds policy ${rule.id}`);
    }

    if (rule.kind === 'allowed_rail' && rule.rail) {
      matchedRules.push(rule.id);
      if (rule.rail !== context.rail) violations.push(`Payment rail is not allowed by policy ${rule.id}`);
    }

    if (rule.kind === 'allowed_asset' && rule.currencyOrAsset) {
      matchedRules.push(rule.id);
      if (rule.currencyOrAsset !== context.money.currencyOrAsset) violations.push(`Asset or currency is not allowed by policy ${rule.id}`);
    }

    if (rule.kind === 'allowed_network' && rule.networkId) {
      matchedRules.push(rule.id);
      if (rule.networkId !== context.networkId) violations.push(`Network is not allowed by policy ${rule.id}`);
    }

    if (rule.kind === 'approved_counterparty') {
      matchedRules.push(rule.id);
      if (!context.counterpartyApproved) violations.push(`Counterparty is not approved by policy ${rule.id}`);
    }

    if (rule.kind === 'approval_threshold' && rule.amountLimitAtomic && BigInt(context.money.amountAtomic) >= BigInt(rule.amountLimitAtomic)) {
      matchedRules.push(rule.id);
      for (const role of rule.requiredRoles ?? []) requiredApprovals.add(role);
    }

    if (rule.kind === 'segregation_of_duties' && rule.forbidSelfApproval) {
      matchedRules.push(rule.id);
      forbidSelfApproval = true;
    }
  }

  if (violations.length > 0) {
    return { decision: 'deny', warnings, violations, requiredApprovals: [...requiredApprovals], matchedRules, forbidSelfApproval };
  }

  if (requiredApprovals.size > 0) {
    if (forbidSelfApproval && context.actorId === context.creatorId) warnings.push('Creator cannot satisfy final approval');
    return { decision: 'requires_approval', warnings, violations, requiredApprovals: [...requiredApprovals], matchedRules, forbidSelfApproval };
  }

  return { decision: 'allow', warnings, violations, requiredApprovals: [], matchedRules, forbidSelfApproval };
}

export interface ApprovalAction {
  readonly requestId: string;
  readonly actorId: string;
  readonly actorRole: OrganizationRole;
  readonly action: 'approve' | 'reject';
  readonly occurredAt: string;
}

export function validateApprovalAction(input: {
  readonly creatorId: string;
  readonly requiredRoles: readonly OrganizationRole[];
  readonly forbidSelfApproval: boolean;
  readonly action: ApprovalAction;
}): void {
  if (input.action.action === 'approve' && !input.requiredRoles.includes(input.action.actorRole)) {
    throw new Error('actor role cannot satisfy this approval request');
  }
  if (input.action.action === 'approve' && input.forbidSelfApproval && input.action.actorId === input.creatorId) {
    throw new Error('segregation of duties forbids self-approval');
  }
}
