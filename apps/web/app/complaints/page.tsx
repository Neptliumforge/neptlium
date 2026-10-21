import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('complaints');

export const metadata = legalMetadata(doc);

export default function ComplaintsPage() {
  return <LegalDocument doc={doc} />;
}
