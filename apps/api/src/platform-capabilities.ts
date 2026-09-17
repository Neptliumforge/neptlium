export type PlatformCapabilityState = 'available' | 'beta' | 'planned' | 'unavailable';

export interface PlatformCapability {
  readonly id: string;
  readonly state: PlatformCapabilityState;
  readonly boundary: string;
  readonly evidence: string;
}

/**
 * Public capability contract. This describes stable product boundaries, not runtime
 * provider readiness. Provider configuration must never promote one of these states.
 */
export const platformCapabilities = {
  contract_version: '2026-09-17',
  principle: 'Every movement has authority. Every position has evidence.',
  authority: {
    ai_creates_authority: false,
    sequence: [
      'mandate',
      'authority_check',
      'denied_or_approval_required_or_authorized',
      'execution',
      'reconciliation',
      'record',
    ],
  },
  capabilities: [
    {
      id: 'intelligence.company_research',
      state: 'available',
      boundary: 'Research context from identified public sources; not advice or execution.',
      evidence: 'Source identity and reporting period remain attached to displayed research.',
    },
    {
      id: 'intelligence.thesis_evaluation',
      state: 'beta',
      boundary: 'User-directed thesis capture and evaluation; never financial authority.',
      evidence: 'Inputs, evaluation state, and revealed outcomes remain distinct records.',
    },
    {
      id: 'intelligence.portfolio_context',
      state: 'beta',
      boundary: 'Context appears only when authoritative portfolio data supports it.',
      evidence: 'Unknown values remain unavailable and are never inferred as zero.',
    },
    {
      id: 'authority.organization_policy',
      state: 'planned',
      boundary: 'No public production contract currently grants organization approval authority.',
      evidence: 'Interface representation is not evidence of enforced policy.',
    },
    {
      id: 'execution.agentic_capital',
      state: 'unavailable',
      boundary: 'No AI or agent may create authority or initiate unrestricted capital execution.',
      evidence: 'Execution remains closed unless mandate, policy, provider, and ledger gates pass.',
    },
    {
      id: 'infrastructure.canonical_financial_state',
      state: 'beta',
      boundary: 'Neptlium-owned ledger state is separate from provider observations.',
      evidence: 'Posting, settlement evidence, and reconciliation states are stored separately.',
    },
    {
      id: 'infrastructure.provider_ingress',
      state: 'beta',
      boundary: 'Signed, replay-safe provider evidence ingress; providers are not canonical truth.',
      evidence: 'Raw evidence identity and idempotent event handling precede state transitions.',
    },
    {
      id: 'infrastructure.reconciliation',
      state: 'beta',
      boundary: 'Mismatch classification and durable records support operator review.',
      evidence: 'Settled and reconciled remain independent lifecycle states.',
    },
  ] satisfies readonly PlatformCapability[],
} as const;
