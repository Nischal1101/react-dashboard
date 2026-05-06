"use client";

import { Pencil, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  isEditing: boolean;
  hasErrors?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function DataTableRowActions({
  isEditing,
  hasErrors,
  canEdit = true,
  canDelete = true,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {isEditing ? (
        <>
          <Button
            variant="default"
            size="icon-xs"
            onClick={onSave}
            disabled={hasErrors}
            aria-label="Save"
            title={hasErrors ? "Fix validation errors" : "Save"}
          >
            <Save />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onCancel}
            aria-label="Cancel"
            title="Cancel"
          >
            <X />
          </Button>
        </>
      ) : (
        <>
          {canEdit && onEdit && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onEdit}
              aria-label="Edit row"
              title="Edit row"
            >
              <Pencil />
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDelete}
              aria-label="Delete row"
              title="Delete row"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
