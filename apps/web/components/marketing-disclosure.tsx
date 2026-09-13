import { DISCLOSURES } from '@/lib/content/site';

export type MarketingDisclosureKind = 'general' | 'investment' | 'modeling' | 'availability';

export function MarketingDisclosure({ kinds = ['investment', 'availability'] }: { kinds?: readonly MarketingDisclosureKind[] }) {
  return (
    <aside className="marketing-disclosure" aria-label="Financial disclosure">
      {kinds.map((kind) => <p key={kind}>{DISCLOSURES[kind]}</p>)}
    </aside>
  );
}
