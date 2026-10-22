/** Public editorial catalog only. No instrument IDs, pricing, eligibility or execution authority. */
export type ResearchCollection = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
  alt: string;
  topics: readonly string[];
  questions: readonly string[];
  risks: string;
};
export const COLLECTIONS = [
  {
    slug: 'ai-compute',
    title: 'AI & Compute',
    eyebrow: 'The intelligence layer',
    summary: 'Explore the hardware, semiconductors and systems behind artificial intelligence.',
    image: '/invest/compute.webp',
    alt: 'Rows of server infrastructure inside a data center',
    topics: ['Semiconductors', 'Accelerated computing', 'AI infrastructure'],
    questions: [
      'Where does value accrue across chips, memory and systems?',
      'How dependent is demand on a small number of customers?',
      'What happens when architectures or spending priorities change?',
    ],
    risks:
      'Technology cycles, customer concentration, export restrictions and capital intensity can reshape demand.',
  },
  {
    slug: 'cloud-software',
    title: 'Cloud & Software',
    eyebrow: 'The operating layer',
    summary: 'Understand the platforms, software and security that organizations build on.',
    image: '/invest/compute.webp',
    alt: 'Data servers and storage hardware',
    topics: ['Cloud platforms', 'Enterprise software', 'Cybersecurity', 'Fintech'],
    questions: [
      'How durable are customer relationships and recurring revenue?',
      'Does growth translate into sustainable cash generation?',
      'How do security, regulation and platform dependence affect the business?',
    ],
    risks:
      'Competition, security incidents, valuation sensitivity and changing customer budgets can affect outcomes.',
  },
  {
    slug: 'digital-infrastructure',
    title: 'Digital Infrastructure',
    eyebrow: 'The connected world',
    summary: 'Look beneath the digital economy to data centers, networks and connectivity.',
    image: '/invest/compute.webp',
    alt: 'Rows of server infrastructure inside a data center',
    topics: ['Data centers', 'Connectivity', 'Network equipment'],
    questions: [
      'What constrains capacity: power, land, cooling or connectivity?',
      'How resilient are contracts and customer demand?',
      'What maintenance and expansion investment does the asset require?',
    ],
    risks:
      'Financing costs, power access, construction delays and tenant concentration can challenge the investment thesis.',
  },
  {
    slug: 'energy-power',
    title: 'Energy & Power',
    eyebrow: 'The physical foundation',
    summary: 'Examine electricity networks, generation and the systems that keep economies moving.',
    image: '/invest/power.webp',
    alt: 'Electricity transmission towers and power lines at sunset',
    topics: ['Electricity grids', 'Power systems', 'Energy infrastructure'],
    questions: [
      'How are investment costs recovered over time?',
      'Which regulatory and permitting decisions matter?',
      'How exposed is the business to fuel costs and demand changes?',
    ],
    risks:
      'Regulation, commodity prices, project execution, weather and environmental obligations can affect results.',
  },
  {
    slug: 'global-innovation',
    title: 'Global Innovation',
    eyebrow: 'Beyond a single sector',
    summary:
      'Connect advances across technology, industry and healthcare with the businesses behind them.',
    image: '/invest/compute.webp',
    alt: 'Server infrastructure supporting the digital economy',
    topics: ['Industrial automation', 'Healthcare technology', 'Fintech'],
    questions: [
      'Does the technology solve an enduring customer need?',
      'What evidence supports commercial adoption?',
      'How do geographic and sector exposures overlap?',
    ],
    risks:
      'Adoption uncertainty, currency exposure, regulation and correlated technology risks can undermine diversification.',
  },
] as const satisfies readonly ResearchCollection[];
export const PLAN_FAMILIES = [
  {
    name: 'Reserve',
    objective: 'Explore liquidity and capital-preservation objectives.',
    considerations:
      'Liquidity constraints, credit quality and inflation risk. Capital is not guaranteed.',
  },
  {
    name: 'Income',
    objective: 'Explore an emphasis on potential distributions.',
    considerations: 'Credit, interest-rate and distribution risk. Income is not guaranteed.',
  },
  {
    name: 'Balanced',
    objective: 'Explore a mix of growth and income objectives.',
    considerations:
      'Allocation, correlation and market risk. Diversification does not prevent loss.',
  },
  {
    name: 'Growth',
    objective: 'Explore long-term capital-appreciation objectives.',
    considerations:
      'Volatility, concentration and loss risk. A longer horizon does not assure returns.',
  },
] as const;
export const INVEST_FAQS = [
  {
    question: 'Can I invest in these collections today?',
    answer:
      'These public collections are research-only, not funds, securities or purchasable portfolios. No investment product is offered through this catalog. Any available product must be confirmed in your account with its terms, eligibility, risks and documentation.',
  },
  {
    question: 'What are Reserve, Income, Balanced and Growth?',
    answer:
      'They are proposed plan families for exploring different objectives. They are product concepts, not available plans, recommendations or promises of return. Final structures, fees, assets and availability have not been established here.',
  },
  {
    question: 'What happens when I get started?',
    answer:
      'You continue to the existing Neptlium Capital sign-up experience. Creating an account does not establish eligibility or guarantee access to an investment product.',
  },
  {
    question: 'Is research personalized investment advice?',
    answer:
      'No. This material is educational and does not consider your circumstances, objectives or tolerance for loss. Consider independent professional advice before making investment decisions.',
  },
] as const;
