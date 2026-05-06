"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type OnChangeFn,
  type SortingState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, DatabaseZap, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  CellRegistry,
  EditableColumnMeta,
  EditingState,
  FilterRegistry,
} from "@/@types";

import { defaultCellRegistry } from "./cells";
import DataTableSkeleton from "./data-table-skeleton";
import { DataTableFilter } from "./data-table-filter";
import { defaultFilterRegistry } from "./filters";
import { DataTableRowActions } from "./data-table-row-actions";
import { formatViewValue } from "./view-formatters";

type Alignment = "left" | "right" | "center" | "justify" | "start" | "end";

const ACTIONS_COLUMN_WIDTH = 96;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  align?:
    | Alignment
    | {
        default?: Alignment;
        overrides?: Partial<Record<keyof TData, Alignment>>;
      };
  gap?: number;
  isLoading?: boolean;
  className?: string;
  date?: string;
  clientSideFilters?: Array<keyof TData>;
  isRefetching?: boolean;
  basic?: boolean;
  initialSorting?: SortingState;
  onRowClick?: (row: TData) => void;
  onRowHover?: (row: TData | null) => void;
  activeRowIndex?: number;
  toolbarActions?: React.ReactNode;
  // editable / interaction props
  getRowId?: (row: TData, index: number) => string;
  editMode?: "row" | "cell" | "both" | "none";
  cellRegistry?: CellRegistry;
  filterRegistry?: FilterRegistry;
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableFiltering?: boolean;
  enableResizing?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onEdit?: (rowId: string, row: TData) => void;
  onSave?: (rowId: string, updated: TData) => void;
  onCancel?: (rowId: string) => void;
  onDelete?: (rowId: string, row: TData) => void;
}

function getColumnVisibilityFromDefs<TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
): VisibilityState {
  const visibility: VisibilityState = {};

  const visit = (defs: ColumnDef<TData, TValue>[]) => {
    defs.forEach((def) => {
      const hidden =
        (def as ColumnDef<TData, TValue> & { hidden?: boolean }).hidden ??
        (def as ColumnDef<TData, TValue> & { meta?: { hidden?: boolean } }).meta
          ?.hidden;

      const id =
        (def as { id?: string }).id ??
        (def as { accessorKey?: string | number | symbol }).accessorKey;

      if (hidden === true && typeof id === "string" && id.length > 0) {
        visibility[id] = false;
      }

      const childColumns = (def as { columns?: ColumnDef<TData, TValue>[] })
        .columns;
      if (Array.isArray(childColumns) && childColumns.length > 0) {
        visit(childColumns);
      }
    });
  };

  visit(columns);
  return visibility;
}

function getColumnId<TData, TValue>(
  def: ColumnDef<TData, TValue>,
): string | undefined {
  const id = (def as { id?: string }).id;
  if (id) return id;
  const accessorKey = (def as { accessorKey?: string | number | symbol })
    .accessorKey;
  return typeof accessorKey === "string" ? accessorKey : undefined;
}

