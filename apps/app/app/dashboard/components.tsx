import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@neptlium/ui';

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  readonly title: string;
  readonly eyebrow?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border-hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="neptlium-meta">{eyebrow}</p>}
        <h1 className="mt-2 max-w-4xl text-text-primary">{title}</h1>
        {description && <p className="mt-2.5 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section className={cn('border-y border-border-hairline', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border-hairline py-4">
        <div className="min-w-0">
          <h2 className="text-base font-medium tracking-[-0.015em] text-text-primary">{title}</h2>
          {description && <p className="mt-1 text-sm leading-5 text-text-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0 text-xs font-medium text-text-secondary">{action}</div>}
      </div>
      <div className="py-4">{children}</div>
    </section>
  );
}

export function MetricRow({
  label,
  value,
  detail,
  tone = 'default',
}: {
  readonly label: string;
  readonly value: string;
  readonly detail?: string;
  readonly tone?: 'default' | 'muted' | 'success' | 'warning';
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b border-border-hairline py-2 last:border-0">
      <span className="min-w-0 text-sm text-text-secondary">
        <span className="block truncate">{label}</span>
        {detail && <span className="block truncate text-xs text-text-muted">{detail}</span>}
      </span>
      <span
        className={cn(
          'max-w-[55%] truncate text-right text-sm tabular-nums',
          tone === 'muted'
            ? 'text-text-muted'
            : tone === 'success'
              ? 'text-success'
              : tone === 'warning'
                ? 'text-warning'
                : 'text-text-primary',
        )}
        data-numeric
      >
        {value}
      </span>
    </div>
  );
}

export function QuickAction({
  href,
  label,
  description,
  icon,
}: {
  readonly href: string;
  readonly label: string;
  readonly description: string;
  readonly icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-14 items-center gap-3 border-b border-border-hairline px-1 py-3 transition-colors hover:bg-black/[.02] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]"
    >
      <span className="flex size-7 shrink-0 items-center justify-center text-text-muted transition-colors group-hover:text-text-primary [&>svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        <span className="block truncate text-xs text-text-muted">{description}</span>
      </span>
    </Link>
  );
}

export function BlueprintPanel({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="flex min-h-[12rem] items-center justify-center border-y border-border-hairline bg-surface-2 sm:min-h-[14rem]">
      <div className="max-w-xs px-6 text-center">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="mt-2 text-xs leading-5 text-text-muted">{description}</p>
      </div>
    </div>
  );
}
