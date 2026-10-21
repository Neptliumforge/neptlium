import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('accessibility');

export const metadata = legalMetadata(doc);

export default function AccessibilityPage() {
  return <LegalDocument doc={doc} />;
}
