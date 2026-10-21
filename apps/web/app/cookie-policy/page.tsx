import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('cookie-policy');

export const metadata = legalMetadata(doc);

export default function CookiePolicyPage() {
  return <LegalDocument doc={doc} />;
}
