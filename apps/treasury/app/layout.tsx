import type { Metadata, Viewport } from 'next';
import { ThemeProvider, themeBootScript } from '@neptlium/ui';
import '@neptlium/ui/styles/nts.css';
import './global.css';
import './onboarding.css';

export const metadata: Metadata = {
  title: 'Neptlium Treasury',
  description:
    'Operate organization capital, liquidity, allocations, authority and records with control.',
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f2' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0c0e' },
  ],
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
