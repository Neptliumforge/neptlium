import { LegalCenter } from '@/components/legal-document';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Legal documents',
  description:
    'Terms, policies and disclosures for Neptlium websites, Neptlium Capital and Neptlium Treasury, with version and review status.',
  path: '/legal',
  index: false,
});

export default function LegalCenterPage() {
  return <LegalCenter />;
}
