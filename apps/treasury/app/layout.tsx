import type { Metadata, Viewport } from 'next';
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
    { media: '(prefers-color-scheme: dark)', color: '#07100f' },
  ],
};

const themeBoot = `(() => {
  try {
    const stored = localStorage.getItem('neptlium-theme');
    const preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const resolved = preference === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {
    const resolved = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = 'system';
    document.documentElement.style.colorScheme = resolved;
  }
})();`;

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
      <body>{children}</body>
    </html>
  );
}
