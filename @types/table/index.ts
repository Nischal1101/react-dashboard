import type { RowData } from "@tanstack/react-table";
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

export interface EditableColumnMeta<TData = unknown, TValue = unknown> {
  fieldType?: EditableFieldType;
  editable?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  validate?: (value: TValue, row: TData) => string | null;
  normalize?: (value: TValue) => TValue;
  currency?: string;
  locale?: string;
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

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  thumbnail?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
