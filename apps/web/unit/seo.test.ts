import { describe, expect, it } from 'vitest';
import { createPageMetadata } from '@/lib/seo';

describe('createPageMetadata', () => {
  it('uses canonical URLs and consistent public and social metadata', () => {
    const metadata = createPageMetadata({
      title: 'Capital',
      description: 'Capital overview',
      path: '/capital',
    });

    expect(metadata.title).toBe('Capital');
    expect(metadata.description).toBe('Capital overview');
    expect(metadata.alternates).toEqual({ canonical: '/capital' });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toEqual({
      type: 'website',
      siteName: 'Neptlium',
      title: 'Capital',
      description: 'Capital overview',
      url: 'https://neptlium.com/capital',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Neptlium' }],
    });
    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      title: 'Capital',
      description: 'Capital overview',
      images: ['/opengraph-image'],
    });
  });

  it('does not advertise indexing or following for non-indexable pages', () => {
    const metadata = createPageMetadata({
      title: 'Private preview',
      description: 'Preview',
      path: '/preview',
      index: false,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toEqual({ canonical: '/preview' });
  });

  it.each([
    ['/', 'https://neptlium.com/'],
    ['/insights/market-outlook', 'https://neptlium.com/insights/market-outlook'],
  ] as const)('resolves the canonical and social URL for %s', (path, url) => {
    const metadata = createPageMetadata({ title: 'Neptlium', description: 'Overview', path });

    expect(metadata.alternates).toEqual({ canonical: path });
    expect(metadata.openGraph?.url).toBe(url);
  });
});
