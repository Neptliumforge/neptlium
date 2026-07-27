import type { Metadata } from 'next'
import { LegalDocument } from '@/components/legal-document'
import { getLegalDoc } from '@/lib/content/legal'

const doc = getLegalDoc('accessibility')!

export const metadata: Metadata = {
  title: doc.title,
  description: doc.intro,
  alternates: { canonical: '/accessibility' },
}

export default function AccessibilityPage() {
  return <LegalDocument doc={doc} />
}
