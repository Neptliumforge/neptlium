import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RESOURCES } from '@/lib/content/public-architecture';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({ title: 'Resources — Capital Operating Knowledge | Neptlium', description: 'Neptlium Resources publishes product concepts, operating principles, research, security boundaries and trust information with evidence appropriate to each subject.', path: '/resources' });

const resourceRoles = [
 ['Learn','Operating vocabulary','Definitions and explanations for capital context, treasury, allocation intent, lifecycle state, evidence, review, authorization and financial consequence.'],
 ['Research','Substantive analysis','A reserved publication surface for dated Neptlium research when verified work is available. No publication is implied before it exists.'],
 ['Security','System boundaries','How authentication, authorization, client boundaries, privileged operations and service responsibilities are represented where supported by the platform architecture.'],
 ['Trust','Product truth','How Neptlium communicates financial information, uncertainty, evidence, authority, limitations and risk without manufacturing certainty.'],
] as const;

export default function ResourcesPage(){return <div className="architecture-page resources-hub">
<section className="architecture-hero"><div className="web-shell architecture-hero-grid"><div><p className="web-eyebrow on-light">Resources</p><h1>Operating knowledge should carry the same discipline as operating state.</h1></div><div className="architecture-lead"><p>Neptlium publishes resources to explain the concepts, boundaries and reasoning behind the platform. The objective is not content volume. It is to make capital operating language, security responsibilities and product truth easier to inspect.</p><p>Different subjects require different forms of evidence. Educational material can explain durable concepts; security material should describe supported architecture; trust material should state limitations; research should exist only when substantive work has actually been published.</p></div></div></section>
<section className="architecture-section" aria-labelledby="roles-title"><div className="web-shell"><div className="architecture-section-heading"><p className="web-eyebrow on-light">Knowledge architecture</p><h2 id="roles-title">Four resource surfaces with different responsibilities.</h2></div><div className="resource-ledger">{resourceRoles.map(([title,role,body],index)=>{const d=RESOURCES.find(r=>r.label===title);if(!d)return null;return <Link href={d.href} key={title}><span>{String(index+1).padStart(2,'0')}</span><div><small>{role}</small><h3>{title}</h3><p>{body}</p></div><ArrowRight aria-hidden="true" /></Link>})}</div></div></section>
<section className="architecture-section architecture-dark"><div className="web-shell architecture-split"><div><p className="web-eyebrow">Publishing discipline</p><h2>Authority should be earned by evidence, not presentation.</h2></div><div className="architecture-prose"><p>Neptlium does not use a polished public surface as a substitute for underlying proof. Certifications, controls, integrations, research findings, customer outcomes and press coverage should appear only when they are verified and appropriate to disclose.</p><p>That same discipline applies to financial concepts: provider evidence, canonical state, modeled interpretation and consequential outcomes should not inherit each other’s authority simply because they appear in the same interface.</p></div></div></section>
<section className="architecture-cta"><div className="web-shell architecture-cta-inner"><h2>Start with the operating vocabulary.</h2><Link className="web-button primary" href="/learn">Explore Learn <ArrowRight aria-hidden="true" /></Link></div></section>
</div>}
