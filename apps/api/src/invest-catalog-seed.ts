import type { Availability, DisclosureKind, ProductFamily } from './invest-catalog-domain.js';

// Mirrors the seed in supabase/migrations/20261022090000_invest_product_catalog.sql
// for the in-memory repository. test/invest-catalog.test.mjs asserts parity.

export const seedSectors = [
  { slug: 'artificial-intelligence', name: 'Artificial intelligence', description: 'Models, tooling and the companies applying machine learning at scale.', sort_rank: 10 },
  { slug: 'semiconductors', name: 'Semiconductors', description: 'Chip design, fabrication, equipment and the supply chain behind compute.', sort_rank: 20 },
  { slug: 'cloud-computing', name: 'Cloud computing', description: 'Hyperscale platforms, infrastructure services and the economics of shared compute.', sort_rank: 30 },
  { slug: 'software', name: 'Software', description: 'Application and platform software sold to businesses and consumers.', sort_rank: 40 },
  { slug: 'cybersecurity', name: 'Cybersecurity', description: 'Identity, network, endpoint and data protection.', sort_rank: 50 },
  { slug: 'digital-infrastructure', name: 'Digital infrastructure', description: 'Data centres, networks, fibre and the physical layer of the internet.', sort_rank: 60 },
  { slug: 'energy-power', name: 'Energy and power', description: 'Generation, grids, storage and the power demand of compute.', sort_rank: 70 },
  { slug: 'financial-technology', name: 'Financial technology', description: 'Payments, lending, market infrastructure and financial software.', sort_rank: 80 },
  { slug: 'industrial-automation', name: 'Industrial automation', description: 'Robotics, control systems and automated manufacturing.', sort_rank: 90 },
  { slug: 'healthcare-technology', name: 'Healthcare technology', description: 'Medical devices, diagnostics and health data platforms.', sort_rank: 100 },
] as const;

type SeedDisclosure = { kind: DisclosureKind; title: string; body: string; sort_rank: number };

const conceptDisclosures: readonly SeedDisclosure[] = [
  { kind: 'CONCEPT_STATUS', title: 'Concept — not available to invest', sort_rank: 10, body: 'This plan is a concept under development. It cannot be invested in. No allocation, instruments, operator, fees, minimums, maximums or eligibility have been approved, and the concept may change or be withdrawn.' },
  { kind: 'NOT_AN_OFFER', title: 'Not an offer or advice', sort_rank: 20, body: 'Nothing here is an offer, solicitation or recommendation to buy or sell any investment, and nothing here is investment, legal or tax advice.' },
  { kind: 'RISK', title: 'Investment risk', sort_rank: 30, body: 'If investing becomes available, the value of investments can fall as well as rise and you may get back less than you invest. No return is promised or implied.' },
];
const researchDisclosures: readonly SeedDisclosure[] = [
  { kind: 'RESEARCH_ONLY', title: 'Research only', sort_rank: 10, body: 'This collection is research context. It is not an investment product, fund or portfolio, and it cannot be bought.' },
  { kind: 'NOT_AN_OFFER', title: 'Not an offer or advice', sort_rank: 20, body: 'Nothing here is an offer, solicitation or recommendation to buy or sell any investment, and nothing here is investment, legal or tax advice.' },
];

export interface SeedProduct {
  readonly slug: string;
  readonly family: ProductFamily;
  readonly availability: Availability;
  readonly sort_rank: number;
  readonly name: string;
  readonly tagline: string;
  readonly summary: string;
  readonly body: string;
  readonly objective: string | null;
  readonly terms: { currency: string; minimum_minor: string; maximum_minor: string; fee_note: string; liquidity_note: string } | null;
  readonly sectors: readonly string[];
  readonly disclosures: readonly SeedDisclosure[];
}

