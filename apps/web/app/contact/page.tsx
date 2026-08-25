import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
import { DisclosureNote } from '@/components/ui/disclosure-note';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact Neptlium and Request Platform Access',
  description:
    'Contact Neptlium for institutional platform, company and access enquiries through the verified public email channel.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Start a conversation with Neptlium."
        intro="For institutional platform, company or access enquiries, use the verified public channel below. Authenticated application access is certified separately from this marketing site."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <Section tone="surface">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-ink">Verified contact channel</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Email is the direct public contact channel for Neptlium. Do not send passwords, private keys,
            recovery material or other sensitive authentication information by email.
          </p>
          <a href={`mailto:${SITE.supportEmail}`} className="button mt-6">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {SITE.supportEmail}
          </a>
          <div className="mt-10">
            <DisclosureNote>
              Information presented by Neptlium is for informational purposes and does not constitute
              investment advice. Product availability is established separately from this public website.
            </DisclosureNote>
          </div>
        </div>
      </Section>
    </>
  );
}
