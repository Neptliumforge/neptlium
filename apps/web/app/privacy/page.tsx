import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';

const doc = getLegalDoc('privacy')!;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.intro,
  robots: { index: false, follow: false },
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalDocument doc={doc} />;
}