export const seedProducts: readonly SeedProduct[] = [
  {
    slug: 'reserve', family: 'MANAGED_PLAN', availability: 'CONCEPT', sort_rank: 10,
    name: 'Neptlium Reserve',
    tagline: 'A stability-first plan concept for capital you may need sooner.',
    summary: 'Neptlium Reserve is a concept for a managed plan that would prioritise capital stability and liquidity. It is not available to invest in.',
    body: 'Reserve is being designed for capital that should stay steady and accessible. As a concept, it has no approved allocation, instruments, operator, fees or eligibility. Proposed minimum and maximum amounts are shown for planning only and are not final. Any future plan would be offered only with a regulated partner, in permitted jurisdictions, with full disclosures.',
    objective: 'Prioritise stability and liquidity over growth.',
    terms: { currency: 'USD', minimum_minor: '30000', maximum_minor: '1000000', fee_note: 'Fees have not been set.', liquidity_note: 'Liquidity terms have not been set.' },
    sectors: [],
    disclosures: [
      ...conceptDisclosures,
      { kind: 'PROPOSED_TERMS', title: 'Proposed amounts are not final', sort_rank: 15, body: 'The proposed minimum of $300 and maximum of $10,000 are planning assumptions. They are not approved terms and may change before any launch.' },
    ],
  },
  {
    slug: 'income', family: 'MANAGED_PLAN', availability: 'CONCEPT', sort_rank: 20,
    name: 'Neptlium Income',
    tagline: 'An income-oriented plan concept.',
    summary: 'Neptlium Income is a concept for a managed plan that would seek income alongside moderate risk. It is not available to invest in.',
    body: 'Income is being designed for investors who prioritise regular income. As a concept, it has no approved allocation, instruments, operator, fees, terms or eligibility, and no yield or distribution is promised or implied.',
    objective: 'Seek income with moderate risk.',
    terms: null, sectors: [], disclosures: conceptDisclosures,
  },
  {
    slug: 'balanced', family: 'MANAGED_PLAN', availability: 'CONCEPT', sort_rank: 30,
    name: 'Neptlium Balanced',
    tagline: 'A plan concept that balances growth potential and stability.',
    summary: 'Neptlium Balanced is a concept for a managed plan that would balance growth potential with stability. It is not available to invest in.',
    body: 'Balanced is being designed for long-term investors who want growth potential with measured volatility. As a concept, it has no approved allocation, instruments, operator, fees, terms or eligibility.',
    objective: 'Balance growth potential with stability.',
    terms: null, sectors: [], disclosures: conceptDisclosures,
  },
  {
    slug: 'growth', family: 'MANAGED_PLAN', availability: 'CONCEPT', sort_rank: 40,
    name: 'Neptlium Growth',
    tagline: 'A long-term growth plan concept.',
    summary: 'Neptlium Growth is a concept for a managed plan that would pursue long-term growth and accept higher volatility. It is not available to invest in.',
    body: 'Growth is being designed for long-horizon investors prepared for larger swings in value. As a concept, it has no approved allocation, instruments, operator, fees, terms or eligibility.',
    objective: 'Pursue long-term growth, accepting higher volatility.',
    terms: null, sectors: [], disclosures: conceptDisclosures,
  },
  {
    slug: 'ai-compute', family: 'THEMATIC_COLLECTION', availability: 'RESEARCH_ONLY', sort_rank: 110,
    name: 'AI & Compute',
    tagline: 'Research on the companies building artificial-intelligence and compute capacity.',
    summary: 'A research collection on artificial intelligence, the chips that power it and the cloud capacity it runs on.',
    body: 'AI & Compute follows how artificial-intelligence demand moves through models, accelerators, semiconductor supply and cloud capacity. It is research context to help you understand the theme. It does not hold or recommend any investment.',
    objective: null, terms: null,
    sectors: ['artificial-intelligence', 'semiconductors', 'cloud-computing'], disclosures: researchDisclosures,
  },
  {
    slug: 'cloud-software', family: 'THEMATIC_COLLECTION', availability: 'RESEARCH_ONLY', sort_rank: 120,
    name: 'Cloud & Software',
    tagline: 'Research on cloud platforms, business software and the security around them.',
    summary: 'A research collection on cloud platforms, application software and cybersecurity.',
    body: 'Cloud & Software looks at how businesses buy computing and software, how platforms compete and why security spending follows. It is research context, not an investment product.',
    objective: null, terms: null,
    sectors: ['cloud-computing', 'software', 'cybersecurity'], disclosures: researchDisclosures,
  },
  {
    slug: 'digital-infrastructure', family: 'THEMATIC_COLLECTION', availability: 'RESEARCH_ONLY', sort_rank: 130,
    name: 'Digital Infrastructure',
    tagline: 'Research on data centres, networks and the physical layer of the internet.',
    summary: 'A research collection on data centres, connectivity and the hardware and power behind them.',
    body: 'Digital Infrastructure examines the physical assets that digital services depend on: data centres, fibre and wireless networks, chips and the power to run them. It is research context, not an investment product.',
    objective: null, terms: null,
    sectors: ['digital-infrastructure', 'semiconductors', 'energy-power'], disclosures: researchDisclosures,
  },
  {
    slug: 'energy-power', family: 'THEMATIC_COLLECTION', availability: 'RESEARCH_ONLY', sort_rank: 140,
    name: 'Energy & Power',
    tagline: 'Research on generation, grids, storage and the power demand of compute.',
    summary: 'A research collection on energy generation, grid infrastructure, storage and industrial electrification.',
    body: 'Energy & Power studies how electricity is generated, moved and stored, and how compute and automation are changing demand. It is research context, not an investment product.',
    objective: null, terms: null,
    sectors: ['energy-power', 'industrial-automation'], disclosures: researchDisclosures,
  },
  {
    slug: 'global-innovation', family: 'THEMATIC_COLLECTION', availability: 'RESEARCH_ONLY', sort_rank: 150,
    name: 'Global Innovation',
    tagline: 'Research on innovation across financial technology, healthcare and automation.',
    summary: 'A research collection spanning financial technology, healthcare technology, industrial automation and applied AI.',
    body: 'Global Innovation brings together research on technology changing established industries worldwide, from payments and lending to diagnostics and factory automation. It is research context, not an investment product.',
    objective: null, terms: null,
    sectors: ['financial-technology', 'healthcare-technology', 'industrial-automation', 'artificial-intelligence'], disclosures: researchDisclosures,
  },
];
