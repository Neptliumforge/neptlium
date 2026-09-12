export type PublicRouteClass =
  | 'canonical-indexable'
  | 'public-supporting-noindex'
  | 'authentication-system'
  | 'generated-metadata-asset'
  | 'legacy-redirect'
  | 'dead-obsolete';

export type NavigationLink = { readonly label: string; readonly href: string; readonly description: string };

export const PRODUCTS = [
  { label: 'Capital Account', href: '/products/capital-account', description: 'Understand balances, funding, liquidity and movement with the operating context behind them intact.' },
  { label: 'Treasury', href: '/products/treasury', description: 'Understand liquidity, obligations and funding requirements before they become urgent.' },
  { label: 'Allocation', href: '/products/allocation', description: 'Model what should change without pretending that the change has already happened.' },
  { label: 'Portfolio Intelligence', href: '/products/portfolio-intelligence', description: 'Understand ownership, exposure, concentration and relationships across the portfolio.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_PRODUCTS = PRODUCTS;

export const SOLUTIONS = [
  { label: 'Capital visibility', href: '/solutions/capital-visibility', description: 'See the whole capital picture across accounts, companies, positions and liquidity.' },
  { label: 'Treasury coordination', href: '/solutions/treasury-coordination', description: 'Keep liquidity visible before it becomes urgent.' },
  { label: 'Allocation workflows', href: '/solutions/allocation-workflows', description: 'Turn a view into an intentional decision process.' },
  { label: 'Governance and control', href: '/solutions/governance-control', description: 'Keep evidence, review, authority and consequence explicit.' },
] as const satisfies readonly NavigationLink[];

export const RESOURCES = [
  { label: 'Learn', href: '/learn', description: 'Ideas and operating concepts for understanding capital more clearly.' },
  { label: 'Research', href: '/research', description: 'Original Neptlium research on capital operations, structure and governance.' },
  { label: 'Security', href: '/security', description: 'How Neptlium approaches system, identity and operational security.' },
  { label: 'Trust', href: '/trust', description: 'How Neptlium represents evidence, uncertainty, authority and consequence.' },
] as const satisfies readonly NavigationLink[];

export const COMPANY = [
  { label: 'About', href: '/about', description: 'Why Neptlium exists and the operating principles behind the platform.' },
  { label: 'Contact', href: '/contact', description: 'Start a conversation with Neptlium.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_COMPANY = COMPANY;

export const NAVIGATION = [
  { label: 'Platform', href: '/platform', description: 'One environment for the capital you own.', links: [{ label: 'Platform', href: '/platform', description: 'Understand the operating model connecting capital state, context and governed work.' }] },
  { label: 'Products', href: '/products', description: 'Four distinct responsibilities inside one capital environment.', links: PRIMARY_PRODUCTS },
  { label: 'Solutions', href: '/solutions', description: 'Institutional operating problems addressed through connected capital context.', links: SOLUTIONS },
  { label: 'Insights', href: '/learn', description: 'Education and research for operating capital more clearly.', links: RESOURCES.slice(0,2) },
  { label: 'Trust', href: '/trust', description: 'Security, evidence and system boundaries.', links: RESOURCES.slice(2) },
  { label: 'Company', href: '/about', description: 'Neptlium’s purpose and institutional information.', links: PRIMARY_COMPANY },
] as const;

export const INDEXABLE_ROUTES = ['/', '/platform', '/products', '/products/capital-account', '/products/treasury', '/products/allocation', '/products/portfolio-intelligence', '/solutions', '/solutions/capital-visibility', '/solutions/treasury-coordination', '/solutions/allocation-workflows', '/solutions/governance-control', '/resources', '/company', '/about', '/learn', '/research', '/security', '/trust', '/contact', '/accessibility'] as const;

export const ROUTE_POLICY: Readonly<Record<string, PublicRouteClass>> = {
  '/': 'canonical-indexable', '/platform': 'canonical-indexable', '/products': 'canonical-indexable', '/products/capital-account': 'canonical-indexable', '/products/treasury': 'canonical-indexable', '/products/allocation': 'canonical-indexable', '/products/portfolio-intelligence': 'canonical-indexable', '/solutions': 'canonical-indexable', '/solutions/capital-visibility': 'canonical-indexable', '/solutions/treasury-coordination': 'canonical-indexable', '/solutions/allocation-workflows': 'canonical-indexable', '/solutions/governance-control': 'canonical-indexable', '/resources': 'canonical-indexable', '/company': 'canonical-indexable', '/about': 'canonical-indexable', '/learn': 'canonical-indexable', '/research': 'canonical-indexable', '/security': 'canonical-indexable', '/trust': 'canonical-indexable', '/contact': 'canonical-indexable', '/accessibility': 'canonical-indexable',
  '/pricing': 'public-supporting-noindex', '/press': 'public-supporting-noindex', '/privacy': 'public-supporting-noindex', '/terms': 'public-supporting-noindex', '/cookie-policy': 'public-supporting-noindex', '/risk-disclosure': 'public-supporting-noindex',
  '/auth/access-denied': 'authentication-system', '/auth/create-account': 'authentication-system', '/auth/forgot-password': 'authentication-system', '/auth/loading': 'authentication-system', '/auth/reset-password': 'authentication-system', '/auth/session-expired': 'authentication-system', '/auth/sign-in': 'authentication-system', '/auth/verify-email': 'authentication-system', '/maintenance': 'authentication-system', '/_not-found': 'authentication-system', '/robots.txt': 'generated-metadata-asset', '/sitemap.xml': 'generated-metadata-asset', '/opengraph-image': 'generated-metadata-asset', '/apple-icon': 'generated-metadata-asset', '/icon.svg': 'generated-metadata-asset',
  '/capital-account': 'legacy-redirect', '/treasury': 'legacy-redirect', '/allocation': 'legacy-redirect', '/portfolio-intelligence': 'legacy-redirect', '/performance': 'dead-obsolete', '/capital-universe': 'dead-obsolete', '/capital-activity': 'legacy-redirect', '/neptlium-link': 'legacy-redirect',
} as const;
