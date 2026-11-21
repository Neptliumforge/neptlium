import { ClerkProvider } from '@clerk/nextjs';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { clerkPreviewConfig, clerkPreviewPaths } from '@/lib/auth/clerk-preview-config';

export const dynamic = 'force-dynamic';

export default function ClerkPreviewLayout({ children }: { readonly children: ReactNode }) {
  const config = clerkPreviewConfig();
  if (!config) notFound();

  return (
    <ClerkProvider publishableKey={config.publishableKey} signInUrl={clerkPreviewPaths.signIn} signUpUrl={clerkPreviewPaths.signUp}>
      <main>{children}</main>
    </ClerkProvider>
  );
}
