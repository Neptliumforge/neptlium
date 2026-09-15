import type { Metadata } from 'next';
import '@neptlium/ui/styles/nts.css';
import './global.css';
import './onboarding.css';

export const metadata: Metadata = {
  title: 'Neptlium Treasury',
  description: 'Organizational capital, payments, stablecoins, approvals, policies and treasury context in one governed environment.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
