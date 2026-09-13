import { SITE } from './site';

export const PRODUCT_FAMILY_LINKS = [
  { label: 'Personal', href: '/personal', description: 'Neptlium Capital for individuals and investors.' },
  { label: 'Business', href: '/business', description: 'VaultRail for organizations and treasury teams.' },
  { label: 'Developers', href: SITE.docsOrigin, description: 'API, webhook and integration documentation.' },
  { label: 'Status', href: SITE.statusOrigin, description: 'Public Neptlium service health.' },
] as const;
