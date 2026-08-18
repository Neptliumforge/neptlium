import { requireProvisionedUser } from '@/lib/auth';
import { getAllocationWorkspace } from '@/lib/api/allocation';
import { ProductStateMessage } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';
import { AllocationWorkspace } from './AllocationWorkspace';

export default async function AllocationsPage() {
  await requireProvisionedUser();
  try {
    return <AllocationWorkspace workspace={await getAllocationWorkspace()} />;
  } catch {
    return (
      <div className="space-y-8">
        <WorkspaceHeader
          eyebrow="Policy and authorization"
          title="Allocation"
          description="Observe canonical capital, define policy, review drift, and authorize decisions while execution remains an explicit capability boundary."
        />
        <div className="border-y border-border-hairline">
          <ProductStateMessage state="ERROR" title="Allocation workspace unavailable">The governed Allocation API could not establish the current owner-scoped workspace. No observed, modeled, or authorized state is inferred.</ProductStateMessage>
        </div>
      </div>
    );
  }
}
