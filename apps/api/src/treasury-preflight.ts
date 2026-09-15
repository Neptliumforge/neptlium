import { canActForOrganization, requireActiveMembership, type OrganizationMembership } from './platform-core-domain.js';
import { normalizeTreasuryMoney, type TreasuryAccountRef, type TreasuryTransactionIntent } from './treasury-orchestration-domain.js';
import { resolvePaymentRail, type PaymentRailContext, type PaymentRailResolution } from './treasury-provider-boundaries.js';
import { evaluateTreasuryPolicy, type PolicyDecision, type TreasuryPolicyContext } from './treasury-policy.js';

export interface TreasurySimulationResult {
  readonly state: 'passed' | 'failed' | 'not_applicable' | 'unavailable';
  readonly warnings: readonly string[];
  readonly assetChanges: readonly { readonly assetKey: string; readonly amountAtomic: string }[];
}

export interface TreasuryRiskFinding {
  readonly code: string;
  readonly severity: 'info' | 'warning' | 'block';
  readonly explanation: string;
}

export interface TreasuryPreflightResult {
  readonly state: 'ready_for_approval' | 'ready_for_execution_review' | 'blocked';
  readonly organizationId: string;
  readonly intentId: string;
  readonly paymentRail: PaymentRailResolution;
  readonly policy: PolicyDecision;
  readonly simulation: TreasurySimulationResult;
  readonly riskFindings: readonly TreasuryRiskFinding[];
  readonly humanExplanation: string;
  readonly executionAuthorized: false;
}

export function runTreasuryPreflight(input: {
  readonly membership: OrganizationMembership;
  readonly intent: TreasuryTransactionIntent;
  readonly sourceAccount: TreasuryAccountRef;
  readonly railContext: PaymentRailContext;
  readonly policyContext: TreasuryPolicyContext;
  readonly simulation: TreasurySimulationResult;
  readonly riskFindings?: readonly TreasuryRiskFinding[];
}): TreasuryPreflightResult {
  const membership = requireActiveMembership(input.membership, input.intent.organizationId);
  if (!canActForOrganization(membership.role, 'operate')) throw new Error('organization membership cannot operate treasury intent');
  if (input.sourceAccount.organizationId !== input.intent.organizationId) throw new Error('treasury source account organization mismatch');
  if (input.sourceAccount.id !== input.intent.sourceAccountId) throw new Error('treasury source account does not match intent');
  if (input.sourceAccount.status !== 'active') throw new Error('treasury source account is not active');

  const intentMoney = normalizeTreasuryMoney(input.intent.money);
  const railMoney = normalizeTreasuryMoney(input.railContext.money);
  if (intentMoney.amountAtomic !== railMoney.amountAtomic || intentMoney.scale !== railMoney.scale || intentMoney.currencyOrAsset !== railMoney.currencyOrAsset) {
    throw new Error('payment rail context money does not match treasury intent');
  }

  const paymentRail = resolvePaymentRail(input.railContext);
  if (paymentRail.state === 'unavailable' || !paymentRail.rail) {
    return {
      state: 'blocked',
      organizationId: input.intent.organizationId,
      intentId: input.intent.id,
      paymentRail,
      policy: {
        decision: 'deny',
        warnings: [],
        violations: ['No governed provider rail is available'],
        requiredApprovals: [],
        matchedRules: [],
        forbidSelfApproval: false,
      },
      simulation: input.simulation,
      riskFindings: input.riskFindings ?? [],
      humanExplanation: 'Execution is unavailable because no governed payment rail is currently available.',
      executionAuthorized: false,
    };
  }

  if (input.policyContext.organizationId !== input.intent.organizationId) throw new Error('policy organization mismatch');
  if (input.policyContext.rail !== paymentRail.rail) throw new Error('policy rail does not match resolved payment rail');
  if (input.policyContext.money.amountAtomic !== intentMoney.amountAtomic || input.policyContext.money.currencyOrAsset !== intentMoney.currencyOrAsset) {
    throw new Error('policy money does not match treasury intent');
  }

  const policy = evaluateTreasuryPolicy(input.policyContext);
  const riskFindings = input.riskFindings ?? [];
  const blockingRisk = riskFindings.some((finding) => finding.severity === 'block');
  const simulationBlocks = input.simulation.state === 'failed';

  if (policy.decision === 'deny' || blockingRisk || simulationBlocks) {
    return {
      state: 'blocked',
      organizationId: input.intent.organizationId,
      intentId: input.intent.id,
      paymentRail,
      policy,
      simulation: input.simulation,
      riskFindings,
      humanExplanation: 'The treasury intent is blocked by deterministic preflight, policy, simulation, or risk evidence.',
      executionAuthorized: false,
    };
  }

  const requiresApproval = policy.decision === 'requires_approval';
  return {
    state: requiresApproval ? 'ready_for_approval' : 'ready_for_execution_review',
    organizationId: input.intent.organizationId,
    intentId: input.intent.id,
    paymentRail,
    policy,
    simulation: input.simulation,
    riskFindings,
    humanExplanation: requiresApproval
      ? 'Preflight passed. Organization approval is required before any provider or signing action may occur.'
      : 'Preflight passed. The intent is ready for a separate execution authorization step; no provider action has been authorized.',
    executionAuthorized: false,
  };
}
