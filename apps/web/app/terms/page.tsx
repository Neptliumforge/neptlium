import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('terms');

export const metadata = legalMetadata(doc);

export default function TermsPage() {
  return <LegalDocument doc={doc} />;
}
