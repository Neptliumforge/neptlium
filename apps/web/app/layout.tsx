import type { Metadata, Viewport } from 'next';
import '@neptlium/ui/styles/nts.css';
import './globals.css';
import './neptlium-visual-direction.css';
import { SiteHeader } from '@/components/site-header';
import { GlobalConversionCta } from '@/components/global-conversion-cta';
import { SiteFooter } from '@/components/site-footer';
import { SkipLink } from '@/components/skip-link';
import { SITE } from '@/lib/content/site';

const socialDestinations = [
  'https://bsky.app/profile/neptlium.bsky.social',
  'https://x.com/Neptlium',
  'https://youtube.com/@neptlium?si=fJ7q0r18UCoxjJth',
  'https://www.tiktok.com/@neptlium?_r=1&_t=ZS-98quVuRhCNt',
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Neptlium — Capital, intelligently managed', template: '%s — Neptlium' },
  description: SITE.description,
  applicationName: SITE.name,
  creator: SITE.name,
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: 'Neptlium — Capital, intelligently managed',
    description: SITE.description,
    url: SITE.url,
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Neptlium — Capital, intelligently managed',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neptlium — Capital, intelligently managed',
    description: SITE.description,
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f2' },
    { media: '(prefers-color-scheme: dark)', color: '#080c10' },
  ],
  width: 'device-width',
  initialScale: 1,
};
const themeBoot = `(() => {
  try {
    const stored = localStorage.getItem('neptlium-theme');
    const preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const resolved = preference === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {}
})();`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: SITE.url + '/icon.svg',
  description: SITE.description,
  email: SITE.supportEmail,
  sameAs: socialDestinations,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SkipLink />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <GlobalConversionCta />
        <SiteFooter />
      </body>
    </html>
  );
}
