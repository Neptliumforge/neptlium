import type { ReactNode } from 'react';
import { cn } from './utils/cn';
import { CapitalRailStage, type CapitalRailNodeState } from './CapitalRails';

export type FinancialState =
  | 'available'
  | 'pending'
  | 'processing'
  | 'settled'
  | 'reconciling'
  | 'failed'
  | 'restricted'
  | 'unknown'
  | 'unavailable';

const labels: Record<FinancialState, string> = {
  available: 'Available',
  pending: 'Pending',
  processing: 'Processing',
  settled: 'Settled',
  reconciling: 'Reconciling',
  failed: 'Failed',
  restricted: 'Restricted',
  unknown: 'Unknown',
  unavailable: 'Unavailable',
};

const tone: Record<FinancialState, string> = {
  available: 'text-success border-success/30',
  pending: 'text-warning border-warning/30',
  processing: 'text-info border-info/30',
  settled: 'text-success border-success/30',
  reconciling: 'text-[var(--color-status-reconciling)] border-[color:var(--color-status-reconciling)]/30',
  failed: 'text-danger border-danger/30',
  restricted: 'text-[var(--color-status-restricted)] border-[color:var(--color-status-restricted)]/30',
  unknown: 'text-text-muted border-border-default',
  unavailable: 'text-text-muted border-border-default',
};

export function FinancialStatus({ state, className }: { readonly state: FinancialState; readonly className?: string }) {
  return (
    <span
      data-financial-state={state}
      className={cn('inline-flex min-h-6 items-center rounded-full border px-2 text-caption font-medium', tone[state], className)}
    >
      <span className="sr-only">Financial state: </span>{labels[state]}
    </span>
  );
}

export type AuthorityStage =
  | 'intent'
  | 'preflight'
  | 'review'
  | 'authorization'
  | 'submission'
  | 'provider-processing'
  | 'evidence'
  | 'ledger-posting'
  | 'reconciliation'
  | 'available';

const stageLabels: Record<AuthorityStage, string> = {
  intent: 'Intent',
  preflight: 'Policy & preflight',
  review: 'Review',
  authorization: 'Authorization',
  submission: 'Submission',
  'provider-processing': 'Provider processing',
  evidence: 'Evidence received',
  'ledger-posting': 'Ledger posting',
  reconciliation: 'Reconciliation',
  available: 'Available',
};

export function AuthorityProgress({
  current,
  completed = [],
  className,
}: {
  readonly current: AuthorityStage;
  readonly completed?: readonly AuthorityStage[];
  readonly className?: string;
}) {
  const stages = Object.keys(stageLabels) as AuthorityStage[];
  return (
    <ol className={cn('n-authority-rail', className)} aria-label="Money movement authority progress">
      {stages.map((stage, index) => {
        const isCurrent = stage === current;
        const isComplete = completed.includes(stage);
        const railState: CapitalRailNodeState = isComplete
          ? 'complete'
          : isCurrent
            ? stage === 'evidence'
              ? 'evidence'
              : stage === 'reconciliation'
                ? 'reconciling'
                : stage === 'authorization'
                  ? 'authorized'
                  : 'active'
            : 'neutral';
        return (
          <CapitalRailStage key={stage} index={index} label={stageLabels[stage]} state={railState}>
            {isComplete ? 'Established' : isCurrent ? 'Current stage' : 'Not yet established'}
          </CapitalRailStage>
        );
      })}
    </ol>
  );
}

export function RestrictedState({
  title = 'Action unavailable',
  description,
  children,
  className,
}: {
  readonly title?: string;
  readonly description: string;
  readonly children?: ReactNode;
  readonly className?: string;
}) {
  return (
    <section className={cn('border border-border-default bg-surface-1 p-5', className)} aria-labelledby="restricted-state-title">
      <FinancialStatus state="restricted" />
      <h2 id="restricted-state-title" className="mt-4 text-h3 font-medium text-text-primary">{title}</h2>
      <p className="mt-2 max-w-2xl text-body-sm text-text-secondary">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}

export function EvidenceStatus({
  observed,
  canonical,
  reconciled,
}: {
  readonly observed: boolean;
  readonly canonical: boolean;
  readonly reconciled: boolean;
}) {
  return (
    <dl className="grid gap-px border border-border-default bg-border-default sm:grid-cols-3">
      {[
        ['Provider evidence', observed, 'Observation does not establish ledger truth.'],
        ['Canonical posting', canonical, 'Established only by the Neptlium ledger.'],
        ['Reconciliation', reconciled, 'Provider evidence matched to canonical state.'],
      ].map(([label, established, note]) => (
        <div key={String(label)} className="bg-surface-1 p-4">
          <dt className="text-label text-text-muted">{label}</dt>
          <dd className="mt-2 text-body-sm font-medium text-text-primary">{established ? 'Established' : 'Not established'}</dd>
          <dd className="mt-1 text-caption text-text-muted">{note}</dd>
        </div>
      ))}
    </dl>
  );
}
