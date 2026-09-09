import { requireProvisionedUser } from '@/lib/auth';
import { getAllocationWorkspace } from '@/lib/api/allocation';
import { AllocationHeader } from '@/components/product/AllocationIntelligence';
import { ProductStateMessage } from '@/components/product/ProductState';
import { AllocationWorkspace } from './AllocationWorkspace';

export default async function AllocationsPage() {
  await requireProvisionedUser();
  try {
    return <AllocationWorkspace workspace={await getAllocationWorkspace()} />;
  } catch {
    return (
      <div className="space-y-8">
        <AllocationHeader />
        <div className="border-y border-border-hairline">
          <ProductStateMessage state="ERROR" title="Allocation intelligence could not be loaded">
            Current allocation information could not be established. No observed, modeled, or
            authorized state is inferred.
          </ProductStateMessage>
        </div>
      </div>
    );
  }
}
