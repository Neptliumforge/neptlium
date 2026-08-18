import type { Metadata, Viewport } from 'next';
import './globals.css';
import './marketing-shell.css';
import './navigation-depth.css';
import './navigation-integration.css';
import './footer-depth.css';
import './hero-platform.css';
import './platform-calibration.css';
import './production-hardening.css';
import './apple-calibration.css';
import './product-showcase-calibration.css';
import './route-product-consolidation.css';
import './detail-product-consolidation.css';
import './home-composition.css';
import './marketing-production.css';
import './marketing-home.css';
import './unified-design.css';
import './production-experience.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SkipLink } from '@/components/skip-link';
import { SITE } from '@/lib/content/site';

const socialDestinations = [
  'https://bsky.app/profile/neptlium.bsky.social',
  'https://x.com/Neptlium',
  'https://youtube.com/@neptlium',
  'https://www.tiktok.com/@neptlium',
  'https://github.com/Neptliumlabs',
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Neptlium — Capital Operating Platform', template: '%s — Neptlium' },
  description: SITE.description,
  applicationName: SITE.name,
  creator: SITE.name,
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: 'Neptlium — Capital Operating Platform',
    description: SITE.description,
    url: SITE.url,
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Neptlium' }],
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
  themeColor: '#FFFFFF',
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SkipLink />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
