import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { type Column } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  EyeOffIcon,
  FilterIcon,
  MoveDown,
  MoveUp,
  XIcon,
} from "lucide-react";

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

  if (!canSort && !canHide && !canFilter) {
    return <div className={cn(className)}>{title}</div>;
  }

  const showMenuTrigger =
    canSort || canHide || column.getIsSorted() || column.getIsFiltered();

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
        {column.columnDef.enableColumnFilter && (
          <FilterIcon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              column.getIsFiltered()
                ? "text-primary"
                : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex shrink-0 items-center">
        {showMenuTrigger && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Column options"
                variant="ghost"
                size="sm"
                tabIndex={-1}
                className="hover:bg-muted h-6 w-6 p-0"
              >
                <ChevronDownIcon className="text-muted-foreground h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onClick={(e) => e.stopPropagation()}
              align="end"
            >
              {canSort && (
                <>
                  <DropdownMenuItem
                    aria-label="Sort ascending"
                    onClick={() => column.toggleSorting(false)}
                  >
                    <ArrowUpIcon
                      className="text-muted-foreground mr-2 size-3.5"
                      aria-hidden="true"
                    />
                    <span className="text-foreground text-sm font-medium">
                      Asc
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    aria-label="Sort descending"
                    onClick={() => column.toggleSorting(true)}
                  >
                    <ArrowDownIcon
                      className="text-muted-foreground mr-2 size-3.5"
                      aria-hidden="true"
                    />
                    <span className="text-foreground text-sm font-medium">
                      Desc
                    </span>
                  </DropdownMenuItem>
                </>
              )}
              {canSort && canHide && <DropdownMenuSeparator />}
              {canHide && (
                <DropdownMenuItem
                  aria-label="Hide column"
                  onClick={() => column.toggleVisibility(false)}
                >
                  <EyeOffIcon
                    className="text-muted-foreground mr-1 size-3.5"
                    aria-hidden="true"
                  />
                  <span className="text-foreground text-sm font-medium">
                    Hide
                  </span>
                </DropdownMenuItem>
              )}
              {(column.getIsSorted() || column.getIsFiltered()) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    aria-label="Clear filters"
                    onClick={() => {
                      column.clearSorting();
                      column.setFilterValue(undefined);
                    }}
                    className="hover:!bg-destructive/10"
                  >
                    <XIcon
                      className="text-destructive mr-1 size-3.5"
                      aria-hidden="true"
                    />
                    <span className="text-destructive text-sm font-medium">
                      Clear
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
