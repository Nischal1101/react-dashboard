"use client";

import type { Column } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/@types";

interface Props<TData> {
  column: Column<TData, unknown>;
}

export function DataTableFilter<TData>({ column }: Props<TData>) {
  const meta = column.columnDef.meta;
  const filterType = meta?.filterType ?? "none";
  if (filterType === "none") return null;

  const value = (column.getFilterValue() ?? "") as string;

  if (filterType === "select") {
    const options: SelectOption[] =
      meta?.filterOptions ?? meta?.options ?? [];
    return (
      <select
        className={cn(
          "border-input bg-background h-7 w-full min-w-0 rounded-md border px-1.5 text-xs outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2",
        )}
        value={value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      className="h-7 w-full text-xs"
      placeholder="Filter…"
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
    />
  );
}
