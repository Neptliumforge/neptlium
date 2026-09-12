import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function EditorialMarketingPage({eyebrow,title,lead,chapters,cta}:{eyebrow:string;title:string;lead:string;chapters:readonly {title:string;body:string}[];cta?:{label:string;href:string}}){return <div className="editorial-page">
  <section className="editorial-hero"><p>{eyebrow}</p><h1>{title}</h1><span>{lead}</span>{cta?<Link className="cin-pill cin-pill-light" href={cta.href}>{cta.label}<ArrowRight aria-hidden="true"/></Link>:null}</section>
  <section className="editorial-chapters">{chapters.map((chapter,index)=><article key={chapter.title}><span>{String(index+1).padStart(2,'0')}</span><h2>{chapter.title}</h2><p>{chapter.body}</p></article>)}</section>
</div>}
