import 'server-only';

import {
  getAccountSettings,
  getAllocationState,
  getCapitalActivity,
  getDocuments,
  getNotifications,
  getOverviewState,
  getPortfolioState,
} from '@/lib/api/client';
import {
  getCanonicalBalances,
  getFundingActivity,
  getFundingCapabilities,
  getTransferActivity,
  getTransferAliases,
  getTransferCapabilities,
} from '@/lib/api/financial';
import type { AccountContext } from '@/lib/api/client';
import type { AuthenticatedProductBootstrap, Projection } from './bootstrap-types';

function projection<T>(result: PromiseSettledResult<T>): Projection<T> {
  if (result.status === 'fulfilled') return { state: 'READY', data: result.value };
  return { state: 'UNAVAILABLE', reason: 'projection_unavailable' };
}

export async function getAuthenticatedProductBootstrap(
  account: Pick<AccountContext, 'id' | 'email' | 'fullName' | 'displayName' | 'complianceStatus' | 'role'>,
): Promise<AuthenticatedProductBootstrap> {
  const [
    settings,
    overview,
    balances,
    fundingCapabilities,
    fundingActivity,
    transferCapabilities,
    destinations,
    transfers,
    portfolio,
    allocation,
    activity,
    notifications,
    documents,
  ] = await Promise.allSettled([
    getAccountSettings(),
    getOverviewState(),
    getCanonicalBalances(),
    getFundingCapabilities(),
    getFundingActivity(),
    getTransferCapabilities(),
    getTransferAliases(),
    getTransferActivity(),
    getPortfolioState(),
    getAllocationState(),
    getCapitalActivity({ limit: 50 }),
    getNotifications(),
    getDocuments(),
  ] as const);

  return {
    account,
    settings: projection(settings),
    overview: projection(overview),
    balances: balances.status === 'fulfilled'
      ? { state: 'READY', data: balances.value.balances }
      : { state: 'UNAVAILABLE', reason: 'canonical_balances_unavailable' },
    fundingCapabilities: fundingCapabilities.status === 'fulfilled'
      ? { state: 'READY', data: fundingCapabilities.value.capabilities }
      : { state: 'UNAVAILABLE', reason: 'funding_capability_unavailable' },
    fundingActivity: fundingActivity.status === 'fulfilled'
      ? { state: 'READY', data: fundingActivity.value.data }
      : { state: 'UNAVAILABLE', reason: 'funding_activity_unavailable' },
    transferCapabilities: transferCapabilities.status === 'fulfilled'
      ? { state: 'READY', data: transferCapabilities.value.capabilities }
      : { state: 'UNAVAILABLE', reason: 'transfer_capability_unavailable' },
    destinations: destinations.status === 'fulfilled'
      ? { state: 'READY', data: destinations.value.data }
      : { state: 'UNAVAILABLE', reason: 'destination_projection_unavailable' },
    transfers: transfers.status === 'fulfilled'
      ? { state: 'READY', data: transfers.value.data }
      : { state: 'UNAVAILABLE', reason: 'transfer_projection_unavailable' },
    portfolio: projection(portfolio),
    allocation: projection(allocation),
    activity: projection(activity),
    notifications: notifications.status === 'fulfilled'
      ? { state: 'READY', data: notifications.value.data }
      : { state: 'UNAVAILABLE', reason: 'notification_projection_unavailable' },
    documents: documents.status === 'fulfilled'
      ? { state: 'READY', data: documents.value.data }
      : { state: 'UNAVAILABLE', reason: 'document_projection_unavailable' },
    asOf: new Date().toISOString(),
  };
}
