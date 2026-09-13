"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@neptlium/lib/supabase/browser";

export function SupabaseAuthForm({ mode }: { readonly mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const next = searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError("We couldn't sign you in with those credentials.");
          return;
        }
        router.replace(destination);
        router.refresh();
        return;
      }

      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", destination);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback.toString() },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.replace(destination);
        router.refresh();
        return;
      }
      setNotice("Check your email to confirm your account, then return to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  const isSignIn = mode === "sign-in";
  return (
    <div className="rounded-[14px] border border-border-hairline bg-surface-1 p-6 sm:p-7">
      <p className="neptlium-meta mb-3">Secure access</p>
      <h1 className="text-[1.8rem] font-medium tracking-[-0.035em] text-text-primary">
        {isSignIn ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {isSignIn
          ? "Access your governed Neptlium capital environment."
          : "Create your Neptlium account with email and password."}
      </p>

      <form className="mt-7 space-y-5" onSubmit={submit}>
        <label className="block text-sm text-text-secondary">
          Email
          <input
            className="mt-2 w-full rounded-[10px] border border-border-default bg-surface-0 px-3.5 py-3 text-text-primary outline-none focus:border-[#35D5C1]"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block text-sm text-text-secondary">
          Password
          <input
            className="mt-2 w-full rounded-[10px] border border-border-default bg-surface-0 px-3.5 py-3 text-text-primary outline-none focus:border-[#35D5C1]"
            type="password"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-status-error" role="alert">{error}</p> : null}
        {notice ? <p className="text-sm text-text-secondary" role="status">{notice}</p> : null}
        <button
          className="w-full rounded-[10px] bg-[#35D5C1] px-4 py-3 text-sm font-semibold text-[#050505] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Working…" : isSignIn ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-text-muted">
        {isSignIn ? "New to Neptlium? " : "Already have an account? "}
        <Link
          className="font-medium text-[#35D5C1] underline-offset-4 hover:underline"
          href={isSignIn ? "/auth/sign-up" : "/auth/sign-in"}
        >
          {isSignIn ? "Create account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
