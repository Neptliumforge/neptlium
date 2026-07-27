import type { ReactNode } from "react";
import { cn } from "@neptlium/ui";

export interface OnboardingPanelProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * The main workspace panel for each onboarding step.
 * surface-1 background, restrained elevation, 8px radius, generous padding.
 */
export function OnboardingPanel({ children, className }: OnboardingPanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-default bg-surface-1 shadow-sm",
        "px-6 py-8 sm:px-8 sm:py-10",
        className
      )}
    >
      {children}
    </div>
  );
}
