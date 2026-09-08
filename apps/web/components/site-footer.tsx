import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './brand';
import chrome from './site-chrome.module.css';

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Risk Disclosure', href: '/risk-disclosure' },
  { label: 'Accessibility', href: '/accessibility' },
] as const;

const socialLinks = [
  { label: 'Bluesky', href: 'https://bsky.app/profile/neptlium.bsky.social' },
  { label: 'X', href: 'https://x.com/Neptlium' },
  { label: 'YouTube', href: 'https://youtube.com/@neptlium?si=fJ7q0r18UCoxjJth' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@neptlium?_r=1&_t=ZS-98quVuRhCNt' },
] as const;

export function SiteFooter() {
  return (
    <footer className={chrome.footer} aria-label="Neptlium footer">
      <div className={chrome.footerShell}>
        <div className={chrome.footerSignature}>
          <div className={chrome.footerIdentity}>
            <Brand />
            <p className={chrome.footerStatement}>
              A capital operating environment for understanding, coordinating and governing what you own.
            </p>
          </div>

          <nav className={chrome.socials} aria-label="Neptlium social channels">
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
          </nav>
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
