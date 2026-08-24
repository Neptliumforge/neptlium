import type { Metadata } from 'next';
import { SITE } from '@/lib/content/site';

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | '/';
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE.url).toString();

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index, follow: index },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      title,
      description,
      url,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}
