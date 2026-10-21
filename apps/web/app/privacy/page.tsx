import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('privacy');

export const metadata = legalMetadata(doc);

export default function PrivacyPage() {
  return <LegalDocument doc={doc} />;
}
