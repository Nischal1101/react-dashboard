import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export default function DataTableSkeleton<TData, TValue>({
  columns,
  className,
  gap = 16,
}: {
  columns: ColumnDef<TData, TValue>[];
  className?: string;
  gap?: number;
}) {
  const skeletonRowCount = 11;
  return (
    <div
      className={cn(
        "h-[calc(100vh-var(--dashboard-header-height)-20.2rem)] w-full overflow-hidden rounded-md border",
        className,
      )}
    >
      <Table className="relative grid w-full">
        <TableHeader className="sticky top-0 z-10 grid bg-[#F8F8F8]">
          <TableRow className="flex w-full">
            {columns.map((column, index) => (
              <TableHead
                key={`skeleton-header-${index}`}
                className={cn(
                  "inline-flex items-center",
                  index !== columns.length - 1 && "border-r",
                )}
                style={{
                  width: (column.size ?? 150) + gap * 2,
                  paddingLeft: gap,
                  paddingRight: gap,
                }}
              >
                <Skeleton className="h-5 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="grid">
          {Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
            <TableRow
              key={`skeleton-row-${rowIndex}`}
              className={cn(
                rowIndex % 2 === 0 ? "bg-black-50/10" : "bg-background",
                "flex w-full",
              )}
              style={{
                height: `40px`,
              }}
            >
              {columns.map((column, cellIndex) => (
                <TableCell
                  key={`skeleton-cell-${rowIndex}-${cellIndex}`}
                  className={cn(
                    "inline-flex items-center",
                    column.id?.toLowerCase() === "symbol" && "border-r",
                  )}
                  style={{
                    width: (column.size ?? 150) + gap * 2,
                    paddingLeft: gap,
                    paddingRight: gap,
                  }}
                >
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
