import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';
export const metadata=createPageMetadata({title:'Research — Neptlium',description:'A publication surface reserved for substantive, dated Neptlium research on capital operating systems, allocation, treasury, governance and infrastructure risk when verified work is available.',path:'/research',index:false});
export default function Page(){return <DetailPage eyebrow="Research" title="Research should add evidence, not content volume." intro="Neptlium Research is reserved for substantive, dated work that can improve understanding of capital operating systems. No publication, finding or institutional endorsement is implied before verified research is actually released." sections={[
 ['Capital operating systems','Work in this area may examine how portfolio context, liquidity, capital movement and governance interact across institutional workflows, with particular attention to state, evidence and authority boundaries.'],
 ['Treasury and allocation','Research may consider how liquidity, funding requirements, capital intent, scenario design and review processes affect one another without treating modeling as execution or analysis as advice.'],
 ['Financial state and evidence','A core research concern is how systems distinguish provider-reported, internally canonical, derived, modeled and consequential information, and how those distinctions affect operational decision quality.'],
 ['Infrastructure and governance risk','Research may examine dependencies across providers, permissions, service boundaries and lifecycle controls where the underlying evidence supports a substantive analysis.'],
 ['Publication standard','Research will appear here when there is real work to publish. Neptlium will not populate this surface with invented reports, article titles, findings, performance claims or third-party validation.'],
]}/>}
