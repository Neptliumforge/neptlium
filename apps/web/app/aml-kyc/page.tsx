import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('aml-kyc');

export const metadata = legalMetadata(doc);

export default function AmlKycPage() {
  return <LegalDocument doc={doc} />;
}
