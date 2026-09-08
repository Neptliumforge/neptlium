import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CanonicalBalance } from '@/lib/api/financial';
import {
  FinancialValue,
  ProductStateBadge,
  ProductStateMessage,
  type ProductStateName,
} from './ProductState';

export type PortfolioStateItem = {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly state: ProductStateName;
};

export type IntelligenceItem = {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly state: ProductStateName;
};

export type PortfolioAttentionItem = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly href?: string;
};

export type PortfolioContextItem = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly occurredAt?: string;
};

export function PortfolioState({ items }: { readonly items: readonly PortfolioStateItem[] }) {
  return (
    <section aria-labelledby="portfolio-state-title">
      <div className="mb-4">
        <p className="neptlium-meta">Current state</p>
        <h2 id="portfolio-state-title" className="mt-2 text-text-primary">
          Portfolio state
        </h2>
      </div>
      <dl className="grid border-y border-border-hairline sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-b border-border-hairline py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
          >
            <dt className="text-xs text-text-muted">{item.label}</dt>
            <dd className="mt-3">
              <ProductStateBadge state={item.state}>{item.value}</ProductStateBadge>
            </dd>
            <p className="mt-3 text-xs leading-5 text-text-muted">{item.detail}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function HoldingsTable({
  balances,
  loadError,
}: {
  readonly balances: readonly CanonicalBalance[];
  readonly loadError: boolean;
}) {
  return (
    <section aria-labelledby="holdings-title">
      <div className="mb-4">
        <p className="neptlium-meta">Source-backed positions</p>
        <h2 id="holdings-title" className="mt-2 text-text-primary">
          Holdings
        </h2>
      </div>
      <div className="border-y border-border-hairline">
        {loadError ? (
          <ProductStateMessage state="UNAVAILABLE" title="Portfolio positions unavailable">
            Canonical position records could not be loaded. No holdings or quantities are inferred.
          </ProductStateMessage>
        ) : balances.length === 0 ? (
          <ProductStateMessage state="NO_POSITION" title="No portfolio positions available.">
            The canonical holdings collection is empty.
          </ProductStateMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-hairline text-xs font-medium text-text-muted">
                  <th className="py-3 pr-6 font-medium">Asset</th>
                  <th className="px-6 py-3 font-medium">Quantity</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="py-3 pl-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((balance) => (
                  <tr
                    key={`${balance.asset}:${balance.network ?? ''}`}
                    className="border-b border-border-hairline last:border-0"
                  >
                    <td className="py-4 pr-6">
                      <p className="text-sm font-medium text-text-primary">{balance.asset}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {balance.network ?? 'Denomination'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary" data-numeric>
                      <FinancialValue valueAtomic={balance.total_atomic} asset={balance.asset} />
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">Neptlium canonical ledger</td>
                    <td className="py-4 pl-6">
                      <ProductStateBadge state="AVAILABLE">Observed</ProductStateBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-text-muted">
        Each quantity is rendered from its returned canonical balance record. Assets are not
        combined without authoritative valuation evidence.
      </p>
    </section>
  );
}

export function ExposurePanel({ items }: { readonly items: readonly IntelligenceItem[] }) {
  return (
    <section aria-labelledby="exposure-title">
      <div className="mb-4">
        <p className="neptlium-meta">Structure</p>
        <h2 id="exposure-title" className="mt-2 text-text-primary">
          Exposure intelligence
        </h2>
      </div>
      <div className="divide-y divide-border-hairline border-y border-border-hairline">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid gap-3 py-4 sm:grid-cols-[10rem_minmax(8rem,auto)_1fr] sm:items-center sm:gap-6"
          >
            <p className="text-sm font-medium text-text-primary">{item.label}</p>
            <div>
              <ProductStateBadge state={item.state}>{item.value}</ProductStateBadge>
            </div>
            <p className="text-sm leading-6 text-text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AttentionState({ items }: { readonly items: readonly PortfolioAttentionItem[] }) {
  return (
    <section aria-labelledby="portfolio-attention-title">
      <div className="mb-4">
        <p className="neptlium-meta">Review</p>
        <h2 id="portfolio-attention-title" className="mt-2 text-text-primary">
          {items.length === 0
            ? 'No portfolio items require attention.'
            : `${items.length} portfolio item${items.length === 1 ? '' : 's'} require review.`}
        </h2>
      </div>
      <div className="border-y border-border-hairline">
        {items.length === 0 ? (
          <div className="flex items-center justify-between gap-6 py-5">
            <p className="text-sm leading-6 text-text-muted">
              No unavailable position sources or allocation review states are currently identified.
            </p>
            <ProductStateBadge state="READY">Clear</ProductStateBadge>
          </div>
        ) : (
          items.map((item) => {
            const content = (
              <>
                <div>
                  <p className="text-sm font-medium text-text-primary">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-text-muted">{item.detail}</p>
                </div>
                {item.href ? (
                  <ArrowRight className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                ) : null}
              </>
            );
            return item.href ? (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center justify-between gap-6 border-b border-border-hairline py-4 last:border-0"
              >
                {content}
              </Link>
            ) : (
              <div
                key={item.id}
                className="flex items-center justify-between gap-6 border-b border-border-hairline py-4 last:border-0"
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export function PortfolioContext({ items }: { readonly items: readonly PortfolioContextItem[] }) {
  return (
    <section aria-labelledby="portfolio-context-title">
      <div className="mb-4">
        <p className="neptlium-meta">Context</p>
        <h2 id="portfolio-context-title" className="mt-2 text-text-primary">
          Portfolio context
        </h2>
      </div>
      <div className="divide-y divide-border-hairline border-y border-border-hairline">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-text-muted">{item.detail}</p>
            </div>
            {item.occurredAt ? (
              <time dateTime={item.occurredAt} className="text-xs text-text-muted">
                {new Date(item.occurredAt).toLocaleString()}
              </time>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
