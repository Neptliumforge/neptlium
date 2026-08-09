import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'
import { SITE } from '@/lib/content/site'
export function DetailPage({eyebrow,title,intro,sections,visual}:{eyebrow?:string;title:string;intro:string;sections:readonly (readonly [string,string])[];visual?:React.ReactNode}){return <><section className="page-hero"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p>{intro}</p></div></section>{visual && <section className="section product-visual-section">{visual}</section>}<section className="detail-sections">{sections.map(([heading,body],i)=><Reveal key={heading}><article><span>0{i+1}</span><div><h2>{heading}</h2><p>{body}</p></div></article></Reveal>)}</section><section className="detail-cta"><h2>Explore Neptlium.</h2><a className="button" href={SITE.accessUrl}>Get started <ArrowRight/></a><Link href="/platform">Explore the platform</Link></section></>}
