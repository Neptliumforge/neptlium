/** Public explanations, not an inventory of enabled financial capabilities. */
export type PageContext = {
  title: string;
  introduction: string;
  sections: readonly { title: string; body: string }[];
  questions: readonly { question: string; answer: string }[];
  links: readonly { label: string; href: string }[];
};

export const PAGE_CONTEXT = {
  '/': {
    title: 'Find the right starting point.',
    introduction: 'Neptlium brings personal capital and organizational finance into one platform. Choose the financial context you need before opening an account or exploring a workflow.',
    sections: [
      { title: 'For your own capital', body: 'Start with Capital to understand available resources, then explore Portfolio for composition, Investments for research context and Allocation for proposed changes. Activity and records give those decisions continuity.' },
      { title: 'For an organization', body: 'Start with Treasury to explore operating liquidity, obligations, counterparties and approvals. Institutional explains the longer-term direction for more complex mandates; Infrastructure introduces the technical surfaces beneath the platform.' },
    ],
    questions: [
      { question: 'Does creating an account activate every product?', answer: 'No. Account access, organization permissions and eligibility for a financial service are separate. Check the applicable product information and terms before relying on a particular transaction, asset or rail.' },
      { question: 'Are the product illustrations live financial information?', answer: 'No. Illustrations explain how information can be organized. They do not show customer assets, actual returns or completed transactions.' },
    ],
    links: [{ label: 'Personal capital', href: '/capital' }, { label: 'Organizational treasury', href: '/treasury' }, { label: 'Questions before starting', href: '/contact' }],
  },
  '/capital': {
    title: 'Give each part of your capital a clear purpose.',
    introduction: 'Capital is the personal financial context within Neptlium. It connects resources, investments and activity without confusing money you can use with money that is invested, reserved or still pending.',
    sections: [
      { title: 'Understand the starting position', body: 'Read available cash, invested exposure and pending activity separately. Consider the account, currency, source and timing behind a value before using it to plan a transfer or investment. An unavailable value is missing information, not a zero balance.' },
      { title: 'Review the next decision', body: 'For any supported Add Funds, Transfer or Withdraw journey, review the source, destination, amount, fees and restrictions presented in the application. Keep the resulting activity record until the outcome is clear. A submitted request is not proof that the destination has received funds.' },
    ],
    questions: [
      { question: 'How is Capital different from Portfolio?', answer: 'Capital explains the personal financial position and the role of cash and movement. Portfolio focuses on the investments, exposures and relationships within that position.' },
      { question: 'Can I assume every displayed amount is withdrawable?', answer: 'No. Invested, reserved, pending and externally reported amounts can have different restrictions. Use the supported availability and withdrawal information for the relevant account.' },
    ],
    links: [{ label: 'Understand your portfolio', href: '/portfolio' }, { label: 'Explore allocation', href: '/allocation' }, { label: 'Read about risk', href: '/risk-disclosure' }],
  },
  '/portfolio': {
    title: 'Read the position behind the total.',
    introduction: 'A useful portfolio view connects what you own with concentration, liquidity, valuation and the reasons for holding it. Those dimensions can change even when the headline value barely moves.',
    sections: [
      { title: 'Composition and concentration', body: 'Look across positions as well as within each one. Several holdings may depend on the same company, sector, currency or economic condition. Category labels help organize a view, but they do not by themselves establish diversification or reduce risk.' },
      { title: 'Valuation and change', body: 'Interpret a value alongside its source and date. Deposits and withdrawals change portfolio value without being investment returns. Compare periods only when the scope, currency, cash flows and calculation method are consistent.' },
    ],
    questions: [
      { question: 'Does a portfolio view recommend what to buy?', answer: 'No. Composition and analysis provide context. A target allocation or illustrative grouping is not personalized advice or an instruction to trade.' },
      { question: 'What if a position has incomplete data?', answer: 'Treat its value or exposure as incomplete until the relevant information is available. Missing prices, stale observations and unresolved activity should not be read as a confirmed loss, zero holding or completed sale.' },
    ],
    links: [{ label: 'Investment context', href: '/investments' }, { label: 'Allocation decisions', href: '/allocation' }, { label: 'Performance interpretation', href: '/products/performance' }],
  },
  '/investments': {
    title: 'Ask better questions before committing capital.',
    introduction: 'Investment research starts with understanding an exposure: what creates value, what could change it and how it fits your objectives and ability to bear loss.',
    sections: [
      { title: 'Understand the investment', body: 'Review the underlying business or asset, ownership rights, fees, liquidity, dealing restrictions and available documentation. Separate a company narrative from a financial claim and distinguish historical observations from expectations about the future.' },
      { title: 'Understand the fit', body: 'Consider your time horizon, need for cash and existing concentration. For any investment actually offered to your account, read the applicable product documents and eligibility conditions before making a decision. A research page is not an offer or a promise of access.' },
    ],
    questions: [
      { question: 'Which investments can I buy through Neptlium?', answer: 'This public page does not establish a catalogue of available investments or venues. Availability must be stated for the specific product, jurisdiction and eligible account through its applicable terms.' },
      { question: 'Does research guarantee a return?', answer: 'No. Research can be incomplete, interpretation can be wrong and market conditions can change. Investing involves possible loss of principal.' },
    ],
    links: [{ label: 'Portfolio relationships', href: '/portfolio' }, { label: 'Learning foundations', href: '/learn' }, { label: 'Investment risks', href: '/risk-disclosure' }],
  },
  '/allocation': {
    title: 'Connect an intended portfolio to real constraints.',
    introduction: 'Allocation is the decision about how capital should be distributed. It starts with purpose and constraints, then compares the present position with an intended arrangement.',
    sections: [
      { title: 'Define the decision', body: 'Start with objectives, time horizon, liquidity needs, concentration limits and restrictions. A proposed allocation should explain why each part belongs and which assumptions would require it to be reconsidered.' },
      { title: 'Review the difference', body: 'Compare the proposal with the current portfolio, including cash needs and the possible costs of change. Keep a modeled difference separate from a transaction request. Only a separately supported and authorized workflow can submit an instruction.' },
    ],
    questions: [
      { question: 'Will a target allocation rebalance my portfolio automatically?', answer: 'A target is a proposed arrangement, not an executed rebalance. This page does not establish automated trading, discretionary management or transaction availability.' },
      { question: 'When should an allocation be reviewed?', answer: 'A change in objectives, obligations, liquidity needs, concentration or the underlying assumptions can justify review. A market movement alone does not determine the right response for every person.' },
    ],
    links: [{ label: 'Current portfolio context', href: '/portfolio' }, { label: 'Capital roles', href: '/products/capital-universe' }, { label: 'Risk considerations', href: '/risk-disclosure' }],
  },
  '/treasury': {
    title: 'Connect liquidity to the work it needs to support.',
    introduction: 'Treasury is the organization financial context within Neptlium. Its product direction connects operating funds, obligations, destinations and the people responsible for decisions.',
    sections: [
      { title: 'Plan around obligations', body: 'Separate available liquidity, reserves, commitments and expected receipts. Consider timing, currency, entity and restrictions when assessing a funding need. An expected receipt should not be treated as available operating cash.' },
      { title: 'Keep responsibility attached', body: 'A useful payment review brings together purpose, counterparty, amount, destination and supporting records. Organization membership, permissions and any applicable approval policy must be established before an action can proceed. Personal account access does not grant authority over organizational funds.' },
    ],
    questions: [
      { question: 'How is Treasury different from Pay?', answer: 'Pay concerns the payment interaction. Treasury concerns the organization’s financial position, obligations and the record of what happened to its money. A payment confirmation alone does not establish reconciled treasury proceeds.' },
      { question: 'Are all currencies, bank rails and stablecoins supported?', answer: 'No universal support is implied. Confirm the specific currency, rail, network, jurisdiction, limits and fees for any service before relying on it.' },
    ],
    links: [{ label: 'Payment lifecycle', href: '/payments' }, { label: 'Treasury coordination', href: '/solutions/treasury-coordination' }, { label: 'Discuss organizational needs', href: '/contact' }],
  },
  '/intelligence': {
    title: 'From a signal to a question worth examining.',
    introduction: 'Intelligence should help you understand what changed and which evidence matters. Its role is decision support, with room for uncertainty and human judgment.',
    sections: [
      { title: 'Keep the source in view', body: 'A useful explanation connects an observation to its source, time period and relevant account, company or activity. Estimates and interpretations need to stay distinguishable from reported facts, especially when information is incomplete or stale.' },
      { title: 'Keep the decision with the decision-maker', body: 'Analysis can identify a concentration, highlight a change or organize a question for review. It does not create permission to trade, move funds or alter an organization’s policy. Any consequential action requires its own supported workflow and authority.' },
    ],
    questions: [
      { question: 'Is an insight personalized investment advice?', answer: 'The public information and conceptual examples here are informational. They are not individualized investment, legal, tax or accounting advice.' },
      { question: 'Can a recommendation execute a transaction?', answer: 'A recommendation is not authorization. No automatic execution capability is established by the intelligence described on this page.' },
    ],
    links: [{ label: 'Evidence and trust', href: '/trust' }, { label: 'Portfolio context', href: '/portfolio' }, { label: 'Learn the terminology', href: '/learn' }],
  },
  '/infrastructure': {
    title: 'Understand the boundary before building an integration.',
    introduction: 'Neptlium Infrastructure connects focused payment interactions, server APIs, developer documentation and service-status information. Each surface has a distinct responsibility within the same platform.',
    sections: [
      { title: 'Choose the appropriate surface', body: 'Use Pay to understand the payment interaction, Docs for published integration contracts and Status for published service information. API access and a public product URL do not by themselves establish permission to use a financial operation.' },
      { title: 'Design for uncertain outcomes', body: 'An integration needs a clear distinction between a request, an acknowledgment and a completed financial result. Before integrating a consequential operation, confirm its documented authentication, permissions, idempotency, event handling, error and recovery requirements.' },
    ],
    questions: [
      { question: 'Can I start processing payments from this page?', answer: 'No. Product information is not merchant approval, an integration credential or payment activation. Confirm that a documented service is available for your intended use before implementation.' },
      { question: 'Where are API contracts and service information?', answer: 'The documentation and status surfaces are linked from this page. Refer to the specific published contract and environment information; do not infer endpoint support from a marketing example.' },
    ],
    links: [{ label: 'Payment concepts', href: '/payments' }, { label: 'Documentation', href: 'https://docs.neptlium.com' }, { label: 'Service status', href: 'https://status.neptlium.com' }],
  },
  '/institutional': {
    title: 'Start with the mandate and operating requirements.',
    introduction: 'The institutional direction addresses organizations whose capital decisions span entities, portfolios, mandates and reporting responsibilities. These are intended product capabilities, not a claim of a live institutional service.',
    sections: [
      { title: 'Make the operating structure explicit', body: 'An institutional conversation starts with who owns the assets, which entities and portfolios are involved, who may act and which limits govern the mandate. Shared human access must not erase separate ownership or responsibilities.' },
      { title: 'Define the evidence needed for oversight', body: 'Discuss valuation sources, reporting periods, liquidity needs, approval requirements and exception handling. Specify how internal records need to relate to external statements and which systems or people are responsible for resolving discrepancies.' },
    ],
    questions: [
      { question: 'Is Institutional available as a live managed service?', answer: 'This page describes a developing product direction. It does not establish custody, discretionary management, brokerage, execution or a regulated investment service.' },
      { question: 'What should an initial inquiry include?', answer: 'Describe the organization type, operating jurisdictions, workflow problem, relevant entity structure and reporting needs. Do not send confidential holdings, credentials or personal records in an initial message.' },
    ],
    links: [{ label: 'Contact Neptlium', href: '/contact' }, { label: 'Organizational Treasury', href: '/treasury' }, { label: 'Platform principles', href: '/platform' }],
  },
  '/platform': {
    title: 'One platform, with clear places for different work.',
    introduction: 'Neptlium connects capital understanding, financial decisions and their records. Product boundaries follow the work people need to do while preserving one platform identity.',
    sections: [
      { title: 'Personal and organizational contexts', body: 'Capital is for personal financial context; Treasury is for organizational finance. Portfolio, Investments, Allocation and Intelligence provide related perspectives. A person may have different responsibilities in each context without combining personal and organizational assets.' },
      { title: 'From context to consequence', body: 'Understanding a position can lead to a proposal, review or supported instruction. The resulting record should distinguish what was requested, authorized, submitted and established by subsequent evidence. A public illustration does not perform any of these actions.' },
    ],
    questions: [
      { question: 'Are these separate companies or accounts with each provider?', answer: 'They are specialized Neptlium surfaces. An external provider’s account or transaction reference does not define the Neptlium customer relationship or establish the meaning of a financial outcome.' },
      { question: 'Where should I go next?', answer: 'Explore Capital for personal needs, Treasury for organizational workflows and Infrastructure for technical context. Contact Neptlium if your requirements do not fit a published product description.' },
    ],
    links: [{ label: 'Capital', href: '/capital' }, { label: 'Treasury', href: '/treasury' }, { label: 'Infrastructure', href: '/infrastructure' }],
  },
  '/payments': {
    title: 'Understand the payment beyond the confirmation screen.',
    introduction: 'A payment connects purpose, payer, recipient and a sequence of financial events. A reliable record needs to explain that sequence, including uncertainty and exceptions.',
    sections: [
      { title: 'Before submission', body: 'Review the recipient, amount, currency, purpose, fees and any required approval in a supported workflow. Payment-method availability, merchant eligibility and transaction limits must be established for the specific service; this page does not offer universal payment acceptance.' },
      { title: 'After submission', body: 'Authorization, capture, settlement, refunds and disputes describe different events. If a submission times out, its outcome may be unknown. Check the existing transaction and seek clarification rather than assuming it failed and creating a second payment.' },
    ],
    questions: [
      { question: 'Does a success screen prove settlement?', answer: 'No. A screen or acknowledgment can describe one stage of processing. Settlement and reconciliation require the relevant financial evidence and records.' },
      { question: 'Does this page establish supported payment methods or merchant pricing?', answer: 'No. Supported methods, merchant terms, fees and activation requirements must be published for the applicable service before they can be relied on.' },
    ],
    links: [{ label: 'Treasury context', href: '/treasury' }, { label: 'Infrastructure', href: '/infrastructure' }, { label: 'Payment questions', href: '/contact' }],
  },
  '/solutions': {
    title: 'Choose the problem you need to resolve.',
    introduction: 'Start with the decision that is difficult today: understanding a financial position or coordinating the resources and responsibilities around an obligation.',
    sections: [
      { title: 'When the picture is fragmented', body: 'Capital visibility helps frame questions about accounts, positions, liquidity and missing context. Begin by identifying which information is needed, where it comes from and what cannot yet be established.' },
      { title: 'When timing and responsibility are unclear', body: 'Treasury coordination brings obligations, expected funding and review responsibilities into the same conversation. Begin with a concrete obligation and work backward through timing, available resources and decision authority.' },
    ],
    questions: [
      { question: 'Do I need both solutions?', answer: 'They address related problems, but the appropriate starting point depends on your context. A personal portfolio question differs from coordinating an organization’s payment obligations.' },
      { question: 'Can Neptlium assess my requirements?', answer: 'Use the contact route to describe the problem, existing workflow and intended outcome. A discussion does not establish product availability or a commitment to provide financial services.' },
    ],
    links: [{ label: 'Capital visibility', href: '/solutions/capital-visibility' }, { label: 'Treasury coordination', href: '/solutions/treasury-coordination' }, { label: 'Discuss a workflow', href: '/contact' }],
  },
  '/solutions/capital-visibility': {
    title: 'Build a useful picture from separate sources.',
    introduction: 'Capital visibility is about knowing what a number represents, how current it is and whether it can support the decision you are considering.',
    sections: [
      { title: 'Start with the decision', body: 'Identify whether you need to understand liquidity, concentration, recent movement or the role of a particular account. Keep currencies, valuation dates, ownership and restrictions visible instead of treating every source as directly comparable.' },
      { title: 'Identify what needs follow-up', body: 'A practical review can reveal stale information, missing positions, an unexplained movement or capital that is committed elsewhere. Resolve those questions before treating a combined view as spendable funds or a complete portfolio.' },
    ],
    questions: [
      { question: 'Does an aggregated view create a new balance?', answer: 'No. Bringing information together does not change ownership, liquidity or the authority of the underlying records.' },
      { question: 'What would a useful outcome look like?', answer: 'A clearer account of what is known, which constraints matter and what must be checked next. Visibility supports a decision; it does not authorize a transaction.' },
    ],
    links: [{ label: 'Capital', href: '/capital' }, { label: 'Portfolio', href: '/portfolio' }, { label: 'Trust principles', href: '/trust' }],
  },
  '/solutions/treasury-coordination': {
    title: 'Work backward from the obligation.',
    introduction: 'A treasury decision has an amount, a due date, an owner and dependencies. Coordination means understanding those relationships before a deadline creates pressure.',
    sections: [
      { title: 'Plan the requirement', body: 'Identify the obligation, entity, currency, destination and required date. Review usable liquidity separately from expected receipts and restricted reserves. Allow for approvals, operating cutoffs and uncertainty in external processing.' },
      { title: 'Review the outcome', body: 'A decision record should explain what was approved and why. Where a supported instruction follows, its later processing, settlement and reconciliation must be tracked separately from the plan and initial approval.' },
    ],
    questions: [
      { question: 'Can projected receipts fund an obligation?', answer: 'A forecast can inform planning, but a projected receipt is not confirmed available cash. Review the source, timing and uncertainty before relying on it.' },
      { question: 'Does coordination replace an organization’s approval policy?', answer: 'No. The applicable membership, permissions, approval responsibilities and financial restrictions continue to govern any consequential action.' },
    ],
    links: [{ label: 'Treasury', href: '/treasury' }, { label: 'Payments', href: '/payments' }, { label: 'Organizational inquiries', href: '/contact' }],
  },
  '/company': {
    title: 'Clarity, integrity and responsible financial decisions.',
    introduction: 'Neptlium’s purpose is to make capital easier to understand and govern across personal and organizational needs. Lasting value depends on the quality of decisions and the honesty of the information supporting them.',
    sections: [
      { title: 'A coherent product', body: 'Financial work crosses accounts, portfolios, liquidity, decisions and records. Neptlium’s direction is to connect those relationships while respecting different ownership and responsibilities, rather than asking people to piece together disconnected product identities.' },
      { title: 'A disciplined standard', body: 'We value clear explanations, explicit limits and human responsibility. Product concepts should be presented as concepts; actual services need appropriate terms, eligibility and evidence. The company should earn trust through useful work and claims people can assess.' },
    ],
    questions: [
      { question: 'Who is Neptlium being built for?', answer: 'Individuals who need clearer capital context, organizations coordinating financial operations and, over time, institutions with more complex mandates and oversight requirements.' },
      { question: 'Where can I obtain company or partnership information?', answer: 'Contact Neptlium with the purpose of your inquiry. Corporate, commercial and regulatory details should be confirmed directly rather than inferred from a repository name or a product illustration.' },
    ],
    links: [{ label: 'Platform direction', href: '/platform' }, { label: 'Media information', href: '/press' }, { label: 'Contact', href: '/contact' }],
  },
  '/contact': {
    title: 'Give us the context needed to understand your question.',
    introduction: 'Use the published support email for product questions, organizational inquiries, media requests and initial security concerns. Choose a clear subject and explain the result you need.',
    sections: [
      { title: 'Product and account questions', body: 'Include the page or product involved, what you were trying to do, the approximate time and a redacted error message if relevant. Send only the minimum information needed to explain the problem. Never include a password, verification code, session token or full payment-card details.' },
      { title: 'Organizational and media inquiries', body: 'Describe your organization or publication, the workflow or subject, relevant jurisdictions and any timing requirements. Initial correspondence should not include confidential portfolios, customer records, private keys or bank credentials.' },
    ],
    questions: [
      { question: 'Should I send a transaction instruction by email?', answer: 'Do not treat public correspondence as a way to authorize a transfer, change a destination or execute a financial action. Use only the supported authenticated workflow for the relevant service.' },
      { question: 'Is there a guaranteed response time?', answer: 'No response-time commitment or round-the-clock support service is established by this page. For a suspected account compromise, do not send credentials while requesting guidance.' },
    ],
    links: [{ label: 'Security information', href: '/security' }, { label: 'Accessibility feedback', href: '/accessibility' }, { label: 'Published service status', href: 'https://status.neptlium.com' }],
  },
  '/security': {
    title: 'Security is also part of how you use the platform.',
    introduction: 'Clear account boundaries and careful handling of sensitive information help protect your work. A product explanation is not a security certification or a guarantee against loss.',
    sections: [
      { title: 'Protect access and verify requests', body: 'Use the intended Neptlium destination and check the address before entering account information. Do not share passwords, verification codes, recovery material or session links. Treat unexpected requests to change a payment destination or bypass review as a reason to pause and verify.' },
      { title: 'Report concerns with limited evidence', body: 'For an initial report, describe the affected page, approximate time, observed behavior and potential impact. Redact personal and financial data. Do not access another person’s records, move funds or disrupt a service to demonstrate a concern.' },
    ],
    questions: [
      { question: 'Does signing in give someone access to organization funds?', answer: 'No. Identity, organization membership and permission for a particular action are separate requirements. A displayed role or an identifier alone is not financial authority.' },
      { question: 'Where should I report a security issue?', answer: 'Use the contact route for initial guidance. This page does not establish a paid bounty, guaranteed response deadline or a separate vulnerability-reporting agreement.' },
    ],
    links: [{ label: 'Contact Neptlium', href: '/contact' }, { label: 'Trust and evidence', href: '/trust' }, { label: 'Risk information', href: '/risk-disclosure' }],
  },
  '/trust': {
    title: 'Know what a statement does—and does not—establish.',
    introduction: 'Trustworthy financial information needs a source, a clear meaning and an honest account of its limits. The same discipline applies to product descriptions and company claims.',
    sections: [
      { title: 'Read financial states carefully', body: 'Pending activity is not settled activity. An external observation can be useful without becoming the final internal record. Missing information should remain visibly unavailable rather than being substituted with a reassuring number or a success message.' },
      { title: 'Read product claims in context', body: 'An illustrative screen explains a design. A capability description explains a purpose. Neither establishes a live service, a guarantee, a license or eligibility. Review the applicable product terms and account information before relying on an operational capability.' },
    ],
    questions: [
      { question: 'Is an illustration a customer example?', answer: 'No. Unless explicitly identified and supported as a real example, product illustrations do not represent customer balances, transactions, performance or endorsements.' },
      { question: 'What should I do when information conflicts?', answer: 'Seek clarification through the relevant product or support route. Do not assume a public page overrides transaction records, account restrictions or applicable service terms.' },
    ],
    links: [{ label: 'Security boundaries', href: '/security' }, { label: 'Risk information', href: '/risk-disclosure' }, { label: 'Ask for clarification', href: '/contact' }],
  },
  '/learn': {
    title: 'Apply the vocabulary to a real decision.',
    introduction: 'The point of precise financial language is practical: understanding what you have, what you intend to do and which facts are still missing.',
    sections: [
      { title: 'Read liquidity and portfolio information together', body: 'Liquidity describes access to resources; a valuation describes an estimated or observed amount at a particular time. A valuable holding may be difficult to sell, and proceeds may not be immediately available. Consider both the source of value and the terms of access.' },
      { title: 'Trace a payment through its lifecycle', body: 'A request records intent. Approval permits the relevant next step. Submission sends an instruction. Later evidence may establish settlement, and reconciliation checks that records agree. A delay or timeout can leave the outcome unknown rather than failed.' },
    ],
    questions: [
      { question: 'Is diversification the same as holding many positions?', answer: 'Not necessarily. Several positions can depend on similar risks. Consider the relationships between exposures rather than relying only on the number of holdings.' },
      { question: 'Are these definitions financial advice?', answer: 'No. They are general educational explanations. Your objectives, circumstances and applicable professional advice matter when making a financial decision.' },
    ],
    links: [{ label: 'Portfolio context', href: '/portfolio' }, { label: 'Payment lifecycle', href: '/payments' }, { label: 'Risk information', href: '/risk-disclosure' }],
  },
  '/insights': {
    title: 'A reading framework for financial decisions.',
    introduction: 'Start with the question, distinguish the available evidence from interpretation and identify what would change the conclusion. The following is general educational context, not a market forecast.',
    sections: [
      { title: 'A larger total can conceal a tighter position', body: 'A portfolio can rise in value while becoming less liquid or more concentrated. Read the total alongside its composition, obligations and accessible reserves. One favorable number does not answer every financial question.' },
      { title: 'Timing is part of financial risk', body: 'An expected receipt and a near-term obligation may have similar amounts but different certainty and timing. A sound review asks when resources can actually be used and what happens if that expectation is delayed.' },
    ],
    questions: [
      { question: 'Where can I find the foundational concepts?', answer: 'Learn explains capital context, portfolio state, allocation intent, review, authorization and the difference between a model and a financial outcome.' },
      { question: 'Can I treat this as a recommendation?', answer: 'No. This educational framework does not recommend a security, asset, allocation or transaction. It provides questions to consider before making a decision.' },
    ],
    links: [{ label: 'Learning foundations', href: '/learn' }, { label: 'Research approach', href: '/research' }, { label: 'Trust principles', href: '/trust' }],
  },
  '/research': {
    title: 'Evaluate the method as well as the conclusion.',
    introduction: 'This page explains the intended research standard. It does not represent a completed research publication, proprietary finding or institutional endorsement.',
    sections: [
      { title: 'A question with a defined scope', body: 'Useful research identifies the question, relevant period, evidence and method. Assumptions, missing observations and limits should remain visible so a reader can assess whether a conclusion applies to another situation.' },
      { title: 'A conclusion open to examination', body: 'A finding should explain the reasoning that connects evidence to interpretation, acknowledge alternative explanations and state what could change the assessment. Scenarios and forecasts need to remain distinguishable from observed outcomes.' },
    ],
    questions: [
      { question: 'Are downloadable original studies available here?', answer: 'No original study is represented as available by this page. Publication links should appear only when the underlying work has been completed and cleared for publication.' },
      { question: 'Does a research theme imply a supported investment?', answer: 'No. A subject can be worth studying without being an available product, recommended asset or executable strategy.' },
    ],
    links: [{ label: 'Educational context', href: '/insights' }, { label: 'Core concepts', href: '/learn' }, { label: 'Research inquiries', href: '/contact' }],
  },
  '/press': {
    title: 'A concise reference for describing Neptlium.',
    introduction: 'Neptlium is a capital operating platform for individuals and institutions. Its product direction connects personal capital, organizational treasury, decision support and financial infrastructure.',
    sections: [
      { title: 'Product names', body: 'Neptlium Capital addresses personal financial context. Neptlium Treasury addresses organizational financial operations. Neptlium Institutional is a developing direction for more complex requirements. Neptlium Infrastructure includes the Pay, API, Docs and Status surfaces.' },
      { title: 'Media requests', body: 'Use the published contact channel to request a company statement, interview or confirmation of a specific fact. Include the publication, subject and deadline. Product illustrations should not be described as real customer accounts or completed financial activity.' },
    ],
    questions: [
      { question: 'Does this page establish funding, licensing or partnership facts?', answer: 'No. Obtain direct confirmation and appropriate supporting material before publishing those details. A product name or technical integration is not evidence of a commercial partnership.' },
      { question: 'Where should I link readers?', answer: 'Use neptlium.com for company and product information. Link to the relevant product page for context rather than suggesting an illustration establishes a currently available service.' },
    ],
    links: [{ label: 'Company', href: '/company' }, { label: 'Product platform', href: '/platform' }, { label: 'Media contact', href: '/contact' }],
  },
  '/pricing': {
    title: 'Understand the commercial terms before using a service.',
    introduction: 'A published product description is not a price quote. This website does not establish public subscription tiers, transaction rates, investment minimums or a free-service commitment.',
    sections: [
      { title: 'What a price needs to explain', body: 'For an available service, review the fee basis, currency, billing period, minimums and any transaction, conversion or external-network costs. Confirm which charges are fixed and which depend on the actual service or transaction.' },
      { title: 'What access needs to explain', body: 'Confirm the contracting party, eligibility, supported geography, product scope and applicable terms. Organization size or account creation alone does not establish approval for a particular financial capability.' },
    ],
    questions: [
      { question: 'Is opening an account a promise that every service is free?', answer: 'No. Do not infer pricing from account access. Review the specific commercial terms before agreeing to a paid service or authorizing a transaction.' },
      { question: 'How do I ask about a commercial requirement?', answer: 'Contact Neptlium with the product, intended workflow and relevant jurisdictions. Do not include confidential account data in an initial pricing inquiry.' },
    ],
    links: [{ label: 'Commercial inquiries', href: '/contact' }, { label: 'Product families', href: '/products' }, { label: 'Risk information', href: '/risk-disclosure' }],
  },
  '/products': {
    title: 'Choose a financial context, then explore its capabilities.',
    introduction: 'The platform combines specialized perspectives without turning each perspective into a separate customer identity or financial system.',
    sections: [
      { title: 'Capital and its connected perspectives', body: 'Capital addresses the personal financial picture. Portfolio describes composition, Investments provides research context and Allocation describes an intended distribution. These are connected questions about the same resources, not interchangeable operations.' },
      { title: 'Organization and infrastructure needs', body: 'Treasury addresses organizational liquidity and controls. Institutional describes more complex future requirements. Infrastructure explains the technical surfaces through which supported capabilities may be accessed.' },
    ],
    questions: [
      { question: 'Which product should an organization choose?', answer: 'Begin with Treasury and use the contact route to discuss any complex entity, mandate, reporting or integration needs. Do not use personal account access as a substitute for organization authorization.' },
      { question: 'Are all described capabilities available?', answer: 'Product direction and financial-service availability are separate. Confirm the applicable account, eligibility and service terms for any operational use.' },
    ],
    links: [{ label: 'Capital', href: '/capital' }, { label: 'Treasury', href: '/treasury' }, { label: 'Institutional', href: '/institutional' }],
  },
  '/products/performance': {
    title: 'Separate investment results from changes in capital.',
    introduction: 'A change in account value can reflect cash flows, price changes, currency movement, fees or incomplete information. Interpretation starts by identifying the source of the change.',
    sections: [
      { title: 'Compare like with like', body: 'Check the period, currency, portfolio scope and valuation sources before comparing results. Deposits and withdrawals should be understood separately from investment gains and losses. Different calculation methods can answer different questions.' },
      { title: 'Keep limitations beside the result', body: 'Stale prices, missing positions and unrecorded flows can affect interpretation. Historical results do not guarantee future outcomes, and a modeled result is not evidence that a customer earned that return.' },
    ],
    questions: [
      { question: 'Does a rise in account value equal investment profit?', answer: 'No. A deposit can raise the value without creating a return. Fees, flows, valuation changes and currency effects need their own context.' },
      { question: 'Is an illustrative chart a track record?', answer: 'No. An illustration or hypothetical example is not actual customer performance and must not be used as evidence of investment results.' },
    ],
    links: [{ label: 'Portfolio', href: '/portfolio' }, { label: 'Learn', href: '/learn' }, { label: 'Risk disclosure', href: '/risk-disclosure' }],
  },
  '/products/capital-universe': {
    title: 'Purpose is a useful lens, not a permission to invest.',
    introduction: 'Capital roles help frame why resources are held and how they relate to a decision. They do not determine what is available to buy or which financial risks are acceptable.',
    sections: [
      { title: 'Connect roles to obligations', body: 'A reserve may support known expenses, while another pool may support a longer-term objective. The role should be considered alongside time horizon, access restrictions and the consequences of needing the resources earlier than expected.' },
      { title: 'Revisit classifications as needs change', body: 'A useful classification can change when an obligation, objective or restriction changes. Reclassifying an amount does not move it, liquidate an investment or remove a legal or operational constraint.' },
    ],
    questions: [
      { question: 'Does the Reserve label mean cash is immediately available?', answer: 'No. Purpose and liquidity are different. Access depends on the actual account, instrument, restrictions and current financial state.' },
      { question: 'Does a Growth label establish a return expectation?', answer: 'No. It describes an intended role, not a promise of growth, a risk rating or a recommendation.' },
    ],
    links: [{ label: 'Allocation', href: '/allocation' }, { label: 'Capital', href: '/capital' }, { label: 'Portfolio', href: '/portfolio' }],
  },
} as const satisfies Readonly<Record<string, PageContext>>;

export type PageContextRoute = keyof typeof PAGE_CONTEXT;
