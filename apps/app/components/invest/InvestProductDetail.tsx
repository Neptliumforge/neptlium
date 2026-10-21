import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { InvestProductDetail } from '@/lib/api/invest';
import { AvailabilityBadge } from './InvestCatalogView';
import {
  availabilityPresentation,
  eligibilityLabels,
  familyPresentation,
  formatBasisPoints,
  jurisdictionNames,
  returnFigureLabels,
  termsRows,
} from './catalog-presentation';

function Section({
  id,
  label,
  title,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="op-panel invest-detail-section" aria-labelledby={id}>
      <div className="op-section-heading">
        <div>
          <span>{label}</span>
          <h2 id={id}>{title}</h2>
        </div>
      </div>
      <div className="invest-detail-body">{children}</div>
    </section>
  );
}

export function InvestProductDetailView({ product }: { readonly product: InvestProductDetail }) {
  const presentation = availabilityPresentation[product.availability];
  const statusDisclosure = product.disclosures.find(
    (disclosure) => disclosure.kind === 'CONCEPT_STATUS' || disclosure.kind === 'RESEARCH_ONLY',
  );
  const otherDisclosures = product.disclosures.filter((disclosure) => disclosure !== statusDisclosure);

  return (
    <div className="op-stack invest-detail">
      <Link href="/dashboard/invest" className="op-inline-link invest-back">
        <ArrowLeft size={14} aria-hidden="true" /> Back to Invest
      </Link>

      <header className="op-page-header invest-header">
        <div>
          <p className="op-eyebrow">{familyPresentation[product.family].label}</p>
          <h1>{product.name}</h1>
          <p>{product.tagline}</p>
        </div>
        <AvailabilityBadge availability={product.availability} />
      </header>

      <aside className={`invest-status-panel invest-status-panel-${presentation.tone}`} aria-labelledby="invest-status-title">
        <ShieldCheck size={18} aria-hidden="true" />
        <div>
          <h2 id="invest-status-title">{statusDisclosure?.title ?? presentation.detail}</h2>
          {statusDisclosure ? <p>{statusDisclosure.body}</p> : null}
          <p className="invest-status-capability">
            Investing in this product is not available. There is nothing to buy or allocate here.
          </p>
        </div>
      </aside>

      <div className="invest-detail-grid">
        <div className="invest-detail-main">
          <Section id="invest-about" label="Overview" title="About">
            <p>{product.body}</p>
            {product.objective ? (
              <dl className="invest-facts">
                <div>
                  <dt>{product.availability === 'CONCEPT' ? 'Intended objective (concept)' : 'Objective'}</dt>
                  <dd>{product.objective}</dd>
                </div>
              </dl>
            ) : null}
          </Section>

          <Section id="invest-performance" label="Performance" title="Returns and performance">
            {product.return_figures.length === 0 ? (
              <p>
                No performance, yield or return information is published for this product. Neptlium
                does not show projected or hypothetical returns.
              </p>
            ) : (
              <ul className="invest-figures">
                {product.return_figures.map((figure) => (
                  <li key={`${figure.kind}-${figure.period ?? ''}`}>
                    <strong>{returnFigureLabels[figure.kind]}</strong>
                    <span className="tabular-nums">{formatBasisPoints(figure.value_bps)}</span>
                    <small>
                      {[figure.period, figure.as_of ? `as of ${figure.as_of}` : null, figure.source]
                        .filter(Boolean)
                        .join(' · ')}
                    </small>
                    <p>{figure.basis}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section id="invest-disclosures" label="Disclosures" title="Important information">
            <ul className="invest-disclosures">
              {otherDisclosures.map((disclosure) => (
                <li key={`${disclosure.kind}-${disclosure.jurisdiction ?? 'all'}`}>
                  <h3>{disclosure.title}</h3>
                  <p>{disclosure.body}</p>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="invest-detail-side">
          {product.terms ? (
            <Section id="invest-terms" label="Terms" title={product.terms.status === 'PROPOSED' ? 'Proposed terms' : 'Terms'}>
              <dl className="invest-facts">
                {termsRows(product.terms).map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd className="tabular-nums">{row.value}</dd>
                  </div>
                ))}
                {product.terms.fee_note ? (
                  <div>
                    <dt>Fees</dt>
                    <dd>{product.terms.fee_note}</dd>
                  </div>
                ) : null}
                {product.terms.liquidity_note ? (
                  <div>
                    <dt>Liquidity</dt>
                    <dd>{product.terms.liquidity_note}</dd>
                  </div>
                ) : null}
              </dl>
              {product.terms.status === 'PROPOSED' ? (
                <p className="invest-muted">Proposed terms are planning assumptions and are not final.</p>
              ) : null}
            </Section>
          ) : null}

          {product.sectors.length ? (
            <Section id="invest-sectors" label="Research" title="Research sectors">
              <ul className="invest-chips invest-chips-links">
                {product.sectors.map((sector) => (
                  <li key={sector.slug}>
                    <Link href={`/dashboard/invest?sector=${sector.slug}`}>{sector.name}</Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section id="invest-eligibility" label="Eligibility" title="Where this could be offered">
            <table className="invest-eligibility">
              <caption className="sr-only">Eligibility by jurisdiction</caption>
              <thead>
                <tr>
                  <th scope="col">Jurisdiction</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {product.eligibility.map((entry) => (
                  <tr key={entry.jurisdiction}>
                    <th scope="row">{jurisdictionNames[entry.jurisdiction]}</th>
                    <td>{eligibilityLabels[entry.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </div>
  );
}
