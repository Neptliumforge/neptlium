import { Badge } from "@neptlium/ui";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export interface PortfolioGreetingProps {
  readonly name: string | null;
  readonly complianceActive: boolean;
}

export function PortfolioGreeting({ name, complianceActive }: PortfolioGreetingProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
        {timeOfDayGreeting()}
        {name ? `, ${name}` : ""}.
      </h1>
      <div className="flex flex-wrap gap-2">
        <Badge tone="success">Identity Verified</Badge>
        <Badge tone="success">Wallet Active</Badge>
        <Badge tone="success">Infrastructure Operational</Badge>
        <Badge tone={complianceActive ? "success" : "neutral"}>
          {complianceActive ? "Compliance Active" : "Compliance Pending"}
        </Badge>
      </div>
    </div>
  );
}
