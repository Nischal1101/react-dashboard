"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  const goTo = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="flex items-center justify-between gap-4 px-2 py-4">
      <p className="text-muted-foreground text-sm font-medium">
        Page {page} of {totalPages}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => goTo(page - 1)}
              disabled={isFirst}
              aria-disabled={isFirst}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => goTo(page + 1)}
              disabled={isLast}
              aria-disabled={isLast}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
