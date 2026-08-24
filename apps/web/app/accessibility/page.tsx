import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';
import { createPageMetadata } from '@/lib/seo';

const doc = getLegalDoc('accessibility')!;

export const metadata = createPageMetadata({
  title: doc.title,
  description: doc.intro,
  path: '/accessibility',
});

export default function AccessibilityPage() {
  return <LegalDocument doc={doc} />;
}
