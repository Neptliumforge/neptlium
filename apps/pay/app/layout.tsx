import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Neptlium Pay',
  description: 'Secure public payment intent experience.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
