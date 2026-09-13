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
  { label: 'Capital Account', href: '/products/capital-account', description: 'Understand balances, funding, liquidity and movement with their operating context intact.' },
  { label: 'Treasury', href: '/products/treasury', description: 'Understand liquidity, obligations and funding requirements before they become urgent.' },
  { label: 'Allocation', href: '/products/allocation', description: 'Model intended capital structure while keeping proposals distinct from financial consequence.' },
  { label: 'Portfolio Intelligence', href: '/products/portfolio-intelligence', description: 'Understand ownership, exposure, concentration and relationships across the portfolio.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_PRODUCTS = PRODUCTS.slice(0, 4);

export const SOLUTIONS = [
  { label: 'Capital visibility', href: '/solutions/capital-visibility', description: 'See the capital picture across accounts, companies, positions and liquidity.' },
  { label: 'Treasury coordination', href: '/solutions/treasury-coordination', description: 'Keep liquidity and funding requirements visible before they become urgent.' },
  { label: 'Allocation workflows', href: '/solutions/allocation-workflows', description: 'Turn a view into a governed decision process.' },
  { label: 'Governance and control', href: '/solutions/governance-control', description: 'Keep evidence, review, authority and consequence explicit.' },
] as const satisfies readonly NavigationLink[];

export const INSIGHTS = [
  { label: 'Insights', href: '/insights', description: 'Investment perspectives, platform intelligence and investor education.' },
  { label: 'Learn', href: '/learn', description: 'Clear explanations of capital, portfolio and operating concepts.' },
  { label: 'Research', href: '/research', description: 'Substantive Neptlium research when original publications are available.' },
] as const satisfies readonly NavigationLink[];

// Retained for the legacy /resources page while that route permanently converges to /insights.
export const RESOURCES = [
  INSIGHTS[1],
  INSIGHTS[2],
  { label: 'Security', href: '/security', description: 'How Neptlium approaches system, identity and operational security.' },
  { label: 'Trust', href: '/trust', description: 'How Neptlium represents evidence, uncertainty, authority and consequence.' },
] as const satisfies readonly NavigationLink[];

export const COMPANY = [
  { label: 'Company', href: '/company', description: 'Neptlium’s mission, operating philosophy and long-term direction.' },
  { label: 'Contact', href: '/contact', description: 'Start a conversation with Neptlium.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_COMPANY = COMPANY.slice(0, 2);

export const NAVIGATION = [
  {
    label: 'Platform',
    href: '/platform',
    description: 'The connected Neptlium capital environment.',
    links: [
      { label: 'Platform', href: '/platform', description: 'Understand the system connecting capital, portfolio context and governed financial work.' },
      { label: 'Products', href: '/products', description: 'Explore the product surfaces that make up the operating environment.' },
      { label: 'Solutions', href: '/solutions', description: 'See how Neptlium addresses recurring capital-management problems.' },
    ],
  },
  {
    label: 'Investments',
    href: '/investments',
    description: 'How Neptlium presents investment opportunities, structure, risk and suitability.',
    links: [
      { label: 'Investments', href: '/investments', description: 'Review the framework Neptlium uses for disciplined investment presentation.' },
    ],
  },
  {
    label: 'Insights',
    href: '/insights',
    description: 'Institutional perspectives, research and investor education.',
    links: INSIGHTS,
  },
  {
    label: 'Security',
    href: '/security',
    description: 'Account security, transaction controls and financial integrity.',
    links: [
      { label: 'Security', href: '/security', description: 'How Neptlium approaches identity, access, infrastructure and operational controls.' },
      { label: 'Trust', href: '/trust', description: 'How evidence, uncertainty, authority and consequence are represented.' },
    ],
  },
  {
    label: 'Company',
    href: '/company',
    description: 'Neptlium’s purpose and institutional information.',
    links: COMPANY,
  },
] as const;

export const INDEXABLE_ROUTES = [
  '/', '/personal', '/business', '/platform', '/investments', '/insights',
  '/products', '/products/capital-account', '/products/treasury', '/products/allocation', '/products/portfolio-intelligence',
  '/solutions', '/solutions/capital-visibility', '/solutions/treasury-coordination', '/solutions/allocation-workflows', '/solutions/governance-control',
  '/company', '/learn', '/security', '/trust', '/contact', '/accessibility',
] as const;

export const ROUTE_POLICY: Readonly<Record<string, PublicRouteClass>> = {
  '/': 'canonical-indexable',
  '/personal': 'canonical-indexable',
  '/business': 'canonical-indexable',
  '/platform': 'canonical-indexable',
  '/investments': 'canonical-indexable',
  '/insights': 'canonical-indexable',
  '/products': 'canonical-indexable',
  '/products/capital-account': 'canonical-indexable',
  '/products/treasury': 'canonical-indexable',
  '/products/allocation': 'canonical-indexable',
  '/products/portfolio-intelligence': 'canonical-indexable',
  '/products/performance': 'public-supporting-noindex',
  '/products/capital-universe': 'public-supporting-noindex',
  '/solutions': 'canonical-indexable',
  '/solutions/capital-visibility': 'canonical-indexable',
  '/solutions/treasury-coordination': 'canonical-indexable',
  '/solutions/allocation-workflows': 'canonical-indexable',
  '/solutions/governance-control': 'canonical-indexable',
  '/company': 'canonical-indexable',
  '/about': 'legacy-redirect',
  '/learn': 'canonical-indexable',
  '/security': 'canonical-indexable',
  '/trust': 'canonical-indexable',
  '/contact': 'canonical-indexable',
  '/accessibility': 'canonical-indexable',
  '/research': 'public-supporting-noindex',
  '/resources': 'legacy-redirect',
  '/pricing': 'public-supporting-noindex',
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
  '/performance': 'dead-obsolete',
  '/capital-universe': 'dead-obsolete',
  '/capital-activity': 'legacy-redirect',
  '/neptlium-link': 'legacy-redirect',
} as const;
