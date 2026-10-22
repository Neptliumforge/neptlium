import type { Metadata } from 'next';
import type { LegalDoc } from './content/legal.ts';
import { ROUTE_POLICY } from './content/public-architecture.ts';
import { SITE } from './content/site.ts';

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
  index = isIndexableRoute(path),
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

/** A route classified in the public route policy is indexed only when it is canonical. */
function isIndexableRoute(path: string): boolean {
  const policy = ROUTE_POLICY[path];
  return policy === undefined || policy === 'canonical-indexable';
}

/** Draft legal documents stay out of search indexes until approved. */
export function legalMetadata(doc: LegalDoc): Metadata {
  return createPageMetadata({
    title: doc.title,
    description: doc.intro,
    path: doc.path,
    index: doc.status !== 'draft',
  });
}
