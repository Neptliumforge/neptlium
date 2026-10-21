import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Section } from '@/components/section'
import {
  LEGAL_CENTER_PATH,
  PROVIDER_DISCLOSURES,
  formatLegalDate,
  getLegalDoc,
  legalStatusLabel,
  listLegalDocs,
  pendingFacts,
  type LegalDoc,
} from '@/lib/content/legal'
import styles from './legal-document.module.css'

function DocumentStatus({ doc }: { doc: LegalDoc }) {
  return (
    <dl className={styles.status} aria-label="Document status">
      <div>
        <dt>Version</dt>
        <dd>{doc.version}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{legalStatusLabel(doc)}</dd>
      </div>
      <div>
        <dt>Last revised</dt>
        <dd>
          <time dateTime={doc.lastRevised}>{formatLegalDate(doc.lastRevised)}</time>
        </dd>
      </div>
      {doc.status === 'draft' && (
        <div>
          <dt>Effective date</dt>
          <dd>
            {doc.effectiveDate ? (
              <time dateTime={doc.effectiveDate}>{formatLegalDate(doc.effectiveDate)}</time>
            ) : (
              'Not yet in effect'
            )}
          </dd>
        </div>
      )}
    </dl>
  )
}

function PendingList({ facts }: { facts: string[] }) {
  return (
    <ul className={styles.pendingList}>
      {facts.map((fact) => (
        <li key={fact}>{fact}</li>
      ))}
    </ul>
  )
}

function ProviderTable() {
  return (
    <div className={styles.providers}>
      {PROVIDER_DISCLOSURES.map((provider) => (
        <div className={styles.provider} key={provider.name}>
          <div className={styles.providerHead}>
            <h3>{provider.name}</h3>
            <span className={styles.providerState}>{provider.state}</span>
          </div>
          <p className={styles.providerRole}>{provider.role}</p>
          <p>{provider.description}</p>
        </div>
      ))}
    </div>
  )
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const unresolved = pendingFacts(doc)
  const related = listLegalDocs().filter((other) => other.slug !== doc.slug)

  return (
    <>
      <PageHeader
        eyebrow="LEGAL"
        title={doc.title}
        intro={doc.intro}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Legal', href: LEGAL_CENTER_PATH },
          { label: doc.title },
        ]}
      />

      <Section tone="surface">
        <div className={styles.layout}>
          <aside className={styles.aside}>
            <DocumentStatus doc={doc} />
            <nav className={styles.contents} aria-label="On this page">
              <details>
                <summary className={styles.label}>
                  On this page <span>({doc.sections.length} sections)</span>
                </summary>
                <ol>
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.heading}</a>
                  </li>
                ))}
                {unresolved.length > 0 && (
                  <li>
                    <a href="#pending-confirmation">Awaiting confirmation</a>
                  </li>
                )}
                </ol>
              </details>
            </nav>
          </aside>

          <article className={styles.article} aria-label={doc.title}>
            {doc.status === 'draft' && (
              <div className={styles.notice} role="note" aria-label="Draft notice">
                <strong>Draft for review.</strong> This document has not been approved by
                legal counsel and is not yet in effect. Items marked “To be confirmed” are
                facts Neptlium has not yet established; they are left open rather than
                assumed.
              </div>
            )}

            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {section.items && (
                  <ul className={styles.items}>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.providers && <ProviderTable />}
                {section.pending && section.pending.length > 0 && (
                  <div className={styles.pending}>
                    <p className={styles.label}>To be confirmed</p>
                    <PendingList facts={section.pending} />
                  </div>
                )}
                {section.see && (
                  <p className={styles.see}>
                    See{' '}
                    {section.see.map((slug, index) => {
                      const target = getLegalDoc(slug)
                      return (
                        <span key={slug}>
                          {index > 0 && ', '}
                          <Link href={target.path}>{target.title}</Link>
                        </span>
                      )
                    })}
                    .
                  </p>
                )}
              </section>
            ))}

            {unresolved.length > 0 && (
              <section id="pending-confirmation" className={styles.section}>
                <h2>Awaiting confirmation</h2>
                <p>
                  These facts must be confirmed by Neptlium’s owner or legal counsel before
                  this document can take effect. Nothing on this page should be read as
                  establishing them.
                </p>
                <PendingList facts={unresolved} />
              </section>
            )}

            <nav className={styles.related} aria-label="Other legal documents">
              <p className={styles.label}>Other legal documents</p>
              <ul>
                <li>
                  <Link href={LEGAL_CENTER_PATH}>All legal documents</Link>
                </li>
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link href={other.path}>{other.title}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </article>
        </div>
      </Section>
    </>
  )
}

export function LegalCenter() {
  const docs = listLegalDocs()
  return (
    <>
      <PageHeader
        eyebrow="LEGAL"
        title="Legal documents"
        intro="Terms, policies and disclosures that apply to Neptlium websites, Neptlium Capital and Neptlium Treasury."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Legal' }]}
      />
      <Section tone="surface">
        <div className={styles.center}>
          <div className={styles.notice} role="note" aria-label="Review status">
            <strong>Review status.</strong> Documents marked as drafts have not been approved by
            legal counsel and are not yet in effect. Each document shows its version, status,
            revision date and the facts still awaiting confirmation.
          </div>
          <ul className={styles.cards}>
            {docs.map((doc) => (
              <li key={doc.slug} className={styles.card}>
                <h2>
                  <Link href={doc.path}>{doc.title}</Link>
                </h2>
                <p>{doc.intro}</p>
                <p className={styles.cardMeta}>
                  <span>Version {doc.version}</span>
                  <span>{legalStatusLabel(doc)}</span>
                  <span>
                    Revised{' '}
                    <time dateTime={doc.lastRevised}>{formatLegalDate(doc.lastRevised)}</time>
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  )
}
