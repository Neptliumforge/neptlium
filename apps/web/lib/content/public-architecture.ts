export type PublicRouteClass =
  | 'canonical-indexable'
  | 'public-supporting-noindex'
  | 'authentication-system'
  | 'generated-metadata-asset'
  | 'legacy-redirect'
  | 'external-product'
  | 'dead-obsolete';

export type NavigationLink = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
};

export const CAPITAL_LINKS = [
  {
    label: 'Capital',
    href: '/capital',
    description: 'Neptlium Capital for individual investors, portfolios and wealth context.',
  },
  {
    label: 'Investing',
    href: '/investments',
    description: 'Evaluate investment structure, objective, risk, liquidity and documentation.',
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    description: 'Understand positions, valuation context, allocation, activity and reporting.',
  },
  {
    label: 'Allocation',
    href: '/allocation',
    description: 'Understand how capital is distributed across the portfolio.',
  },
] as const satisfies readonly NavigationLink[];

export const TREASURY_LINKS = [
  {
    label: 'Treasury',
    href: '/treasury',
    description: 'Neptlium Treasury for organizational capital and financial operations.',
  },
  {
    label: 'Liquidity',
    href: '/treasury',
    description:
      'Understand business liquidity, stablecoins, movement, settlement and reconciliation.',
  },
  {
    label: 'Payments',
    href: '/payments',
    description: 'Govern payment intent, authority, progression and evidence.',
  },
] as const satisfies readonly NavigationLink[];

export const INSTITUTIONAL_LINKS = [
  {
    label: 'Institutional',
    href: '/institutional',
    description: 'The planned Neptlium environment for funds, family offices and asset managers.',
  },
] as const satisfies readonly NavigationLink[];

export const INFRASTRUCTURE_LINKS = [
  {
    label: 'Infrastructure',
    href: '/infrastructure',
    description: 'Neptlium Pay, API and developer infrastructure.',
  },
  {
    label: 'Documentation',
    href: 'https://docs.neptlium.com',
    description: 'Developer documentation and integration contracts.',
  },
  {
    label: 'Status',
    href: 'https://status.neptlium.com',
    description: 'Public service-status information.',
  },
] as const satisfies readonly NavigationLink[];

export const PERSONAL_LINKS = CAPITAL_LINKS;
export const BUSINESS_LINKS = TREASURY_LINKS;

