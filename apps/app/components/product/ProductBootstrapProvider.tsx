'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
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
  const [snapshot] = useState(initial);
  const value = useMemo<BootstrapContextValue>(() => ({ snapshot, refreshedAt: snapshot.asOf }), [snapshot]);
  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>;
}

export function useProductBootstrap(): BootstrapContextValue {
  const value = useContext(BootstrapContext);
  if (!value) throw new Error('ProductBootstrapProvider is required inside the authenticated environment.');
  return value;
}
