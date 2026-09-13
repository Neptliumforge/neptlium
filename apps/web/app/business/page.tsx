import { EditorialMarketingPage } from '@/components/editorial-marketing-page';
import { SITE } from '@/lib/content/site';

export default function BusinessPage() {
  return <EditorialMarketingPage
    eyebrow="Business"
    title="VaultRail"
    lead="A governed treasury operating environment for organizations, finance teams and treasury operators."
    chapters={[
      { title: 'Treasury before wallets', body: 'VaultRail treats treasury accounts, purpose, authority, policy and accounting classification as the business layer; wallets remain execution infrastructure beneath it.' },
      { title: 'Policy and approvals', body: 'Payment intent, policy checks, approvals and reservation remain separate from signing, provider submission, settlement and reconciliation.' },
      { title: 'Evidence over inference', body: 'No browser session, provider observation or connected wallet independently becomes canonical treasury truth.' },
    ]}
    cta={{ label: 'Enter VaultRail', href: SITE.vaultOrigin }}
  />;
}
