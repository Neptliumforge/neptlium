import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal-document';
import { getLegalDoc } from '@/lib/content/legal';

const doc = getLegalDoc('cookie-policy')!;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.intro,
  robots: { index: false, follow: false },
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyPage() {
  return <LegalDocument doc={doc} />;
}
