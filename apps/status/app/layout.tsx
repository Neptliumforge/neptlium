import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Neptlium Status',
  description: 'Public Neptlium service health and incident information.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
