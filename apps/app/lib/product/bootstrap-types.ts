import type {
  AccountContext,
  AccountSettings,
  AllocationState,
  CapitalActivityPage,
  CustomerDocument,
  CustomerNotification,
  OverviewState,
  PortfolioState,
} from '@/lib/api/client';
import type {
  CanonicalBalance,
  FundingActivity,
  FundingCapability,
  TransferActivity,
  TransferAlias,
} from '@/lib/api/financial';

export type Projection<T> =
  | { readonly state: 'READY'; readonly data: T }
  | { readonly state: 'UNAVAILABLE'; readonly reason: string };

export interface AuthenticatedProductBootstrap {
  readonly account: Pick<AccountContext, 'id' | 'email' | 'fullName' | 'displayName' | 'complianceStatus' | 'role'>;
  readonly settings: Projection<AccountSettings>;
  readonly overview: Projection<OverviewState>;
  readonly balances: Projection<readonly CanonicalBalance[]>;
  readonly fundingCapabilities: Projection<readonly FundingCapability[]>;
  readonly fundingActivity: Projection<readonly FundingActivity[]>;
  readonly transferCapabilities: Projection<readonly FundingCapability[]>;
  readonly destinations: Projection<readonly TransferAlias[]>;
  readonly transfers: Projection<readonly TransferActivity[]>;
  readonly portfolio: Projection<PortfolioState>;
  readonly allocation: Projection<AllocationState>;
  readonly activity: Projection<CapitalActivityPage>;
  readonly notifications: Projection<readonly CustomerNotification[]>;
  readonly documents: Projection<readonly CustomerDocument[]>;
  readonly asOf: string;
}
