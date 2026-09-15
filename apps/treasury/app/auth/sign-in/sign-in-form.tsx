'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@neptlium/lib/supabase/browser';

export function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setPending(false);
      setError('Unable to sign in with those credentials.');
      return;
    }
    const next = search.get('next');
    router.replace(next?.startsWith('/dashboard') ? next : '/dashboard');
    router.refresh();
  }

  return <form className="vault-auth-form" onSubmit={submit}>
    <label><span>Email</span><input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <label><span>Password</span><input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    {error ? <p role="alert">{error}</p> : null}
    <button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
  </form>;
}
