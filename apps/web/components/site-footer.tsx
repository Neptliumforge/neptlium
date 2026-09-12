import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import chrome from './site-chrome.module.css';
import { NAVIGATION } from '@/lib/content/public-architecture';

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Risk Disclosure', href: '/risk-disclosure' },
  { label: 'Accessibility', href: '/accessibility' },
] as const;

const socialLinks = [
  { label: 'X', href: 'https://x.com/Neptlium' },
  { label: 'YouTube', href: 'https://youtube.com/@neptlium?si=fJ7q0r18UCoxjJth' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/neptlium.bsky.social' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@neptlium?_r=1&_t=ZS-98quVuRhCNt' },
] as const;

export function SiteFooter() {
  return (
    <footer className={chrome.footer} aria-label="Neptlium footer">
      <div className={chrome.footerShell}>
        <div className={chrome.footerArchitecture}>
          <div className={chrome.footerIdentity}>
            <Brand />
            <p className={chrome.footerStatement}>
              A capital operating environment for understanding, coordinating and governing what you own.
            </p>
          </div>

          {NAVIGATION.map((section) => (
            <section className={chrome.footerColumn} key={section.label}>
              <Link className={chrome.footerColumnTitle} href={section.href}>
                {section.label}
              </Link>
              <div className={chrome.footerLinks}>
                {section.links
                  .filter((link) => link.href !== section.href)
                  .map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
              </div>
            </section>
          ))}

          <section className={chrome.footerColumn}>
            <span className={chrome.footerColumnTitle}>Socials</span>
            <div className={chrome.footerLinks}>
              {socialLinks.map((social) => (
                <a
                  className={chrome.socialLink}
                  href={social.href}
                  key={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.label}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className={chrome.footerBase}>
          <span>© {new Date().getFullYear()} Neptlium</span>
          <nav className={chrome.legal} aria-label="Legal">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
