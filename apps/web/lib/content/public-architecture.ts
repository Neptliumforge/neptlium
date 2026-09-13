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

export const PERSONAL_LINKS = [
  { label: 'Personal', href: '/personal', description: 'The Neptlium Capital experience for individual investors and capital customers.' },
  { label: 'Capital', href: '/capital', description: 'Understand available, reserved and allocated capital with operating context intact.' },
  { label: 'Investments', href: '/investments', description: 'Evaluate investment structure, objective, risk, liquidity and documentation.' },
  { label: 'Portfolio', href: '/portfolio', description: 'Understand positions, valuation context, allocation, activity and reporting.' },
  { label: 'Allocation', href: '/allocation', description: 'Model and govern capital decisions before execution and reconciliation.' },
] as const satisfies readonly NavigationLink[];

export const BUSINESS_LINKS = [
  { label: 'Business', href: '/business', description: 'VaultRail for treasury, payments, approvals, risk, evidence and audit.' },
  { label: 'VaultRail', href: '/vaultrail', description: 'The governed business financial operating environment.' },
  { label: 'Treasury', href: '/treasury', description: 'Understand business liquidity, movement, settlement and reconciliation.' },
  { label: 'Payments', href: '/payments', description: 'Govern payment intent, authority, progression and evidence.' },
] as const satisfies readonly NavigationLink[];

export const PRODUCTS = [
  { label: 'Capital', href: '/capital', description: 'Available, reserved and allocated capital.' },
  { label: 'Portfolio', href: '/portfolio', description: 'Positions, valuation context, activity and reporting.' },
  { label: 'Allocation', href: '/allocation', description: 'Governed capital decisions before execution.' },
  { label: 'VaultRail', href: '/vaultrail', description: 'Business treasury and financial operations.' },
  { label: 'Treasury', href: '/treasury', description: 'Liquidity, movement, settlement and reconciliation.' },
  { label: 'Payments', href: '/payments', description: 'Governed payment intent and operating context.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_PRODUCTS = PRODUCTS;

export const SOLUTIONS = [
  { label: 'Capital visibility', href: '/solutions/capital-visibility', description: 'See the capital picture across accounts, positions and liquidity.' },
  { label: 'Treasury coordination', href: '/solutions/treasury-coordination', description: 'Keep liquidity and funding requirements visible before they become urgent.' },
  { label: 'Allocation workflows', href: '/solutions/allocation-workflows', description: 'Turn a view into a governed decision process.' },
  { label: 'Governance and control', href: '/solutions/governance-control', description: 'Keep evidence, review, authority and consequence explicit.' },
] as const satisfies readonly NavigationLink[];

export const INSIGHTS = [
  { label: 'Insights', href: '/insights', description: 'Investing, markets, capital, treasury, payments, risk and technology.' },
  { label: 'Learn', href: '/learn', description: 'Clear explanations of financial and operating concepts.' },
  { label: 'Research', href: '/research', description: 'Substantive Neptlium research when original publications are available.' },
] as const satisfies readonly NavigationLink[];

export const RESOURCES = [
  INSIGHTS[1],
  INSIGHTS[2],
  { label: 'Security', href: '/security', description: 'Identity, authorization, financial authority, evidence and reconciliation.' },
  { label: 'Trust', href: '/trust', description: 'How evidence, uncertainty, authority and consequence are represented.' },
] as const satisfies readonly NavigationLink[];

export const COMPANY = [
  { label: 'Company', href: '/company', description: 'Neptlium’s company thesis, product family and long-term direction.' },
  { label: 'Contact', href: '/contact', description: 'Start a conversation with Neptlium.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_COMPANY = COMPANY;

export const NAVIGATION = [
  { label: 'Personal', href: '/personal', description: 'Neptlium Capital for individual investors.', links: PERSONAL_LINKS },
  { label: 'Business', href: '/business', description: 'VaultRail for business treasury and financial operations.', links: BUSINESS_LINKS },
  { label: 'Platform', href: '/platform', description: 'The shared Neptlium financial system underneath both journeys.', links: [{ label: 'Platform', href: '/platform', description: 'How Personal and Business experiences share identity, authority, evidence, reconciliation and audit.' }] },
  { label: 'Insights', href: '/insights', description: 'One editorial system for investing, capital, treasury, payments and risk.', links: INSIGHTS },
  { label: 'Security', href: '/security', description: 'One governance story across Personal and Business.', links: [{ label: 'Security', href: '/security', description: 'Identity, authorization, financial authority, evidence, reconciliation and data security.' }, { label: 'Trust', href: '/trust', description: 'How evidence, uncertainty, authority and consequence are represented.' }] },
  { label: 'Company', href: '/company', description: 'Neptlium as the parent company and product family.', links: COMPANY },
] as const;

export const INDEXABLE_ROUTES = [
  '/', '/personal', '/business', '/platform', '/investments', '/capital', '/portfolio', '/allocation',
  '/vaultrail', '/treasury', '/payments', '/insights', '/company', '/learn', '/security', '/trust', '/contact', '/accessibility',
  '/solutions', '/solutions/capital-visibility', '/solutions/treasury-coordination', '/solutions/allocation-workflows', '/solutions/governance-control',
] as const;

export const ROUTE_POLICY: Readonly<Record<string, PublicRouteClass>> = {
  '/': 'canonical-indexable',
  '/personal': 'canonical-indexable',
  '/business': 'canonical-indexable',
  '/platform': 'canonical-indexable',
  '/investments': 'canonical-indexable',
  '/capital': 'canonical-indexable',
  '/portfolio': 'canonical-indexable',
  '/allocation': 'canonical-indexable',
  '/vaultrail': 'canonical-indexable',
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