function DataTableComponent<TData, TValue>({
  columns,
  data,
  align,
  gap = 16,
  isLoading = false,
  className,
  date,
  isRefetching = false,
  clientSideFilters = [],
  initialSorting,
  onRowClick,
  onRowHover,
  activeRowIndex,
  getRowId,
  editMode = "none",
  cellRegistry,
  filterRegistry,
  enableSorting = true,
  enableMultiSort = true,
  enableFiltering = true,
  enableResizing = true,
  pageSize = 10,
  pageSizeOptions,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange: controlledOnColumnFiltersChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting || []);
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([]);
  const isFiltersControlled = controlledColumnFilters !== undefined;
  const columnFilters = isFiltersControlled
    ? controlledColumnFilters
    : internalColumnFilters;
  const setColumnFilters: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      if (isFiltersControlled) {
        controlledOnColumnFiltersChange?.(updater);
      } else {
        setInternalColumnFilters(updater);
      }
    },
    [isFiltersControlled, controlledOnColumnFiltersChange],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => getColumnVisibilityFromDefs(columns),
  );
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [editing, setEditing] = useState<EditingState>(null);
  const [draft, setDraft] = useState<Partial<TData> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isFiltersControlled) return;
    const filters: ColumnFiltersState = [];
    searchParams.forEach((value, key) => {
      if (clientSideFilters.includes(key as keyof TData)) {
        filters.push({ id: key, value });
      }
    });
    setInternalColumnFilters((prev) => {
      const urlKeys = new Set(filters.map((f) => f.id));
      const preserved = prev.filter(
        (f) =>
          !clientSideFilters.includes(f.id as keyof TData) || urlKeys.has(f.id),
      );
      const urlFilteredOut = preserved.filter((f) => !urlKeys.has(f.id));
      return [...urlFilteredOut, ...filters];
    });
  }, [searchParams, clientSideFilters, isFiltersControlled]);

  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    enableSorting,
    enableMultiSort,
    enableColumnResizing: enableResizing,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnSizing,
    },
    defaultColumn: {
      enableHiding: false,
      enableSorting: false,
      minSize: 60,
      size: 150,
    },
  });

  const { rows } = table.getRowModel();
  const hasActiveFilters = searchParams.toString().length > 0;
  const showActionsColumn = editMode !== "none" && Boolean(onEdit || onDelete);
  const totalSize =
    table.getTotalSize() + (showActionsColumn ? ACTIONS_COLUMN_WIDTH : 0);

  const registry = useMemo<CellRegistry>(
    () => ({ ...defaultCellRegistry, ...(cellRegistry ?? {}) }),
    [cellRegistry],
  );

  const filterRenderers = useMemo<FilterRegistry>(
    () => ({ ...defaultFilterRegistry, ...(filterRegistry ?? {}) }),
    [filterRegistry],
  );

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const getAlignmentStyle = useCallback(
    (key: keyof TData): CSSProperties | undefined => {
      if (!align) return undefined;
      let finalAlignmentValue: Alignment | undefined =
        typeof align === "string" ? align : align.default;
      if (
        typeof align === "object" &&
        align.overrides &&
        align.overrides[key]
      ) {
        finalAlignmentValue = align.overrides[key];
      }
      if (!finalAlignmentValue) return undefined;
      switch (finalAlignmentValue) {
        case "left":
        case "start":
          return { justifyContent: "flex-start" };
        case "right":
        case "end":
          return { justifyContent: "flex-end" };
        case "center":
          return { justifyContent: "center" };
        case "justify":
          return { justifyContent: "space-between" };
        default:
          return undefined;
      }
    },
    [align],
  );

  const isRowEditing = useCallback(
    (rowId: string) =>
      editing != null && editing.kind === "row" && editing.rowId === rowId,
    [editing],
  );

  const isCellEditing = useCallback(
    (rowId: string, columnId: string) => {
      if (!editing) return false;
      if (editing.kind === "cell")
        return editing.rowId === rowId && editing.columnId === columnId;
      if (editing.kind === "row") return editing.rowId === rowId;
      return false;
    },
    [editing],
  );

  const beginEdit = useCallback(
    (kind: "row" | "cell", rowId: string, row: TData, columnId?: string) => {
      if (editing && editing.rowId !== rowId) return;
      if (kind === "cell" && columnId) {
        setEditing({ kind: "cell", rowId, columnId });
      } else {
        setEditing({ kind: "row", rowId });
      }
      setDraft((prev) => prev ?? { ...row });
      setErrors({});
      onEdit?.(rowId, row);
    },
    [editing, onEdit],
  );

  const handleCancel = useCallback(() => {
    if (editing) onCancel?.(editing.rowId);
    setEditing(null);
    setDraft(null);
    setErrors({});
  }, [editing, onCancel]);

  const handleSave = useCallback(
    (originalRow: TData, rowId: string) => {
      if (!editing || !draft) return;
      const newErrors: Record<string, string> = {};
      const merged = { ...originalRow } as TData;

      const editableColumns =
        editing.kind === "cell"
          ? columns.filter((c) => getColumnId(c) === editing.columnId)
          : columns;

      for (const col of editableColumns) {
        const colId = getColumnId(col);
        if (!colId) continue;
        const meta = col.meta as EditableColumnMeta<TData> | undefined;
        if (meta?.editable === false) continue;
        const raw = (draft as Record<string, unknown>)[colId];
        const normalized = meta?.normalize ? meta.normalize(raw as never) : raw;
        if (meta?.validate) {
          const err = meta.validate(normalized as never, originalRow);
          if (err) newErrors[colId] = err;
        } else if (
          meta?.required &&
          (normalized === "" || normalized == null)
        ) {
          newErrors[colId] = "Required";
        }
        (merged as Record<string, unknown>)[colId] = normalized;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSave?.(rowId, merged);
      setEditing(null);
      setDraft(null);
      setErrors({});
    },
    [columns, draft, editing, onSave],
  );

  const handleFieldChange = useCallback((columnId: string, value: unknown) => {
    setDraft(
      (prev) =>
        ({
          ...(prev ?? {}),
          [columnId]: value,
        }) as Partial<TData>,
    );
    setErrors((prev) => {
      if (!prev[columnId]) return prev;
      const next = { ...prev };
      delete next[columnId];
      return next;
    });
  }, []);

  const tryStartCellEdit = useCallback(
    (
      rowId: string,
      columnId: string,
      row: TData,
      meta?: EditableColumnMeta<TData>,
    ) => {
      if (editMode === "none" || editMode === "row") return false;
      if (meta?.editable === false) return false;
      if (!meta?.fieldType) return false;
      beginEdit("cell", rowId, row, columnId);
      return true;
    },
    [beginEdit, editMode],
  );

  const renderEditor = (
    columnId: string,
    row: TData,
    meta: EditableColumnMeta<TData>,
    autoFocus: boolean,
    rowId: string,
  ) => {
    const fieldType = meta.fieldType ?? "text";
    const Renderer = registry[fieldType];
    const value =
      (draft as Record<string, unknown> | null)?.[columnId] ??
      (row as Record<string, unknown>)[columnId];
    const error = errors[columnId];

    if (!Renderer) {
      return (
        <span className="text-muted-foreground text-xs italic">
          No editor for &quot;{fieldType}&quot;
        </span>
      );
    }

    return (
      <div className="relative w-full">
        <Renderer
          value={value}
          rawValue={value}
          row={row}
          meta={meta as EditableColumnMeta<unknown, unknown>}
          error={error}
          autoFocus={autoFocus}
          onChange={(v) => handleFieldChange(columnId, v)}
          onCommit={() => handleSave(row, rowId)}
          onCancel={handleCancel}
        />
        {error && (
          <span className="text-destructive pointer-events-none absolute top-full left-0 mt-0.5 text-[10px] leading-tight">
            {error}
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <DataTableSkeleton columns={columns} gap={gap} className={className} />
    );
  }

  return (
    <div className="space-y-2 font-medium">
      <div className="flex items-center justify-between gap-8 py-3">
        <div className="flex items-center gap-3.5">
          <p className="text-foreground text-sm font-medium">
            Showing {rows.length} results
          </p>
          {date && (
            <div className="bg-data-table-divider h-5 w-0.5 rounded-full" />
          )}
          {date && (
            <p className="text-foreground text-sm font-medium">{date}</p>
          )}
          {hasActiveFilters && (
            <>
              <div className="bg-data-table-divider h-5 w-0.5 rounded-full" />
              <button
                onClick={handleClearFilters}
                className="text-data-table-clear-filters flex cursor-pointer items-center gap-px"
              >
                <X className="mr-1 h-4 w-4" />
                <p className="text-sm font-medium">Clear filters</p>
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "w-full overflow-auto rounded-md border",
          isRefetching && "animate-pulse opacity-60",
          className,
        )}
      >
        <table
          className="relative grid caption-bottom text-sm"
          style={{ minWidth: totalSize, width: "100%" }}
        >
          <thead className="bg-data-table-header sticky top-0 z-20 grid">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="flex w-full border-b transition-colors"
              >
                {headerGroup.headers.map((header, index) => {
                  const isFirstColumn = index === 0;
                  const meta = header.column.columnDef.meta as
                    | EditableColumnMeta<TData>
                    | undefined;
                  const sortDir = header.column.getIsSorted();
                  const canSort = enableSorting && header.column.getCanSort();
                  const canResize =
                    enableResizing && header.column.getCanResize();
                  const customHeader =
                    typeof header.column.columnDef.header === "function";

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "text-foreground relative inline-flex h-auto min-h-10 flex-col items-stretch justify-center px-0 py-1.5 align-middle font-medium whitespace-nowrap",
                        index !== headerGroup.headers.length - 1 && "border-r",
                        isFirstColumn &&
                          "bg-data-table-header sticky left-0 z-20",
                      )}
                      style={{
                        width: header.getSize(),
                        flexGrow: header.getSize(),
                        flexShrink: 0,
                        paddingLeft: gap,
                        paddingRight: gap,
                      }}
                      colSpan={header.colSpan}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          canSort && !customHeader && "cursor-pointer select-none",
                        )}
                        style={getAlignmentStyle(
                          header.column.id as keyof TData,
                        )}
                        onClick={
                          canSort && !customHeader
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {canSort && !customHeader && (
                          <span className="text-muted-foreground">
                            {sortDir === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : sortDir === "desc" ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                      {enableFiltering && meta?.filterType && (
                        <div className="mt-1">
                          <DataTableFilter
                            column={header.column}
                            registry={filterRenderers}
                          />
                        </div>
                      )}
                      {canResize && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "absolute top-0 right-0 z-30 h-full w-1 cursor-col-resize touch-none select-none",
                            "hover:bg-primary/40",
                            header.column.getIsResizing() && "bg-primary",
                          )}
                          aria-hidden
                        />
                      )}
                    </th>
                  );
                })}
                {showActionsColumn && (
                  <th
                    className="text-muted-foreground inline-flex items-center justify-center text-xs font-medium"
                    style={{
                      width: ACTIONS_COLUMN_WIDTH,
                      flexShrink: 0,
                      paddingLeft: gap,
                      paddingRight: gap,
                    }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            ))}
          </thead>
          <tbody className="grid">
            {rows.map((row, index) => {
              const rowId = row.id;
              const isLastRow = index === rows.length - 1;
              const rowEditing = isRowEditing(rowId);
              const anyCellEditing = editing?.rowId === rowId;
              const rowHasErrors = Object.keys(errors).length > 0;

              return (
                <tr
                  key={rowId}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    "bg-data-table-body hover:bg-muted flex w-full border-b transition-colors",
                    onRowClick && !anyCellEditing && "cursor-pointer",
                    activeRowIndex === index &&
                      "bg-muted ring-primary/20 ring-1",
                    anyCellEditing && "bg-muted/50",
                    isLastRow && "border-b-0",
                  )}
                  onClick={
                    onRowClick && !anyCellEditing
                      ? () => onRowClick(row.original)
                      : undefined
                  }
                  onMouseEnter={
                    onRowHover ? () => onRowHover(row.original) : undefined
                  }
                  onMouseLeave={onRowHover ? () => onRowHover(null) : undefined}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isFirstColumn = cellIndex === 0;
                    const meta = cell.column.columnDef.meta as
                      | EditableColumnMeta<TData>
                      | undefined;
                    const columnId = cell.column.id;
                    const cellEditing = isCellEditing(rowId, columnId);
                    const editorAutoFocus =
                      editing?.kind === "cell" &&
                      editing.columnId === columnId &&
                      editing.rowId === rowId;

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "relative inline-flex items-center p-2 align-middle whitespace-nowrap",
                          cell.column.id.toLowerCase() === "symbol" &&
                            "border-r",
                          isFirstColumn &&
                            "bg-data-table-body sticky left-0 z-10 border-r",
                        )}
                        style={{
                          width: cell.column.getSize(),
                          flexGrow: cell.column.getSize(),
                          flexShrink: 0,
                          paddingLeft: gap,
                          paddingRight: gap,
                          ...getAlignmentStyle(columnId as keyof TData),
                        }}
                        onClick={(e) => {
                          if (cellEditing) {
                            e.stopPropagation();
                            return;
                          }
                          if (rowEditing) return;
                          const started = tryStartCellEdit(
                            rowId,
                            columnId,
                            row.original,
                            meta,
                          );
                          if (started) e.stopPropagation();
                        }}
                      >
                        {cellEditing
                          ? renderEditor(
                              columnId,
                              row.original,
                              meta as EditableColumnMeta<TData>,
                              editorAutoFocus,
                              rowId,
                            )
                          : cell.column.columnDef.cell
                            ? flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext() as CellContext<
                                  TData,
                                  unknown
                                >,
                              )
                            : formatViewValue(
                                cell.getValue(),
                                meta as EditableColumnMeta<unknown, unknown>,
                              )}
                      </td>
                    );
                  })}
                  {showActionsColumn && (
                    <td
                      className="inline-flex items-center justify-center p-2"
                      style={{
                        width: ACTIONS_COLUMN_WIDTH,
                        flexShrink: 0,
                        paddingLeft: gap,
                        paddingRight: gap,
                      }}
                    >
                      <DataTableRowActions
                        isEditing={anyCellEditing === true}
                        hasErrors={anyCellEditing && rowHasErrors}
                        canEdit={Boolean(onEdit)}
                        canDelete={Boolean(onDelete)}
                        onEdit={
                          editMode === "cell"
                            ? undefined
                            : () => beginEdit("row", rowId, row.original)
                        }
                        onSave={() => handleSave(row.original, rowId)}
                        onCancel={handleCancel}
                        onDelete={
                          onDelete
                            ? () => onDelete(rowId, row.original)
                            : undefined
                        }
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {!isLoading && !rows.length && (
          <div className="flex h-[300px] items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2.5">
              <DatabaseZap className="text-data-table-no-results-icon size-12" />
              <p className="text-muted-foreground text-lg">No results.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return (
    <Suspense
      fallback={<DataTableSkeleton columns={props.columns} gap={props.gap} />}
    >
      <DataTableComponent {...props} />
    </Suspense>
  );
}
