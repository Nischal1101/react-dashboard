"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ColumnSizingState,
  type SortingState,
} from "@tanstack/react-table";
import { DatabaseZap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EditableColumnMeta, EditingState } from "@/@types";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { defaultCellRegistry } from "./cells";
import DataTableSkeleton from "./data-table-skeleton";
import { DataTableRowActions } from "./data-table-row-actions";
import { formatViewValue } from "./view-formatters";

const ACTIONS_COLUMN_WIDTH = 96;
const CELL_PADDING = 16;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isRefetching?: boolean;
  className?: string;
  getRowId?: (row: TData, index: number) => string;
  editMode?: "row" | "cell" | "both" | "none";
  onSave?: (rowId: string, updated: TData) => void;
  onDelete?: (rowId: string, row: TData) => void;
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
  isLoading = false,
  isRefetching = false,
  className,
  getRowId,
  editMode = "none",
  onSave,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [editing, setEditing] = useState<EditingState>(null);
  const [draft, setDraft] = useState<Partial<TData> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
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
  const showActionsColumn = editMode !== "none" && Boolean(onDelete);
  const totalSize =
    table.getTotalSize() + (showActionsColumn ? ACTIONS_COLUMN_WIDTH : 0);

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
      const switchingRow = editing != null && editing.rowId !== rowId;
      if (kind === "cell" && columnId) {
        setEditing({ kind: "cell", rowId, columnId });
      } else {
        setEditing({ kind: "row", rowId });
      }
      setDraft((prev) => (switchingRow ? { ...row } : (prev ?? { ...row })));
      setErrors({});
    },
    [editing],
  );

  const handleCancel = useCallback(() => {
    setEditing(null);
    setDraft(null);
    setErrors({});
  }, []);

  useEffect(() => {
    if (!editing) return;
    const handler = (event: MouseEvent) => {
      const editingRow = document.querySelector<HTMLTableRowElement>(
        'tr[data-editing-row="true"]',
      );
      if (editingRow && !editingRow.contains(event.target as Node)) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editing, handleCancel]);

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
    meta: EditableColumnMeta<TData> | undefined,
    autoFocus: boolean,
    rowId: string,
  ) => {
    const fieldType = meta?.fieldType ?? "text";
    const Renderer = defaultCellRegistry[fieldType];
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

    const editorMeta = (meta ?? {}) as EditableColumnMeta<TData>;

    return (
      <div className="relative w-full">
        <Renderer
          value={value}
          rawValue={value}
          row={row}
          meta={editorMeta as EditableColumnMeta<unknown, unknown>}
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
    return <DataTableSkeleton columns={columns} className={className} />;
  }

  return (
    <div className={cn("flex min-h-0 flex-col font-medium", className)}>
      <div
        className={cn(
          "w-full min-h-0 flex-1 overflow-auto rounded-md border",
          isRefetching && "animate-pulse opacity-60",
        )}
      >
        <table
          className="relative grid caption-bottom text-sm"
          style={{ minWidth: totalSize, width: "100%" }}
        >
          <TableHeader className="bg-data-table-header sticky top-0 z-20 grid">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="flex w-full border-b transition-colors hover:bg-transparent"
              >
                {headerGroup.headers.map((header, index) => {
                  const isFirstColumn = index === 0;
                  const canResize = header.column.getCanResize();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-foreground relative inline-flex h-auto min-h-10 flex-col items-stretch justify-center px-0 py-1.5 align-middle font-medium whitespace-nowrap",
                        "border-r",
                        isFirstColumn &&
                          "bg-data-table-header sticky left-0 z-20",
                      )}
                      style={{
                        width: header.getSize(),
                        flexGrow: header.getSize(),
                        flexShrink: 0,
                        paddingLeft: CELL_PADDING,
                        paddingRight: CELL_PADDING,
                      }}
                      colSpan={header.colSpan}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </div>
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
                    </TableHead>
                  );
                })}
                {showActionsColumn && (
                  <TableHead
                    className="text-muted-foreground inline-flex h-auto items-center justify-center text-xs font-medium"
                    style={{
                      width: ACTIONS_COLUMN_WIDTH,
                      flexShrink: 0,
                      paddingLeft: CELL_PADDING,
                      paddingRight: CELL_PADDING,
                    }}
                  >
                    Actions
                  </TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="grid">
            {rows.map((row, index) => {
              const rowId = row.id;
              const isLastRow = index === rows.length - 1;
              const rowEditing = isRowEditing(rowId);
              const anyCellEditing = editing?.rowId === rowId;
              const rowHasErrors = Object.keys(errors).length > 0;

              return (
                <TableRow
                  key={rowId}
                  data-editing-row={anyCellEditing ? "true" : undefined}
                  className={cn(
                    "bg-data-table-body hover:bg-muted flex w-full border-b transition-colors",
                    anyCellEditing && "bg-muted/50",
                    isLastRow && "border-b-0",
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isFirstColumn = cellIndex === 0;
                    const meta = cell.column.columnDef.meta as
                      | EditableColumnMeta<TData>
                      | undefined;
                    const columnId = cell.column.id;
                    const cellEditing = isCellEditing(rowId, columnId);
                    const isColumnEditable =
                      Boolean(meta?.fieldType) && meta?.editable !== false;
                    const showEditor = cellEditing && isColumnEditable;
                    const editorAutoFocus =
                      editing?.kind === "cell" &&
                      editing.columnId === columnId &&
                      editing.rowId === rowId;

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "relative inline-flex items-center p-2 align-middle whitespace-nowrap border-r",
                          isFirstColumn &&
                            "bg-data-table-body sticky left-0 z-10 ",
                        )}
                        style={{
                          width: cell.column.getSize(),
                          flexGrow: cell.column.getSize(),
                          flexShrink: 0,
                          paddingLeft: CELL_PADDING,
                          paddingRight: CELL_PADDING,
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
                        {showEditor
                          ? renderEditor(
                              columnId,
                              row.original,
                              meta,
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
                      </TableCell>
                    );
                  })}
                  {showActionsColumn && (
                    <TableCell
                      className="inline-flex items-center justify-center p-2 "
                      style={{
                        width: ACTIONS_COLUMN_WIDTH,
                        flexShrink: 0,
                        paddingLeft: CELL_PADDING,
                        paddingRight: CELL_PADDING,
                      }}
                    >
                      <DataTableRowActions
                        isEditing={anyCellEditing === true}
                        hasErrors={anyCellEditing && rowHasErrors}
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
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
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
    <Suspense fallback={<DataTableSkeleton columns={props.columns} />}>
      <DataTableComponent {...props} />
    </Suspense>
  );
}
