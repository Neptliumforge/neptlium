import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Neptlium Developers',
  description: 'API and integration documentation for Neptlium products.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
