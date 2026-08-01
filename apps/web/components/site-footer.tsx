import Link from 'next/link'
import { Brand } from './brand'
import { SITE } from '@/lib/content/site'
const groups=[['Platform',[['Platform','/platform'],['Capital Universe','/capital-universe'],['Security','/security']]],['Company',[['About','/about'],['Research','/research'],['Contact','/contact']]],['Legal',[['Privacy','/privacy'],['Terms','/terms'],['Cookie Policy','/cookie-policy'],['Accessibility','/accessibility'],['Risk Disclosure','/risk-disclosure']]]] as const
export function SiteFooter(){return <footer className="site-footer"><div className="footer-grid"><div><Brand/><p>{SITE.positioning}</p><a href={'mailto:'+SITE.supportEmail}>{SITE.supportEmail}</a></div>{groups.map(([title,links])=><nav key={title} aria-label={title}><h2>{title}</h2>{links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav>)}</div><div className="footer-base"><span>{SITE.copyright}</span><span>Information only. Not investment advice.</span></div></footer>}

