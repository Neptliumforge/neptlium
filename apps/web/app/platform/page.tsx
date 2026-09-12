import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CinematicScrollStory } from '@/components/cinematic-scroll-story';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata=createPageMetadata({title:'Platform — Neptlium',description:'One operating environment for the capital you own.',path:'/platform'});

export default function PlatformPage(){return <div className="marketing-home">
  <section className="platform-hero">
    <div><p>Platform</p><h1>One environment for the capital you own.</h1><span>Neptlium connects financial state, operating context and governed work without collapsing their different meanings.</span><Link className="cin-pill cin-pill-light" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel}<ArrowRight aria-hidden="true"/></Link></div>
    <div className="platform-hero-image"><img src="/marketing/overview.webp" alt="Neptlium capital operating environment"/></div>
  </section>
  <CinematicScrollStory/>
  <section className="platform-editorial"><article><h2>See the financial system as it is.</h2><p>Accounts, companies, positions, liquidity and obligations become one evidence-backed picture of current capital state.</p></article><article><h2>Keep context attached.</h2><p>Ownership, intent, constraints, timing and exposure remain visible so the same number can be understood for what it actually represents.</p></article><article><h2>Govern the handoff to action.</h2><p>Analysis, review, authorization and consequence remain explicit rather than disappearing into one generic workflow state.</p></article></section>
  <section className="governance-cinema"><div><p>From observation to consequence</p><h2>A visible state is not permission to change it.</h2></div><div className="governance-sequence">{['Observed','Modeled','Reviewed','Authorized','Consequential'].map((item,index)=><span key={item}>{item}{index<4?<i>→</i>:null}</span>)}</div><Link className="cin-pill cin-pill-light" href="/products">Explore the products<ArrowRight aria-hidden="true"/></Link></section>
</div>}
