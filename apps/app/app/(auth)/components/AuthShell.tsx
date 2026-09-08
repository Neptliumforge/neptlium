"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { TrustFooter } from "./TrustFooter";
import { NeptliumMark } from "./NeptliumMark";

export interface AuthShellProps {
  readonly children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="neptlium-environment flex min-h-dvh flex-col px-5 py-6 text-text-primary sm:px-8 sm:py-7 lg:px-10">
        <header className="flex h-10 shrink-0 items-center justify-between gap-6 border-b border-border-hairline pb-5">
          <div className="flex items-center gap-2.5" aria-label="Neptlium">
            <NeptliumMark size={25} tone="teal" />
            <span className="select-none text-[12px] font-semibold uppercase tracking-[0.16em] text-text-primary">NEPTLIUM</span>
          </div>
          <span className="hidden text-[11px] font-medium text-text-muted sm:block">Secure access</span>
        </header>

        <main className="mx-auto flex w-full max-w-[1080px] flex-1 items-center py-10 sm:py-14">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
            <div className="hidden max-w-[31rem] lg:block">
              <p className="neptlium-meta mb-4">Neptlium</p>
              <h2 className="max-w-[28rem] text-[clamp(2.25rem,4vw,3.8rem)] font-medium leading-[.98] tracking-[-0.05em] text-text-primary">
                Your capital intelligence, in one place.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-text-secondary">
                Sign in or create an account to access your portfolio, company intelligence, thesis work, and capital activity.
              </p>
            </div>

            <section className="w-full max-w-[400px] justify-self-end">{children}</section>
          </div>
        </main>

        <div className="mt-auto flex w-full justify-center border-t border-border-hairline pt-5">
          <TrustFooter />
        </div>
      </div>
    </MotionConfig>
  );
}
