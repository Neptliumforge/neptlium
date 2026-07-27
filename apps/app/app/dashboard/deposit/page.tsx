import { Wallet } from "lucide-react";
import { Card, CardContent, EmptyState } from "@neptlium/ui";
import { requireProvisionedUser } from "@/lib/auth";
export default async function Page(){await requireProvisionedUser();return <div className="space-y-6 py-4"><header><h1 className="text-lg font-semibold">Deposit</h1></header><Card><CardContent className="py-10"><EmptyState icon={<Wallet className="size-5"/>} title="Deposit unavailable" description="Crypto deposits require a connected custody provider. No address or QR code is available."/></CardContent></Card></div>}
