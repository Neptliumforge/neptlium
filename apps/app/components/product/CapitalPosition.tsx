import type { CanonicalBalance } from '@/lib/api/financial';
import { FinancialValue } from './ProductState';

type CapitalBalanceValue = {
  readonly value: string;
  readonly asset: string;
};

function firstBalance(
  balances: readonly CanonicalBalance[],
  key: keyof Pick<CanonicalBalance, 'total_atomic' | 'available_atomic' | 'reserved_atomic' | 'pending_atomic'>,
): CapitalBalanceValue | null {
  const balance = balances[0];
  if (balances.length !== 1 || !balance) return null;
  return { value: balance[key], asset: balance.asset };
}

const positionRows = (
  available: CapitalBalanceValue | null,
  reserved: CapitalBalanceValue | null,
  pending: CapitalBalanceValue | null,
) => [
  { label: 'Available', value: available },
  { label: 'Reserved', value: reserved },
  { label: 'Pending', value: pending },
] as const;

export function CapitalPosition({
  balances,
  loadError = false,
  title = 'Capital position',
}: {
  readonly balances: readonly CanonicalBalance[];
  readonly loadError?: boolean;
  readonly title?: string;
}) {
  const total = firstBalance(balances, 'total_atomic');
  const available = firstBalance(balances, 'available_atomic');
  const reserved = firstBalance(balances, 'reserved_atomic');
  const pending = firstBalance(balances, 'pending_atomic');
  const multiAsset = balances.length > 1;

  return (
    <section className="border-y border-border-hairline py-6 sm:py-7" aria-labelledby="capital-position-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p id="capital-position-title" className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">{title}</p>
          <div className="mt-2 text-[2.25rem] font-medium leading-none tracking-[-0.025em] text-text-primary sm:text-[2.6rem]">
            {loadError ? (
              'Unavailable'
            ) : multiAsset ? (
              <span>{balances.length} canonical assets</span>
            ) : total ? (
              <FinancialValue valueAtomic={total.value} asset={total.asset} />
            ) : (
              'Unavailable'
            )}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
            {loadError
              ? 'Canonical capital state could not be loaded from the Neptlium API.'
              : multiAsset
                ? 'Asset balances remain separate. Neptlium does not fabricate a cross-asset total without a canonical valuation source.'
                : balances.length === 0
                  ? 'No canonical balance is available yet.'
                  : 'Canonical Neptlium ledger state.'}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-x-5 gap-y-4 border-t border-border-hairline pt-5 sm:max-w-2xl">
        {positionRows(available, reserved, pending).map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-text-primary sm:text-base">
              {multiAsset ? 'By asset' : value ? <FinancialValue valueAtomic={value.value} asset={value.asset} /> : 'Unavailable'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
