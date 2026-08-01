import Link from 'next/link';
import { Brand } from './brand';
import { FooterAccordion, SocialIcon } from './footer-interactions';
import { SITE, SOCIALS } from '@/lib/content/site';
// Footer navigation groups: Platform, Explore, Individuals, Institutions, Company, Legal and privacy.
// Social labels use the accessible form: `Neptlium on ${social.name}`.
// Locale selector: Global — English.
const groups = [
  [
    'PLATFORM',
    [
      ['Overview', '/platform'],
      ['Portfolio Intelligence', '/platform'],
      ['Capital Universe', '/capital-universe'],
      ['Allocation', '/platform'],
      ['Capital Account', '/platform'],
      ['Treasury', '/platform'],
      ['Performance', '/platform'],
      ['Activity', '/platform'],
      ['Reports', '/platform'],
    ],
  ],
  [
    'OWNERSHIP',
    [
      ['Digital Assets', '/capital-universe'],
      ['Public Markets', '/capital-universe'],
      ['Tokenized Opportunities', '/capital-universe'],
      ['Reserve Assets', '/capital-universe'],
      ['Capital Classifications', '/capital-universe'],
      ['Portfolio Construction', '/research'],
    ],
  ],
  [
    'RESEARCH',
    [
      ['Research', '/research'],
      ['Capital Allocation', '/research'],
      ['Portfolio Construction', '/research'],
      ['Treasury and Liquidity', '/research'],
      ['Digital Assets', '/capital-universe'],
      ['Public Markets', '/capital-universe'],
      ['Learn', '/research'],
    ],
  ],
  [
    'COMPANY',
    [
      ['About Neptlium', '/company'],
      ['Our Principles', '/company#principles'],
      ['Leadership', '/company#leadership'],
      ['Careers', '/company#careers'],
      ['Security', '/security'],
      ['Trust Center', '/trust'],
      ['Press', '/press'],
      ['Contact', '/contact'],
    ],
  ],
  [
    'SUPPORT',
    [
      ['Access Neptlium', SITE.accessUrl],
      ['Sign In', SITE.signInUrl],
      ['Help Center', '/contact'],
      ['Contact Support', '/contact'],
      ['Account Access', SITE.signInUrl],
    ],
  ],
  [
    'LEGAL',
    [
      ['Privacy Policy', '/privacy'],
      ['Terms and Conditions', '/terms'],
      ['Cookie Policy', '/cookie-policy'],
      ['Cookie Preferences', '/cookie-policy'],
      ['Accessibility', '/accessibility'],
      ['Risk Disclosure', '/risk-disclosure'],
      ['Digital Asset Disclosure', '/risk-disclosure'],
      ['Tokenized Asset Disclosure', '/risk-disclosure'],
    ],
  ],
] as const;
function Links({ links }: { links: readonly (readonly [string, string])[] }) {
  return (
    <div className="footer-links">
      {links.map(([label, href]) => (
        <Link key={label} href={href}>
          {label}
        </Link>
      ))}
    </div>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-top">
          <div className="footer-brand-block">
            <Brand />
            <p>{SITE.positioning}</p>
            <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
          </div>
          <div className="footer-social">
            <p className="eyebrow">CONNECT</p>
            {SOCIALS.map((s) =>
              s.href ? (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Neptlium on ${s.name}`}
                >
                  <SocialIcon name={s.name} />
                  <span>{s.name}</span>
                </a>
              ) : (
                <span
                  key={s.name}
                  className="social-unavailable"
                  aria-label={`${s.name} destination unavailable`}
                >
                  <SocialIcon name={s.name} />
                  <span>{s.name}</span>
                </span>
              ),
            )}
          </div>
        </div>
        <div className="footer-desktop-nav">
          {groups.map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h2>{title}</h2>
              <Links links={links} />
            </nav>
          ))}
        </div>
        <div className="footer-mobile-nav">
          {groups.map(([title, links], i) => (
            <FooterAccordion key={title} id={`footer-group-${i}`} title={title}>
              <Links links={links} />
            </FooterAccordion>
          ))}
        </div>
        <div className="footer-disclosure">
          <p>
            Neptlium provides capital operating infrastructure and access to supported products and
            services. Product availability, supported assets, account capabilities and investor
            eligibility may vary.
          </p>
          <p>
            Nothing on this website constitutes personalized investment, legal, accounting or tax
            advice. Investing involves risk, including possible loss of principal.
          </p>
        </div>
        <div className="footer-base">
          <span>{SITE.copyright}</span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/risk-disclosure">Risk disclosure</Link>
            <Link href="/cookie-policy">Cookie preferences</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
