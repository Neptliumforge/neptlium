/**
 * Legal document registry.
 *
 * Every document except the accessibility statement is a DRAFT that has not
 * been approved by counsel. Drafts render a visible review banner, carry a
 * version and revision date, have no effective date and are excluded from
 * search indexing. Facts the owner or counsel must supply (contracting
 * entity, governing law, regulatory status, official complaints contact and
 * similar) are recorded as `pending` items and rendered as unresolved; they
 * must never be replaced with invented values.
 *
 * Provider descriptions follow docs/platform/PROVIDERS.md. Listing a provider
 * describes an integration boundary, not live customer capability.
 */

export type LegalStatus = 'draft' | 'current'

export type LegalSection = {
  /** Stable anchor used by the on-page contents list. */
  id: string
  heading: string
  paragraphs: string[]
  items?: string[]
  /** Facts in this section that require owner/legal confirmation. */
  pending?: string[]
  /** Related legal documents rendered as links after the section. */
  see?: LegalSlug[]
  /** Render the infrastructure provider table in this section. */
  providers?: boolean
}

export type LegalDoc = {
  slug: string
  path: `/${string}`
  title: string
  /** Short label for footer and cross-document navigation. */
  navLabel: string
  intro: string
  version: string
  status: LegalStatus
  /** ISO date of the latest revision of this text. */
  lastRevised: string
  /** ISO date the document takes effect; null until approved. */
  effectiveDate: string | null
  sections: LegalSection[]
}

export type ProviderDisclosure = {
  name: string
  role: string
  state: string
  description: string
}

export const LEGAL_REVISION_DATE = '2026-10-21'
const DRAFT_VERSION = '0.2 (draft)'

export const SUPPORT_EMAIL = 'support@neptlium.com'

const PENDING = {
  entity:
    'Registered legal name, entity type, registration number and registered address of the Neptlium entity that provides the services.',
  governingLaw:
    'Governing law, courts or arbitration forum, and any dispute-resolution, class-action or jury-waiver terms.',
  regulatory:
    'Regulatory status: any licence, registration or exemption relied on, the regulator name and the reference number. None is claimed until confirmed.',
  effectiveDate: 'Effective date and the approval record for this document.',
  noticeAddress: 'Address for formal legal notices.',
  eligibility: 'Eligible and restricted jurisdictions and minimum age for each product.',
  fees: 'Approved fee schedule, charging basis and where it is published.',
  liability: 'Approved limitation-of-liability and indemnity wording, including any cap.',
  controller: 'Data controller identity and privacy contact (and any data protection officer or local representative).',
  lawfulBasis: 'Applicable privacy laws and the lawful bases relied on for each processing purpose.',
  retention: 'Retention periods for each category of record.',
  transfers: 'International transfer safeguards for each service provider.',
  emailProvider: 'Transactional email provider for non-authentication notices.',
  paperCopies: 'Whether paper copies are available, how to request them and any fee.',
  esign: 'Jurisdictions in which this consent is relied on and the statutory disclosures they require.',
  cookieInventory: 'Exact cookie names, lifetimes and any consent mechanism for each production domain.',
  kycProvider: 'Identity verification provider and the verification steps required for each product.',
  sanctionsList: 'Sanctions lists screened, restricted jurisdictions and screening provider.',
  amlRegistration: 'Any AML registration held (for example as a money services business) and the designated compliance officer.',
  complaintsContact: 'Official complaints address, acknowledgement and resolution timeframes.',
  ombudsman: 'External escalation route (ombudsman, regulator or dispute body), if any applies.',
  supportHours: 'Support hours and response commitments.',
  protection: 'Confirmation that no deposit-insurance or investor-protection scheme applies, or the exact scheme and limits that do.',
} as const

/**
 * Infrastructure providers named in customer documents. States are written
 * conditionally and must stay aligned with docs/platform/PROVIDERS.md.
 */
