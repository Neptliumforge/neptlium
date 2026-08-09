import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from '@neptlium/ui';

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-accent-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 max-w-4xl text-[1.32rem] font-semibold leading-tight tracking-[-0.02em] text-text-primary sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
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
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div className="shrink-0 text-xs font-medium text-accent-primary">{action}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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
    <div className="flex min-h-11 items-center justify-between gap-4 border-b border-border-hairline py-2 last:border-0">
      <span className="min-w-0 text-sm text-text-secondary">
        <span className="block truncate">{label}</span>
        {detail && <span className="block truncate text-xs text-text-muted">{detail}</span>}
      </span>
      <span
        className={cn(
          'max-w-[55%] truncate text-right font-mono text-sm tabular-nums',
          tone === 'muted'
            ? 'text-text-muted'
            : tone === 'success'
              ? 'text-success'
              : tone === 'warning'
                ? 'text-warning'
                : 'text-text-primary',
        )}
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
      className="flex min-h-14 items-center gap-3 rounded-md border border-border-default bg-surface-2/50 p-3 transition hover:border-border-hover hover:bg-surface-2 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-primary/12 text-accent-primary [&>svg]:size-4"
        aria-hidden="true"
      >
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
    <div className="relative flex min-h-[14rem] items-center justify-center overflow-hidden rounded-md border border-border-hairline bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:18px_18px] sm:min-h-[16rem]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,110,255,0.14),transparent_45%)]" />
      <div className="relative max-w-xs px-6 text-center">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="mt-2 text-xs leading-5 text-text-muted">{description}</p>
      </div>
    </div>
  );
}
