"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@neptlium/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Authentication failed.");
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md items-center px-6 py-12">
      <section className="w-full rounded-xl border border-neutral-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Neptlium internal</p>
        <h1 className="mt-3 text-2xl font-semibold text-neutral-950">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Authentication identifies you. Administrative access still requires explicit server-owned authorization.
        </p>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-medium text-neutral-700">
            Email
            <input className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2.5" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Password
            <input className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2.5" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
          <button className="w-full rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
