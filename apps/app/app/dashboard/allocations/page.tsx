import { requireProvisionedUser } from '@/lib/auth';
import { getAllocationWorkspace } from '@/lib/api/allocation';
import { ProductStateMessage } from '@/components/product/ProductState';
import { AllocationWorkspace } from './AllocationWorkspace';

export default async function AllocationsPage() {
  await requireProvisionedUser();
  try {
    return <AllocationWorkspace workspace={await getAllocationWorkspace()} />;
  } catch {
    return (
      <div>
        <h1>Allocation</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Govern how capital is distributed, reviewed and authorized.</p>
        <div className="mt-8 border-y border-border-hairline">
          <ProductStateMessage state="ERROR" title="Allocation workspace unavailable">The governed Allocation API could not establish the current owner-scoped workspace.</ProductStateMessage>
        </div>
      </div>
    );
  }
}
