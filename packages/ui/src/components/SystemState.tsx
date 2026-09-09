import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './utils/cn';

export type SystemState =
  | 'UNKNOWN'
  | 'ZERO'
  | 'OBSERVED'
  | 'MODELED'
  | 'CONFIGURED'
  | 'LIVE'
  | 'UNAVAILABLE'
  | 'AUTHORIZATION_REQUIRED'
  | 'EXECUTABLE'
  | 'NON_EXECUTABLE';

const stateLabels: Record<SystemState, string> = {
  UNKNOWN: 'Unknown',
  ZERO: 'Confirmed zero',
  OBSERVED: 'Observed',
  MODELED: 'Modeled',
  CONFIGURED: 'Configured',
  LIVE: 'Live',
  UNAVAILABLE: 'Unavailable',
  AUTHORIZATION_REQUIRED: 'Authorization required',
  EXECUTABLE: 'Executable',
  NON_EXECUTABLE: 'Non-executable',
};

const stateClasses: Record<SystemState, string> = {
  UNKNOWN: 'border-dashed border-border-strong bg-surface-3 text-text-secondary',
  ZERO: 'border-border-default bg-surface-1 text-text-secondary',
  OBSERVED: 'border-info/35 bg-info/8 text-info',
  MODELED: 'border-dashed border-border-strong bg-surface-2 text-text-primary',
  CONFIGURED: 'border-border-strong bg-surface-2 text-text-primary',
  LIVE: 'border-success/35 bg-success/8 text-success',
  UNAVAILABLE: 'border-dotted border-border-default bg-surface-3 text-text-muted',
  AUTHORIZATION_REQUIRED: 'border-warning/35 bg-warning/8 text-warning',
  EXECUTABLE: 'border-info/50 bg-info/8 text-info',
  NON_EXECUTABLE: 'border-border-strong bg-surface-1 text-text-secondary',
};

export interface SystemStateLabelProps extends HTMLAttributes<HTMLSpanElement> {
  readonly state: SystemState;
  readonly children?: ReactNode;
}

export function SystemStateLabel({ state, className, children, ...props }: SystemStateLabelProps) {
  return (
    <span
      data-system-state={state}
      className={cn(
        'inline-flex min-h-6 items-center border px-2 py-0.5 text-[11px] font-medium tracking-[0.02em]',
        stateClasses[state],
        className,
      )}
      {...props}
    >
      {children ?? stateLabels[state]}
    </span>
  );
}

export interface StateBlockProps extends HTMLAttributes<HTMLDivElement> {
  readonly state: SystemState;
  readonly title: string;
  readonly description?: ReactNode;
  readonly evidence?: ReactNode;
  readonly action?: ReactNode;
}

export function StateBlock({
  state,
  title,
  description,
  evidence,
  action,
  className,
  ...props
}: StateBlockProps) {
  return (
    <div
      data-system-state={state}
      className={cn('border-y border-border-default py-5', className)}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h3 className="text-body font-medium text-text-primary">{title}</h3>
          {description ? (
            <div className="mt-1 text-body-sm leading-6 text-text-muted">{description}</div>
          ) : null}
        </div>
        <SystemStateLabel state={state} />
      </div>
      {evidence ? (
        <div className="mt-4 border-t border-border-hairline pt-3 text-caption text-text-muted">
          {evidence}
        </div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
