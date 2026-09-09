import { Check } from 'lucide-react';
import { cn } from './utils/cn';

export interface StepperStep {
  readonly key: string;
  readonly label: string;
}

export interface StepperProps {
  readonly steps: readonly StepperStep[];
  readonly currentStepKey: string;
  readonly completedStepKeys: readonly string[];
  readonly className?: string;
}

type StepStatus = 'upcoming' | 'current' | 'completed';

function resolveStatus(
  step: StepperStep,
  currentStepKey: string,
  completedStepKeys: readonly string[],
): StepStatus {
  if (completedStepKeys.includes(step.key)) return 'completed';
  if (step.key === currentStepKey) return 'current';
  return 'upcoming';
}

const nodeClasses: Record<StepStatus, string> = {
  upcoming: 'border-border-default text-text-muted',
  current: 'border-accent-emerald text-accent-emerald',
  completed: 'border-accent-emerald bg-accent-emerald/12 text-accent-emerald',
};

const labelClasses: Record<StepStatus, string> = {
  upcoming: 'text-text-muted',
  current: 'text-text-primary',
  completed: 'text-text-secondary',
};

export function Stepper({ steps, currentStepKey, completedStepKeys, className }: StepperProps) {
  return (
    <ol className={cn('flex w-full items-start', className)} aria-label="Progress">
      {steps.map((step, index) => {
        const status = resolveStatus(step, currentStepKey, completedStepKeys);
        const isLast = index === steps.length - 1;

        return (
          <li key={step.key} className={cn('flex items-center', !isLast && 'flex-1')}>
            <div className="flex flex-col items-center gap-2">
              <div
                aria-current={status === 'current' ? 'step' : undefined}
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-sm border text-caption font-medium transition-colors duration-200 ease-out',
                  nodeClasses[status],
                )}
              >
                {status === 'completed' ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'max-w-20 text-center text-caption font-medium transition-colors duration-200 ease-out',
                  labelClasses[status],
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'mx-2 h-px flex-1 translate-y-[-14px] bg-border-default transition-colors duration-200 ease-out',
                  status === 'completed' && 'bg-accent-emerald/40',
                )}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
