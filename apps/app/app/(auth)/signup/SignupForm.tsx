"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail } from "lucide-react";
import {
  Button,
  Field,
  FieldError,
  Input,
  Label,
} from "@neptlium/ui";
import { resendVerification, signup } from "../actions";
import { emailPattern, passwordPattern } from "../auth-utils";
import { initialAuthActionState } from "../schema";
import { AuthShell } from "../components/AuthShell";
import { AuthNotice } from "../components/AuthNotice";
import { PasswordRequirements } from "../components/PasswordRequirements";

const inputClass =
  "h-11 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";

const ctaClass =
  "h-11 w-full rounded-md text-[14px] font-semibold";

export function SignupForm() {
  const [signupState, signupAction, isSigningUp] = useActionState(
    signup,
    initialAuthActionState,
  );

  const [resendState, resendAction, isResending] = useActionState(
    resendVerification,
    initialAuthActionState,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;

    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );

    return () => window.clearInterval(timer);
  }, [cooldown]);

  function validateBeforeSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!emailPattern.test(email)) {
      event.preventDefault();
      setClientError("Enter a valid email address.");
      return;
    }

    if (!passwordPattern.test(password)) {
      event.preventDefault();
      setClientError("Password must meet all security requirements.");
      return;
    }

    if (!acceptedTerms) {
      event.preventDefault();
      setClientError(
        "You must accept the Terms of Service and Privacy Policy.",
      );
      return;
    }

    setClientError(null);
  }

  if (signupState.success) {
    return (
      <AuthShell>
        <div className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
              Check your email
            </h1>

            <p className="text-[13px] leading-relaxed text-text-muted">
              We sent a secure confirmation link to{" "}
              <span className="font-medium text-text-secondary">
                {email}
              </span>
              .
            </p>

            <p className="text-[13px] leading-relaxed text-text-muted">
              Open the email and confirm your account to continue.
            </p>
          </div>

          <div className="space-y-3 border-t border-[color:var(--color-border-hairline)] pt-5">
            <form
              action={resendAction}
              onSubmit={() => setCooldown(60)}
            >
              <input type="hidden" name="email" value={email} />

              <Button
                type="submit"
                variant="outline"
                className="h-10 w-full rounded-md text-[13px]"
                loading={isResending}
                disabled={cooldown > 0 || isResending}
              >
                {isResending
                  ? "Sending..."
                  : cooldown
                    ? `Resend in ${cooldown}s`
                    : "Resend email"}
              </Button>
            </form>

            {resendState.success && (
              <AuthNotice variant="success">
                {resendState.message}
              </AuthNotice>
            )}

            {resendState.error && (
              <AuthNotice>{resendState.error}</AuthNotice>
            )}

            <button
              type="button"
              className="w-full text-center text-[12px] text-accent-primary hover:brightness-110"
              onClick={() => {
                setEmail("");
                window.location.reload();
              }}
            >
              Use a different email
            </button>

            <p className="text-center text-[12px] leading-relaxed text-text-muted">
              The confirmation email may take a moment to arrive.
            </p>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
            Create your account
          </h1>

          <p className="text-[13px] text-text-muted">
            Access your Neptlium capital environment.
          </p>
        </div>

        <form
          action={signupAction}
          onSubmit={validateBeforeSubmit}
          className="flex flex-col gap-4"
        >
          <Field>
            <Label htmlFor="signup-email">Email address</Label>

            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-[14px] -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />

              <Input
                id="signup-email"
                name="email"
                type="email"
                autoFocus
                autoComplete="email"
                inputMode="email"
                placeholder="Enter your email"
                value={email}
                disabled={isSigningUp}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (clientError) setClientError(null);
                }}
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>

          <Field>
            <Label htmlFor="signup-password">Password</Label>

            <div className="relative">
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                disabled={isSigningUp}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (clientError) setClientError(null);
                }}
                className={`${inputClass} pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="size-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </div>

            <div id="signup-password-requirements">
              <PasswordRequirements password={password} />
            </div>
          </Field>

          <label className="flex cursor-pointer items-start gap-2.5 text-[12px] text-text-muted">
            <input
              type="checkbox"
              name="acceptedTerms"
              value="on"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked);
                if (clientError) setClientError(null);
              }}
              aria-required="true"
              className="mt-0.5 size-3.5 accent-[--color-accent-primary]"
            />

            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-accent-primary hover:brightness-110"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-accent-primary hover:brightness-110"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <FieldError id="signup-error">
            {clientError ?? signupState.error}
          </FieldError>

          <Button
            type="submit"
            variant="cta"
            className={ctaClass}
            loading={isSigningUp}
          >
            {isSigningUp ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-[13px] text-text-muted">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-accent-primary hover:brightness-110"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