export const PROVIDER_DISCLOSURES: readonly ProviderDisclosure[] = [
  {
    name: 'Supabase',
    role: 'Authentication and database infrastructure',
    state: 'Used for sign-in',
    description:
      'Supabase Auth verifies sign-in and keeps you signed in to Neptlium accounts. Supabase-hosted PostgreSQL stores account and application records where configured. Signing in proves who you are; it does not by itself give access to money movement or administrative actions.',
  },
  {
    name: 'Vercel',
    role: 'Website and application hosting',
    state: 'Used for hosting',
    description:
      'Neptlium websites and applications are served through Vercel, which processes technical request information such as IP address, browser type and request time in order to deliver pages.',
  },
  {
    name: 'Stripe',
    role: 'Payment and billing infrastructure',
    state: 'Limited: billing notifications only',
    description:
      'Neptlium software can receive subscription-billing notifications from Stripe. Stripe is not used to fund Neptlium Capital accounts. Card or bank funding through Stripe is not offered unless a product page and this document are updated to say so.',
  },
  {
    name: 'Circle',
    role: 'Digital-asset wallet infrastructure',
    state: 'Integrated; availability not established',
    description:
      'Neptlium systems include integration with Circle wallet infrastructure. Whether a wallet feature is available to you is shown in your account, not by this list. A balance reported by Circle is not your Neptlium balance until it has been recorded and reconciled by Neptlium.',
  },
  {
    name: 'Alchemy',
    role: 'Blockchain data infrastructure',
    state: 'Used where configured',
    description:
      'Alchemy may be used to read public blockchain data, such as whether a transaction has been confirmed. Observing a transaction on a network is evidence for review; it does not by itself credit, settle or reconcile your account.',
  },
  {
    name: 'Resend',
    role: 'Email delivery infrastructure',
    state: 'Not integrated',
    description:
      'Neptlium does not currently send email through Resend. If Neptlium adopts Resend or another email provider, this document will be updated before that provider processes your information.',
  },
  {
    name: 'Mercury',
    role: 'Banking infrastructure',
    state: 'Not integrated',
    description:
      'Neptlium does not currently hold or move customer funds through Mercury and does not offer bank accounts. If a banking provider is introduced, the provider, the account relationship and any protections will be disclosed before it is offered to you.',
  },
]

const DRAFT_META = {
  version: DRAFT_VERSION,
  status: 'draft',
  lastRevised: LEGAL_REVISION_DATE,
  effectiveDate: null,
} as const

