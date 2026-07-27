import { Wallet } from "lucide-react";
import { Card, CardContent, EmptyState } from "@neptlium/ui";
import { requireProvisionedUser } from "@/lib/auth";
export default async function Page(){await requireProvisionedUser();return <div className="space-y-6 py-4"><header><h1 className="text-lg font-semibold">Withdraw</h1></header><Card><CardContent className="py-10"><EmptyState icon={<Wallet className="size-5"/>} title="Withdraw unavailable" description="Customer withdrawal submission is disabled until custody, ledger, security, and execution infrastructure is connected."/></CardContent></Card></div>}
