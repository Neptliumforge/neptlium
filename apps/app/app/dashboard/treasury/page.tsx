import { requireProvisionedUser } from "@/lib/auth";
import { getTreasuryState } from "@/lib/api/client";
import { TreasuryView } from "./TreasuryView";

export default async function TreasuryPage() {
  await requireProvisionedUser();
  try {
    return <TreasuryView state={await getTreasuryState()} />;
  } catch {
    return <TreasuryView state={null} />;
  }
}