const terms: LegalDoc = {
  slug: 'terms',
  path: '/terms',
  title: 'Terms of Service',
  navLabel: 'Terms',
  intro:
    'These terms describe how you may use Neptlium websites, Neptlium Capital and Neptlium Treasury, and what each side is responsible for. This is a draft pending legal review and is not yet in effect.',
  ...DRAFT_META,
  sections: [
    {
      id: 'about',
      heading: 'About these terms',
      paragraphs: [
        'These terms will form an agreement between you and Neptlium when you create an account or use Neptlium services. Product-specific terms, risk disclosures and the Privacy Policy form part of the agreement where they apply.',
        'Until this document shows an effective date, it is a draft that describes intended terms. It does not replace any agreement you have signed with Neptlium.',
      ],
      pending: [PENDING.effectiveDate],
    },
    {
      id: 'provider',
      heading: 'Who provides the services',
      paragraphs: [
        '“Neptlium”, “we” and “us” refer to the Neptlium entity that provides the services. Its legal name and registered details will be stated here once confirmed.',
        'Neptlium does not claim to hold any banking, money-transmission, securities, investment-advisory or other financial licence or registration. Any licence or registration that applies will be named here, with the regulator and reference number, before it is relied on.',
      ],
      pending: [PENDING.entity, PENDING.regulatory],
    },
    {
      id: 'eligibility',
      heading: 'Eligibility and your account',
      paragraphs: [
        'You must be legally able to enter into a binding agreement and must give accurate, current information about yourself or the organization you represent. Each Neptlium Capital account belongs to one individual. Neptlium Treasury accounts belong to an organization and are used by people the organization authorizes.',
        'Products may be available only in some locations or to some customers. Neptlium may ask for identity information and may decline or limit an account where eligibility, verification or legal requirements are not met.',
      ],
      pending: [PENDING.eligibility],
    },
    {
      id: 'security',
      heading: 'Signing in and keeping your account secure',
      paragraphs: [
        'You sign in through Neptlium’s authentication service. Keep your password, verification codes and devices secure, and do not share them. Neptlium will never ask you for your password or a one-time code by email, message or phone.',
        'Tell us promptly at ' + SUPPORT_EMAIL + ' if you believe your account has been accessed without permission. Signing in confirms your identity only; sensitive actions are separately checked by Neptlium’s servers against your account, role and policy.',
      ],
    },
    {
      id: 'services',
      heading: 'What the services are',
      paragraphs: [
        'Neptlium provides software for individuals (Neptlium Capital) and organizations (Neptlium Treasury) to view, organize and, where available, act on capital. The public website is for information only.',
        'Some features are available, some are limited and some are in development or unavailable. Your account shows what is available to you. A feature described on the website or in documentation is not an offer to provide it.',
      ],
    },
    {
      id: 'records',
      heading: 'Account records and transaction status',
      paragraphs: [
        'Neptlium shows the status of each request in plain terms. These states mean different things and one does not imply the next:',
      ],
      items: [
        'Pending or requested — Neptlium has received the request; nothing has moved yet.',
        'Approved — the request has passed Neptlium’s checks; it has not necessarily been sent.',
        'Submitted — the request has been sent to the relevant network or provider; it has not necessarily completed.',
        'Settled — the network or provider reports completion.',
        'Reconciled — Neptlium has matched the completed transaction to its own records.',
        'Unknown — Neptlium cannot currently confirm the state. Unknown is never shown as zero.',
      ],
    },
    {
      id: 'records-corrections',
      heading: 'Errors and corrections',
      paragraphs: [
        'Information reported by a provider or observed on a blockchain is treated as evidence until Neptlium has recorded and reconciled it. If an account record is wrong, Neptlium corrects it with a visible adjusting entry rather than deleting history. Tell us promptly if you see something you do not recognize.',
      ],
    },
    {
      id: 'money-movement',
      heading: 'Deposits, transfers and withdrawals',
      paragraphs: [
        'Use only the methods your account shows as available, and follow the instructions shown for each request. Do not send funds unless your account displays a deposit address or instruction for that specific request. Digital-asset transfers sent to the wrong address or network may be unrecoverable.',
        'Neptlium may delay, hold, decline or reverse a request where needed for verification, security, fraud prevention, legal obligations or to correct an error. Where the law allows, we will tell you why.',
      ],
    },
    {
      id: 'no-advice',
      heading: 'No investment, legal or tax advice',
      paragraphs: [
        'Information, analysis, models and illustrations in Neptlium are provided to help you understand your position. They are not personal investment, legal, tax or accounting advice, and modeled outcomes are not executed results. You are responsible for your decisions. Investing and digital-asset activity involve risk, including possible loss of principal; see the Financial and Digital Asset Risk Disclosures.',
      ],
      see: ['risk-disclosure'],
    },
    {
      id: 'fees',
      heading: 'Fees',
      paragraphs: [
        'Neptlium has not published a fee schedule. Neptlium intends to show any fee before you confirm the action it applies to. Network, provider or third-party fees may also apply and will be shown where Neptlium can determine them.',
      ],
      pending: [PENDING.fees],
    },
    {
      id: 'third-parties',
      heading: 'Infrastructure providers',
      paragraphs: [
        'Neptlium uses third-party infrastructure for authentication, hosting, data storage, payments and blockchain access. The Privacy Policy lists these providers and what each currently does. Naming a provider does not mean that every feature it could support is offered to you, and a provider’s report is not your Neptlium record until Neptlium has recorded it.',
      ],
      see: ['privacy'],
    },
    {
      id: 'acceptable-use',
      heading: 'Acceptable use',
      paragraphs: ['You agree not to:'],
      items: [
        'use Neptlium for unlawful activity, including fraud, money laundering, terrorist financing or sanctions evasion;',
        'give false information or act for another person without their authority;',
        'access accounts, data or systems you are not authorized to use, or test security without written permission;',
        'interfere with, overload or reverse-engineer the services, except where the law allows; or',
        'use automated tools to scrape or copy content in a way that harms the services.',
      ],
    },
    {
      id: 'suspension',
      heading: 'Suspension and closing your account',
      paragraphs: [
        'You may ask to close your account at any time. Neptlium may restrict, suspend or close an account where these terms are breached, where required by law, or to protect you, other customers or Neptlium. Records Neptlium must keep will be retained after closure as described in the Privacy Policy. Where funds are held, Neptlium will explain how they can be returned.',
      ],
    },
    {
      id: 'ip',
      heading: 'Intellectual property',
      paragraphs: [
        'The Neptlium name, marks, software and content belong to Neptlium or its licensors. You may use them only as needed to use the services.',
      ],
    },
    {
      id: 'liability',
      heading: 'Disclaimers and limitation of liability',
      paragraphs: [
        'The services are provided as available. To the extent the law allows, Neptlium does not promise that the services will be uninterrupted or error-free, and is not responsible for losses caused by networks, providers or events outside its reasonable control. Nothing in these terms limits rights you have under law that cannot be limited.',
      ],
      pending: [PENDING.liability],
    },
    {
      id: 'changes',
      heading: 'Changes to the services and these terms',
      paragraphs: [
        'Neptlium may update the services and these terms. Material changes will be notified in advance through the account or by email as described in the Electronic Communications and E-Delivery terms, and the version and revision date above will change.',
      ],
      see: ['e-delivery'],
    },
    {
      id: 'law',
      heading: 'Governing law and disputes',
      paragraphs: [
        'The governing law and how disputes are resolved will be stated here once confirmed. Before starting a formal dispute, please use the Complaints and Support process so we can try to resolve the issue.',
      ],
      pending: [PENDING.governingLaw],
      see: ['complaints'],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [
        'For questions about these terms, email ' + SUPPORT_EMAIL + '. An address for formal legal notices will be stated here once confirmed.',
      ],
      pending: [PENDING.noticeAddress],
    },
  ],
}

