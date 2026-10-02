import React from 'react';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider, themeBootScript } from '@neptlium/ui';
import { assertProductionRuntimeConfig } from '@/lib/runtime-config';
import '@neptlium/ui/styles/nts.css';
import './global.css';
import './dashboard-v2.css';
import './investment-dashboard.css';
import './authenticated-product.css';
import './authenticated-records.css';
import './authenticated-mobile.css';

assertProductionRuntimeConfig();

export const metadata: Metadata = {
  title: 'Neptlium Capital',
  description:
    'Personal investing, portfolio and wealth context in one governed financial environment.',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f2' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0c0e' },
  ],
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="antialiased"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
