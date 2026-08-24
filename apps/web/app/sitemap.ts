import type { MetadataRoute } from 'next';

const routes = [
  '',
  '/platform',
  '/portfolio-intelligence',
  '/capital-account',
  '/allocation',
  '/treasury',
  '/learn',
  '/company',
  '/about',
  '/security',
  '/contact',
  '/accessibility',
] as const;

const highPriorityRoutes = new Set([
  '',
  '/platform',
  '/portfolio-intelligence',
  '/capital-account',
  '/allocation',
  '/treasury',
]);

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://neptlium.com${route}`,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : highPriorityRoutes.has(route) ? 0.8 : 0.6,
  }));
}
