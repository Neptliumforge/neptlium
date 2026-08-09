import type { ReactNode } from 'react';
import { cn } from './utils/cn';

export interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
  readonly deltaTone?: 'positive' | 'negative' | 'neutral';
  readonly icon?: ReactNode;
  readonly className?: string;
}

const deltaToneClasses: Record<NonNullable<StatCardProps['deltaTone']>, string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-text-muted',
};

export function StatCard({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-md border border-border-default bg-surface-1 px-4 py-3.5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-label font-medium text-text-secondary">{label}</p>
        {icon && <span className="text-text-disabled">{icon}</span>}
      </div>
      <p className="mt-2.5 break-words font-mono text-xl font-medium leading-tight tracking-tight text-text-primary">
        {value}
      </p>
      {delta && (
        <p className={cn('mt-2 text-caption font-medium', deltaToneClasses[deltaTone])}>{delta}</p>
      )}
    </div>
  );
}
