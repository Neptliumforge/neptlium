"use client";

import { useActionState, useState } from "react";
import type { KeyboardEvent } from "react";
import { Lock, Mail } from "lucide-react";
import { Button, Field, FieldError, FieldHint, Input, Label } from "@neptlium/ui";
import { adminLogin, initialAdminLoginState } from "./actions";

export function AdminLoginForm({ next }: { readonly next: string }) {
  const [state, formAction, isPending] = useActionState(adminLogin, initialAdminLoginState);
  const [capsLock, setCapsLock] = useState(false);

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo + title */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-default bg-surface-1">
          <Lock className="size-5 text-accent-primary" />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-text-muted mb-1">
            Neptlium
          </p>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-text-primary">
            Admin Console
          </h1>
          <p className="mt-1 text-[13px] text-text-muted">
            Restricted access — authorised personnel only
          </p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <Field>
          <Label htmlFor="admin-email">Email address</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <Input
              id="admin-email"
              name="email"
              type="email"
              autoFocus
              autoComplete="email"
              inputMode="email"
              placeholder="admin@neptlium.com"
              disabled={isPending}
              aria-invalid={Boolean(state.error)}
              className="h-11 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] pl-10 transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]"
            />
          </div>
        </Field>

        <Field>
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            onKeyUp={trackCapsLock}
            disabled={isPending}
            aria-invalid={Boolean(state.error)}
            aria-describedby="admin-login-error"
            className="h-11 rounded-md border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] transition-[border-color,box-shadow] focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]"
          />
          {capsLock && <FieldHint>Caps Lock is on</FieldHint>}
          <FieldError id="admin-login-error">{state.error}</FieldError>
        </Field>

        <Button
          type="submit"
          variant="cta"
          loading={isPending}
          className="h-11 w-full rounded-md text-[14px] font-semibold"
        >
          {isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[12px] text-text-muted">
        This console is for authorised administrators only.
        <br />
        Unauthorised access attempts are logged.
      </p>
    </div>
  );
}
