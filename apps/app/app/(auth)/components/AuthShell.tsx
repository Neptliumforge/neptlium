"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthBackground } from "./AuthBackground";
import { TrustFooter } from "./TrustFooter";
import { NeptliumMark } from "./NeptliumMark";

export interface AuthShellProps {
  readonly children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate flex min-h-screen min-h-dvh flex-col px-5 py-8 sm:px-10 sm:py-10">
        <AuthBackground />

        <div className="flex h-10 shrink-0 items-center gap-2.5">
          <NeptliumMark size={28} />
          <span className="select-none text-[13px] font-medium uppercase tracking-[0.12em] text-text-primary">NEPTLIUM</span>
        </div>

        <div className="mx-auto w-full max-w-[420px] pt-12 sm:pt-14">{children}</div>

        <div className="mt-auto flex w-full justify-center pt-10">
          <TrustFooter />
        </div>
      </div>
    </MotionConfig>
  );
}
