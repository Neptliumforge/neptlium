import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@neptlium/ui";

const authCardVariants = cva(
  [
    "relative mx-auto w-full max-w-[calc(100vw-2rem)] rounded-lg border p-5 sm:p-7",
    "border-[color:var(--color-border-whisper)] bg-surface-2",
    "shadow-[var(--shadow-card-floating)]"
  ].join(" "),
  {
    variants: {
      size: {
        sm: "max-w-sm",
        wide: "max-w-2xl"
      }
    },
    defaultVariants: {
      size: "sm"
    }
  }
);

export interface AuthCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof authCardVariants> {}

export function AuthCard({ className, size, ...props }: AuthCardProps) {
  return <div className={cn(authCardVariants({ size }), className)} {...props} />;
}
