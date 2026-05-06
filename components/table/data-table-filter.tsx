"use client";

import type { Column } from "@tanstack/react-table";

import type { EditableColumnMeta, FilterRegistry } from "@/@types";

import { defaultFilterRegistry } from "./filters";

interface Props<TData> {
  column: Column<TData, unknown>;
  registry?: FilterRegistry;
}

export function DataTableFilter<TData>({ column, registry }: Props<TData>) {
  const meta = column.columnDef.meta as EditableColumnMeta<TData> | undefined;
  if (!column.getCanFilter() || !meta?.filterType || meta.filterType === "none")
    return null;

  const Renderer = (registry ?? defaultFilterRegistry)[meta.filterType];
  if (!Renderer) return null;

  return (
    <Renderer
      column={column as Column<unknown, unknown>}
      value={column.getFilterValue()}
      meta={meta as EditableColumnMeta<unknown, unknown>}
      onChange={(v) => column.setFilterValue(v)}
    />
  );
}
