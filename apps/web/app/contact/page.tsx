import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
import { DisclosureNote } from '@/components/ui/disclosure-note';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Contact | Neptlium',
  description: `Contact the Neptlium team at ${SITE.supportEmail}.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Neptlium."
        intro="For platform, research or company enquiries, use the verified address below."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <Section tone="surface">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-ink">Email us</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Email is the direct contact channel for Neptlium.
          </p>
          <a href={`mailto:${SITE.supportEmail}`} className="button mt-6">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {SITE.supportEmail}
          </a>
          <div className="mt-10">
            <DisclosureNote>
              Information presented by Neptlium is for informational purposes and does not
              constitute investment advice.
            </DisclosureNote>
          </div>
        </div>
      </Section>
    </>
  );
}
