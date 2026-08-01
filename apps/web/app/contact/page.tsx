import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
import { ContactForm } from '@/components/contact-form';
import { DisclosureNote } from '@/components/ui/disclosure-note';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact the Neptlium team at ${SITE.supportEmail}.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="COMPANY"
        title="Contact Neptlium."
        intro="For questions about the platform, capital universe or research, use the verified support address below."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="text-lg font-semibold text-ink">Email us</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The most reliable way to reach us today is by email.
            </p>
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line bg-surface-subtle px-4 py-3 text-sm font-medium text-ink hover:border-accent/40 hover:text-accent-hover"
            >
              <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
              {SITE.supportEmail}
            </a>

            <div className="mt-8">
              <DisclosureNote>
                Information presented by Neptlium is for informational purposes and does not
                constitute investment advice.
              </DisclosureNote>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-ink">Send a message</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Submission infrastructure is not connected. The form below cannot send or store a
              message; use the support email for contact.
            </p>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
