import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';

const doc = getLegalDoc('terms')!;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.intro,
  robots: { index: false, follow: false },
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalDocument doc={doc} />;
}
