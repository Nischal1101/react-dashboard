import type { RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";

export type TEditableFieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "phone"
  | "currency"
  | "percentage"
  | (string & {});

export type TSelectOption = {
  label: string;
  value: string;
};

export type TEditableColumnMeta<TData = unknown, TValue = unknown> = {
  fieldType?: TEditableFieldType;
  editable?: boolean;
  options?: TSelectOption[];
  placeholder?: string;
  validate?: (value: TValue, row: TData) => string | null;
  normalize?: (value: TValue) => TValue;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
};

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ColumnMeta<
    TData extends RowData,
    TValue,
  > extends TEditableColumnMeta<TData, TValue> {}
}

export type TEditingState =
  | { kind: "row"; rowId: string; focusColumnId?: string }
  | { kind: "cell"; rowId: string; columnId: string }
  | null;

export type TEditableCellRenderProps<TData = unknown, TValue = unknown> = {
  value: TValue;
  rawValue: TValue;
  row: TData;
  meta: TEditableColumnMeta<TData, TValue>;
  error?: string;
  autoFocus?: boolean;
  onChange: (value: TValue) => void;
  onCommit: () => void;
  onCancel: () => void;
};

export type TEditableCellRenderer = (
  props: TEditableCellRenderProps<unknown, unknown>,
) => ReactNode;

export type TCellRegistry = Record<string, TEditableCellRenderer>;

export type TProduct = {
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
};

export type TProductsResponse = {
  products: TProduct[];
  total: number;
  skip: number;
  limit: number;
};

export type TProductListParams = {
  limit: number;
  skip: number;
  category?: string;
  brand?: string;
};

export type TUpdateProductInput = {
  id: number;
  payload: Partial<TProduct>;
};

export type TDeleteProductInput = {
  id: number;
};

export type TProductFilterOptions = {
  categories: string[];
  brands: string[];
};

export type TJsonServerPage<T> = {
  items: number;
  data: T[];
};
