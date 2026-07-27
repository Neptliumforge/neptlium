"use client";

import { useTransition } from "react";
import { Badge, Button } from "@neptlium/ui";
import { markNotificationReadAction } from "./actions";

export interface NotificationItemProps {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly body: string | null;
  readonly createdAt: string;
  readonly readAt: string | null;
}

const CATEGORY_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  security: "warning",
  deposit: "success",
  withdrawal: "info",
  allocation: "info",
  document: "neutral",
  system: "neutral"
};

export function NotificationItem({ id, category, title, body, createdAt, readAt }: NotificationItemProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <li
      className={`flex items-start justify-between gap-4 rounded-md border p-4 ${
        readAt ? "border-border-hairline" : "border-border-default bg-surface-2"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge tone={CATEGORY_TONE[category] ?? "neutral"}>{category}</Badge>
          <span className="text-body-sm font-medium text-text-primary">{title}</span>
        </div>
        {body && <p className="text-body-sm text-text-secondary">{body}</p>}
        <p className="text-caption text-text-muted">{new Date(createdAt).toLocaleString()}</p>
      </div>
      {!readAt && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={isPending}
          onClick={() => startTransition(() => markNotificationReadAction(id))}
        >
          Mark as read
        </Button>
      )}
    </li>
  );
}
