import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './global.css';

export const metadata: Metadata = {
  title: 'VaultRail — Neptlium',
  description: 'Governed business treasury operating environment.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
