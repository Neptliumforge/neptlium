import 'server-only';
import { apiRequest } from './client';

export interface ProposedOrder {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly currency: 'USD';
  readonly amountMinor: string;
  readonly durationMonths: number;
  readonly state: 'UNAVAILABLE';
  readonly enrollmentEnabled: false;
  readonly returnTerms: null;
  readonly issuer: null;
  readonly legalApproval: 'PENDING';
}
export interface ProposedOrderCatalog {
  readonly state: 'PROPOSED';
  readonly purchasable: false;
  readonly requirements: readonly string[];
  readonly listings: readonly ProposedOrder[];
}

export async function loadProposedOrders(): Promise<ProposedOrderCatalog | null> {
  try {
    const value = await apiRequest<ProposedOrderCatalog>('/v1/investment-orders');
    // A future purchasable catalog must receive a separate reviewed customer flow.
    if (
      value.state !== 'PROPOSED' ||
      value.purchasable !== false ||
      !Array.isArray(value.listings) ||
      !Array.isArray(value.requirements) ||
      value.requirements.some((requirement) => typeof requirement !== 'string') ||
      new Set(value.listings.map((order) => order.id)).size !== value.listings.length ||
      value.listings.some(
        (order) =>
          order.state !== 'UNAVAILABLE' ||
          order.enrollmentEnabled !== false ||
          order.returnTerms !== null ||
          order.legalApproval !== 'PENDING' ||
          order.issuer !== null ||
          order.currency !== 'USD' ||
          !/^[1-9][0-9]{0,12}$/.test(order.amountMinor) ||
          !Number.isSafeInteger(order.durationMonths) ||
          order.durationMonths <= 0 ||
          order.version !== 1 ||
          !/^[a-z-]{1,40}$/.test(order.id) ||
          typeof order.name !== 'string',
      )
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

export function proposedOrderAmount(order: ProposedOrder) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(order.amountMinor) / 100);
}
