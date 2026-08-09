import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';

export const metadata: Metadata = {
  title: 'Neptlium Link | Infrastructure Connectivity',
  description: 'The controlled connectivity layer between Neptlium and supported capital infrastructure.',
  alternates: { canonical: '/neptlium-link' },
};

export default function NeptliumLinkPage() {
  return <DetailPage eyebrow="Infrastructure" title="Connectivity with clear boundaries." intro="Neptlium Link coordinates supported capital infrastructure while keeping identity, authorization and external operations distinct." sections={[
    ['Account connectivity', 'Connect supported account infrastructure through governed boundaries.'],
    ['Network context', 'Keep verified network information attached to the capital it represents.'],
    ['Identity boundaries', 'Keep authenticated identity and authorization distinct from external operations.'],
  ]} />;
}
