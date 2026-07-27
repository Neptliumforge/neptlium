import { requireProvisionedUser } from "@/lib/auth";
import { TreasuryView } from "./TreasuryView";
export default async function TreasuryPage(){await requireProvisionedUser();return <TreasuryView/>;}