export const PRODUCTS = [
  {
    label: 'Neptlium Capital',
    href: '/capital',
    description: 'Personal investing, portfolio and wealth context.',
  },
  {
    label: 'Neptlium Treasury',
    href: '/treasury',
    description: 'Business treasury, payments, stablecoins, approvals and policies.',
  },
  {
    label: 'Neptlium Institutional',
    href: '/institutional',
    description: 'Planned capital systems for complex organizations.',
  },
  {
    label: 'Neptlium Infrastructure',
    href: '/infrastructure',
    description: 'Pay, API and developer infrastructure.',
  },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_PRODUCTS = PRODUCTS;

export const SOLUTIONS = [
  {
    label: 'Capital visibility',
    href: '/solutions/capital-visibility',
    description: 'See the capital picture across accounts, positions and liquidity.',
  },
  {
    label: 'Treasury coordination',
    href: '/solutions/treasury-coordination',
    description: 'Keep liquidity and funding requirements visible before they become urgent.',
  },
  {
    label: 'Allocation workflows',
    href: '/solutions/allocation-workflows',
    description: 'Turn a view into a governed decision process.',
  },
  {
    label: 'Governance and control',
    href: '/solutions/governance-control',
    description: 'Keep evidence, review, authority and consequence explicit.',
  },
] as const satisfies readonly NavigationLink[];

export const INSIGHTS = [
  {
    label: 'Insights',
    href: '/insights',
    description: 'Investing, markets, capital, treasury, payments, risk and technology.',
  },
  {
    label: 'Learn',
    href: '/learn',
    description: 'Clear explanations of financial and operating concepts.',
  },
  {
    label: 'Research',
    href: '/research',
    description: 'Substantive Neptlium research when original publications are available.',
  },
] as const satisfies readonly NavigationLink[];

export const RESOURCES = [
  INSIGHTS[1],
  INSIGHTS[2],
  {
    label: 'Security',
    href: '/security',
    description: 'Identity, authorization, financial authority, evidence and reconciliation.',
  },
  {
    label: 'Trust',
    href: '/trust',
    description: 'How evidence, uncertainty, authority and consequence are represented.',
  },
] as const satisfies readonly NavigationLink[];

export const COMPANY = [
  {
    label: 'Company',
    href: '/company',
    description:
      'Neptlium is the financial platform company within parent company Neptliumforge, spanning Capital, Treasury, Institutional and Infrastructure.',
  },
  { label: 'Contact', href: '/contact', description: 'Start a conversation with Neptlium.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_COMPANY = COMPANY;

export const PRODUCT_LINKS = [
  { label: 'Capital', href: '/capital', description: 'Understand capital, availability and governed movement.' },
  { label: 'Portfolio', href: '/portfolio', description: 'Understand positions, ownership and portfolio context.' },
  { label: 'Investments', href: '/investments', description: 'Understand how eligible capital can be put to work.' },
  { label: 'Treasury', href: '/treasury', description: 'Operate organizational capital with control.' },
  { label: 'Intelligence', href: '/intelligence', description: 'Decision support grounded in evidence and context.' },
  { label: 'Infrastructure', href: '/infrastructure', description: 'Build on governed Neptlium primitives.' },
] as const satisfies readonly NavigationLink[];

export const NAVIGATION = [
  {
    label: 'Products',
    href: '/capital',
    description: 'The six capabilities of the Neptlium Capital Operating Platform.',
    links: PRODUCT_LINKS,
  },
  {
    label: 'Solutions',
    href: '/solutions',
    description: 'Capital visibility, treasury coordination, allocation and governance.',
    links: SOLUTIONS,
  },
  {
    label: 'Institutional',
    href: '/institutional',
    description: 'Capital systems for complex organizations.',
    links: INSTITUTIONAL_LINKS,
  },
  {
    label: 'Insights',
    href: '/insights',
    description: 'Capital, treasury, investing and infrastructure perspectives.',
    links: INSIGHTS,
  },
] as const;

export const INDEXABLE_ROUTES = [
  '/',
  '/capital',
  '/institutional',
  '/intelligence',
  '/infrastructure',
  '/platform',
  '/investments',
  '/portfolio',
  '/allocation',
  '/treasury',
  '/payments',
  '/insights',
  '/company',
  '/learn',
  '/security',
  '/trust',
  '/contact',
  '/accessibility',
  '/solutions',
  '/solutions/capital-visibility',
  '/solutions/treasury-coordination',
  '/solutions/allocation-workflows',
  '/solutions/governance-control',
] as const;

export const ROUTE_POLICY: Readonly<Record<string, PublicRouteClass>> = {
  '/': 'canonical-indexable',
  '/personal': 'legacy-redirect',
  '/business': 'legacy-redirect',
  '/capital': 'canonical-indexable',
  '/institutional': 'canonical-indexable',
  '/intelligence': 'canonical-indexable',
  '/infrastructure': 'canonical-indexable',
  '/platform': 'canonical-indexable',
  '/investments': 'canonical-indexable',
  '/portfolio': 'canonical-indexable',
  '/allocation': 'canonical-indexable',
  '/treasury': 'canonical-indexable',
  '/payments': 'canonical-indexable',
  '/insights': 'canonical-indexable',
  '/company': 'canonical-indexable',
  '/learn': 'canonical-indexable',
  '/security': 'canonical-indexable',
  '/trust': 'canonical-indexable',
  '/contact': 'canonical-indexable',
  '/accessibility': 'canonical-indexable',
  '/docs': 'external-product',
  '/status': 'external-product',
  '/solutions': 'canonical-indexable',
  '/solutions/capital-visibility': 'canonical-indexable',
  '/solutions/treasury-coordination': 'canonical-indexable',
  '/solutions/allocation-workflows': 'canonical-indexable',
  '/solutions/governance-control': 'canonical-indexable',
  '/products': 'public-supporting-noindex',
  '/products/capital-account': 'legacy-redirect',
  '/products/treasury': 'legacy-redirect',
  '/products/allocation': 'legacy-redirect',
  '/products/portfolio-intelligence': 'legacy-redirect',
  '/products/performance': 'public-supporting-noindex',
  '/products/capital-universe': 'public-supporting-noindex',
  '/about': 'legacy-redirect',
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
  '/portfolio-intelligence': 'legacy-redirect',
  '/performance': 'dead-obsolete',
  '/capital-universe': 'dead-obsolete',
  '/capital-activity': 'legacy-redirect',
  '/neptlium-link': 'legacy-redirect',
} as const;
