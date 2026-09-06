import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({ title: 'Learn — Capital Operating Concepts | Neptlium', description: 'Learn the operating vocabulary behind capital context, treasury, allocation intent, portfolio state, provider evidence, modeling, review, authorization and financial consequence.', path: '/learn' });

const concepts = [
 ['Capital context','The relationships that explain where capital stands, what role it serves, what constraints apply and which evidence supports the current view.'],
 ['Portfolio state','A representation of composition and related portfolio context at a point or period, with source and authority retained where known.'],
 ['Treasury context','Liquidity, reserves, funding requirements and readiness considered alongside the portfolio activity and obligations they support.'],
 ['Allocation intent','A proposed way to organize or position capital. Intent can be modeled and reviewed without becoming an instruction, authorization or outcome.'],
 ['Provider evidence','Information reported by an external provider or consequential system. Its provenance matters and should not be silently rewritten as another kind of state.'],
 ['Modeled state','A calculated, hypothetical or proposed representation used to reason about what may change. It is not evidence that capital has moved.'],
 ['Authoritative state','State supported by the system or evidence designated to establish that fact for the relevant operating purpose. Authority is contextual, not decorative.'],
 ['Review','The deliberate examination of evidence, assumptions, constraints and proposed work before an authorization boundary is crossed.'],
 ['Authorization','The identity, permission and policy boundary that permits a sensitive operation to proceed. Authorization does not itself prove execution or settlement.'],
 ['Financial consequence','A state in which an action has produced or is producing a real financial effect. Requested, approved, submitted, settled and reconciled remain different lifecycle states.'],
] as const;

export default function LearnPage(){return <div className="learn-editorial-page">
<section className="learn-editorial-hero"><div className="web-shell learn-editorial-hero-grid"><div><p className="web-eyebrow on-light">Learn</p><h1>A precise operating vocabulary makes capital easier to govern.</h1></div><div><p>Capital systems become ambiguous when the same words are used for observation, intention and outcome. Neptlium uses explicit state language so users can reason about what is known, what is proposed, what has been reviewed and what has actually become consequential.</p><p>These definitions describe the product model. They do not imply that every capability, provider or financial action is available in every environment.</p></div></div></section>
<section className="learn-definition-ledger" aria-labelledby="definitions-title"><div className="web-shell"><div className="learn-definition-heading"><span>Foundations</span><h2 id="definitions-title">Ten concepts for keeping capital state legible.</h2></div><dl>{concepts.map(([term,definition],index)=><div key={term}><dt><span>{String(index+1).padStart(2,'0')}</span>{term}</dt><dd>{definition}</dd></div>)}</dl></div></section>
<section className="learn-principle architecture-dark"><div className="web-shell learn-principle-grid"><p className="web-eyebrow">Working principle</p><div><h2>Observed is not modeled. Proposed is not approved. Authorized is not settled.</h2><p>The operating model is designed to preserve these distinctions because financial information becomes less trustworthy when lifecycle states inherit authority from one another without evidence.</p></div></div></section>
<section className="learn-paths"><div className="web-shell learn-paths-grid"><div><h2>Continue from vocabulary to system architecture.</h2></div><div className="inline-links"><Link href="/platform">Platform</Link><Link href="/products">Products</Link><Link href="/trust">Trust</Link></div><Link className="text-arrow-link" href="/platform">Explore the operating model <ArrowRight aria-hidden="true" /></Link></div></section>
</div>}
