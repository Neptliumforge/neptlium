export type PublicRouteClass =
  | 'canonical-indexable'
  | 'public-supporting-noindex'
  | 'authentication-system'
  | 'generated-metadata-asset'
  | 'legacy-redirect'
  | 'dead-obsolete';

export type NavigationLink = { readonly label: string; readonly href: string; readonly description: string };

export const PRODUCTS = [
  { label: 'Capital Account', href: '/products/capital-account', description: 'Maintain account-level funding and capital-movement context without confusing workflow state with provider or settlement authority.' },
  { label: 'Treasury', href: '/products/treasury', description: 'Read liquidity, reserves, funding requirements and capital readiness against the wider portfolio operating picture.' },
  { label: 'Allocation', href: '/products/allocation', description: 'Model capital intent, compare target states and preserve the distinction between proposal, review, authorization and outcome.' },
  { label: 'Portfolio Intelligence', href: '/products/portfolio-intelligence', description: 'Interpret composition, exposure, concentration and liquidity context while keeping source, derived and modeled information distinct.' },
  { label: 'Performance', href: '/products/performance', description: 'Interpret portfolio outcomes with period, cash-flow and calculation context rather than treating a return figure as self-explanatory.' },
  { label: 'Capital Universe', href: '/products/capital-universe', description: 'Organize capital across the roles and operating categories represented in Neptlium without reducing the system to a single asset class.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_PRODUCTS = PRODUCTS.slice(0, 4);

export const SOLUTIONS = [
  { label: 'Capital visibility', href: '/solutions#capital-visibility', description: 'Connect position, liquidity, account and movement context so visible information retains its source and operating meaning.' },
  { label: 'Treasury coordination', href: '/solutions#treasury-coordination', description: 'Coordinate liquidity and funding context with portfolio activity while preserving timing, source, state and authority.' },
  { label: 'Allocation workflows', href: '/solutions#allocation-workflows', description: 'Carry capital intent through modeling, review and authorization without collapsing proposed state into financial consequence.' },
  { label: 'Governance and control', href: '/solutions#governance-control', description: 'Keep identity, roles, review, evidence and consequential authority explicit around sensitive capital workflows.' },
] as const satisfies readonly NavigationLink[];

export const RESOURCES = [
  { label: 'Learn', href: '/learn', description: 'Definitions and operating concepts for capital context, state, evidence, review, authorization and consequence.' },
  { label: 'Research', href: '/research', description: 'A publication surface reserved for substantive Neptlium research and analysis when verified work is available.' },
  { label: 'Security', href: '/security', description: 'System, identity and privileged-operation boundaries described without implying undocumented controls or certifications.' },
  { label: 'Trust', href: '/trust', description: 'How Neptlium represents financial information, uncertainty, authority, limitations and product truth.' },
] as const satisfies readonly NavigationLink[];

export const COMPANY = [
  { label: 'About', href: '/about', description: 'The thesis behind a system-level approach to capital context, coordination and governance.' },
  { label: 'Contact', href: '/contact', description: 'Contact Neptlium about the platform, institutional inquiries, security, press or general matters.' },
  { label: 'Press', href: '/press', description: 'Verified company information and press resources when they are available.' },
] as const satisfies readonly NavigationLink[];

export const PRIMARY_COMPANY = COMPANY.slice(0, 2);

export const NAVIGATION = [
  { label: 'Platform', href: '/platform', description: 'Understand the operating model that connects capital state, interpretation, governance and consequential work.', links: [{ label: 'Platform', href: '/platform', description: 'The central system model for Neptlium and the boundaries between observed, modeled, reviewed, authorized and consequential state.' }] },
  { label: 'Products', href: '/products', description: 'Defined product responsibilities within one capital operating model.', links: PRIMARY_PRODUCTS },
  { label: 'Solutions', href: '/solutions', description: 'Institutional operating problems addressed through connected capital context.', links: SOLUTIONS },
  { label: 'Resources', href: '/resources', description: 'Product concepts, research, security boundaries and trust information.', links: RESOURCES },
  { label: 'Company', href: '/company', description: 'Neptlium’s purpose, platform principles and institutional information.', links: PRIMARY_COMPANY },
] as const;

export const INDEXABLE_ROUTES = ['/', '/platform', '/products', '/products/capital-account', '/products/treasury', '/products/allocation', '/products/portfolio-intelligence', '/products/performance', '/products/capital-universe', '/solutions', '/resources', '/company', '/about', '/learn', '/security', '/trust', '/contact', '/accessibility'] as const;

export const ROUTE_POLICY: Readonly<Record<string, PublicRouteClass>> = {
  '/': 'canonical-indexable', '/platform': 'canonical-indexable', '/products': 'canonical-indexable', '/products/capital-account': 'canonical-indexable', '/products/treasury': 'canonical-indexable', '/products/allocation': 'canonical-indexable', '/products/portfolio-intelligence': 'canonical-indexable', '/products/performance': 'canonical-indexable', '/products/capital-universe': 'canonical-indexable', '/solutions': 'canonical-indexable', '/resources': 'canonical-indexable', '/company': 'canonical-indexable', '/about': 'canonical-indexable', '/learn': 'canonical-indexable', '/security': 'canonical-indexable', '/trust': 'canonical-indexable', '/contact': 'canonical-indexable', '/accessibility': 'canonical-indexable',
  '/pricing': 'public-supporting-noindex', '/research': 'public-supporting-noindex', '/press': 'public-supporting-noindex', '/privacy': 'public-supporting-noindex', '/terms': 'public-supporting-noindex', '/cookie-policy': 'public-supporting-noindex', '/risk-disclosure': 'public-supporting-noindex',
  '/auth/access-denied': 'authentication-system', '/auth/create-account': 'authentication-system', '/auth/forgot-password': 'authentication-system', '/auth/loading': 'authentication-system', '/auth/reset-password': 'authentication-system', '/auth/session-expired': 'authentication-system', '/auth/sign-in': 'authentication-system', '/auth/verify-email': 'authentication-system', '/maintenance': 'authentication-system', '/_not-found': 'authentication-system',
  '/robots.txt': 'generated-metadata-asset', '/sitemap.xml': 'generated-metadata-asset', '/opengraph-image': 'generated-metadata-asset', '/apple-icon': 'generated-metadata-asset', '/icon.svg': 'generated-metadata-asset',
  '/capital-account': 'legacy-redirect', '/treasury': 'legacy-redirect', '/allocation': 'legacy-redirect', '/portfolio-intelligence': 'legacy-redirect', '/performance': 'legacy-redirect', '/capital-universe': 'legacy-redirect', '/capital-activity': 'legacy-redirect', '/neptlium-link': 'legacy-redirect',
} as const;
