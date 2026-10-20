import { PageContext } from '@/components/page-context';
import { EditorialMarketingPage } from '@/components/editorial-marketing-page';
import { createPageMetadata } from '@/lib/seo';
export const metadata=createPageMetadata({title:'Treasury Coordination — Neptlium',description:'Keep liquidity visible before it becomes urgent.',path:'/solutions/treasury-coordination'});
function PageContent(){return <EditorialMarketingPage eyebrow="Treasury coordination" title="Keep liquidity visible before it becomes urgent." lead="Coordinate available capital, obligations, timing and funding requirements without losing the operating context around them." chapters={[{title:'See readiness early.',body:'Understand what is available, committed, required and projected before pressure becomes urgency.'},{title:'Coordinate around timing.',body:'Keep liquidity and funding context connected to the obligations, entities and portfolio activity that create demand.'},{title:'Preserve authority.',body:'A coordinated treasury view can inform action while keeping review and authorization distinct from the visibility that preceded them.'}]} cta={{label:'Explore Treasury',href:'/treasury'}}/>}

export default function Page() {
  return <><PageContent /><PageContext route="/solutions/treasury-coordination" /></>;
}
