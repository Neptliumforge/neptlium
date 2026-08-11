import { requireProvisionedUser } from "@/lib/auth";
import { getAllocationState } from "@/lib/api/client";
import { AllocationModes } from "./AllocationModes";

export default async function AllocationsPage() {
  await requireProvisionedUser();
  try {
    return <AllocationModes state={await getAllocationState()} />;
  } catch {
    return <AllocationModes state={null} />;
  }
}
