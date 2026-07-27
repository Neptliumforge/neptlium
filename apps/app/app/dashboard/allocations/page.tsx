import { requireProvisionedUser } from "@/lib/auth";
import { AllocationModes } from "./AllocationModes";
export default async function AllocationsPage() { await requireProvisionedUser(); return <AllocationModes />; }
