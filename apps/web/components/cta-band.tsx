import Link from 'next/link'
import { SITE } from '@/lib/content/site'
export function CtaBand({title='Capital deserves an operating environment.',body='Organize capital with greater structure, visibility and explicit control.'}:{title?:string;body?:string}){return <section className="detail-cta"><p className="eyebrow">Neptlium</p><h2>{title}</h2><p>{body}</p><div className="final-actions"><a className="button" href={SITE.accessUrl}>Access Neptlium</a><Link className="text-link" href="/contact">Contact</Link></div></section>}
