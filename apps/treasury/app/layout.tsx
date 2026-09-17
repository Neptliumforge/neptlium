import type { Metadata } from 'next';
import '@neptlium/ui/styles/nts.css';
import './global.css';
import './onboarding.css';

export const metadata: Metadata = {
  title: 'Neptlium Treasury',
  description:
    'Operate organization capital, liquidity, allocations, authority and records with control.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
