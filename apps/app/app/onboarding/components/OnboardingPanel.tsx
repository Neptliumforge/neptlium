import type { ReactNode } from 'react';
import { cn } from '@neptlium/ui';

export interface OnboardingPanelProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function OnboardingPanel({ children, className }: OnboardingPanelProps) {
  return <div className={cn('w-full', className)}>{children}</div>;
}
