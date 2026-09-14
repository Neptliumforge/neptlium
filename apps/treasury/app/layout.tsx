import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Neptlium Treasury',
  description: 'Governed business treasury, payments, approvals, policy, risk and reporting.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
