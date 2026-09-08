'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { OnboardingHeader } from './OnboardingHeader';

export interface OnboardingShellProps {
  readonly children: ReactNode;
  readonly step: number;
  readonly totalSteps: number;
}

const stepLabels = ['Identity', 'Account', 'Organization', 'Confirmation'];

export function OnboardingShell({ children, step, totalSteps }: OnboardingShellProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="neptlium-environment flex min-h-dvh flex-col text-text-primary">
        <OnboardingHeader />
        <main className="flex flex-1 justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-7 sm:px-6 sm:pt-9 lg:px-10 lg:pt-11">
          <div className="grid w-full max-w-[1080px] gap-9 lg:grid-cols-[260px_minmax(0,500px)] lg:justify-between lg:gap-16">
            <aside className="hidden lg:block">
              <p className="neptlium-meta">Account establishment</p>
              <h1 className="mt-3 text-[2rem] font-medium leading-[1.05] tracking-[-0.04em] text-text-primary">
                Establish your operating context.
              </h1>
              <p className="mt-4 text-sm leading-6 text-text-secondary">
                Neptlium uses this information to shape the workspace around the account, organization, and governed operating state.
              </p>
              <div className="mt-8 space-y-3 border-t border-border-hairline pt-5">
                {stepLabels.slice(0, totalSteps).map((label, index) => {
                  const number = index + 1;
                  const active = number === step;
                  const complete = number < step;
                  return (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <span className={`flex size-6 items-center justify-center border text-[10px] font-semibold ${active ? 'border-text-primary bg-text-primary text-canvas' : complete ? 'border-text-primary text-text-primary' : 'border-border-default text-text-muted'}`}>
                        {String(number).padStart(2, '0')}
                      </span>
                      <span className={active ? 'font-medium text-text-primary' : complete ? 'text-text-secondary' : 'text-text-muted'}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </aside>

            <section className="w-full max-w-[500px] lg:justify-self-end">
              <div className="mb-7 flex items-center justify-between gap-4 border-b border-border-hairline pb-4" aria-label={`Step ${step} of ${totalSteps}`}>
                <div>
                  <p className="neptlium-meta">Account establishment</p>
                  <p className="mt-1 text-sm font-medium text-text-primary">{stepLabels[step - 1] ?? `Step ${step}`}</p>
                </div>
                <span className="text-xs font-medium tabular-nums text-text-muted">{String(step).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}</span>
              </div>
              {children}
            </section>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
