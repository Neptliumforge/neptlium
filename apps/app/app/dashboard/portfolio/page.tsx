import { Briefcase } from "lucide-react";
import { Card, CardContent, EmptyState, StatCard } from "@neptlium/ui";
import { requireProvisionedUser } from "@/lib/auth";
import { PortfolioGreeting } from "./PortfolioGreeting";
export default async function PortfolioPage(){const{profile}=await requireProvisionedUser();const name=profile.fullName??profile.displayName??null;return <div className="space-y-5"><PortfolioGreeting name={name} complianceActive={profile.complianceStatus==="active"}/><div className="grid gap-3 md:grid-cols-2"><StatCard label="Portfolio valuation" value="—" delta="Connected data required"/><StatCard label="Holdings" value="Unavailable"/></div><Card><CardContent className="py-10"><EmptyState icon={<Briefcase className="size-5"/>} title="Portfolio data unavailable" description="Connected portfolio and custody data are required before holdings or estimated reporting valuations can be shown."/></CardContent></Card></div>}
