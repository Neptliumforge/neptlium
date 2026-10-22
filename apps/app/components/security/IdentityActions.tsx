'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { useClerk } from '@clerk/nextjs';
import { revokeClerkSessions } from '@/lib/auth/clerk-actions';
type Scope = 'local' | 'others' | 'global';
const Context = createContext<null | { signOut: (scope?: Scope) => Promise<void> }>(null);
export const useIdentityActions = () => useContext(Context);
export function ClerkIdentityActions({ children }: { children: ReactNode }) {
  const clerk = useClerk();
  async function signOut(scope: Scope = 'local') {
    if (scope !== 'local') await revokeClerkSessions(scope);
    if (scope !== 'others') await clerk.signOut({ redirectUrl: '/auth/sign-in' });
  }
  return <Context.Provider value={{ signOut }}>{children}</Context.Provider>;
}
