'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthenticatedProductBootstrap } from '@/lib/product/bootstrap-types';

type BootstrapContextValue = {
  readonly snapshot: AuthenticatedProductBootstrap;
  readonly refreshedAt: string;
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function ProductBootstrapProvider({
  initial,
  children,
}: {
  readonly initial: AuthenticatedProductBootstrap;
  readonly children: ReactNode;
}) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initial);

  useEffect(() => {
    setSnapshot(initial);
  }, [initial]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [router]);

  const value = useMemo<BootstrapContextValue>(() => ({ snapshot, refreshedAt: snapshot.asOf }), [snapshot]);
  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>;
}

export function useProductBootstrap(): BootstrapContextValue {
  const value = useContext(BootstrapContext);
  if (!value) throw new Error('ProductBootstrapProvider is required inside the authenticated environment.');
  return value;
}
