import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { legalMetadata } from '@/lib/seo';

const doc = getLegalDoc('e-delivery');

export const metadata = legalMetadata(doc);

export default function ElectronicDeliveryPage() {
  return <LegalDocument doc={doc} />;
}
