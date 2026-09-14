export const productDomains = {
  web: 'neptlium.com',
  capital: 'app.neptlium.com',
  treasury: 'treasury.neptlium.com',
  pay: 'pay.neptlium.com',
  api: 'api.neptlium.com',
  docs: 'docs.neptlium.com',
  admin: 'admin.neptlium.com',
  status: 'status.neptlium.com',
} as const;

export type ProductDomain = keyof typeof productDomains;

export const productHierarchy = {
  capital: {
    name: 'Neptlium Capital',
    audience: 'individuals / investors',
    capabilities: ['investing', 'portfolio', 'wealth'] as const,
  },
  treasury: {
    name: 'Neptlium Treasury',
    audience: 'businesses / finance teams / treasury operators',
    capabilities: ['treasury', 'payments', 'stablecoins', 'approvals', 'policies'] as const,
  },
  institutional: {
    name: 'Neptlium Institutional',
    audience: 'funds / family offices / asset managers',
    capabilities: ['institutional accounts', 'controls', 'reporting', 'apis'] as const,
    state: 'PLANNED' as const,
  },
  infrastructure: {
    name: 'Neptlium Infrastructure',
    audience: 'developers / integrators / platform operators',
    capabilities: ['pay', 'api', 'docs'] as const,
  },
} as const;

export const productFamilies = {
  capital: { name: 'Neptlium Capital', audience: productHierarchy.capital.audience },
  treasury: { name: 'Neptlium Treasury', audience: productHierarchy.treasury.audience },
  institutional: { name: 'Neptlium Institutional', audience: productHierarchy.institutional.audience },
  pay: { name: 'Neptlium Pay', audience: 'public invoice/payment recipients' },
  docs: { name: 'Neptlium Developers', audience: 'developers and integration teams' },
  status: { name: 'Neptlium Status', audience: 'customers, operators, and integrators' },
} as const;

export type ProductCapabilityState = 'AVAILABLE' | 'BETA' | 'PLANNED' | 'NOT_CONFIGURED' | 'UNAVAILABLE';

export type TreasuryRole =
  | 'OWNER'
  | 'ADMINISTRATOR'
  | 'CFO'
  | 'FINANCE_MANAGER'
  | 'APPROVER'
  | 'OPERATOR'
  | 'AUDITOR'
  | 'VIEWER';

export type OrganizationAuthorityState = 'AVAILABLE' | 'NOT_CONFIGURED' | 'UNAVAILABLE';

export type OrganizationAuthorityProjection = {
  readonly state: OrganizationAuthorityState;
  readonly organizationId?: string;
  readonly membershipId?: string;
  readonly role?: TreasuryRole;
  readonly permissions?: readonly string[];
  readonly reason?: string;
};

export type TreasuryPaymentState =
  | 'DRAFT'
  | 'PREFLIGHT'
  | 'POLICY_CHECKED'
  | 'AWAITING_APPROVAL'
  | 'AUTHORIZED'
  | 'RESERVED'
  | 'AWAITING_SIGNATURE'
  | 'SIGNED'
  | 'SUBMITTED'
  | 'CONFIRMING'
  | 'SETTLED'
  | 'RECONCILED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'POLICY_BLOCKED'
  | 'SIMULATION_FAILED'
  | 'SIGNATURE_EXPIRED'
  | 'SUBMISSION_FAILED'
  | 'REVERTED'
  | 'DROPPED'
  | 'REPLACED'
  | 'RECONCILIATION_EXCEPTION';

export type TreasuryAccountClass = 'ROOT_EXTERNAL' | 'SMART_ACCOUNT' | 'WATCH_ONLY' | 'CUSTODIAL_PROVIDER' | 'BANK_ACCOUNT';

export type PublicPaymentIntentPresentation = {
  readonly state: ProductCapabilityState;
  readonly publicToken: string;
  readonly invoiceReference?: string;
  readonly amountDisplay?: string;
  readonly paymentMethods?: readonly string[];
  readonly receiptState?: 'UNAVAILABLE' | 'PENDING' | 'AVAILABLE';
};

export type PublicServiceState = 'OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'MAINTENANCE';
export type IncidentPhase = 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';

export type PublicIncident = {
  readonly title: string;
  readonly state: IncidentPhase;
  readonly impact: PublicServiceState;
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly resolvedAt?: string;
  readonly updates: readonly { readonly at: string; readonly body: string }[];
};
