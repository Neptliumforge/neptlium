import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/lib/content/public-architecture';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Platform — Capital Operating Model | Neptlium',
  description: 'Neptlium connects portfolio context, treasury, allocation, capital movement, governance and intelligence while preserving the boundaries between observed, modeled, reviewed, authorized and consequential state.',
  path: '/platform',
});

const lifecycle = [
  ['Observe', 'Establish what the available portfolio, account, provider and treasury evidence says now.'],
  ['Understand', 'Place positions, liquidity, movement and constraints into a common operating context.'],
  ['Model', 'Represent possible target states and capital intent without presenting them as approved or executed outcomes.'],
  ['Review', 'Bring evidence, assumptions and authority into view before a decision becomes consequential.'],
  ['Govern', 'Preserve who may authorize sensitive work and which lifecycle state that work has actually reached.'],
  ['Interpret', 'Return outcomes and updated evidence to the wider capital picture without rewriting history or provenance.'],
] as const;

const principles = [
  ['Connected state', 'Portfolio context, liquidity, allocation and movement are related operating facts. Neptlium is designed to preserve those relationships across product boundaries.'],
  ['Explicit authority', 'A visible balance is not permission to move it. A model is not an instruction. A review is not an execution. The operating model keeps those distinctions legible.'],
  ['Evidence before certainty', 'Provider-reported, internally canonical, derived, modeled and unknown information retain different meanings. The system should not manufacture certainty where evidence does not support it.'],
  ['Consequential boundaries', 'Public presentation and analytical context remain separate from privileged operations. Sensitive work belongs behind authenticated, authorized and auditable service boundaries where supported.'],
] as const;

export default function PlatformPage() {
  return <div className="architecture-page platform-hub">
    <section className="architecture-hero"><div className="web-shell architecture-hero-grid"><div><p className="web-eyebrow on-light">Platform</p><h1>Capital should remain intelligible as it moves.</h1></div><div className="architecture-lead"><p>Neptlium is a capital operating platform designed to keep portfolio context, treasury, allocation, capital movement, governance and intelligence connected without erasing the boundaries between them.</p><p>Its purpose is not to turn every financial activity into one undifferentiated workflow. It is to provide a coherent operating context in which state, evidence, intent, review, authority and consequence can be understood for what they are.</p></div></div></section>

    <section className="architecture-section" aria-labelledby="fragmentation-title"><div className="web-shell architecture-split"><div><p className="web-eyebrow on-light">The operating problem</p><h2 id="fragmentation-title">Fragmentation is not only a data problem.</h2></div><div><p>Capital context is commonly divided across portfolio views, cash and liquidity systems, account records, transfer workflows, allocation models and approval processes. Each surface may be locally useful while the relationships between them remain difficult to reconstruct.</p><p>That separation creates operational ambiguity: whether capital is merely visible or actually available; whether a target is modeled or approved; whether movement is requested, authorized, submitted, settled or reconciled; whether an outcome is provider-reported, calculated or inferred.</p><p>Neptlium is designed to reduce that ambiguity by carrying context across the operating lifecycle rather than treating each handoff as a new source of truth.</p></div></div></section>

    <section className="architecture-section architecture-dark" aria-labelledby="lifecycle-title"><div className="web-shell"><div className="architecture-section-heading"><p className="web-eyebrow">Operating lifecycle</p><h2 id="lifecycle-title">From evidence to consequence, state should remain explicit.</h2></div><ol className="platform-lifecycle">{lifecycle.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></div></section>

    <section className="architecture-section" aria-labelledby="products-title"><div className="web-shell architecture-split"><div><p className="web-eyebrow on-light">Product architecture</p><h2 id="products-title">Defined responsibilities within one operating context.</h2><p>Capital Account, Treasury, Allocation and Portfolio Intelligence address different parts of capital work. Their value compounds when account state can inform liquidity, liquidity can constrain allocation, and portfolio context can inform interpretation without any product claiming authority it does not possess.</p></div><div className="platform-map">{PRODUCTS.slice(0,4).map((product,index)=><div key={product.href}><span>{String(index+1).padStart(2,'0')}</span><strong>{product.label}</strong><p>{product.description}</p></div>)}</div></div></section>

    <section className="architecture-section" aria-labelledby="principles-title"><div className="web-shell architecture-split"><div><p className="web-eyebrow on-light">Operating principles</p><h2 id="principles-title">A coherent system depends on disciplined distinctions.</h2></div><div className="architecture-numbered-list">{principles.map(([title,body],index)=><article key={title}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></div></section>

    <section className="architecture-cta architecture-dark"><div className="web-shell architecture-cta-inner"><div><p className="web-eyebrow">Product family</p><h2>See how each product carries a defined part of the operating model.</h2></div><Link className="web-button secondary" href="/products">Explore products <ArrowRight aria-hidden="true" /></Link></div></section>
  </div>;
}
