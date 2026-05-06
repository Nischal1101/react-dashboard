"use client";

import { useMemo } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  pageSizeOptions?: number[];
  siblingCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100, 500];

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function buildPageItems(
  current: number,
  total: number,
  siblingCount: number,
): PageItem[] {
  if (total <= 0) return [];

  // first + last + current + 2 siblings + 2 ellipses
  const maxVisible = siblingCount * 2 + 5;

  if (total <= maxVisible) {
    return range(1, total);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  // edge group size keeps width constant
  const edgeCount = siblingCount * 2 + 3;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeCount), "ellipsis-end", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis-start", ...range(total - edgeCount + 1, total)];
  }

  return [
    1,
    "ellipsis-start",
    ...range(leftSibling, rightSibling),
    "ellipsis-end",
    total,
  ];
}

export function DataTablePagination({
  page,
  pageSize,
  totalPages,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  siblingCount = 1,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageItems = useMemo(
    () => buildPageItems(page, totalPages, siblingCount),
    [page, totalPages, siblingCount],
  );

  const goTo = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  const handlePageSizeChange = (next: string) => {
    onPageSizeChange(Number(next));
    onPageChange(1);
  };

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-sm font-medium">
          Rows per page
        </p>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger
            size="sm"
            className="bg-background text-foreground h-8 w-[80px] min-w-fit"
          >
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-muted-foreground text-center text-sm sm:hidden">
        Page {page} of {totalPages}
      </div>

      <Pagination className="sm:mx-0 sm:w-auto sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => goTo(page - 1)}
              disabled={isFirst}
              aria-disabled={isFirst}
            />
          </PaginationItem>

          {pageItems.map((item) => {
            if (item === "ellipsis-start" || item === "ellipsis-end") {
              return (
                <PaginationItem key={item} className="hidden sm:list-item">
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            const isActive = item === page;
            return (
              <PaginationItem
                key={item}
                className={isActive ? "list-item" : "hidden sm:list-item"}
              >
                <PaginationLink
                  isActive={isActive}
                  onClick={() => goTo(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}

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
