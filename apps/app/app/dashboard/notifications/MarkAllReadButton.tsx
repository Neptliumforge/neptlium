"use client";

import { useTransition } from "react";
import { Button } from "@neptlium/ui";
import { markAllNotificationsReadAction } from "./actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={isPending}
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
    >
      Mark all as read
    </Button>
  );
}
