import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Section, SectionHeader } from '@/components/section'
import { CtaBand } from '@/components/cta-band'
import { SITE } from '@/lib/content/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Neptlium is capital operating infrastructure for modern ownership, bringing portfolio intelligence, digital assets and controlled capital operations into one environment.',
  alternates: { canonical: '/about' },
}

const VALUES = [
  {
    title: 'Structure over activity',
    body: 'We believe capital is served better by organization and clarity than by constant transactional activity.',
  },
  {
    title: 'Visibility over noise',
    body: 'A clear, consolidated view of capital supports better long-term decisions than fragmented tools.',
  },
  {
    title: 'Discipline over speculation',
    body: 'Modeling, review and explicit authorization are designed to keep capital decisions deliberate.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="COMPANY"
        title="Capital, organized for long-term ownership."
        intro="Neptlium is capital operating infrastructure for modern ownership. We bring portfolio intelligence, digital assets, allocation modeling and controlled capital operations into one unified environment."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHeader
            eyebrow="WHY NEPTLIUM"
            title="Designed around capital, not transactions."
            description="Traditional platforms emphasize activity. Neptlium emphasizes the organization, visibility and disciplined direction of capital over time."
          />
          <div className="grid gap-6">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="border-t border-line py-6"
              >
                <h3 className="text-base font-semibold text-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="subtle">
        <SectionHeader
          eyebrow="CONTACT"
          title="Get in touch."
          description="For questions about Neptlium, reach our team directly."
        />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Visit the contact page
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="mono text-sm text-muted hover:text-ink"
          >
            {SITE.supportEmail}
          </a>
        </div>
      </Section>

      <CtaBand />
    </>
  )
}
