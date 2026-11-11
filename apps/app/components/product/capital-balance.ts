import type { CanonicalBalance, CanonicalBalancesResponse } from '@/lib/api/financial';
import type { Projection } from '@/lib/product/bootstrap-types';

/**
 * Display state for the customer's Capital balance, derived only from the
 * canonical balances contract (docs/financial/CANONICAL_BALANCES.md). Anything
 * missing, failed or internally inconsistent is UNAVAILABLE; only a contract
 * version 2 ZERO with a ZERO_LEDGER valuation is shown as a currency zero.
 */
export type CapitalBalanceView =
  | { readonly kind: 'UNAVAILABLE' }
  | { readonly kind: 'NOT_INITIALIZED' }
  | { readonly kind: 'ZERO'; readonly display: string }
  | { readonly kind: 'SINGLE'; readonly balance: CanonicalBalance }
  | { readonly kind: 'MULTIPLE'; readonly balances: readonly CanonicalBalance[] };

const unavailable: CapitalBalanceView = { kind: 'UNAVAILABLE' };

function isZero(balance: CanonicalBalance) {
  return [
    balance.total_atomic,
    balance.available_atomic,
    balance.reserved_atomic,
    balance.pending_atomic,
    balance.restricted_atomic,
  ].every((value) => value === '0');
}

/** Formats an integer amount of currency minor units, e.g. ('0', 2, 'USD') → '$0.00'. */
export function formatReportingMinor(
  minor: string,
  decimals: number,
  currency: string,
): string | null {
  if (!/^\d+$/.test(minor) || !Number.isInteger(decimals) || decimals < 0 || decimals > 6)
    return null;
  if (!/^[A-Z]{3}$/.test(currency)) return null;
  const padded = minor.padStart(decimals + 1, '0');
  const whole = (decimals ? padded.slice(0, -decimals) : padded).replace(/^0+(?=\d)/, '');
  const fraction = decimals ? `.${padded.slice(-decimals)}` : '';
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency === 'USD' ? '$' : `${currency} `}${grouped}${fraction}`;
}

export function capitalBalanceView(
  projection: Projection<CanonicalBalancesResponse>,
): CapitalBalanceView {
  if (projection.state !== 'READY') return unavailable;
  const response = projection.data;
  switch (response.state) {
    // EMPTY is the version 1 shape; it never meant an established zero.
    case 'EMPTY':
    case 'NOT_INITIALIZED':
      return response.balances.length === 0 ? { kind: 'NOT_INITIALIZED' } : unavailable;
    case 'ZERO': {
      const reporting = response.reporting;
      if (
        response.contract_version !== 2 ||
        reporting?.valuation !== 'ZERO_LEDGER' ||
        reporting.total_minor !== '0' ||
        !response.balances.every(isZero)
      )
        return unavailable;
      const display = formatReportingMinor('0', reporting.decimals, reporting.currency);
      return display ? { kind: 'ZERO', display } : unavailable;
    }
    case 'VALUE':
      if (response.balances.length === 0) return unavailable;
      return response.balances.length === 1
        ? { kind: 'SINGLE', balance: response.balances[0]! }
        : { kind: 'MULTIPLE', balances: response.balances };
    default:
      return unavailable;
  }
}
