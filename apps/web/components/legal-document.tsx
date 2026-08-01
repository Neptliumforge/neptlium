import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
import type { LegalDoc } from '@/lib/content/legal';

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHeader
        eyebrow="LEGAL"
        title={doc.title}
        intro={doc.intro}
        crumbs={[{ label: 'Home', href: '/' }, { label: doc.title }]}
      />

      <Section tone="surface">
        <div className="mx-auto max-w-3xl">
          {doc.draft && (
            <div className="mb-8 border-l-2 border-warning/50 bg-surface-subtle p-4 text-sm text-text">
              Draft for review. This document is a structured informational draft and requires
              review by qualified counsel before public production use.
            </div>
          )}

          <div className="flex flex-col gap-10">
            {doc.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-lg font-semibold text-ink">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
