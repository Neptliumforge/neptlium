import type { MetadataRoute } from 'next';
import { INDEXABLE_ROUTES } from '@/lib/content/public-architecture';

const highPriorityRoutes = new Set([
  '/',
  '/platform',
  '/products',
  '/solutions',
  '/resources',
  '/company',
]);

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_ROUTES.map((route) => ({
    url: `https://neptlium.com${route === '/' ? '' : route}`,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : highPriorityRoutes.has(route) ? 0.85 : 0.65,
  }));
}
