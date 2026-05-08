/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Suspense, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type ColumnSizingState,
  type SortingState,
} from "@tanstack/react-table";
import { DatabaseZap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TEditableColumnMeta } from "@/@types";

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
import { useTableEditing } from "@/hooks/use-table-editing";

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
  globalFilter?: string;
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
  globalFilter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const {
    editing,
    draft,
    errors,
    isRowEditing,
    isCellEditing,
    beginEdit,
    tryStartCellEdit,
    handleCancel,
    handleSave,
    handleFieldChange,
  } = useTableEditing({ columns, editMode, onSave });

  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnSizing,
      globalFilter,
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

  const renderEditor = (
    columnId: string,
    row: TData,
    meta: TEditableColumnMeta<TData> | undefined,
    autoFocus: boolean,
    rowId: string,
  ) => {
    const fieldType = meta?.fieldType ?? "text";
    const Renderer = defaultCellRegistry[fieldType];
    const draftRecord = draft as Record<string, unknown> | null;
    const value =
      draftRecord && columnId in draftRecord
        ? draftRecord[columnId]
        : (row as Record<string, unknown>)[columnId];
    const error = errors[columnId];

    if (!Renderer) {
      return (
        <span className="text-muted-foreground text-xs italic">
          No editor for &quot;{fieldType}&quot;
        </span>
      );
    }

    const editorMeta = (meta ?? {}) as TEditableColumnMeta<TData>;

    return (
      <div className="relative w-full">
        <Renderer
          value={value}
          rawValue={value}
          row={row}
          meta={editorMeta as TEditableColumnMeta<unknown, unknown>}
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
                      | TEditableColumnMeta<TData>
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
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext() as CellContext<TData, unknown>,
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
