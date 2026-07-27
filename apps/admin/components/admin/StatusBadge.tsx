import { Badge } from "@neptlium/ui";
import type { ComponentProps } from "react";

type Tone = ComponentProps<typeof Badge>["tone"];

function statusTone(status: string): Tone {
  switch (status) {
    case "completed":
    case "executed":
    case "approved":
    case "active":
      return "success";
    case "pending":
    case "pending_review":
      return "warning";
    case "cancelled":
    case "failed":
    case "rejected":
    case "suspended":
      return "danger";
    default:
      return "neutral";
  }
}

function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({ status }: { readonly status: string }) {
  return <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>;
}
