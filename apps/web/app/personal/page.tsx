import { EditorialMarketingPage } from '@/components/editorial-marketing-page';
import { SITE } from '@/lib/content/site';

export default function PersonalPage() {
  return <EditorialMarketingPage
    eyebrow="Personal"
    title="Neptlium Capital"
    lead="A governed capital operating environment for individuals and investors."
    chapters={[
      { title: 'Capital state', body: 'Understand available, reserved, allocated and pending capital without collapsing unknown state into zero.' },
      { title: 'Portfolio context', body: 'See reconciled portfolio and allocation information only when authoritative valuation and position evidence exists.' },
      { title: 'Governed work', body: 'Funding, movement, allocation and reconciliation remain explicit stages rather than implied browser actions.' },
    ]}
    cta={{ label: 'Enter Neptlium Capital', href: SITE.appOrigin }}
  />;
}
