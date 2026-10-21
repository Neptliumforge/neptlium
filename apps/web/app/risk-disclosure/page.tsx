import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('risk-disclosure');

export const metadata = legalMetadata(doc);

export default function RiskDisclosurePage() {
  return <LegalDocument doc={doc} />;
}