const privacy: LegalDoc = {
  slug: 'privacy',
  path: '/privacy',
  title: 'Privacy Policy',
  navLabel: 'Privacy',
  intro:
    'This policy explains what personal information Neptlium collects, why, who it is shared with and the choices you have. This is a draft pending legal review and is not yet in effect.',
  ...DRAFT_META,
  sections: [
    {
      id: 'scope',
      heading: 'Scope',
      paragraphs: [
        'This policy covers neptlium.com, Neptlium Capital (app.neptlium.com), Neptlium Treasury and communications from Neptlium. It does not cover third-party sites you reach through links.',
      ],
    },
    {
      id: 'controller',
      heading: 'Who is responsible for your information',
      paragraphs: [
        'The Neptlium entity that provides the services is responsible for your personal information. Its legal name, address and privacy contact will be stated here once confirmed. Until then, privacy questions can be sent to ' + SUPPORT_EMAIL + '.',
      ],
      pending: [PENDING.entity, PENDING.controller],
    },
    {
      id: 'collect',
      heading: 'Information we collect',
      paragraphs: ['Depending on how you use Neptlium, we may collect:'],
      items: [
        'Account information you give us: name, email address, country of residence, account type and preferences.',
        'Identity and verification information, where verification is required: such as date of birth, address, government identification and, for organizations, ownership and authorized-user details.',
        'Financial and transaction information: requests you make, their status, wallet addresses you use with Neptlium and related network transaction data. Blockchain transactions are publicly visible on their networks.',
        'Communications: messages you send to support and your communication preferences.',
        'Technical information: IP address, browser and device type, pages requested and timestamps, collected by hosting infrastructure to deliver and protect the service.',
        'Sign-in information: authentication events and session data needed to keep you signed in securely.',
      ],
    },
    {
      id: 'use',
      heading: 'How we use information',
      paragraphs: ['We use personal information to:'],
      items: [
        'create and operate your account and show your records accurately;',
        'verify your identity and keep your account secure;',
        'process and track requests you make, and keep required financial records;',
        'meet legal obligations, including anti-money-laundering, sanctions and record-keeping requirements;',
        'communicate with you about your account, service changes and support requests; and',
        'protect, investigate and improve the services.',
      ],
    },
    {
      id: 'no-sale',
      heading: 'What we do not do',
      paragraphs: [
        'Neptlium does not sell personal information. The public website does not use advertising cookies or third-party advertising trackers.',
      ],
    },
    {
      id: 'lawful-basis',
      heading: 'Legal bases',
      paragraphs: [
        'Where privacy law requires a legal basis, Neptlium expects to rely on performing its agreement with you, complying with legal obligations, its legitimate interests in operating a secure service, and your consent where consent is required.',
      ],
      pending: [PENDING.lawfulBasis],
    },
    {
      id: 'providers',
      heading: 'Infrastructure providers',
      paragraphs: [
        'Neptlium uses the providers below. Each receives only the information it needs for its role. A listed provider is described by what it currently does for Neptlium; inclusion is not a statement that every feature it could support is offered to you.',
      ],
      providers: true,
    },
    {
      id: 'sharing',
      heading: 'When we share information',
      paragraphs: ['We share personal information only:'],
      items: [
        'with infrastructure providers acting on our instructions;',
        'with payment, wallet or blockchain infrastructure where needed to carry out a request you make;',
        'where required by law, regulation, legal process or to protect rights and safety;',
        'as part of a merger, acquisition or reorganization, subject to this policy; or',
        'with your consent or at your direction.',
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      paragraphs: [
        'Neptlium’s providers may process information in the United States and other countries. Where the law requires safeguards for international transfers, Neptlium will rely on recognized mechanisms and describe them here.',
      ],
      pending: [PENDING.transfers],
    },
    {
      id: 'retention',
      heading: 'How long we keep information',
      paragraphs: [
        'We keep information for as long as your account is open and afterwards for as long as needed for legal, regulatory, tax, audit and dispute purposes. Financial records are kept as an unaltered history; corrections are added as new entries rather than by deleting records.',
      ],
      pending: [PENDING.retention],
    },
    {
      id: 'security',
      heading: 'Security',
      paragraphs: [
        'Neptlium encrypts information in transit, checks every sensitive action on its servers rather than relying on the browser, and limits access to sensitive records. Identity documents, where collected, are required to be held in private encrypted storage with short-lived access. No system is completely secure; please report concerns to ' + SUPPORT_EMAIL + '.',
      ],
    },
    {
      id: 'rights',
      heading: 'Your choices and rights',
      paragraphs: [
        'Depending on where you live, you may have rights to access, correct, delete, restrict or object to the use of your information, to receive a copy of it, and to withdraw consent. Some information must be kept for legal reasons even if you ask us to delete it; we will tell you when that applies.',
        'To make a request, email ' + SUPPORT_EMAIL + ' with the subject “Privacy request”. We may need to verify your identity before acting. You may also have the right to complain to a data protection authority.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies and similar technologies',
      paragraphs: ['See the Cookie Policy for the cookies and browser storage Neptlium uses.'],
      see: ['cookie-policy'],
    },
    {
      id: 'children',
      heading: 'Children',
      paragraphs: [
        'Neptlium services are not intended for children, and we do not knowingly collect information from anyone under the minimum age to hold an account.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      paragraphs: [
        'When this policy changes, the version and revision date above will be updated. Material changes will be notified in advance through your account or by email.',
      ],
    },
  ],
}

const risk: LegalDoc = {
  slug: 'risk-disclosure',
  path: '/risk-disclosure',
  title: 'Financial and Digital Asset Risk Disclosures',
  navLabel: 'Risk disclosures',
  intro:
    'Using Neptlium involves financial, digital-asset, provider and technology risks. Read this before you fund an account or act on information in Neptlium. This is a draft pending legal review.',
  ...DRAFT_META,
  sections: [
    {
      id: 'summary',
      heading: 'Key points',
      paragraphs: ['In summary:'],
      items: [
        'You can lose some or all of the money or digital assets you use with Neptlium.',
        'Nothing in Neptlium guarantees a return, a price, a yield or the availability of a feature.',
        'Neptlium accounts are not bank accounts.',
        'Digital-asset transfers are usually irreversible.',
        'A transaction you can see on a network or at a provider is not final in your Neptlium account until Neptlium has recorded and reconciled it.',
      ],
    },
    {
      id: 'loss',
      heading: 'Risk of loss',
      paragraphs: [
        'The value of investments and digital assets can fall as well as rise. Past performance, modeled results and illustrations do not predict future results. Do not commit money you cannot afford to lose.',
      ],
    },
    {
      id: 'protection',
      heading: 'No bank or deposit protection',
      paragraphs: [
        'Neptlium is not a bank and does not claim any banking licence. Unless a specific product disclosure states otherwise in writing, amounts you hold through Neptlium are not bank deposits and are not covered by deposit insurance or investor-protection schemes.',
      ],
      pending: [PENDING.protection, PENDING.regulatory],
    },
    {
      id: 'digital-assets',
      heading: 'Digital-asset risks',
      paragraphs: ['Digital assets carry specific risks, including:'],
      items: [
        'Volatility: prices can change sharply in short periods.',
        'Irreversibility: a transfer sent to the wrong address or the wrong network may be permanently lost.',
        'Stablecoin risk: a stablecoin may lose its intended value or be frozen or redeemed under its issuer’s terms.',
        'Network risk: congestion, fees, outages, forks or changes to network rules can delay, alter or prevent transactions.',
        'Software risk: wallets, smart contracts and integrations can contain defects or be attacked.',
        'Legal risk: the treatment of digital assets differs by jurisdiction and may change.',
      ],
    },
    {
      id: 'provider',
      heading: 'Provider and custody risk',
      paragraphs: [
        'Neptlium relies on third-party infrastructure, which may include wallet, payment and blockchain-data providers. A provider can suffer outages, errors, security incidents, insolvency or regulatory action, and this can delay or prevent access to assets. The Privacy Policy lists the providers Neptlium uses and their current role. Which custody arrangement applies to a specific feature will be disclosed with that feature before you use it.',
      ],
      see: ['privacy'],
    },
    {
      id: 'status',
      heading: 'Timing and status of transactions',
      paragraphs: [
        'Requests move through distinct stages: requested, approved, submitted, settled and reconciled. Each stage can take time, and a request can stop at any of them. Information from networks and providers can be delayed or incomplete. Neptlium shows a status as unknown rather than guessing, and does not treat an unknown amount as zero.',
      ],
    },
    {
      id: 'liquidity',
      heading: 'Liquidity and availability',
      paragraphs: [
        'You may not always be able to withdraw, transfer or sell when you want to. Withdrawals can be delayed by verification, security review, network conditions, provider availability or legal requirements. Features can be limited, paused or withdrawn.',
      ],
    },
    {
      id: 'information',
      heading: 'Information, models and illustrations',
      paragraphs: [
        'Analysis, allocation models, projections and illustrative interfaces help you understand options. They are not advice, are not executed transactions and do not move capital. Data from third parties may be inaccurate or out of date.',
      ],
    },
    {
      id: 'regulatory',
      heading: 'Regulatory and legal risk',
      paragraphs: [
        'Laws affecting financial services and digital assets are changing. Changes may require Neptlium to restrict or stop features, collect more information or change how services work. Neptlium’s regulatory status will be stated here once confirmed; no licence or registration is claimed in this draft.',
      ],
      pending: [PENDING.regulatory],
    },
    {
      id: 'security',
      heading: 'Security and technology risk',
      paragraphs: [
        'Accounts can be targeted by phishing, malware and social engineering. Protect your sign-in details and devices. Neptlium will never ask for your password or one-time codes.',
      ],
    },
    {
      id: 'tax',
      heading: 'Tax',
      paragraphs: [
        'Transactions may have tax consequences. You are responsible for your own tax reporting. Consult a qualified adviser.',
      ],
    },
  ],
}

const eDelivery: LegalDoc = {
  slug: 'e-delivery',
  path: '/e-delivery',
  title: 'Electronic Communications and E-Delivery',
  navLabel: 'E-delivery',
  intro:
    'By agreeing to these terms you consent to receive agreements, disclosures, notices and records from Neptlium electronically. This is a draft pending legal review and is not yet in effect.',
  ...DRAFT_META,
  sections: [
    {
      id: 'consent',
      heading: 'What you are consenting to',
      paragraphs: [
        'You agree that Neptlium may provide communications electronically instead of on paper, and that electronic signatures and records have the same effect as paper ones. Where a law such as the United States Electronic Signatures in Global and National Commerce Act (E-SIGN Act) applies, this consent is intended to satisfy it.',
      ],
      pending: [PENDING.esign],
    },
    {
      id: 'covered',
      heading: 'Communications covered',
      paragraphs: ['This consent covers, where applicable:'],
      items: [
        'these terms, the Privacy Policy, risk disclosures and changes to them;',
        'account notices, security alerts and verification messages;',
        'confirmations and status updates for requests you make;',
        'account statements and records, where Neptlium provides them; and',
        'tax and regulatory documents, where Neptlium is required to provide them and electronic delivery is permitted.',
      ],
    },
    {
      id: 'how',
      heading: 'How we deliver communications',
      paragraphs: [
        'Neptlium may deliver communications in your account, by email to the address on your account, or by posting them on neptlium.com and notifying you. A communication is treated as delivered when it is available in your account or sent to your email address.',
        'Sign-in, verification and password-reset emails are sent through the email delivery of Neptlium’s authentication service, Supabase Auth. Neptlium does not currently send email through Resend. The provider for other notices will be named in the Privacy Policy before it is used.',
      ],
      pending: [PENDING.emailProvider],
      see: ['privacy'],
    },
    {
      id: 'requirements',
      heading: 'What you need',
      paragraphs: ['To receive electronic communications you need:'],
      items: [
        'a current version of a widely used web browser with cookies enabled for Neptlium application domains;',
        'a working email address that you check regularly;',
        'software that can open PDF files; and',
        'the ability to download, save or print communications.',
      ],
    },
    {
      id: 'update',
      heading: 'Keeping your contact details current',
      paragraphs: [
        'Keep your email address up to date in your account. If email to you fails, Neptlium may restrict some features until a working address is provided.',
      ],
    },
    {
      id: 'copies',
      heading: 'Paper copies',
      paragraphs: [
        'You may ask for a copy of any communication by emailing ' + SUPPORT_EMAIL + '. Whether paper copies are available, and any charge for them, will be stated here once confirmed.',
      ],
      pending: [PENDING.paperCopies],
    },
    {
      id: 'withdraw',
      heading: 'Withdrawing consent',
      paragraphs: [
        'You may withdraw consent by emailing ' + SUPPORT_EMAIL + '. Withdrawal applies to communications sent after we process it. Because Neptlium is an online service, withdrawing consent may mean that Neptlium can no longer provide your account, and the account may need to be closed.',
      ],
    },
    {
      id: 'phishing',
      heading: 'Recognizing genuine messages',
      paragraphs: [
        'Neptlium will never ask for your password, one-time codes or private keys by email or message. If you are unsure whether a message is genuine, sign in directly at app.neptlium.com rather than using a link, and report the message to ' + SUPPORT_EMAIL + '.',
      ],
    },
  ],
}

const cookies: LegalDoc = {
  slug: 'cookie-policy',
  path: '/cookie-policy',
  title: 'Cookie Policy',
  navLabel: 'Cookies',
  intro:
    'This policy explains the cookies and browser storage Neptlium uses and how you can control them. This is a draft pending legal review.',
  ...DRAFT_META,
  sections: [
    {
      id: 'what',
      heading: 'What cookies and browser storage are',
      paragraphs: [
        'Cookies are small files a website stores in your browser. Local storage and session storage are similar browser features that keep information on your device. Neptlium uses these only to run the service and remember your preferences.',
      ],
    },
    {
      id: 'website',
      heading: 'Public website (neptlium.com)',
      paragraphs: [
        'The public website does not set advertising or third-party analytics cookies. It stores your appearance choice (Dark, Light or System) in local storage under the name neptlium-theme. This stays on your device until you clear it and is not sent to Neptlium.',
      ],
    },
    {
      id: 'application',
      heading: 'Neptlium Capital and Treasury',
      paragraphs: ['When you sign in, the applications use:'],
      items: [
        'Authentication cookies set by Supabase Auth (named with an sb- prefix) that keep you signed in. They are strictly necessary; without them you cannot sign in. They last for your signed-in session and are refreshed while you remain active.',
        'Appearance preference in local storage (neptlium-theme), as on the website.',
        'Session storage for in-progress requests, where used, so that a request is not submitted twice if a page reloads. It is cleared when the browser tab closes.',
      ],
      pending: [PENDING.cookieInventory],
      see: ['privacy'],
    },
    {
      id: 'hosting',
      heading: 'Hosting',
      paragraphs: [
        'Neptlium’s hosting provider, Vercel, processes technical request information to deliver and protect pages. Neptlium does not use it to build advertising profiles.',
      ],
    },
    {
      id: 'control',
      heading: 'Your choices',
      paragraphs: [
        'You can block or delete cookies and browser storage in your browser settings. Blocking authentication cookies will stop you signing in. Clearing local storage resets your appearance preference to System.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes',
      paragraphs: [
        'If Neptlium adds analytics or other optional cookies, this policy will be updated first and consent will be requested where the law requires it.',
      ],
    },
  ],
}

const amlKyc: LegalDoc = {
  slug: 'aml-kyc',
  path: '/aml-kyc',
  title: 'AML/KYC Policy Summary',
  navLabel: 'AML/KYC',
  intro:
    'This summary explains how Neptlium intends to verify customers and help prevent money laundering, terrorist financing, fraud and sanctions violations, and what that means for you. It is a draft pending legal and compliance review.',
  ...DRAFT_META,
  sections: [
    {
      id: 'purpose',
      heading: 'Purpose of this summary',
      paragraphs: [
        'Financial services can be misused to move the proceeds of crime. Neptlium’s anti-money-laundering (AML) and know-your-customer (KYC) controls are designed to prevent that. This page is a customer summary, not the full internal policy, and it does not state that Neptlium holds any registration or licence.',
      ],
      pending: [PENDING.amlRegistration],
    },
    {
      id: 'individuals',
      heading: 'Verifying individuals',
      paragraphs: [
        'Before some features become available, Neptlium may ask for your full name, date of birth, residential address, government identification number and an image of an identity document, and may ask you to confirm the document belongs to you. Neptlium may use a specialist verification provider for these checks.',
      ],
      pending: [PENDING.kycProvider],
    },
    {
      id: 'organizations',
      heading: 'Verifying organizations',
      paragraphs: [
        'For Neptlium Treasury, Neptlium may ask for the organization’s legal and registration details, its business activity, its beneficial owners and controllers, and the identity of the people authorized to act for it.',
      ],
    },
    {
      id: 'sanctions',
      heading: 'Sanctions screening',
      paragraphs: [
        'Neptlium does not provide services to people, organizations or locations subject to applicable sanctions. Customers, and where relevant counterparties and wallet addresses, may be screened against sanctions lists when they join and on an ongoing basis.',
      ],
      pending: [PENDING.sanctionsList, PENDING.eligibility],
    },
    {
      id: 'monitoring',
      heading: 'Ongoing monitoring',
      paragraphs: [
        'Neptlium reviews account activity for patterns that may indicate fraud, money laundering or other misuse. Where implemented, this may include reviewing the history of digital-asset addresses involved in a transaction. Neptlium may ask you to explain a transaction or provide source-of-funds information.',
      ],
    },
    {
      id: 'restrictions',
      heading: 'Holds, restrictions and closures',
      paragraphs: [
        'Neptlium may delay, hold, reject or reverse a transaction, limit features, or close an account where verification is incomplete, information is inconsistent, a sanctions or risk concern arises, or the law requires it. In some cases the law prevents Neptlium from explaining the reason.',
      ],
    },
    {
      id: 'reporting',
      heading: 'Reporting and record keeping',
      paragraphs: [
        'Where the law requires, Neptlium will report suspicious activity to the appropriate authorities and keep verification and transaction records for the required period.',
      ],
      pending: [PENDING.retention],
    },
    {
      id: 'your-part',
      heading: 'What we ask of you',
      paragraphs: [
        'Provide accurate, complete information and keep it current. Use your account only for yourself or for the organization you are authorized to represent. Do not use Neptlium to send or receive funds for someone else without disclosing it.',
      ],
    },
    {
      id: 'data',
      heading: 'How verification information is protected',
      paragraphs: [
        'Verification information is used for compliance, security and fraud prevention. Neptlium requires identity documents to be held in private encrypted storage with short-lived, limited access. The Privacy Policy explains your rights over this information.',
      ],
      see: ['privacy'],
    },
  ],
}

const complaints: LegalDoc = {
  slug: 'complaints',
  path: '/complaints',
  title: 'Complaints and Support',
  navLabel: 'Complaints',
  intro:
    'How to get help with your account, how to make a complaint, and what happens next. This is a draft pending legal review; formal complaint timeframes and escalation routes are still to be confirmed.',
  ...DRAFT_META,
  sections: [
    {
      id: 'help',
      heading: 'Getting help',
      paragraphs: [
        'For questions about your account or Neptlium services, email ' + SUPPORT_EMAIL + ' from the address on your account. If you can, include what you were trying to do, the page or feature involved, the approximate time and any reference shown on screen.',
        'Never send your password, one-time codes, private keys or full identity documents by email. Neptlium will never ask for them.',
      ],
      pending: [PENDING.supportHours],
    },
    {
      id: 'security',
      heading: 'If you think your account is compromised',
      paragraphs: [
        'Change your password, sign out of other sessions if you can, and email ' + SUPPORT_EMAIL + ' with “Security” in the subject. Tell us about any transaction you do not recognize.',
      ],
    },
    {
      id: 'transactions',
      heading: 'Questions about a transaction',
      paragraphs: [
        'Check the status shown in your account first. Requested, approved, submitted, settled and reconciled are different stages, and a transaction may still be in progress. If something looks wrong, contact us with the reference shown. Neptlium will review its records and the relevant network or provider evidence. Any correction is recorded as a visible adjusting entry.',
      ],
    },
    {
      id: 'complaint',
      heading: 'Making a complaint',
      paragraphs: [
        'If you are unhappy with Neptlium, tell us. Until a dedicated complaints address is confirmed, send complaints to ' + SUPPORT_EMAIL + ' with “Complaint” in the subject. Please include:',
      ],
      items: [
        'your name and the email address on your account;',
        'what happened and when;',
        'any references, screenshots (with sensitive details removed) or correspondence; and',
        'what you would like Neptlium to do.',
      ],
      pending: [PENDING.complaintsContact],
    },
    {
      id: 'process',
      heading: 'What happens next',
      paragraphs: [
        'Neptlium will acknowledge your complaint, investigate it fairly using the records available, and reply in writing with its decision and reasons. If we need more time or information, we will tell you. Complaints and their outcomes are recorded so recurring problems can be fixed.',
      ],
      pending: [PENDING.complaintsContact],
    },
    {
      id: 'escalation',
      heading: 'If you are not satisfied',
      paragraphs: [
        'You can ask for your complaint to be reviewed again by someone not involved in the original decision. Depending on where you live, you may be able to refer a complaint to an external body. Any external route that applies will be named here once confirmed. Nothing in this process affects your legal rights.',
      ],
      pending: [PENDING.ombudsman, PENDING.regulatory],
      see: ['terms'],
    },
    {
      id: 'accessibility',
      heading: 'Accessibility',
      paragraphs: [
        'If you need information in a different format, or have trouble using Neptlium because of an accessibility barrier, see the Accessibility Statement or email ' + SUPPORT_EMAIL + '.',
      ],
      see: ['accessibility'],
    },
  ],
}

const accessibility: LegalDoc = {
  slug: 'accessibility',
  path: '/accessibility',
  title: 'Accessibility Statement',
  navLabel: 'Accessibility',
  version: '1.0',
  status: 'current',
  lastRevised: LEGAL_REVISION_DATE,
  effectiveDate: null,
  intro:
    'Neptlium is committed to building an accessible experience. This statement describes our intended approach and how to reach us.',
  sections: [
    {
      id: 'commitment',
      heading: 'Our commitment',
      paragraphs: [
        'We aim to meet WCAG 2.2 AA guidance across the Neptlium website, including keyboard support, sufficient contrast, semantic structure and reduced-motion support.',
      ],
    },
    {
      id: 'ongoing',
      heading: 'Ongoing work',
      paragraphs: [
        'Accessibility is an ongoing effort. As the platform grows, we will continue to test and improve the experience.',
      ],
    },
    {
      id: 'using',
      heading: 'Using the website',
      paragraphs: [
        'The website is designed to support keyboard navigation, a skip-to-content link, visible focus and your browser’s text-size and zoom controls. Light, Dark and System appearance preferences are intended to help you choose a comfortable reading experience.',
        'Where an interface includes motion, reduced-motion preferences should be respected. Color should support meaning alongside text rather than being the only way information is communicated.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [
        'If you encounter an accessibility barrier, please email ' + SUPPORT_EMAIL + ' so we can address it.',
        'Include the page address, what you were trying to do, the barrier you encountered and your browser or assistive technology if you are comfortable sharing it. A redacted screenshot or description of an alternative format that would help can make the issue easier to understand. Do not send passwords, verification codes or sensitive financial records.',
        'This statement describes our accessibility aims and feedback route. It is not a claim that every page has been independently certified as conforming to an accessibility standard.',
      ],
    },
  ],
}

/** Display order for the legal centre, footer and cross-document navigation. */
export const LEGAL_DOC_ORDER = [
  'terms',
  'privacy',
  'risk-disclosure',
  'e-delivery',
  'cookie-policy',
  'aml-kyc',
  'complaints',
  'accessibility',
] as const

export type LegalSlug = (typeof LEGAL_DOC_ORDER)[number]

export const LEGAL_DOCS: Record<LegalSlug, LegalDoc> = {
  terms,
  privacy,
  'risk-disclosure': risk,
  'e-delivery': eDelivery,
  'cookie-policy': cookies,
  'aml-kyc': amlKyc,
  complaints,
  accessibility,
}

export const LEGAL_CENTER_PATH = '/legal'

export function getLegalDoc(slug: LegalSlug): LegalDoc {
  return LEGAL_DOCS[slug]
}

export function listLegalDocs(): LegalDoc[] {
  return LEGAL_DOC_ORDER.map((slug) => LEGAL_DOCS[slug])
}

/** Unique unresolved facts for a document, in section order. */
export function pendingFacts(doc: LegalDoc): string[] {
  return [...new Set(doc.sections.flatMap((section) => section.pending ?? []))]
}

export function legalStatusLabel(doc: LegalDoc): string {
  return doc.status === 'draft' ? 'Draft — pending legal review' : 'Current'
}

export function formatLegalDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
