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
      <div className="neptlium-environment relative isolate flex min-h-dvh flex-col overflow-hidden px-5 py-7 text-text-primary sm:px-10 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-[28rem] top-[-24rem] size-[58rem] rounded-full border border-black/5 bg-[radial-gradient(circle_at_35%_35%,rgba(15,143,134,.11),rgba(17,19,18,.035)_42%,transparent_68%)]" />
        <header className="relative z-10 flex h-10 shrink-0 items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <NeptliumMark size={27} />
            <span className="select-none text-[12px] font-semibold uppercase tracking-[0.16em] text-text-primary">NEPTLIUM</span>
          </div>
          <span className="hidden text-[11px] font-medium tracking-[0.04em] text-text-muted sm:block">Capital operating infrastructure</span>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 items-center py-12 sm:py-16">
          <div className="grid w-full items-end gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-24">
            <div className="hidden max-w-[34rem] pb-8 lg:block">
              <p className="neptlium-meta mb-5">Secure operating access</p>
              <h2 className="max-w-[30rem] text-[clamp(2.6rem,5vw,5.4rem)] font-medium leading-[.94] tracking-[-0.065em] text-text-primary">
                Clarity before consequence.
              </h2>
              <p className="mt-7 max-w-md text-base leading-7 text-text-secondary">
                Access the governed environment where capital state, operating context, and authorized work remain intelligible together.
              </p>
            </div>

            <section className="w-full max-w-[420px] justify-self-end">{children}</section>
          </div>
        </main>

        <div className="relative z-10 mt-auto flex w-full justify-center pt-8">
          <TrustFooter />
        </div>
      </div>
    </MotionConfig>
  );
}
