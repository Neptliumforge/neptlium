import type { ReactNode } from 'react';
import { ProductStateBadge, ProductStateMessage, type ProductStateName } from './ProductState';
import { WorkspaceHeader } from './WorkspaceHeader';

export type AccountStateItem = {
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly state: ProductStateName;
};

export type CapitalActionItem = {
  readonly label: string;
  readonly description: string;
  readonly state: ProductStateName;
};

export type CapitalContextItem = {
  readonly label: string;
  readonly value: string;
  readonly state: ProductStateName;
};

export function CapitalAccountHeader() {
  return (
    <WorkspaceHeader
      eyebrow="Capital"
      title="Capital Account"
      description="Understand capital availability, account state, and movement readiness."
      meta={
        <>
          <span>Private environment</span>
          <span>Account overview</span>
        </>
      }
    />
  );
}

export function CapitalPositionCard() {
  return (
    <section aria-labelledby="capital-position-title">
      <div className="neptlium-plane overflow-hidden rounded-[2px]">
        <div className="grid gap-8 px-5 py-7 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:py-9">
          <div>
            <p className="neptlium-meta">Capital position</p>
            <h2
              id="capital-position-title"
              className="mt-4 text-[clamp(2rem,4vw,3.5rem)] font-medium leading-none tracking-[-0.05em] text-text-primary"
            >
              No capital positions yet.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-text-muted">
              Positions will appear here when capital information becomes available.
            </p>
          </div>
          <div className="border-t border-border-hairline pt-5 lg:min-w-52 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="text-xs text-text-muted">Status</p>
            <div className="mt-3">
              <ProductStateBadge state="PENDING">Awaiting account data</ProductStateBadge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AccountStateGrid({ items }: { readonly items: readonly AccountStateItem[] }) {
  return (
    <section aria-labelledby="account-overview-title">
      <div className="mb-4">
        <p className="neptlium-meta">Current state</p>
        <h2 id="account-overview-title" className="mt-2 text-text-primary">
          Account overview
        </h2>
      </div>
      <div className="grid border-y border-border-hairline md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.label}
            className="border-b border-border-hairline py-5 transition-colors duration-200 md:odd:border-r md:odd:pr-6 md:even:pl-6"
          >
            <p className="text-xs text-text-muted">{item.label}</p>
            <div className="mt-3">
              <ProductStateBadge state={item.state}>{item.title}</ProductStateBadge>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-text-muted">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CapitalActionState({ items }: { readonly items: readonly CapitalActionItem[] }) {
  return (
    <section aria-labelledby="capital-actions-title">
      <div className="mb-4">
        <p className="neptlium-meta">Capability map</p>
        <h2 id="capital-actions-title" className="mt-2 text-text-primary">
          Capital actions
        </h2>
      </div>
      <div className="divide-y divide-border-hairline border-y border-border-hairline">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid gap-3 py-4 sm:grid-cols-[10rem_auto_1fr] sm:items-center sm:gap-6"
          >
            <p className="text-sm font-medium text-text-primary">{item.label}</p>
            <ProductStateBadge state={item.state}>Unavailable</ProductStateBadge>
            <p className="text-sm leading-6 text-text-muted">{item.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-text-muted">
        Capability states are informational. No capital action can be initiated from this workspace.
      </p>
    </section>
  );
}

function EmptyPanel({
  eyebrow,
  title,
  state,
  description,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly state: string;
  readonly description: ReactNode;
}) {
  return (
    <section aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-title`}>
      <div className="mb-4">
        <p className="neptlium-meta">{eyebrow}</p>
        <h2
          id={`${title.toLowerCase().replaceAll(' ', '-')}-title`}
          className="mt-2 text-text-primary"
        >
          {title}
        </h2>
      </div>
      <div className="border-y border-border-hairline">
        <ProductStateMessage state="NO_ACTIVITY" title={state}>
          {description}
        </ProductStateMessage>
      </div>
    </section>
  );
}

export function BalancePanel() {
  return (
    <EmptyPanel
      eyebrow="Position records"
      title="Balances"
      state="No balances available."
      description="Account balances will appear here once available."
    />
  );
}

export function MovementPanel({ items }: { readonly items: readonly CapitalActionItem[] }) {
  return (
    <section aria-labelledby="movement-title">
      <div className="mb-4">
        <p className="neptlium-meta">Readiness</p>
        <h2 id="movement-title" className="mt-2 text-text-primary">
          Movement
        </h2>
      </div>
      <div className="grid border-y border-border-hairline sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-b border-border-hairline py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
          >
            <p className="text-sm font-medium text-text-primary">{item.label}</p>
            <div className="mt-3">
              <ProductStateBadge state={item.state}>Unavailable</ProductStateBadge>
            </div>
            <p className="mt-3 text-xs leading-5 text-text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DestinationPanel() {
  return (
    <EmptyPanel
      eyebrow="Movement controls"
      title="Destinations"
      state="No destinations configured."
      description="Saved destinations will appear here when available."
    />
  );
}

export function ActivityPanel() {
  return (
    <EmptyPanel
      eyebrow="Record"
      title="Capital activity"
      state="No activity recorded."
      description="Capital events will appear here when available."
    />
  );
}

export function CapitalContextPanel({ items }: { readonly items: readonly CapitalContextItem[] }) {
  return (
    <section aria-labelledby="capital-context-title">
      <div className="mb-4">
        <p className="neptlium-meta">Intelligence</p>
        <h2 id="capital-context-title" className="mt-2 text-text-primary">
          Capital context
        </h2>
      </div>
      <dl className="divide-y divide-border-hairline border-y border-border-hairline">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid gap-3 py-4 sm:grid-cols-[11rem_auto_1fr] sm:items-center sm:gap-6"
          >
            <dt className="text-sm font-medium text-text-primary">{item.label}</dt>
            <dd>
              <ProductStateBadge state={item.state}>{item.value}</ProductStateBadge>
            </dd>
            <p className="text-sm leading-6 text-text-muted">
              This state remains explicit until authoritative account information is available.
            </p>
          </div>
        ))}
      </dl>
    </section>
  );
}
