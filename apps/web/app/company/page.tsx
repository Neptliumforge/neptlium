import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';

export const metadata: Metadata = {
  title: 'Company | Neptlium',
  description: 'Neptlium is building infrastructure for a more coherent capital system.',
  alternates: { canonical: '/company' },
};

const principles = [
  ['Truthful presentation', 'Capabilities, risks and availability are communicated clearly.'],
  ['Explicit control', 'Consequential decisions remain understandable and intentional.'],
  ['Portfolio purpose', 'Every allocation should have a defined role within the whole.'],
  ['Liquidity discipline', 'Capital readiness is part of portfolio structure.'],
  ['Security by design', 'Identity, authorization and operational boundaries are foundational.'],
] as const;

export default function CompanyPage() {
  return (
    <>
      <PageHeader
        title="Building infrastructure for a more coherent capital system."
        intro="Neptlium is focused on the structures that help digital ownership become clearer, more deliberate and more controlled."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Company' }]}
      />
      <Section>
        <div className="route-split">
          <div>
            <h2>Ownership has changed. Its operating model should change with it.</h2>
          </div>
          <p>Portfolio intelligence, account infrastructure, treasury and allocation belong in one system—without turning every capital decision into a transaction.</p>
        </div>
      </Section>
      <Section tone="surface">
        <div id="principles" className="principles-editorial">
          <h2>Principles that shape the platform.</h2>
          <div>
            {principles.map(([title, body]) => (
              <article key={title}><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div className="route-action">
          <Link className="button" href="/contact">Contact Neptlium</Link>
          <Link href="/about">About Neptlium</Link>
        </div>
      </Section>
    </>
  );
}
