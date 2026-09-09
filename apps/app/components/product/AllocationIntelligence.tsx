import type { ReactNode } from 'react';
import {
  FinancialValue,
  ProductStateBadge,
  ProductStateMessage,
  type ProductStateName,
} from './ProductState';
import { WorkspaceHeader } from './WorkspaceHeader';
import type { AllocationClassification, DriftRow, ObservedPosition } from '@/lib/api/allocation';

const classDetails: Record<
  AllocationClassification,
  { readonly label: string; readonly purpose: string }
> = {
  RESERVE: { label: 'Reserve', purpose: 'Liquidity and stability' },
  CORE: { label: 'Core', purpose: 'Primary capital structure' },
  GROWTH: { label: 'Growth', purpose: 'Long-term growth exposure' },
  OPPORTUNITY: { label: 'Opportunity', purpose: 'Selective strategic exposure' },
  RESTRICTED: { label: 'Restricted', purpose: 'Capital outside allocation targets' },
};

const driftLabels = {
  WITHIN_POLICY: 'Within policy',
  REVIEW: 'Review',
  OUTSIDE_POLICY: 'Outside policy',
  RESTRICTED: 'Restricted',
  VALUATION_UNAVAILABLE: 'Valuation unavailable',
} as const;

export function AllocationHeader({ observedAt }: { readonly observedAt?: string }) {
  return (
    <WorkspaceHeader
      eyebrow="Capital structure"
      title="Allocation Intelligence"
      description="Understand capital structure, policy alignment, and decision readiness."
      meta={
        <>
          Allocation decisions remain separate from capital execution.
          {observedAt ? ` · Information observed ${new Date(observedAt).toLocaleString()}` : ''}
        </>
      }
    />
  );
}

export interface AllocationLifecycleItem {
  readonly label: 'Observed' | 'Modeled' | 'Authorized' | 'Executed' | 'Reconciled';
  readonly detail: string;
  readonly state: ProductStateName;
  readonly status: string;
}

export function AllocationLifecycle({
  items,
}: {
  readonly items: readonly AllocationLifecycleItem[];
}) {
  return (
    <section aria-labelledby="allocation-state-title">
      <div className="mb-4">
        <p className="neptlium-meta">Decision progression</p>
        <h2 id="allocation-state-title" className="mt-2 text-text-primary">
          Allocation State
        </h2>
      </div>
      <ol
        className="grid border-y border-border-hairline sm:grid-cols-5"
        aria-label="Allocation state"
      >
        {items.map((item, index) => (
          <li
            key={item.label}
            className="border-b border-border-hairline py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:last:border-r-0"
          >
            <span className="text-[11px] tabular-nums text-accent-primary">0{index + 1}</span>
            <p className="mt-3 text-sm font-medium text-text-primary">{item.label}</p>
            <p className="mt-1 min-h-10 text-xs leading-5 text-text-muted">{item.detail}</p>
            <div className="mt-3">
              <ProductStateBadge state={item.state}>{item.status}</ProductStateBadge>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ObservedCapital({
  positions,
  drift,
  hasPolicy,
}: {
  readonly positions: readonly (ObservedPosition & { readonly decimals: number | null })[];
  readonly drift: readonly DriftRow[] | null;
  readonly hasPolicy: boolean;
}) {
  return (
    <section aria-labelledby="observed-capital-title">
      <div className="mb-4">
        <p className="neptlium-meta">Capital observation</p>
        <h2 id="observed-capital-title" className="mt-2 text-text-primary">
          Observed Capital
        </h2>
      </div>
      <div className="border-y border-border-hairline">
        {positions.length === 0 ? (
          <ProductStateMessage state="NO_POSITION" title="No positions available">
            Allocation analysis begins when capital positions become available.
          </ProductStateMessage>
        ) : (
          positions.map((position) => {
            const row = drift?.find(
              (item) =>
                item.asset === position.asset && (item.network ?? null) === position.network,
            );
            return (
              <div
                key={`${position.asset}:${position.network ?? ''}`}
                className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[minmax(8rem,1fr)_minmax(10rem,auto)_auto] sm:items-center sm:gap-5"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{position.asset}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {position.network ?? 'Denomination'}
                  </p>
                </div>
                <FinancialValue
                  valueAtomic={position.totalAtomic}
                  asset={position.asset}
                  decimals={position.decimals}
                  className="text-sm font-medium"
                />
                <span className="text-xs text-text-muted">
                  {row
                    ? driftLabels[row.status]
                    : hasPolicy
                      ? 'Valuation required'
                      : 'Policy not established'}
                </span>
              </div>
            );
          })
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-text-muted">
        No cross-asset value is inferred without sufficient valuation evidence.
      </p>
    </section>
  );
}

export function PolicyFramework({ children }: { readonly children: ReactNode }) {
  return (
    <section aria-labelledby="capital-policy-title">
      <div className="mb-5 max-w-2xl">
        <p className="neptlium-meta">Policy framework</p>
        <h2 id="capital-policy-title" className="mt-2 text-text-primary">
          Capital Policy
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Define how capital should be structured across categories.
        </p>
      </div>
      <div className="grid border-y border-border-hairline sm:grid-cols-2 lg:grid-cols-5">
        {(Object.keys(classDetails) as AllocationClassification[]).map((classification) => (
          <div
            key={classification}
            className="border-b border-border-hairline py-5 last:border-b-0 sm:border-r sm:px-4 lg:border-b-0 lg:last:border-r-0"
          >
            <p className="text-sm font-medium text-text-primary">
              {classDetails[classification].label}
            </p>
            <p className="mt-4 text-[11px] text-text-muted">Purpose</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {classDetails[classification].purpose}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-7">{children}</div>
    </section>
  );
}

export function DecisionIntelligence({
  policyStatus,
  driftStatus,
  reviewStatus,
  modelStatus,
  children,
}: {
  readonly policyStatus: string;
  readonly driftStatus: string;
  readonly reviewStatus: string;
  readonly modelStatus: string;
  readonly children?: ReactNode;
}) {
  const states = [
    ['Policy alignment', policyStatus],
    ['Drift analysis', driftStatus],
    ['Review readiness', reviewStatus],
    ['Model availability', modelStatus],
  ] as const;
  return (
    <section aria-labelledby="decision-intelligence-title">
      <div className="mb-4">
        <p className="neptlium-meta">Analysis</p>
        <h2 id="decision-intelligence-title" className="mt-2 text-text-primary">
          Decision Intelligence
        </h2>
      </div>
      <dl className="grid border-y border-border-hairline sm:grid-cols-2 lg:grid-cols-4">
        {states.map(([label, value]) => (
          <div
            key={label}
            className="border-b border-border-hairline py-4 last:border-b-0 sm:border-r sm:px-4 lg:border-b-0 lg:last:border-r-0"
          >
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="mt-2 text-sm font-medium text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

export function ModeledReview({ children }: { readonly children: ReactNode }) {
  return (
    <section aria-labelledby="modeled-decisions-title">
      <div className="mb-4">
        <p className="neptlium-meta">Decision preparation</p>
        <h2 id="modeled-decisions-title" className="mt-2 text-text-primary">
          Modeled Decisions
        </h2>
      </div>
      {children}
    </section>
  );
}

export function AllocationContext({ children }: { readonly children: ReactNode }) {
  return (
    <section aria-labelledby="allocation-context-title">
      <div className="mb-4">
        <p className="neptlium-meta">Decision record</p>
        <h2 id="allocation-context-title" className="mt-2 text-text-primary">
          Allocation Context
        </h2>
      </div>
      {children}
    </section>
  );
}
