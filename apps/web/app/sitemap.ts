import type { MetadataRoute } from 'next';

const routes = [
  '',
  '/platform',
  '/portfolio-intelligence',
  '/capital-account',
  '/allocation',
  '/treasury',
  '/performance',
  '/capital-universe',
  '/research',
  '/learn',
  '/company',
  '/about',
  '/security',
  '/trust',
  '/press',
  '/contact',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/accessibility',
  '/risk-disclosure',
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
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : highPriorityRoutes.has(route) ? 0.8 : 0.6,
  }));
}
