import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal-document'
import { getLegalDoc } from '@/lib/content/legal'

const doc = getLegalDoc('risk-disclosure')!

export const metadata: Metadata = {
  title: doc.title,
  description: doc.intro,
  robots: { index: false, follow: false },
  alternates: { canonical: '/risk-disclosure' },
}

export default function RiskDisclosurePage() {
  return <LegalDocument doc={doc} />
}
