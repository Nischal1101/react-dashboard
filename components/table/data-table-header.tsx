import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Column } from "@tanstack/react-table";
import { FilterIcon, MoveDown, MoveUp } from "lucide-react";

import type { EditableColumnMeta } from "@/@types";

interface DataTableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string | React.ReactNode;
  className?: string;
}

export function DataTableHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();
  const canFilter = column.getCanFilter();
  const meta = column.columnDef.meta as
    | EditableColumnMeta<TData, TValue>
    | undefined;
  const hasFilter = Boolean(meta?.filterType && meta.filterType !== "none");

  if (!canSort && !canHide && !canFilter) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-1",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <p className="truncate [font-size:inherit] [font-weight:inherit]">
          {title}
        </p>
        {hasFilter && (
          <FilterIcon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              column.getIsFiltered() ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex shrink-0 items-center">
        {canSort && (
          <Button
            aria-label={
              column.getIsSorted() === "desc"
                ? "Sorted descending. Click to sort ascending."
                : column.getIsSorted() === "asc"
                  ? "Sorted ascending. Click to sort descending."
                  : "Not sorted. Click to sort ascending."
            }
            variant="ghost"
            size="sm"
            className={cn(
              "hover:bg-muted h-6 w-6 p-0",
              column.getIsSorted() && "text-primary",
            )}
            onClick={() => {
              if (column.getIsSorted() === "asc") {
                column.toggleSorting(true);
              } else {
                column.toggleSorting(false);
              }
            }}
          >
            <div className="flex items-center -space-y-1 -space-x-2">
              <MoveUp
                className={cn(
                  "h-2.5 w-2.5",
                  column.getIsSorted() === "asc"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              <MoveDown
                className={cn(
                  "h-2.5 w-2.5",
                  column.getIsSorted() === "desc"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
