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
  '/security',
  '/research',
  '/learn',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/accessibility',
  '/risk-disclosure',
  '/company',
  '/press',
  '/trust',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://neptlium.com${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
