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
        <main className="flex flex-1 justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-7 sm:px-6 sm:pt-10 lg:px-10 lg:pt-14">
          <div className="grid w-full max-w-[1120px] gap-10 lg:grid-cols-[280px_minmax(0,520px)] lg:justify-between lg:gap-20">
            <aside className="hidden lg:block">
              <p className="neptlium-meta">Account establishment</p>
              <h1 className="mt-4 text-[2.4rem] font-medium leading-[1.02] tracking-[-0.05em] text-text-primary">
                Establish your operating context.
              </h1>
              <p className="mt-5 text-sm leading-6 text-text-secondary">
                Neptlium uses this information to shape the workspace around the account, organization, and governed operating state.
              </p>
              <div className="mt-10 space-y-4 border-t border-border-hairline pt-6">
                {stepLabels.slice(0, totalSteps).map((label, index) => {
                  const number = index + 1;
                  const active = number === step;
                  const complete = number < step;
                  return (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <span className={`flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold ${active ? 'border-[#0f8f86] bg-[#0f8f86] text-white' : complete ? 'border-text-primary bg-text-primary text-canvas' : 'border-border-default text-text-muted'}`}>
                        {String(number).padStart(2, '0')}
                      </span>
                      <span className={active ? 'font-medium text-text-primary' : complete ? 'text-text-secondary' : 'text-text-muted'}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </aside>

            <section className="w-full max-w-[520px] lg:justify-self-end">
              <div className="mb-8 flex items-center justify-between gap-4 border-b border-border-hairline pb-4" aria-label={`Step ${step} of ${totalSteps}`}>
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
