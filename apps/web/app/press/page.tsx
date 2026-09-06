import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';
export const metadata=createPageMetadata({title:'Press — Neptlium',description:'Verified company description and media inquiry information for Neptlium. Announcements and coverage appear only when sourceable materials exist.',path:'/press',index:false});
export default function PressPage(){return <DetailPage eyebrow="Press" title="Company information for media and institutional reference." intro="Neptlium is a capital operating platform designed to bring portfolio context, treasury, allocation, capital movement, governance and intelligence into one coherent operating environment. This page contains only company information that can be stated without inventing coverage, milestones or institutional validation." sections={[
 ['Company description','Neptlium is building an operating environment for understanding, coordinating and governing capital while preserving distinctions between observed, provider-reported, modeled, proposed, authorized and consequential state.'],
 ['Publication standard','Announcements, partnerships, product capabilities, regulatory status, awards, customer claims and other consequential company statements should be published only when they are verified and appropriate to disclose.'],
 ['Media inquiries','Requests for verified company information may be directed to support@neptlium.com. Neptlium does not present fabricated press quotes, logos, awards or media coverage to imply external validation.'],
]}/>} 
