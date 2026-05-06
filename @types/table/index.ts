import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";

export type BuiltInFieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "phone"
  | "currency"
  | "percentage";

export type EditableFieldType = BuiltInFieldType | (string & {});

export interface SelectOption {
  label: string;
  value: string;
}

export type FilterType = "text" | "select" | "number" | "none";

export interface EditableColumnMeta<TData = unknown, TValue = unknown> {
  fieldType?: EditableFieldType;
  editable?: boolean;
  filterType?: FilterType;
  filterOptions?: SelectOption[];
  options?: SelectOption[];
  placeholder?: string;
  validate?: (value: TValue, row: TData) => string | null;
  format?: (value: TValue, row: TData) => string;
  parse?: (rawInput: string) => TValue;
  normalize?: (value: TValue) => TValue;
  currency?: string;
  locale?: string;
  align?: "left" | "right" | "center";
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ColumnMeta<
    TData extends RowData,
    TValue,
  > extends EditableColumnMeta<TData, TValue> {}
}

export type EditableColumnDef<TData, TValue = unknown> = ColumnDef<
  TData,
  TValue
>;

export type EditingState =
  | { kind: "row"; rowId: string; focusColumnId?: string }
  | { kind: "cell"; rowId: string; columnId: string }
  | null;

export interface EditableCellRenderProps<TData = unknown, TValue = unknown> {
  value: TValue;
  rawValue: TValue;
  row: TData;
  meta: EditableColumnMeta<TData, TValue>;
  error?: string;
  autoFocus?: boolean;
  onChange: (value: TValue) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export type EditableCellRenderer = (
  props: EditableCellRenderProps<unknown, unknown>,
) => ReactNode;

export type CellRegistry = Record<string, EditableCellRenderer>;

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  salary: number;
  bonus: number;
  startDate: string;
  phone: string;
  active: boolean;
  yearsExperience: number;
}
