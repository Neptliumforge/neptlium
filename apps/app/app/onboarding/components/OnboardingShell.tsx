'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { OnboardingHeader } from './OnboardingHeader';

export interface OnboardingShellProps {
  readonly children: ReactNode;
  readonly step: number;
  readonly totalSteps: number;
}

export function OnboardingShell({ children, step, totalSteps }: OnboardingShellProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-canvas text-text-primary">
        <OnboardingHeader />
        <main className="flex flex-1 justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-7 sm:px-6 sm:pt-10">
          <div className="w-full max-w-[30rem]">
            <div
              className="mb-7 flex items-center gap-3"
              aria-label={`Step ${step} of ${totalSteps}`}
            >
              <span className="shrink-0 text-xs font-medium text-text-muted">
                {step} of {totalSteps}
              </span>
              <div className="h-px flex-1 bg-border-default" aria-hidden="true">
                <div
                  className="h-px bg-accent-primary transition-[width] duration-200 motion-reduce:transition-none"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
