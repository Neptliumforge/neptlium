import type { Metadata, Viewport } from 'next';
import './globals.css';
import './neptlium-visual-direction.css';
import './mobile-navigation-fix.css';
import './landing-v3.css';
import './elite-shell.css';
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
  title: { default: 'Neptlium — Capital Operating Platform', template: '%s — Neptlium' },
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
    title: 'Neptlium — Capital Operating Platform',
    description: SITE.description,
    url: SITE.url,
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Neptlium — Capital Operating Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neptlium — Capital Operating Platform',
    description: SITE.description,
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#101214',
  width: 'device-width',
  initialScale: 1,
};

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
    <html lang="en" data-theme="light">
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
