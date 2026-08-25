export type PublicRouteClass =
  | 'canonical-indexable'
  | 'public-supporting-noindex'
  | 'authentication-system'
  | 'generated-metadata-asset'
  | 'legacy-redirect'
  | 'dead-obsolete';

export type NavigationLink = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
};

export const PRODUCTS = [
  {
    label: 'Capital Account',
    href: '/products/capital-account',
    description: 'Organize funding and capital movement around one operating context.',
  },
  {
    label: 'Treasury',
    href: '/products/treasury',
    description: 'Understand liquidity, reserves and capital readiness in context.',
  },
  {
    label: 'Allocation',
    href: '/products/allocation',
    description: 'Shape and review capital intent before action.',
  },
  {
    label: 'Portfolio Intelligence',
    href: '/products/portfolio-intelligence',
    description: 'Read portfolio composition and operating context together.',
  },
  {
    label: 'Performance',
    href: '/products/performance',
    description: 'Understand the context required to interpret portfolio outcomes responsibly.',
  },
  {
    label: 'Capital Universe',
    href: '/products/capital-universe',
    description: 'Organize capital across roles without reducing the model to one asset class.',
  },
] as const satisfies readonly NavigationLink[];

export const SOLUTIONS = [
  {
    label: 'Capital visibility',
    href: '/solutions#capital-visibility',
    description: 'Keep position, liquidity and movement context connected.',
  },
  {
    label: 'Treasury coordination',
    href: '/solutions#treasury-coordination',
    description: 'Bring liquidity and capital readiness into the wider operating picture.',
  },
  {
    label: 'Allocation workflows',
    href: '/solutions#allocation-workflows',
    description: 'Separate modeling, review and authority from financial outcome.',
  },
  {
    label: 'Governance and control',
    href: '/solutions#governance-control',
    description: 'Keep identity, review and consequential action explicit.',
  },
] as const satisfies readonly NavigationLink[];

export const RESOURCES = [
  {
    label: 'Learn',
    href: '/learn',
    description: 'Understand Neptlium concepts, terminology and operating relationships.',
  },
  {
    label: 'Security',
    href: '/security',
    description: 'Review the security and control principles behind the platform.',
  },
  {
    label: 'Trust',
    href: '/trust',
    description: 'Understand how Neptlium communicates boundaries, risk and product truth.',
  },
  {
    label: 'Research',
    href: '/research',
    description: 'Publication surface for substantive Neptlium research when it exists.',
  },
] as const satisfies readonly NavigationLink[];

export const COMPANY = [
  {
    label: 'About',
    href: '/about',
    description: 'Read the product thesis and principles behind Neptlium.',
  },
  {
    label: 'Contact',
    href: '/contact',
    description: 'Start a direct conversation with Neptlium.',
  },
  {
    label: 'Press',
    href: '/press',
    description: 'Verified company and press information when available.',
  },
] as const satisfies readonly NavigationLink[];

export const NAVIGATION = [
  {
    label: 'Platform',
    href: '/platform',
    description: 'See how Neptlium works as one capital operating environment.',
    links: [
      {
        label: 'Platform overview',
        href: '/platform',
        description: 'Understand the system model, operating lifecycle and product relationships.',
      },
    ],
  },
  {
    label: 'Products',
    href: '/products',
    description: 'Explore the products that form the Neptlium system.',
    links: PRODUCTS,
  },
  {
    label: 'Solutions',
    href: '/solutions',
    description: 'See Neptlium through the operating problems it is designed to address.',
    links: SOLUTIONS,
  },
  {
    label: 'Resources',
    href: '/resources',
    description: 'Learn the concepts, security principles and thinking behind Neptlium.',
    links: RESOURCES,
  },
  {
    label: 'Company',
    href: '/company',
    description: 'Understand the organization and principles behind Neptlium.',
    links: COMPANY,
  },
] as const;

export const INDEXABLE_ROUTES = [
  '/',
  '/platform',
  '/products',
  '/products/capital-account',
  '/products/treasury',
  '/products/allocation',
  '/products/portfolio-intelligence',
  '/products/performance',
  '/products/capital-universe',
  '/solutions',
  '/resources',
  '/company',
  '/about',
  '/learn',
  '/security',
  '/trust',
  '/contact',
  '/accessibility',
] as const;

export const ROUTE_POLICY: Readonly<Record<string, PublicRouteClass>> = {
  '/': 'canonical-indexable',
  '/platform': 'canonical-indexable',
  '/products': 'canonical-indexable',
  '/products/capital-account': 'canonical-indexable',
  '/products/treasury': 'canonical-indexable',
  '/products/allocation': 'canonical-indexable',
  '/products/portfolio-intelligence': 'canonical-indexable',
  '/products/performance': 'canonical-indexable',
  '/products/capital-universe': 'canonical-indexable',
  '/solutions': 'canonical-indexable',
  '/resources': 'canonical-indexable',
  '/company': 'canonical-indexable',
  '/about': 'canonical-indexable',
  '/learn': 'canonical-indexable',
  '/security': 'canonical-indexable',
  '/trust': 'canonical-indexable',
  '/contact': 'canonical-indexable',
  '/accessibility': 'canonical-indexable',

  '/pricing': 'public-supporting-noindex',
  '/research': 'public-supporting-noindex',
  '/press': 'public-supporting-noindex',
  '/privacy': 'public-supporting-noindex',
  '/terms': 'public-supporting-noindex',
  '/cookie-policy': 'public-supporting-noindex',
  '/risk-disclosure': 'public-supporting-noindex',

  '/auth/access-denied': 'authentication-system',
  '/auth/create-account': 'authentication-system',
  '/auth/forgot-password': 'authentication-system',
  '/auth/loading': 'authentication-system',
  '/auth/reset-password': 'authentication-system',
  '/auth/session-expired': 'authentication-system',
  '/auth/sign-in': 'authentication-system',
  '/auth/verify-email': 'authentication-system',
  '/maintenance': 'authentication-system',
  '/_not-found': 'authentication-system',

  '/robots.txt': 'generated-metadata-asset',
  '/sitemap.xml': 'generated-metadata-asset',
  '/opengraph-image': 'generated-metadata-asset',
  '/apple-icon': 'generated-metadata-asset',
  '/icon.svg': 'generated-metadata-asset',

  '/capital-account': 'legacy-redirect',
  '/treasury': 'legacy-redirect',
  '/allocation': 'legacy-redirect',
  '/portfolio-intelligence': 'legacy-redirect',
  '/performance': 'legacy-redirect',
  '/capital-universe': 'legacy-redirect',
  '/capital-activity': 'legacy-redirect',
  '/neptlium-link': 'legacy-redirect',
} as const;
