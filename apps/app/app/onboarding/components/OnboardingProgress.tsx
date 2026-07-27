import { Check } from "lucide-react";
import { cn } from "@neptlium/ui";
import type { OnboardingStepKey } from "../wizard-steps";
import { onboardingSteps } from "../wizard-steps";

export interface OnboardingProgressProps {
  readonly currentStepKey: OnboardingStepKey;
  readonly completedStepKeys: readonly string[];
}

type StepStatus = "upcoming" | "current" | "completed";

function resolveStatus(key: string, currentStepKey: string, completedStepKeys: readonly string[]): StepStatus {
  if (completedStepKeys.includes(key)) return "completed";
  if (key === currentStepKey) return "current";
  return "upcoming";
}

/**
 * Desktop: vertical ordered rail — number/check, label, connector, aria-current.
 */
export function OnboardingProgress({ currentStepKey, completedStepKeys }: OnboardingProgressProps) {
  return (
    <nav
      className="flex w-full flex-col gap-0"
      aria-label="Account opening progress"
    >
      <ol className="flex flex-col">
        {onboardingSteps.map((step, index) => {
          const status = resolveStatus(step.key, currentStepKey, completedStepKeys);
          const isLast = index === onboardingSteps.length - 1;

          return (
            <li key={step.key} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center">
                <div
                  aria-current={status === "current" ? "step" : undefined}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-caption font-medium transition-colors duration-180 ease-out",
                    status === "upcoming" && "border-border-default text-text-muted",
                    status === "current" && "border-accent-primary bg-accent-primary/8 text-accent-primary",
                    status === "completed" && "border-accent-primary bg-accent-primary/12 text-accent-primary"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true">{index + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "my-1 w-px flex-1 bg-border-default transition-colors duration-180 ease-out",
                      status === "completed" && "bg-accent-primary/30"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className={cn("pb-6 pt-0.5", isLast && "pb-0")}>
                <span
                  className={cn(
                    "text-body-sm font-medium transition-colors duration-180 ease-out",
                    status === "upcoming" && "text-text-muted",
                    status === "current" && "text-text-primary",
                    status === "completed" && "text-text-secondary"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
