"use client";

import { useCallback, useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { TEditableColumnMeta, TEditingState } from "@/@types";

type EditMode = "row" | "cell" | "both" | "none";

type UseTableEditingArgs<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  editMode: EditMode;
  onSave?: (rowId: string, updated: TData) => void;
};

function getColumnId<TData, TValue>(
  def: ColumnDef<TData, TValue>,
): string | undefined {
  const id = (def as { id?: string }).id;
  if (id) return id;
  const accessorKey = (def as { accessorKey?: string | number | symbol })
    .accessorKey;
  return typeof accessorKey === "string" ? accessorKey : undefined;
}

function getMeta<TData, TValue>(
  def: ColumnDef<TData, TValue>,
): TEditableColumnMeta<TData> | undefined {
  return def.meta as TEditableColumnMeta<TData> | undefined;
}

export function useTableEditing<TData, TValue>({
  columns,
  editMode,
  onSave,
}: UseTableEditingArgs<TData, TValue>) {
  const [editing, setEditing] = useState<TEditingState>(null);
  const [draft, setDraft] = useState<Partial<TData> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        const meta = getMeta(col);
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
      meta?: TEditableColumnMeta<TData>,
    ) => {
      if (editMode === "none" || editMode === "row") return false;
      if (meta?.editable === false) return false;
      if (!meta?.fieldType) return false;
      beginEdit("cell", rowId, row, columnId);
      return true;
    },
    [beginEdit, editMode],
  );

  return {
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
  };
}
