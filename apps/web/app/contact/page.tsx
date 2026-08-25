import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
import { DisclosureNote } from '@/components/ui/disclosure-note';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact Neptlium',
  description: 'Contact Neptlium for platform, company and institutional enquiries.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Start a conversation with Neptlium."
        intro="Questions about the platform, company or how Neptlium could fit your organization? Use the contact channel below."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <Section tone="surface">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-ink">Contact Neptlium</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Email is our direct public contact channel. Please do not send passwords, private keys,
            recovery material or other sensitive authentication information by email.
          </p>
          <a href={`mailto:${SITE.supportEmail}`} className="button mt-6">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {SITE.supportEmail}
          </a>
          <div className="mt-10">
            <DisclosureNote>
              Information presented by Neptlium is for informational purposes and does not constitute
              investment advice.
            </DisclosureNote>
          </div>
        </div>
      </Section>
    </>
  );
}
