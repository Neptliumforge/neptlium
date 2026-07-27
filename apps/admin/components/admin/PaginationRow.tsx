"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@neptlium/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationRowProps {
  readonly page: number;
  readonly total: number;
  readonly pageSize: number;
}

export function PaginationRow({ page, total, pageSize }: PaginationRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border-hairline pt-4">
      <p className="text-[12px] text-text-muted">
        Page {page + 1} of {totalPages} &middot; {total} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(page - 1)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="size-3.5" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(page + 1)}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
