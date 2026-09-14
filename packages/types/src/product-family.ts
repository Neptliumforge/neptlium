export const productDomains = {
  web: 'neptlium.com',
  capital: 'app.neptlium.com',
  vault: 'vault.neptlium.com',
  pay: 'pay.neptlium.com',
  api: 'api.neptlium.com',
  docs: 'docs.neptlium.com',
  admin: 'admin.neptlium.com',
  status: 'status.neptlium.com',
} as const;

export type ProductDomain = keyof typeof productDomains;

export const productFamilies = {
  capital: { name: 'Neptlium Capital', audience: 'individuals / investors' },
  vault: { name: 'VaultRail', audience: 'organizations / finance teams / treasury operators' },
  pay: { name: 'Neptlium Pay', audience: 'public invoice/payment recipients' },
  docs: { name: 'Neptlium Developers', audience: 'developers and integration teams' },
  status: { name: 'Neptlium Status', audience: 'customers, operators, and integrators' },
} as const;

export type ProductCapabilityState = 'AVAILABLE' | 'BETA' | 'PLANNED' | 'NOT_CONFIGURED' | 'UNAVAILABLE';

export type VaultRailRole =
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
  readonly role?: VaultRailRole;
  readonly permissions?: readonly string[];
  readonly reason?: string;
};

export type VaultRailPaymentState =
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
