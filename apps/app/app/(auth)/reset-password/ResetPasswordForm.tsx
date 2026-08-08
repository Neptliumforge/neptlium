"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, Field, FieldError, Input, Label } from "@neptlium/ui";
import { resetPassword } from "../actions";
import { initialAuthActionState } from "../schema";
import { AuthShell } from "../components/AuthShell";

const inputClass =
  "h-11 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialAuthActionState,
  );
  const [email, setEmail] = useState("");

  if (state.success) {
    return (
      <AuthShell>
        {/* Reserved back-slot height so heading stays at same Y */}
        <div className="mb-6 h-7" />

        <div className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
              Check your email
            </h1>
            <p className="text-[13px] text-text-muted">
              If an account exists for that address, we sent a secure
              password-reset link.
            </p>
          </div>
          <Link
            href="/auth/sign-in"
            className="text-[13px] font-medium text-accent-primary hover:brightness-110"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-6 h-7">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted hover:text-text-secondary"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Sign In
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
            Reset your password
          </h1>
          <p className="text-[13px] text-text-muted">
            Enter the email address associated with your Neptlium account.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              name="email"
              type="email"
              autoFocus
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(state.error)}
              aria-describedby="reset-email-error"
              className={inputClass}
            />
            <FieldError id="reset-email-error">{state.error}</FieldError>
          </Field>
          <Button
            type="submit"
            variant="cta"
            className="h-11 w-full rounded-md text-[14px] font-semibold"
            loading={isPending}
          >
            {isPending ? "Sending link…" : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
