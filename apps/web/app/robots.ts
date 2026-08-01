import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth/', '/maintenance'],
    },
    sitemap: 'https://neptlium.com/sitemap.xml',
    host: 'https://neptlium.com',
  };
}
